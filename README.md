

# STRUCTURE

```
/frontend
  ├── introduction
  │     - Frontend tech stack overview
  │
  ├── authentication
  │     - Session management
  │     - Auth providers (OAuth, etc.)
  │     - JWT and cookies
  │     - Protected routes
  │
  ├── data fetching
  │     - React Query usage
  │     - Built-in caching
  │     - Server actions
  │     - Query invalidation
  │     - Mutations
  │     - OpenAPI model generation
  │
  ├── maps
  │     - Leaflet setup
  │     - Map layers
  │     - GeoJSON integration
  │
  └── deployment
        - Deployment targets (e.g., Vercel, Netlify)
        - Required environment variables

/backend
  ├── introduction
  │
  ├── scheduling + jobs
  │     - Job types and schedulers used
  │
  ├── search
  │     - Search implementation and indexing
  │
  ├── chat
  │     - Chat logic and architecture
  │
  ├── scraping
  │     - Libraries used
  │     - `ScraperBase` class
  │     - Timeout handling
  │     - Error handling strategies
  │
  ├── deployment
  │     - Backend deployment details
  │
  ├── middleware
  │     - Middleware patterns and examples
  │
  └── db
        - Supabase as DB
        - Declarative schema management
        - Supabase branching strategy
```


# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
