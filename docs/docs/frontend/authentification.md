---
sidebar_position: 2
---

# Auth

**Author:** `Nguyen Duc Trung`

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

## `useAuth` Hook

For the full implementation and latest updates of the authentication logic, see the [`useAuth` hook in the openeu-frontend repository on GitHub](https://github.com/jst-seminar-rostlab-tum/openeu-frontend/blob/main/src/domain/hooks/useAuth.tsx).

Also check out relevant authentification action in frontend repo: 
- [Auth action implementation](https://github.com/jst-seminar-rostlab-tum/openeu-frontend/blob/main/src/domain/actions/auth.ts): Core authentication actions and logic.
- [Login with Google action](https://github.com/jst-seminar-rostlab-tum/openeu-frontend/blob/main/src/domain/actions/login-with-google.ts): Implementation for Google OAuth login.

This hook provides:
- Real-time authentication state (user, loading, signOut)
- Automatic session expiration and notification
- Token refresh and cookie management
- Sign out logic with public route handling

## Public Pages

[Middleware that handles public page](https://github.com/jst-seminar-rostlab-tum/openeu-frontend/blob/main/src/lib/supabase/middleware.ts)

- The following routes in the frontend are **public** and do not require authentication:
  - `/privacy`
  - `/`
  - `/login`
  - `/register`
  - `/forgot-password`
  - `/auth/confirm`
  - `/auth/callback`
  - `/auth/error`
- **Every other route in the frontend should be considered protected and will require authentication.**
- If a request to a protected route does not include a valid Bearer token, it will return `401 Unauthorized`.

## Sign Out Timeout
- Sessions automatically expire after 24 hours (session timeout).
- When the session expires, cookies are cleared and the user is signed out.

## Environment Variables
- Add the following to your `.env` file:
  ```env
  SUPABASE_JWT_SECRET=<get it from Notion>
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


## How to View Your Authentication Cookie in Chrome

To manually view or copy your authentication token (JWT) stored in cookies using Google Chrome:

1. Open your app in Chrome and log in.
2. Right-click anywhere on the page and select **Inspect** to open DevTools.
3. Go to the **Application** tab in DevTools.
4. In the left sidebar, expand the **Cookies** section and select your app's URL (e.g., `http://localhost:3002`).
5. In the main panel, look for the `token` cookie. You can view or copy its value for use in API requests or debugging.

This is useful for testing authenticated requests or debugging authentication issues.
