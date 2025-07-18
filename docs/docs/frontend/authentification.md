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
