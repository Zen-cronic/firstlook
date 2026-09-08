# Google Cloud setup checklist — Agentic Cinema

_Current as of 2026-09-08. Project: `agentic-cinema-2026-kzh`; region: `us-central1`._

## Live Deployment & Cloud Resources

| Resource | Current value | Console / Location |
|---|---|---|
| **Google Cloud Project** | `agentic-cinema-2026-kzh` | [Project Dashboard](https://console.cloud.google.com/home/dashboard?project=agentic-cinema-2026-kzh) |
| **Billing Account** | `01C27D-9EBB10-630C72` (Open & Linked) | [Billing Overview](https://console.cloud.google.com/billing/01C27D-9EBB10-630C72) |
| **Google Cloud Storage Bucket** | `gs://agentic-cinema-2026-media` (`us-central1`) | [GCS Buckets](https://console.cloud.google.com/storage/browser/agentic-cinema-2026-media?project=agentic-cinema-2026-kzh) |
| **Vertex AI / Gemini 3.6 Flash & Veo 3.1** | `aiplatform.googleapis.com` (Enabled) | [Vertex AI](https://console.cloud.google.com/vertex-ai?project=agentic-cinema-2026-kzh) |
| **Cloud Run API** | `run.googleapis.com` (Enabled) | [Cloud Run](https://console.cloud.google.com/run?project=agentic-cinema-2026-kzh) |
| **Artifact Registry API** | `artifactregistry.googleapis.com` (Enabled) | [Artifact Registry](https://console.cloud.google.com/artifacts?project=agentic-cinema-2026-kzh) |
| **Secret Manager API** | `secretmanager.googleapis.com` (Enabled) | [Secret Manager](https://console.cloud.google.com/security/secret-manager?project=agentic-cinema-2026-kzh) |

---

## Configured Environment Values (`.env.local`)

| Environment Value | Configured Source |
|---|---|
| `GCP_PROJECT_ID` | `agentic-cinema-2026-kzh` |
| `GCS_BUCKET_NAME` | `agentic-cinema-2026-media` |
| `GEMINI_API_KEY` | Enabled for Gemini 3.6 Flash & Veo 3.1 proxy generator |
| `CLICKHOUSE_HOST` | `sql-clickhouse.clickhouse.com` (4.56B YouTube dataset via `mcp-clickhouse`) |

---

## Recorded Verification Checklist

- [x] GCP Project `agentic-cinema-2026-kzh` created & set as active.
- [x] GCP Billing Account linked (`01C27D-9EBB10-630C72`).
- [x] Vertex AI (`aiplatform`), Cloud Storage (`storage`), Cloud Run (`run`), Artifact Registry (`artifactregistry`), and Secret Manager (`secretmanager`) APIs enabled.
- [x] Google Cloud Storage bucket `gs://agentic-cinema-2026-media` created in `us-central1`.
- [x] Local `@google-cloud/storage` SDK integration verified.
- [x] Full local E2E verification suite (`npm run test:e2e`) passed.
- [x] Production build (`npm run build`) succeeded in 2.9s.
