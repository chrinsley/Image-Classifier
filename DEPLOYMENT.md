# Deployment

The frontend is deployed to Vercel and the Django API to Render. The Render
service uses a persistent disk for the SQLite database and uploaded images.

## Render API

1. Push this repository to GitHub. Make sure `model_state.pth` at the
   repository root is included; the API needs it to load the classifier.
2. In Render, create a **Blueprint** from the repository and apply the
   settings in `render.yaml`. The service root directory is `Backend`.
3. Wait for the deployment to finish. The API URL will look like
   `https://image-classifier-api.onrender.com`.

The Blueprint provisions a 1 GB persistent disk. This is required for SQLite
and uploaded images to survive service restarts and deployments.

## Vercel frontend

1. Import the same GitHub repository into Vercel.
2. Set the project **Root Directory** to `Frontend/my-app`.
3. Add the environment variable `NEXT_PUBLIC_API_URL`, set to the Render API
   URL with a trailing slash, for example
   `https://image-classifier-api.onrender.com/`.
4. Deploy or redeploy the project after setting the variable.
5. In Render, set `CORS_ALLOWED_ORIGINS` to the Vercel site's origin, for
   example `https://your-app.vercel.app` (no trailing slash), then redeploy
   the API.

If you use a custom Vercel domain, add that domain's origin to the Render
service's `CORS_ALLOWED_ORIGINS` environment variable and redeploy the API.

## Local frontend

Copy `.env.example` to `.env.local` in `Frontend/my-app` if you need to change
the local API URL. Do not commit environment files containing secrets.
