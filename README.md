## Main frontend routes

-   `/` - User login/register
-   `/admin` - Admin login (super Monsalves admin panel)

## Quick Start

1. To start as admin first customize the backend env vars in `backend/.env` (TODO: add a .env file)
1. Run the backend server

    ```bash
    cd backend
    npm install
    npm run start
    # or for development
    npm run start:dev
    ```

1. Run the frontend server

    ```bash
    cd frontend
    npm install
    npm run start
    # or for development
    npm run dev
    ```

1. Then navigate to `/admin` in your browser (e.g. `http://localhost:5173/admin`).

1. Login with the admin credentials (user and password)

## Testing Users

For testing as a user run the server and login/register in the page root `/`
