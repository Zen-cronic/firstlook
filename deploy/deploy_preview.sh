#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# FirstLook Cloud Run Reproducible Deploy Script
# Targets GCP project: agentic-cinema-2026-kzh (Region: us-central1)
# ==============================================================================

PROJECT_ID="${GCP_PROJECT_ID:-agentic-cinema-2026-kzh}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="firstlook-web"
REPO_NAME="firstlook-repo"
BUCKET_NAME="${GCS_BUCKET_NAME:-agentic-cinema-2026-media}"
COMMIT_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo "manual-$(date +%s)")"
IMAGE_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}:${COMMIT_SHA}"
LATEST_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}:latest"

echo "=== FirstLook Cloud Run Deploy ==="
echo "Project:   ${PROJECT_ID}"
echo "Region:    ${REGION}"
echo "Service:   ${SERVICE_NAME}"
echo "Image Tag: ${IMAGE_TAG}"
echo "Commit:    ${COMMIT_SHA}"
echo ""

# 1. Ensure required APIs are enabled
echo ">>> Checking required Google Cloud APIs..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  storage.googleapis.com \
  aiplatform.googleapis.com \
  --project="${PROJECT_ID}"

# 2. Ensure Artifact Registry repository exists
echo ">>> Ensuring Artifact Registry repository exists..."
if ! gcloud artifacts repositories describe "${REPO_NAME}" --location="${REGION}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
  echo "Creating Artifact Registry repository: ${REPO_NAME} in ${REGION}..."
  gcloud artifacts repositories create "${REPO_NAME}" \
    --repository-format=docker \
    --location="${REGION}" \
    --description="FirstLook container images" \
    --project="${PROJECT_ID}"
fi

# 3. Build container via Cloud Build
echo ">>> Submitting build to Google Cloud Build..."
gcloud builds submit \
  --tag="${IMAGE_TAG}" \
  --project="${PROJECT_ID}"

# Also tag as latest
gcloud artifacts docker images add-tag "${IMAGE_TAG}" "${LATEST_TAG}" --quiet || true

# 4. Deploy to Cloud Run with Secret Manager and environment bindings
echo ">>> Deploying container to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image="${IMAGE_TAG}" \
  --region="${REGION}" \
  --platform=managed \
  --allow-unauthenticated \
  --memory=2Gi \
  --cpu=2 \
  --timeout=300s \
  --set-secrets="GEMINI_API_KEY=gemini-api-key:latest,CLICKHOUSE_PASSWORD=clickhouse-password:latest" \
  --set-env-vars="GCP_PROJECT_ID=${PROJECT_ID},GCS_BUCKET_NAME=${BUCKET_NAME},CLICKHOUSE_HOST=k50lgadaib.us-central1.gcp.clickhouse.cloud,CLICKHOUSE_PORT=8443,CLICKHOUSE_SECURE=true,CLICKHOUSE_USER=default,CLICKHOUSE_ALLOW_WRITE_ACCESS=true,CLICKHOUSE_READ_ONLY_HOST=play.clickhouse.com,CLICKHOUSE_READ_ONLY_PORT=443" \
  --project="${PROJECT_ID}"

# 5. Fetch and display live URL
LIVE_URL="$(gcloud run services describe "${SERVICE_NAME}" --platform=managed --region="${REGION}" --project="${PROJECT_ID}" --format='value(status.url)')"
echo ""
echo "================================================="
echo "  DEPLOY SUCCESSFUL!"
echo "  Live URL: ${LIVE_URL}"
echo "================================================="
