/**
 * Receipt Scanner using GPT-4 Vision API
 * Extracts grocery items from receipt images and returns structured data
 */

export interface ScannedItem {
    name: string;
    quantity: number;
    storage: 'Fridge' | 'Freezer' | 'Pantry';
    addedOn: string;
    expiresOn: string;
    shelfLifeDays: number;
}

export interface ScanResult {
    items: ScannedItem[];
    rawText?: string;
}

const OPENAI_API_KEY = "KEY_HERE"

/**
 * Convert image file to base64 string
 */
async function imageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Calculate expiration date based on shelf life days
 */
function calculateExpirationDate(shelfLifeDays: number): string {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + shelfLifeDays);
    return expirationDate.toISOString().slice(0, 10);
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
    return new Date().toISOString().slice(0, 10);
}

/**
 * Scan receipt image using GPT-4 Vision API
 */
export async function scanReceipt(imageFile: File): Promise<ScanResult> {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
        throw new Error('OpenAI API key is not configured. Please add it to .env.local');
    }

    // Convert image to base64
    const base64Image = await imageToBase64(imageFile);

    // Prepare the prompt for GPT-4 Vision
    const prompt = `You are a grocery receipt analyzer. Extract all food items from this receipt image.

For each item, provide:
1. name: Clean product name (remove brand names, expand abbreviations like "grk ygrt" → "greek yogurt", "virgirl's cream soda" → "cream soda")
2. quantity: Number of items (parse from text, default to 1 if unclear)
3. storage: Best storage location - choose one: "Fridge", "Freezer", or "Pantry"
4. shelfLifeDays: Estimated shelf life in days based on the item type

Guidelines:
- Remove brand names and promotional text (e.g., "Coca-Cola" → "cola", "Dannon Yogurt" → "yogurt")
- Expand common grocery abbreviations (e.g., "org" → "organic", "chkn" → "chicken", "brst" → "breast")
- For storage:
  * Fridge: dairy, fresh produce, cooked items, eggs, fresh meat
  * Freezer: frozen items, raw meat for long-term storage, ice cream
  * Pantry: dry goods, canned items, oils, spices, bread
- For shelfLifeDays:
  * Fresh produce (leafy greens): 3-7 days
  * Fresh meat (refrigerated): 2-3 days
  * Frozen items: 90-180 days
  * Dairy (milk, yogurt): 5-14 days
  * Bread: 5-7 days
  * Canned/dry goods: 365+ days
  * Eggs: 21-28 days

Return ONLY a valid JSON object in this exact format (no markdown, no code blocks):
{
  "items": [
    {
      "name": "string",
      "quantity": number,
      "storage": "Fridge" | "Freezer" | "Pantry",
      "shelfLifeDays": number
    }
  ]
}`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o', // gpt-4o supports vision and is faster/cheaper than gpt-4-turbo
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: prompt,
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: base64Image,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 2000,
            temperature: 0.3, // Lower temperature for more consistent/accurate extraction
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to scan receipt');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
        throw new Error('No response from OpenAI API');
    }

    // Parse the JSON response
    let parsedData;
    try {
        // Remove any markdown code blocks if present
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsedData = JSON.parse(cleanContent);
    } catch (e) {
        console.error('Failed to parse OpenAI response:', content);
        throw new Error('Failed to parse receipt data. Please try again.');
    }

    // Validate and transform the data
    if (!parsedData.items || !Array.isArray(parsedData.items)) {
        throw new Error('Invalid response format from API');
    }

    const today = getTodayDate();

    const scannedItems: ScannedItem[] = parsedData.items.map((item: any) => ({
        name: item.name || 'Unknown Item',
        quantity: parseInt(item.quantity) || 1,
        storage: item.storage || 'Pantry',
        addedOn: today,
        expiresOn: calculateExpirationDate(item.shelfLifeDays || 365),
        shelfLifeDays: item.shelfLifeDays || 365,
    }));

    return {
        items: scannedItems,
        rawText: content,
    };
}
