# API Documentation

This document provides details about the API endpoints for the appointments and admin functionalities.

**Base URL:** `/api` (mounted in `server/index.js`)

## Authentication

Authentication for admin endpoints is handled via JSON Web Tokens (JWT).

1.  **Login:** Clients authenticate by sending credentials to `POST /api/admin/login`. On success, a JWT is returned.
2.  **Authorization Header:** For all protected admin endpoints, the client must include the JWT in the `Authorization` header with the `Bearer` scheme:
    `Authorization: Bearer <your_jwt_token>`
3.  **Token Expiry:** Tokens have a defined expiry time (e.g., 1 hour, configurable in `server/utils/authUtils.js`). Clients should handle token expiry and re-authentication.
4.  **JWT Secret:** The JWTs are signed with a secret key (`JWT_SECRET`) defined in `server/.env`. Ensure this is a strong, unique secret in production.

-   **Public Endpoints:**
    -   `POST /api/appointments` (Create new appointment)
    -   `GET /api/appointments` (Get all appointments - useful for checking available slots on the frontend, though this endpoint itself is not filtered by date/status by default)
-   **Protected Admin Endpoints:**
    -   All routes under `/api/admin/*` except for `/api/admin/login`. This includes:
        -   `GET /api/admin/users`
        -   `POST /api/admin/users`
        -   `PUT /api/admin/users/:id`
        -   `DELETE /api/admin/users/:id`
        -   `GET /api/admin/me`

## Appointments API

**Resource URL:** `/api/appointments`

All data is exchanged in JSON format.

---

### 1. Get All Appointments

-   **Endpoint:** `GET /api/appointments`
-   **Description:** Retrieves a list of all appointments, ordered by creation date (descending by default from the DB query, though client-side sort in DashboardPage might alter this).
-   **Request Body:** None
-   **Responses:**
    -   `200 OK`: Success
        ```json
        [
          {
            "id": "uuid-string-1",
            "user_name": "John Doe",
            "user_email": "john.doe@example.com",
            "user_phone": "1234567890",
            "user_dni": "12345678",
            "appointment_date": "2023-10-26",
            "appointment_time": "10:00",
            "status": "confirmed",
            "created_at": "2023-10-25T10:00:00.000Z"
          },
          // ... other appointments
        ]
        ```
    -   `500 Internal Server Error`: If there's an error fetching from the database.
        ```json
        { "error": "Internal server error" }
        ```

---

### 2. Create a New Appointment

-   **Endpoint:** `POST /api/appointments`
-   **Description:** Creates a new appointment. Status defaults to 'pending'.
-   **Request Body:**
    ```json
    {
      "user_name": "Jane Smith",
      "user_email": "jane.smith@example.com",
      "user_phone": "0987654321",
      "user_dni": "87654321",
      "appointment_date": "2023-10-27",
      "appointment_time": "11:30"
    }
    ```
    *   All fields are required.
-   **Responses:**
    -   `201 Created`: Appointment created successfully. Returns the created appointment object.
        ```json
        {
          "id": "new-uuid-string",
          "user_name": "Jane Smith",
          // ... other fields including status: "pending" and created_at
        }
        ```
    -   `400 Bad Request`: If any required fields are missing.
        ```json
        { "error": "All fields are required" }
        ```
    -   `500 Internal Server Error`: If there's an error during database insertion.
        ```json
        { "error": "Internal server error" }
        ```

---

### 3. Update an Appointment

-   **Endpoint:** `PUT /api/appointments/:id`
-   **Description:** Updates an existing appointment by its ID. Can be used to update details or status.
-   **URL Parameters:**
    -   `id` (string, required): The UUID of the appointment to update.
-   **Request Body:** Object containing fields to update.
    ```json
    {
      "status": "confirmed"
      // "user_name": "New Name", (other fields can also be updated)
      // "appointment_date": "2023-10-28",
    }
    ```
    *   At least one field to update must be provided.
    *   `status` must be one of 'pending', 'confirmed', 'cancelled'.
-   **Responses:**
    -   `200 OK`: Appointment updated successfully. Returns the updated appointment object.
    -   `400 Bad Request`: If no update fields are provided or if `status` has an invalid value.
        ```json
        { "error": "No update fields provided." }
        // or
        { "error": "Invalid status value. Must be one of 'pending', 'confirmed', 'cancelled'." }
        ```
    -   `404 Not Found`: If no appointment with the given ID exists.
        ```json
        { "error": "Appointment not found" }
        ```
    -   `500 Internal Server Error`: Database error.

---

### 4. Delete an Appointment

-   **Endpoint:** `DELETE /api/appointments/:id`
-   **Description:** Deletes an appointment by its ID.
-   **URL Parameters:**
    -   `id` (string, required): The UUID of the appointment to delete.
-   **Request Body:** None
-   **Responses:**
    -   `200 OK`: Appointment deleted successfully. Returns a confirmation message and the deleted appointment.
        ```json
        {
          "message": "Appointment deleted successfully",
          "deletedAppointment": { /* ...deleted appointment object... */ }
        }
        ```
    -   `404 Not Found`: If no appointment with the given ID exists.
        ```json
        { "error": "Appointment not found" }
        ```
    -   `500 Internal Server Error`: Database error.

---
---

## Admin API

**Resource URL:** `/api/admin`

All data is exchanged in JSON format. All endpoints under `/api/admin` (except `/login`) require JWT authentication.

---

### 1. Admin Login

-   **Endpoint:** `POST /api/admin/login`
-   **Description:** Authenticates an admin user and returns a JWT.
-   **Request Body:**
    ```json
    {
      "email": "admin@example.com",
      "password": "securepassword123"
    }
    ```
