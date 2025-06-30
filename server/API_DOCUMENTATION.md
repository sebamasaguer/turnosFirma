# API Documentation

This document provides details about the API endpoints for the appointments and admin functionalities.

**Base URL:** `/api` (mounted in `server/index.js`)

## Authentication

-   **Public Endpoints:** Appointment creation and listing (for available slots) are public.
-   **Admin Endpoints:** Currently use a **mock authentication** system (`POST /api/admin/login`). All other admin routes (`/api/admin/users/*`) have a placeholder `authenticateAdmin` middleware that does **not** enforce security. This needs to be replaced with a robust authentication mechanism (e.g., JWT).

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

All data is exchanged in JSON format.
**IMPORTANT: Authentication for these endpoints is currently placeholder/mock and NOT secure.**

---

### 1. Admin Login (Mock)

-   **Endpoint:** `POST /api/admin/login`
-   **Description:** Mock login for an admin user. Checks if email exists in `admin_users`. Does NOT verify password securely.
-   **Request Body:**
    ```json
    {
      "email": "admin@example.com",
      "password": "anypassword" // Password is not actually checked securely
    }
    ```
-   **Responses:**
    -   `200 OK`: Login successful (mock). Returns a message, user object, and a mock token.
        ```json
        {
          "message": "Login successful (mock)",
          "user": { "id": "admin-uuid", "email": "admin@example.com", "full_name": "Admin User" },
          "token": "mock-jwt-token"
        }
        ```
    -   `400 Bad Request`: If email or password is not provided.
        ```json
        { "error": "Email and password are required" }
        ```
    -   `401 Unauthorized`: If the email is not found in `admin_users`.
        ```json
        { "error": "Invalid credentials" }
        ```
    -   `500 Internal Server Error`: Database or other server error.

---

### 2. Get All Admin Users

-   **Endpoint:** `GET /api/admin/users`
-   **Description:** Retrieves a list of all admin users. (Requires actual authentication in production).
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
          },
          // ... other admin users
        ]
        ```
    -   `500 Internal Server Error`: Database error.

---

### 3. Create a New Admin User

-   **Endpoint:** `POST /api/admin/users`
-   **Description:** Creates a new admin user. (Requires actual authentication/authorization in production, e.g., superadmin only).
    **Security Warning:** Current implementation expects a plain text password and does not hash it. This is insecure.
-   **Request Body:**
    ```json
    {
      "email": "newadmin@example.com",
      "full_name": "New Admin",
      "password": "plainTextPassword123" // Highly insecure, for mock setup only
    }
    ```
-   **Responses:**
    -   `201 Created`: Admin user created. Returns the created user (excluding password).
        ```json
        {
          "id": "new-admin-uuid",
          "email": "newadmin@example.com",
          "full_name": "New Admin",
          "created_at": "..."
        }
        ```
    -   `400 Bad Request`: Missing required fields.
    -   `409 Conflict`: If an admin user with this email already exists.
        ```json
        { "error": "Admin user with this email already exists." }
        ```
    -   `500 Internal Server Error`: Database error.

---

### 4. Update an Admin User

-   **Endpoint:** `PUT /api/admin/users/:id`
-   **Description:** Updates an existing admin user's details (e.g., email, full_name). (Requires actual authentication in production). Password updates should be handled via a separate, secure mechanism.
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
    -   `404 Not Found`: Admin user with the given ID not found.
    -   `409 Conflict`: If trying to update email to one that already exists for another user.
    -   `500 Internal Server Error`: Database error.

---

### 5. Delete an Admin User

-   **Endpoint:** `DELETE /api/admin/users/:id`
-   **Description:** Deletes an admin user by ID. (Requires actual authentication in production).
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
    -   `404 Not Found`: Admin user not found.
    -   `500 Internal Server Error`: Database error.

---

This documentation should be kept up-to-date as the API evolves, especially when proper authentication and authorization are implemented.
The database schema details (table names, column names) are defined in the respective route handlers (e.g., `server/routes/appointments.js`) and the `db.js` module interacts with PostgreSQL.
Refer to `server/.env.example` or `server/.env` for environment variable configurations (database connection, CORS origins).
