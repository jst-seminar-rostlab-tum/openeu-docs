---
sidebar_position: 2
---

# Deployment

**Author:** `Trung Nguyen`

This document outlines the deployment strategy for the backend service, which is primarily deployed using **Render** as a Docker container.

## Production Deployment (Render)

The production backend is deployed on Render and is accessible at:
[https://openeu-backend-1.onrender.com](https://openeu-backend-1.onrender.com)

### Deployment Method: Docker Container

The backend is deployed as a Docker container on Render. Render automatically builds the Docker image from the `Dockerfile` located in the root of the backend repository.

**Docker Configuration Files:**
- **Main Dockerfile:** [Dockerfile](https://github.com/jst-seminar-rostlab-tum/openeu-backend/blob/main/Dockerfile) - Contains the main application build instructions
- **Base Dockerfile:** [Dockerfile.base](https://github.com/jst-seminar-rostlab-tum/openeu-backend/blob/main/Dockerfile.base) - Contains the base image configuration that serves to reduce deployment time by pre-building common dependencies and system packages

**Build and Deploy Process on Render:**
1. **Connect Repository:** Render is connected to the backend's Git repository (e.g., GitHub, GitLab).
2. **Dockerfile Detection:** Render automatically detects the `Dockerfile` in the repository.
3. **Automated Builds:** Upon every push to the configured branch (e.g., `main`), Render triggers an automated build process:
   - It pulls the latest code.
   - It builds the Docker image based on the `Dockerfile`.
   - Once the image is built successfully, it deploys the new container instance.
4. **Environment Variables:** Ensure all necessary environment variables are configured in your Render service settings.

### Required Environment Variables

The following environment variables must be configured in your Render service settings:

**Supabase Configuration:**
- `SUPABASE_PROJECT_URL` - Your Supabase project URL
- `SUPABASE_REST_KEY` - Your Supabase REST API key
- `SUPABASE_JWT_SECRET` - Your Supabase JWT secret
- `SUPABASE_PROJECT_ID` - Your Supabase project ID

**API Keys:**
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `DEEPL_API_KEY` - DeepL API key for translation services
- `COHERE_API_KEY` - Cohere API key for AI features
- `BREVO_API_KEY` - Brevo API key for email services
- `TWITTER_API_KEY` - Twitter API key for social media features
- `BUNDESTAG_KEY` - Bundestag API key
- `CRAWLER_API_KEY` - Crawler API key

**Docker Registry (if applicable):**
- `DOCKER_REGISTRY_USERNAME` - Docker registry username
- `DOCKER_REGISTRY_PASSWORD` - Docker registry password
- `DOCKER_REGISTRY_SERVER` - Docker registry server URL

**System Configuration:**
- `PYTHON_VERSION` - Python version for the container
- `POETRY_VERSION` - Poetry version for dependency management

## Local Deployment

For local development and testing, you can run the backend as a Docker container on your local machine.

### Prerequisites
- Docker and Docker Compose installed on your system
- Access to the backend repository

### Build and Run Locally

1. **Build the Docker Image:**
   Navigate to the root of your backend repository and build the Docker image:
   ```bash
   docker build -t openeu-backend .
   ```

2. **Run the Container:**
   You can run the container, mapping ports and providing necessary environment variables:
   ```bash
   docker run -p 8000:8000 \
     -e SUPABASE_PROJECT_URL="your_supabase_url" \
     -e SUPABASE_REST_KEY="your_supabase_rest_key" \
     -e SUPABASE_JWT_SECRET="your_jwt_secret" \
     openeu-backend
   ```

   Alternatively, if you have a `docker-compose.yml` file, you can use:
   ```bash
   docker-compose up
   ```

3. **Environment Variables for Local Development:**
   Create a `.env` file in your backend repository root with the same environment variables listed above.

## Remote Deployment

### Staging/Preview Environments

For testing changes before production deployment:

1. **Create a new Render service** for your staging environment
2. **Connect to a feature branch** instead of the main branch
3. **Configure the same environment variables** as production
4. **Deploy automatically** on pushes to the feature branch

### Manual Deployment

If you need to deploy manually:

1. **Trigger a new deployment** from the Render dashboard
2. **Monitor the build logs** for any issues
3. **Verify the deployment** by checking the service health

## Supabase Preview Environments (Branching)

Supabase offers a powerful feature for preview environments through its branching capabilities. While the backend is deployed on Render, its interaction with Supabase can leverage this:

- **Database Branching:** For each new feature branch in your backend repository, you can create a corresponding database branch in Supabase. This allows you to test backend changes against an isolated database schema and data, preventing conflicts with the main production database.

- **Connecting Preview Backends:** When deploying a preview version of your backend (e.g., a staging environment on Render for a specific Git branch), you would configure that backend instance to connect to its dedicated Supabase database branch using the appropriate `SUPABASE_PROJECT_URL` and `SUPABASE_REST_KEY` for that branch.

- **Isolated Testing:** This setup ensures that changes to your backend's database interactions can be thoroughly tested in isolation before merging to `main` and deploying to production.

### Setting Up Supabase Branching

1. **Create a Database Branch:**
   - Go to your Supabase project dashboard
   - Navigate to **Database** > **Branches**
   - Create a new branch for your feature

2. **Configure Backend for Branch:**
   - Update your backend's environment variables to use the branch-specific Supabase URL and keys
   - Deploy the backend to your staging environment

3. **Test and Merge:**
   - Test your changes against the branch database
   - Once satisfied, merge your code changes and database schema changes

## Build and Deploy Process

### Automated Deployment Flow

1. **Code Push:** Developer pushes code to the repository
2. **Render Detection:** Render detects the push and starts the build process
3. **Docker Build:** Render builds the Docker image using the `Dockerfile`
4. **Environment Setup:** Render applies the configured environment variables
5. **Container Deployment:** The new container is deployed and the old one is replaced
6. **Health Check:** Render verifies the deployment is healthy
7. **Traffic Routing:** Traffic is routed to the new container

### Manual Deployment Steps

If you need to deploy manually:

1. **Build Locally (Optional):**
   ```bash
   docker build -t openeu-backend .
   docker push your-registry/openeu-backend:latest
   ```

2. **Trigger Render Deployment:**
   - Go to your Render service dashboard
   - Click "Manual Deploy"
   - Select the branch/commit to deploy

3. **Monitor Deployment:**
   - Watch the build logs for any errors
   - Verify the service is healthy after deployment

## Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check the Dockerfile syntax
   - Verify all dependencies are properly specified
   - Review build logs for specific error messages

2. **Environment Variable Issues:**
   - Ensure all required environment variables are set in Render
   - Verify the variable names match exactly (case-sensitive)
   - Check for any typos in the values

3. **Container Startup Issues:**
   - Review the application logs in Render
   - Verify the container can bind to the specified port
   - Check if all required services are accessible

### Monitoring and Logs

- **Render Logs:** Access application logs through the Render dashboard
- **Health Checks:** Monitor the service health status
- **Performance:** Track response times and resource usage

## Security Considerations

- **Environment Variables:** Never commit sensitive environment variables to the repository
- **API Keys:** Rotate API keys regularly and use different keys for different environments
- **Access Control:** Limit access to the Render dashboard and repository
- **Database Security:** Use Supabase's security features and follow best practices for database access