-   **Responses:**
    -   `200 OK`: Login successful.
        ```json
        {
          "message": "Login successful",
          "token": "your_jwt_token_here",
          "user": {
            "id": "admin-uuid",
            "email": "admin@example.com",
            "full_name": "Admin User"
          }
        }
        ```
    -   `400 Bad Request`: If email or password is not provided.
        ```json
        { "error": "Email and password are required" }
        ```
    -   `401 Unauthorized`: Invalid credentials (user not found or password incorrect).
        ```json
        { "error": "Invalid credentials" }
        ```
    -   `500 Internal Server Error`: Database or other server error.

---

### 2. Get Current Authenticated Admin User

-   **Endpoint:** `GET /api/admin/me`
-   **Description:** Retrieves the details of the currently authenticated admin user based on the provided JWT.
-   **Headers:**
    -   `Authorization: Bearer <your_jwt_token>`
-   **Request Body:** None
-   **Responses:**
    -   `200 OK`: Success. Returns the admin user object.
        ```json
        {
          "id": "admin-uuid",
          "email": "admin@example.com",
          "full_name": "Admin User",
          "created_at": "2023-10-25T10:00:00.000Z"
        }
        ```
    -   `401 Unauthorized`: No token provided.
    -   `403 Forbidden`: Invalid or expired token.
    -   `404 Not Found`: User ID from token not found in database.
    -   `500 Internal Server Error`: Database error.

---

### 3. Get All Admin Users

-   **Endpoint:** `GET /api/admin/users`
-   **Description:** Retrieves a list of all admin users.
-   **Headers:**
    -   `Authorization: Bearer <your_jwt_token>`
-   **Request Body:** None
-   **Responses:**
    -   `200 OK`: Success.
        ```json
        [
          {
            "id": "admin-uuid-1",
            "email": "admin1@example.com",
            "full_name": "Admin One",
            "created_at": "2023-10-25T10:00:00.000Z"
          }
          // ... other admin users
        ]
        ```
    -   `401 Unauthorized`: No token provided.
    -   `403 Forbidden`: Invalid or expired token.
    -   `500 Internal Server Error`: Database error.

---

### 4. Create a New Admin User

-   **Endpoint:** `POST /api/admin/users`
-   **Description:** Creates a new admin user. Password will be hashed before storage.
    *(Consider if this endpoint should have role-based restrictions, e.g., only creatable by a superadmin).*
-   **Headers:**
    -   `Authorization: Bearer <your_jwt_token>`
-   **Request Body:**
    ```json
    {
      "email": "newadmin@example.com",
      "full_name": "New Admin",
      "password": "securePassword123"
    }
    ```
-   **Responses:**
    -   `201 Created`: Admin user created. Returns the created user object (excluding password hash).
        ```json
        {
          "id": "new-admin-uuid",
          "email": "newadmin@example.com",
          "full_name": "New Admin",
          "created_at": "..."
        }
        ```
    -   `400 Bad Request`: Missing required fields.
    -   `401 Unauthorized`: No token provided.
    -   `403 Forbidden`: Invalid/expired token or insufficient privileges (if role system implemented).
    -   `409 Conflict`: If an admin user with this email already exists.
        ```json
        { "error": "Admin user with this email already exists." }
        ```
    -   `500 Internal Server Error`: Database error.

---

### 5. Update an Admin User

-   **Endpoint:** `PUT /api/admin/users/:id`
-   **Description:** Updates an existing admin user's details (e.g., email, full_name). Password updates should be handled via a separate, secure mechanism (e.g., a dedicated "change password" endpoint).
-   **Headers:**
    -   `Authorization: Bearer <your_jwt_token>`
-   **URL Parameters:**
    -   `id` (string, required): The UUID of the admin user to update.
-   **Request Body:** Object containing fields to update.
    ```json
    {
      "email": "updatedadmin@example.com",
      "full_name": "Updated Admin Name"
    }
    ```
-   **Responses:**
    -   `200 OK`: Update successful. Returns the updated admin user object.
    -   `400 Bad Request`: No valid fields to update provided.
    -   `401 Unauthorized`: No token provided.
    -   `403 Forbidden`: Invalid/expired token or insufficient privileges (e.g., trying to edit another user without superadmin rights).
    -   `404 Not Found`: Admin user with the given ID not found.
    -   `409 Conflict`: If trying to update email to one that already exists for another user.
    -   `500 Internal Server Error`: Database error.

---

### 6. Delete an Admin User

-   **Endpoint:** `DELETE /api/admin/users/:id`
-   **Description:** Deletes an admin user by ID.
    *(Consider if this endpoint should have role-based restrictions, e.g., only deletable by a superadmin, and preventing self-deletion via this route).*
-   **Headers:**
    -   `Authorization: Bearer <your_jwt_token>`
-   **URL Parameters:**
    -   `id` (string, required): The UUID of the admin user to delete.
-   **Request Body:** None
-   **Responses:**
    -   `200 OK`: Deletion successful. Returns a message and the deleted user's basic info.
        ```json
        {
          "message": "Admin user deleted successfully",
          "deletedUser": { "id": "admin-uuid", "email": "deleted@example.com", "full_name": "Deleted Admin" }
        }
        ```
    -   `401 Unauthorized`: No token provided.
    -   `403 Forbidden`: Invalid/expired token or insufficient privileges.
    -   `404 Not Found`: Admin user not found.
    -   `500 Internal Server Error`: Database error.

---

This documentation should be kept up-to-date as the API evolves.
The database schema details (table names, column names) are defined in the respective route handlers (e.g., `server/routes/appointments.js`) and the `db.js` module interacts with PostgreSQL.
Refer to `server/.env` for environment variable configurations (database connection, CORS origins, JWT_SECRET).
