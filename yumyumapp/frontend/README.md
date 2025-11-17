# YumYumApp Frontend

React + Vite frontend for the YumYumApp food inventory management system.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

The app uses OpenAI's GPT-4 Vision API for receipt scanning. To enable this feature:

1. **Copy the example environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Get your OpenAI API key:**
   - Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Sign in or create an account
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

3. **Add your API key to `.env.local`:**
   ```
   VITE_OPENAI_API_KEY=sk-your-actual-key-here
   ```

   > **Important:** Never commit `.env.local` to git! It's already in `.gitignore`.

### 3. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Features

### 📸 Receipt Scanning
- Upload receipt photos to automatically extract grocery items
- OpenAI API will take care of the text cleaning (removing brands, expanding abbreviations)
- Automatic categorizing
- Automatic expiration date calculation
- Review and edit items before adding to inventory

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_OPENAI_API_KEY` | Yes* | OpenAI API key for receipt scanning |

\* Required only if you want to use the receipt scanning feature

## Build for Production

```bash
npm run build
```
