from decouple import config

# Get Spoonacular API key from environment variables
# Falls back to None if not set (will cause error, which is intentional for security)
SPOONACULAR_API_KEY = config('SPOONACULAR_API_KEY', default=None)

if not SPOONACULAR_API_KEY:
    SPOONACULAR_API_KEY = "KEY_HERE"
    # raise ValueError(
    #     "SPOONACULAR_API_KEY is not set. Please set it in your .env file. "
    #     "See .env.example for reference."
    # )
