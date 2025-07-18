---
sidebar_position: 2
---

# Auth

This project uses **Supabase** for authentication, supporting OAuth providers such as Google. Below you'll find details on how authentication, session management, and route protection work in our frontend and backend.

## Session Management
- User sessions are managed via JWT tokens.
- When a user logs in (e.g., with Google), a JWT is issued and stored in cookies.
- The session (JWT) is valid for 24 hours. After this period, the user is automatically signed out and cookies are cleared.

## Auth Providers
- **Supabase** handles authentication and supports OAuth (e.g., Google sign-in).
- Users can log in using their Google account.

## JWT and Cookies
- After successful login, a JWT is generated and saved in a cookie while the user is logged in.
- The JWT is included in the `Authorization` header for every request to protected endpoints.
- Example header:
  ```http
  Authorization: Bearer <your_token>
  ```
- To get your token:
  1. Log in via the app.
  2. Open DevTools → Application → Cookies → Host URL (e.g., localhost:3002).
  3. Copy the value of the `token` cookie.
- The JWT is used for server-side authentication.

## Protected Routes
- Most endpoints are protected and require a valid JWT in the `Authorization` header.
- If a request does not include a valid Bearer token, it will return `401 Unauthorized`.
- The following routes are **public** (do not require authentication):
  - `/`
  - `/docs`
  - `/redoc`
  - `/openapi.json`
  - `/scheduler/tick`
  - `/topics`
- All other routes are protected.


## Sign Out Timeout
- Sessions automatically expire after 24 hours (session timeout).
- When the session expires, cookies are cleared and the user is signed out.

## Environment Variables
- Add the following to your `.env` file:
  ```env
  SUPABASE_JWT_SECRET=<get it from Notion>
  ```
- For testing, you can disable authentication by setting:
  ```env
  DISABLE_AUTH=true
  ```

## Session Expiry Notification
- When your session expires, you will receive a notification (toast) informing you that your session has expired for security reasons and you will be logged out automatically. This helps ensure you are aware of session timeouts and can log in again as needed.

## Session State Tracking
- The application uses `sessionStorage` to track if you have had a valid session and whether the session expiration notification has already been shown. This prevents duplicate notifications and improves user experience.

## Public Page Handling on Sign Out
- When you sign out, the app checks if you are on a public page (such as `/`, `/login`, `/register`, `/privacy`, `/forgot-password`). If you are not, you will be redirected to the homepage. If you are already on the homepage, the page will refresh to reflect your signed-out state.

## Token Refresh Handling
- When your authentication token is refreshed (for example, after a period of inactivity), the new token is automatically saved in your cookies. This ensures that your session remains valid and you do not need to log in again unnecessarily.

## Error Handling on Sign Out
- If there is an error during sign out, you will see a notification (toast) explaining that sign out failed, and your previous session will be restored so you can try again.

## Mock Authentication for Development
- In development mode, the app can be configured to use a mock authenticated user for testing purposes. This allows developers to simulate logged-in states without needing to go through the full authentication flow.
