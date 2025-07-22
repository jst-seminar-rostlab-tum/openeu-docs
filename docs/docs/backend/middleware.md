# Middleware

**Author**: Magnus Singer

## Overview

The backend middleware consists of two parts: the CORS middleware handing the allowed request origins and the
authentication middleware handling the request security.

## 📦 CORS Middleware

The CORS middleware checks that requests to the backend only get processed by valid origins. Any request coming from
another origin than the ones specified gets blocked. The code for the middleware looks like this:

```python
class CustomCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin")
        is_allowed_origin = origin and (
            origin.startswith("http://localhost")
            or origin.endswith("netlify.app") # endswith because of netlify project subdomain
            or origin.endswith("openeu.csee.tech") # we can use startswith and endswith, both works
        )

        if request.method == "OPTIONS" and is_allowed_origin:
            response = PlainTextResponse("Preflight OK", status_code=200)
        else:
            response = await call_next(request)

        if is_allowed_origin:
            response.headers["Access-Control-Allow-Origin"] = origin # set the current origin as allowed when it's in the defined ones
            response.headers["Access-Control-Allow-Credentials"] = "true" # allow request credentials for authentication
            response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS,PATCH" # allowed request methods
            response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization" # allowed headers for authentication

        return response
```

The important part is from line 4 to line 7, where we define the allowed origins and block any request with no origin or
other than the ones defined here.

We also set some response headers in line 16 to 19 in order to tell the origin what's allowed on the backend and what's
not.

## 💂‍♀️ Authentication Middleware

The authentication middleware makes sure that requests can only be made from signed-in users. The code looks like this:

````python
class JWTMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        # Public pages
        self.public_paths = [
            r"^/$",
            r"^/docs$",
            r"^/redoc$",
            r"^/openapi.json$",
            r"^/topics",
            r"^/countries",
        ]

    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)

        # Skip for public pages
        for pattern in self.public_paths:
            if re.match(pattern, request.url.path):
                response = await call_next(request)
                return response

        # Check if auth header is there
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Authentication required. Missing Authorization header."},
                headers={"WWW-Authenticate": "Bearer"},
            )

        try:
            scheme, token = auth_header.split()
            if scheme.lower() != "bearer":
                raise ValueError("Invalid authentication scheme. Must be Bearer.")

            # Call the decode method to get the credentials from the token
            payload = decode_supabase_jwt(token)
            # Store the decoded user information in request.state
            # This makes the user object available to any endpoint via `request.state.user`
            # or through the `get_current_user` dependency.
            request.state.user = User(id=payload.get("sub"), email=payload.get("email"))

        except (ValueError, HTTPException) as e:
            detail = getattr(e, "detail", str(e))

            # If the token is invalid (i.e. timed out)
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": f"Invalid authentication token: {detail}"},
                headers={"WWW-Authenticate": "Bearer"},
            )
        except Exception as e:
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": f"An unexpected error occurred during authentication: {e}"},
                headers={"WWW-Authenticate": "Bearer"},
            )

        response = await call_next(request)
        return response
````

We can define some exception routes where requests can also be made by signed-out users. This happens in the
``__init__`` method where we exclude for example the docs pages.

The decoding of the authentication token is done with the standard JWT decode method and uses the Supabase project JWT
secret. The method looks like this:

````python
def decode_supabase_jwt(token: str) -> dict:
    try:
        # decoding happens here
        payload = jwt.decode(token, settings.get_supabase_jwt_secret(), algorithms=["HS256"], audience="authenticated")
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during token decoding: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None
````

We also implemented user access control for certain endpoints, where we call the ``check_request_user_id`` method at the
beginning of the endpoint and inside of that check the authenticated user against the request user id. The method for
this looks like this:

````python
def check_request_user_id(request: Request, user_id: str | None):
    if settings.get_disable_auth():
        return
    user = get_current_user(request)

    if not user or user.id != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID does not match with authentication",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None
````
