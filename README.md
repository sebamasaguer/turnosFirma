# Project Title (Firma Digital Turnos - Enhanced Backend)

This project is a web application for managing digital signature appointments. It features a React frontend and an Express.js backend connected to a PostgreSQL database.

## Prerequisites

Before you begin, ensure you have the following installed:

*   Node.js (which includes npm or yarn) - Latest LTS version recommended.
*   PostgreSQL - A running instance of PostgreSQL server.
*   Git (for cloning the repository).

## Local Deployment Steps

Follow these steps to get the application running locally:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Backend Setup

The backend server is located in the `server/` directory.

**a. Navigate to the server directory:**

```bash
cd server
```

**b. Install backend dependencies:**

```bash
npm install
# or
# yarn install
```

**c. Configure Environment Variables:**

   Create a `.env` file in the `server/` directory by copying the example:

   ```bash
   cp .env.example .env
   ```

   Now, edit the `server/.env` file with your specific configurations:

   ```env
   # PostgreSQL Connection Details
   DB_USER="your_postgres_user"          # Your PostgreSQL username
   DB_HOST="localhost"                   # Or your PostgreSQL host
   DB_DATABASE="your_database_name"      # The name of your PostgreSQL database
   DB_PASSWORD="your_postgres_password"  # Your PostgreSQL password
   DB_PORT="5432"                        # Your PostgreSQL port

   # Server Configuration
   PORT=3001                             # Port for the backend server

   # CORS Configuration
   # Comma-separated list of allowed origins.
   # For local frontend development (usually Vite), http://localhost:5173 is common.
   CORS_ALLOWED_ORIGINS="http://localhost:5173"
   ```

   **Important:** Replace placeholder values like `"your_postgres_user"`, `"your_database_name"`, etc., with your actual PostgreSQL credentials.

**d. Database Setup:**

   -   Ensure your PostgreSQL server is running.
   -   Connect to your PostgreSQL instance (e.g., using `psql` or a GUI tool like pgAdmin).
   -   Create the database specified in `DB_DATABASE` if it doesn't already exist.
       ```sql
       CREATE DATABASE your_database_name;
       ```
   -   Connect to your newly created database and run the following SQL commands to create the required tables. (Alternatively, you could use a migration tool in a more complex project).

     **`appointments` table:**
     ```sql
     CREATE TABLE appointments (
         id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Or use uuid_generate_v4() if extension is enabled
         user_name TEXT NOT NULL,
         user_email TEXT NOT NULL,
         user_phone TEXT NOT NULL,
         user_dni TEXT NOT NULL,
         appointment_date DATE NOT NULL,
         appointment_time TEXT NOT NULL, -- e.g., 'HH:MM'
         status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
         created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
     );
     ```

     **`admin_users` table:**
     ```sql
     CREATE TABLE admin_users (
         id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Or use uuid_generate_v4()
         email TEXT NOT NULL UNIQUE,
         full_name TEXT NOT NULL,
         -- password_hash TEXT NOT NULL, -- Add this when implementing secure auth
         created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
     );
     ```
     *Note on UUID generation:* `gen_random_uuid()` is available in PostgreSQL 13+. For older versions, you might need to enable the `uuid-ossp` extension (`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`) and use `uuid_generate_v4()`.

**e. Start the Backend Server:**

   From the `server/` directory:
   ```bash
   node index.js
   ```
   Or, for development with automatic restarts on file changes (if nodemon is installed globally or as a dev dependency):
   ```bash
   nodemon index.js
   ```
   The backend should now be running (typically on `http://localhost:3001` as per default `PORT` in `.env`). You should see a console message like `Server listening at http://localhost:3001`.

### 3. Frontend Setup

The frontend is a React application built with Vite.

**a. Navigate to the root project directory (if you were in `server/`):**

```bash
cd ..
```

**b. Install frontend dependencies:**

```bash
npm install
# or
# yarn install
```

**c. Configure Frontend Environment Variables (if any specific ones are needed beyond default):**

   The frontend uses `VITE_API_BASE_URL` in `src/lib/apiClient.ts`. By default, it's set to `http://localhost:3001/api`.
   If your backend is running on a different URL or port, you might need to:
   1. Create a `.env` file in the root directory (where `package.json` for the frontend is).
   2. Add the variable: `VITE_API_BASE_URL=http://your-backend-api-url`

**d. Start the Frontend Development Server:**

   From the root project directory:
   ```bash
   npm run dev
   ```
   The frontend development server should start, typically on `http://localhost:5173`. Your browser might open automatically, or you can navigate to this URL.

### 4. Accessing the Application

-   **Frontend (Public Appointment Booking):** Open your browser and go to `http://localhost:5173` (or the port Vite assigned).
-   **Admin Section:**
    -   Navigate to `http://localhost:5173/admin/login` to access the admin login page.
    -   **Mock Admin User:** To log in, you'll first need an admin user in your `admin_users` table. You can insert one manually using SQL:
        ```sql
        INSERT INTO admin_users (email, full_name) VALUES ('admin@example.com', 'Admin User');
        ```
        Then use `admin@example.com` and any password on the login page (as password checking is currently mocked).
-   **Backend API Documentation:** Can be found at `server/API_DOCUMENTATION.md`.

## Development Notes

*   **Backend:** The backend API is defined in `server/routes/`. Database interaction is handled by `server/db.js`.
*   **Frontend:** Components are in `src/components/` and pages in `src/pages/`. API interactions are managed through `src/lib/apiClient.ts`. Authentication state is managed by `src/contexts/AuthContext.tsx`.
*   **Security:** The current admin authentication is **for mock/development purposes only** and is not secure. For production, implement proper password hashing (e.g., bcrypt) on the backend and a secure session/token mechanism (e.g., JWT with HttpOnly cookies).

Enjoy using the application!
