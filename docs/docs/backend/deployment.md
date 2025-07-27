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

**Redeploying the Base Docker Image:**
If you make changes to the base image (`Dockerfile.base`), you need to rebuild and push the updated base image before deploying the main application image. This ensures all subsequent builds use the latest base image.

Steps:
1. Build the new base image locally:
   ```bash
   docker build -f Dockerfile.base -t your-registry/openeu-backend-base:latest .
   ```
2. Push the base image to your Docker registry:
   ```bash
   docker push your-registry/openeu-backend-base:latest
   ```
3. Trigger a rebuild of the main application image (push a commit or trigger a manual deploy in Render) so it uses the updated base image.

**Build and Deploy Process on Render:**
1. **Connect Repository:** Render is connected to the backend's Github repository
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


## Supabase Preview Environments (Branching)

- **Supabase Branch Integration:**
- For each PR, a new Supabase database branch is automatically created
- The branch is populated with seed data from [supabase/seed.sql](https://github.com/jst-seminar-rostlab-tum/openeu-backend/blob/main/supabase/seed.sql) which can also be extended for testing purpose.
- The preview backend connects dynamically to the PR-specific Supabase branch using this function from [app/core/config.py](https://github.com/jst-seminar-rostlab-tum/openeu-backend/blob/d12295afd3dee45097b3cf79d4cb161dd76e398c/app/core/config.py#L12C5-L47C22)
- This ensures complete isolation for testing database changes and API interactions


## Remote Deployment

### Preview Deployments (Pull Requests)

Render automatically creates preview deployments for each pull request, allowing you to test changes before merging to production.

**Preview URL:** [https://dashboard.render.com/web/srv-d0vdf7vfte5s739i276g/previews](https://dashboard.render.com/web/srv-d0vdf7vfte5s739i276g/previews)

**Features:**
- Each PR gets its own isolated preview environment
- Preview deployments are automatically created when PRs are opened
- You can configure which PRs should create previews (to manage costs)
- **Cost Note:** The longer a preview exists, the more it costs, so remember to close PRs or delete previews when no longer needed



**Configuration Options:**
- Enable/disable preview deployments for specific branches
- Set automatic preview deletion after a certain time period
- Configure preview environment variables (can be different from production)

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
