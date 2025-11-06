# YumYumApp - AI Coding Agent Instructions

## Project Overview

Full-stack food management app: Django REST backend + React/Vite frontend. Users track fridge inventory and discover recipes from Spoonacular API based on available ingredients.

## Architecture

### Monorepo Structure

- **Root**: `/yumyumapp/` - Django project root, contains both backend and frontend
- **Backend**: Django app in `/yumyumapp/api/` with SQLite database
- **Frontend**: React app in `/yumyumapp/frontend/` using Vite

### Key Data Flow

1. **Authentication**: Token-based (DRF TokenAuthentication). Email used as username. Tokens stored in `localStorage` and sent via `Authorization: Token <key>` header.
2. **Fridge Model**: Users → Fridge (1:many) → FridgeItem (1:many). Each user gets a default "Main Fridge" auto-created on first access.
3. **Metadata Pattern**: Frontend stores additional item metadata (unit, storage location, dates) in `localStorage` under `yumyumapp.fridge.itemMeta`, keyed by item ID. Backend only stores `name` and `quantity`.
4. **Recipe Integration**: `/api/recipes/find-by-ingredients/` endpoint queries Spoonacular API using fridge items as ingredients.

## Development Workflow

### Initial Setup (First Time Only)

```bash
cd yumyumapp
pip install -r requirements.txt    # Install Python dependencies
npm run install-all                # Install root + frontend npm packages
python manage.py migrate           # Set up database
```

**Critical**: The `.venv` is at project root (`/five-guys/.venv/`). Always ensure Python dependencies are installed before running servers or you'll get `ModuleNotFoundError`.

### Running the App

```bash
cd yumyumapp
npm run dev  # Runs both servers concurrently
```

- Backend: `http://localhost:8000` (Django runserver)
- Frontend: `http://localhost:5173` (Vite dev server, may use 5174-5176 if port busy)

### Database Changes

```bash
cd yumyumapp
python manage.py makemigrations
python manage.py migrate
```

Always run migrations after model changes.

### Testing

```bash
cd yumyumapp
npm run backend_unit_tests  # Runs Django tests in api/
```

Tests use DRF's `APITestCase`. See `api/test_fridge.py` for examples with token authentication setup.

## Project-Specific Conventions

### API Design Patterns

- **All auth endpoints** except login/register require `IsAuthenticated` permission (global default in `settings.py`)
- **URL pattern**: `/api/<resource>/` for views, `/api/<resource>/<action>/` for actions (e.g., `/api/fridge/add/`)
- **Case-insensitive item lookup**: Use `name__iexact` when checking existing items to prevent duplicates with different casing
- **Quantity merging**: Adding existing items increments quantity rather than creating duplicates (see `add_fridge_item` view)

### Frontend Patterns

- **Auth flow**: `AuthContext` provides `token`, `authed`, `login()`, `logout()`. Wrap protected routes with `<ProtectedRoute>`
- **API calls**: Separate files per resource (`api.ts`, `api_fridge.ts`, `api_recipe.ts`). All return promises and throw errors with messages from backend
- **Mixed language**: Pages are `.jsx`, library code is `.ts/.tsx` (TypeScript). Accept this inconsistency
- **Hardcoded URLs**: `API_BASE_URL = 'http://localhost:8000/api'` appears in each API file. Update all three when changing backend URL

### Critical Configuration

- **CORS**: Backend allows ports 5173-5176 with credentials enabled (`settings.py` line 143-148)
- **Spoonacular API Key**: Hardcoded in `views.py` `find_recipes_by_ingredients()` - rotate if needed
- **Default credentials**: Superuser varies between READMEs ("admin/admin123" vs "fiveguys/123456") - check actual database

## External Dependencies

### Django Requirements

```
Django, djangorestframework, django-cors-headers, requests
```

Install: `pip install -r requirements.txt`

### Frontend Packages

Core: `react`, `react-dom`, `react-router-dom`
Build: `vite`, `@vitejs/plugin-react`
Install: `cd frontend && npm install`

### Third-Party API

**Spoonacular** (`https://api.spoonacular.com/recipes/findByIngredients`)

- Used for recipe discovery based on fridge ingredients
- API key in `api/views.py` line 225
- Returns recipes ranked by ingredient match
- **Free tier limit**: 150 requests/day (resets at midnight UTC)
- **402 Payment Required error**: Indicates daily quota exceeded - get new API key from https://spoonacular.com/food-api or wait until quota resets
- Backend returns 503 Service Unavailable with helpful message when quota exceeded

## Common Pitfalls

1. **Missing Python dependencies**: If you get `ModuleNotFoundError: No module named 'requests'` or similar, run `pip install -r requirements.txt` from `/yumyumapp/`. The `.venv` is at project root but requirements.txt is in yumyumapp directory.

2. **Running servers individually**: Always use `npm run dev` from `/yumyumapp/` root to run both servers. Individual scripts exist but concurrent mode is standard workflow.

3. **Forgetting migrations**: After editing `models.py`, must run both `makemigrations` and `migrate`. Use `npm run migrate` which chains both and starts backend.

4. **Auth token mismatch**: Frontend expects `{token: string, user: {...}}` response shape from login/register. Backend must return this exact structure.

5. **Metadata cleanup**: When removing fridge items, frontend must update `localStorage` metadata to prevent orphaned entries. See `handleRemoveItem` and `updateMetadata` pattern in `Fridge.jsx`.

6. **Unique constraints**: Both `Fridge` and `FridgeItem` have `unique_together` constraints. Attempting to create duplicates returns 400 errors - handle gracefully.

7. **Spoonacular API quota**: Free tier is limited to 150 requests/day. If you get 402 errors, either wait for quota reset (midnight UTC) or sign up for a new free API key and update it in `api/views.py`.

## File Organization Notes

- `/yumyumapp/api/views_test.py` appears to be an alternate or old test file - active tests are in `test_fridge.py`
- Frontend has duplicate structure: `/yumyumapp/src/auth/` exists but active auth code is in `/yumyumapp/frontend/src/auth/`
- Root `package.json` contains orchestration scripts; frontend `package.json` contains actual dependencies
