# Google Cloud and Firebase setup checklist — FirstLook

_Current as of 2026-09-08. Project: `agentic-cinema-2026-kzh`; region: `us-central1`._

## Live Deployment & Cloud Resources

| Resource | Current value | Console / Location |
|---|---|---|
| **Google Cloud Project** | `agentic-cinema-2026-kzh` | [Project Dashboard](https://console.cloud.google.com/home/dashboard?project=agentic-cinema-2026-kzh) |
| **Billing Account** | `01C27D-9EBB10-630C72` (Open & Linked) | [Billing Overview](https://console.cloud.google.com/billing/01C27D-9EBB10-630C72) |
| **Google Cloud Storage Bucket** | `gs://agentic-cinema-2026-media` (`us-central1`) | [GCS Buckets](https://console.cloud.google.com/storage/browser/agentic-cinema-2026-media?project=agentic-cinema-2026-kzh) |
| **Vertex AI API (Gemini & Veo)** | `aiplatform.googleapis.com` (Enabled) | [Vertex AI](https://console.cloud.google.com/vertex-ai?project=agentic-cinema-2026-kzh) |
| **Cloud Run API** | `run.googleapis.com` (Enabled) | [Cloud Run](https://console.cloud.google.com/run?project=agentic-cinema-2026-kzh) |
| **Artifact Registry API** | `artifactregistry.googleapis.com` (Enabled) | [Artifact Registry](https://console.cloud.google.com/artifacts?project=agentic-cinema-2026-kzh) |
| **Live Cloud Run Deployment** | [https://firstlook-web-933560214849.us-central1.run.app](https://firstlook-web-933560214849.us-central1.run.app) | [Cloud Run Service Console](https://console.cloud.google.com/run/detail/us-central1/firstlook-web?project=agentic-cinema-2026-kzh) |
| **Artifact Registry Container** | `us-central1-docker.pkg.dev/agentic-cinema-2026-kzh/firstlook/firstlook-web:latest` | [Artifact Registry Console](https://console.cloud.google.com/artifacts/docker/agentic-cinema-2026-kzh/us-central1/firstlook?project=agentic-cinema-2026-kzh) |
| **ClickHouse MCP Target** | `sql-clickhouse.clickhouse.com:8443` (4.56B YouTube dataset) | [Playground](https://sql-clickhouse.clickhouse.com) |

---

## Google Cloud Provisioning Step-by-Step

### 1. Project Initialization & Billing Linkage
```bash
# Set active GCP Project
gcloud config set project agentic-cinema-2026-kzh

# Link Billing Account
gcloud billing projects link agentic-cinema-2026-kzh --billing-account=01C27D-9EBB10-630C72
```

### 2. Enable Required Google Cloud APIs
```bash
gcloud services enable \
  aiplatform.googleapis.com \
  storage.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  --project=agentic-cinema-2026-kzh
```

### 3. Create Google Cloud Storage Bucket for Video & Media
```bash
gcloud storage buckets create gs://agentic-cinema-2026-media \
  --location=us-central1 \
  --project=agentic-cinema-2026-kzh
```

### 4. Configure Cloud Run & Artifact Registry (Production Container Deploy)
```bash
# Create Artifact Registry Docker Repository
gcloud artifacts repositories create firstlook \
  --repository-format=docker \
  --location=us-central1 \
  --description="FirstLook Docker container repository" \
  --project=agentic-cinema-2026-kzh

# Submit Cloud Build to compile & push container image
gcloud builds submit \
  --tag=us-central1-docker.pkg.dev/agentic-cinema-2026-kzh/firstlook/firstlook-web:latest \
  --project=agentic-cinema-2026-kzh

# Deploy container to Cloud Run
gcloud run deploy firstlook-web \
  --image=us-central1-docker.pkg.dev/agentic-cinema-2026-kzh/firstlook/firstlook-web:latest \
  --region=us-central1 \
  --allow-unauthenticated \
  --memory=2Gi \
  --cpu=2 \
  --timeout=300 \
  --set-env-vars="GCP_PROJECT_ID=agentic-cinema-2026-kzh,GCS_BUCKET_NAME=agentic-cinema-2026-media,CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com,CLICKHOUSE_PORT=8443,CLICKHOUSE_USER=demo,CLICKHOUSE_SECURE=true,CLICKHOUSE_ALLOW_WRITE_ACCESS=true,NODE_ENV=production" \
  --project=agentic-cinema-2026-kzh
```

---

## Configured Environment Values (`.env.local`)

| Environment Value | Configured Value / Source |
|---|---|
| `GCP_PROJECT_ID` | `agentic-cinema-2026-kzh` |
| `GCS_BUCKET_NAME` | `agentic-cinema-2026-media` |
| `GEMINI_API_KEY` | Google AI Studio Key (Gemini 3.6 Flash & Veo 3.1) |
| `CLICKHOUSE_HOST` | `sql-clickhouse.clickhouse.com` (4.56B YouTube rows via `mcp-clickhouse`) |
| `CLICKHOUSE_PORT` | `8443` |
| `CLICKHOUSE_USER` | `demo` |
| `CLICKHOUSE_SECURE` | `true` |
| `CLICKHOUSE_ALLOW_WRITE_ACCESS` | `true` |

---

## Security & Access Model

- Runtime storage access is mediated via `@google-cloud/storage` with Application Default Credentials (ADC) or explicit scoped keys.
- ClickHouse queries strictly execute via the official `mcp-clickhouse` stdio tool transport.
- No real social media accounts are connected; publishing actions transition to honest `Published · SIM` badges with `synthetic = 1` tagging.

---

## Recorded Verification Record

Verified `2026-09-08`:
- GCP Project `agentic-cinema-2026-kzh` created & set active;
- Billing account `01C27D-9EBB10-630C72` linked;
- Vertex AI, GCS, Cloud Run, Artifact Registry, and Secret Manager APIs enabled;
- GCS bucket `gs://agentic-cinema-2026-media` created in `us-central1`;
- ClickHouse MCP scanned **4,557,605,031 rows** in `youtube.youtube`;
- Sintel 4K clips ingested and probed;
- Remotion compositions rendered (16:9 Teaser, 9:16 Vertical, 4:5 Poster);
- End-to-end automated test suite passed (`npm run test:e2e`);
- Next.js production build succeeded in 2.9s;
- Artifact Registry container image built & pushed (`us-central1-docker.pkg.dev/agentic-cinema-2026-kzh/firstlook/firstlook-web:latest`);
- Production Cloud Run service live and serving 100% of traffic: `https://firstlook-web-933560214849.us-central1.run.app`;
- Live Cloud Run HTTP/2 200 response and ClickHouse MCP 4.56B-row query verified on `https://firstlook-web-933560214849.us-central1.run.app/api/benchmark`.
