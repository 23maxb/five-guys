# YumYumApp

A full-stack web application with Django backend and React frontend.

## Project Structure

```
yumyumapp/
├── frontend/           # React frontend (Vite)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/            # Django backend settings
├── api/                # Django API app
├── manage.py           # Django management script
├── requirements.txt    # Python dependencies
├── package.json        # Root package.json with scripts
└── README.md
```

## Quick Start

### Install all dependencies
```bash
npm run install-all
```

### Run both backend and frontend
```bash
npm run dev
```

This will start:
- Django backend at `http://localhost:8000`
- React frontend at `http://localhost:5173`

## Individual Commands

### Backend (Django)
```bash
npm run backend
# or
python manage.py runserver
```

### Frontend (React)
```bash
npm run frontend
# or
cd frontend && npm run dev
```

## Setup Instructions

### Backend (Django)

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run database migrations:
   ```bash
   python manage.py migrate
   ```

3. Create a superuser (optional):
   ```bash
   python manage.py createsuperuser
   ```

### Frontend (React)

1. Install Node.js dependencies:
   ```bash
   cd frontend
   npm install
   ```

## API Endpoints

- `POST /api/login/` - User login
- `POST /api/register/` - User registration
- `POST /api/logout/` - User logout
- `GET /api/profile/` - Get user profile

## Default Credentials

- **Superuser**: admin / admin123
- **Admin Panel**: http://localhost:8000/admin/

## Development Workflow

1. **Full Stack Development**: Run `npm run dev` to start both servers
2. **Backend Only**: Run `npm run backend` for Django development
3. **Frontend Only**: Run `npm run frontend` for React development
4. **Build**: Run `npm run build` to build the frontend for production
