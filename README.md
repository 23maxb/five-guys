# Five Guys App

A full-stack web application with React frontend and Django backend.

## Project Structure

```
five-guys/
├── yumyumapp/          # React frontend
├── backend/            # Django backend settings
├── api/                # Django API app
├── manage.py           # Django management script
├── requirements.txt    # Python dependencies
└── README.md
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

4. Start the Django development server:
   ```bash
   python manage.py runserver
   ```

   The backend will be available at `http://localhost:8000`

### Frontend (React)

1. Navigate to the frontend directory:
   ```bash
   cd yumyumapp
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173` (or another port if 5173 is busy)

## API Endpoints

- `POST /api/login/` - User login
- `POST /api/register/` - User registration
- `POST /api/logout/` - User logout
- `GET /api/profile/` - Get user profile

## Default Credentials

- **Superuser**: fiveguys  / 123456
- **Admin Panel**: http://localhost:8000/admin/

## Running the Full Application

1. Start the Django backend:
   ```bash
   python manage.py runserver
   ```

2. In a new terminal, start the React frontend:
   ```bash
   cd yumyumapp
   npm run dev
   ```

3. Visit `http://localhost:5173` to access the application
