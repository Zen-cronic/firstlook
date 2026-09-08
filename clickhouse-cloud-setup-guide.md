# ClickHouse Cloud Setup & MCP Configuration Guide

_Comprehensive setup guide for provisioning a dedicated ClickHouse Cloud service, obtaining credentials, and connecting the official `mcp-clickhouse` server for FirstLook._

---

## 1. Overview & Architecture

FirstLook utilizes a hybrid ClickHouse architecture:

1. **Read Leg (4.56B YouTube Trailer Benchmark)**:
   - Connects to ClickHouse's public SQL Playground (`sql-clickhouse.clickhouse.com:8443`, user `demo`).
   - Scans 4,557,605,031 real YouTube video rows across 44,000+ movie trailers to compute real median and p90 engagement benchmarks.
   - Requires **no private credentials**.

2. **Write Leg (Dedicated Campaign Events & Revisions)**:
   - Connects to your private ClickHouse Cloud cluster (using hackathon credits or free tier).
   - Ingests simulated campaign impressions, viewer A/B test votes, and Gemini telemetry into high-throughput `MergeTree` tables (`campaign_events`).
   - Requires **dedicated service credentials** via `mcp-clickhouse`.

---

## 2. Step-by-Step Provisioning in ClickHouse Cloud

### Step 1: Create a New Service

1. Navigate and log in to **[console.clickhouse.cloud](https://console.clickhouse.cloud)**.
2. On the **Services** overview dashboard, click the **+ New service** button in the top-right corner.
3. Configure your service parameters:
   - **Environment**: Select **Development** (or Production if using dedicated cluster credits).
   - **Cloud Provider**: Select **GCP** (recommended to co-locate in `us-central1` with your Google Cloud Run instances) or **AWS**.
   - **Region**: Choose the region matching your deployment (e.g., `us-central1` or `us-east-1`).
   - **Service Name**: Enter an identifiable name, such as `firstlook-prod` or `agentic-cinema`.
4. Click **Create Service**.

---

### Step 2: Capture the Initial Admin Password (One-Time Gate)

Immediately after clicking Create, ClickHouse presents a one-time credential modal dialog:

- **Default User**: `default`
- **Generated Password**: ClickHouse generates a strong cryptographic password (e.g. `kZh9...`).
- **Action**: Click **Copy** and store this password in a secure password manager or `.env.local` immediately.

> [!WARNING]
> ClickHouse Cloud stores only salted hashes. It **cannot reveal this password again** once this dialog is dismissed (though you can reset it later from the service settings).

---

### Step 3: Configure Network Access (IP Whitelisting)

By default, new ClickHouse Cloud services restrict incoming connections:

1. In the service setup screen, or from your service page under **Settings** → **Security** / **IP Access List**:
2. Click **Add IP address**.
3. Choose:
   - **"Allow access from anywhere" (`0.0.0.0/0`)**: Recommended so that both your local workstation and the dynamic Google Cloud Run container instances can establish HTTPS connections.
   - Alternatively, add your workstation public IP and the Google Cloud VPC Serverless Connector NAT IP.
4. Save the network configuration.

---

### Step 4: Retrieve Hostname & Connection Endpoints

1. Wait for the service state to change to green **Running**.
2. Click into your service and click the **Connect** button in the top navigation.
3. Under **Connection Details** (or **Node.js** tab), note:
   - **Host**: e.g., `x8z7wq99ab.us-central1.gcp.clickhouse.cloud` (without `https://` prefix or `:8443` suffix).
   - **HTTPS Port**: `8443` (secure TLS).
   - **Native Protocol Port**: `9440` (secure).
   - **Username**: `default`
   - **Password**: Your copied password from Step 2.
   - **Unified Connection URL format**:
     ```
     https://default:<PASSWORD>@<HOST>:8443
     ```

---

## 3. Configuring Environment Variables

### Local Environment (`.env.local`)

Add the following environment variables to [`/home/zin-kg/code/hackathons/agentic-cinema-2026/firstlook/.env.local`](file:///home/zin-kg/code/hackathons/agentic-cinema-2026/firstlook/.env.local):

```bash
# ClickHouse Cloud Dedicated Cluster
CLICKHOUSE_HOST=x8z7wq99ab.us-central1.gcp.clickhouse.cloud
CLICKHOUSE_PORT=8443
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=YOUR_COPIED_PASSWORD
CLICKHOUSE_SECURE=true
CLICKHOUSE_ALLOW_WRITE_ACCESS=true

# Unified URL pattern (similar to playerplayer / Trigger.dev setups)
CLICKHOUSE_URL=https://default:YOUR_COPIED_PASSWORD@x8z7wq99ab.us-central1.gcp.clickhouse.cloud:8443
```

### Google Cloud Run (Production Environment)

To apply credentials to the live Google Cloud Run service (`firstlook-web`):

```bash
gcloud run services update firstlook-web \
  --region=us-central1 \
  --project=agentic-cinema-2026-kzh \
  --update-env-vars="CLICKHOUSE_HOST=x8z7wq99ab.us-central1.gcp.clickhouse.cloud,CLICKHOUSE_PORT=8443,CLICKHOUSE_USER=default,CLICKHOUSE_PASSWORD=YOUR_COPIED_PASSWORD,CLICKHOUSE_SECURE=true,CLICKHOUSE_ALLOW_WRITE_ACCESS=true"
```

---

## 4. Verifying the MCP Connection

FirstLook includes an automated test harness to verify the `mcp-clickhouse` connection:

```bash
# From the firstlook directory:
npm run test:ch-mcp
```

### What this test verifies:
1. Launches the official `mcp-clickhouse` stdio tool transport (`uvx mcp-clickhouse`).
2. Executes a test handshake query `SELECT version()`.
3. Auto-creates the `campaign_events` table if not already present:
   ```sql
   CREATE TABLE IF NOT EXISTS campaign_events (
     brief_id UUID,
     item_id UUID,
     platform LowCardinality(String),
     kind Enum8('impression' = 1, 'like' = 2, 'click' = 3, 'complete' = 4),
     synthetic UInt8 DEFAULT 1,
     ts DateTime64(3) DEFAULT now64(3)
   )
   ENGINE = MergeTree()
   ORDER BY (brief_id, item_id, ts);
   ```
4. Verifies concurrent reads against the public 4.56B-row YouTube trailer dataset.

---

## 5. Connecting Antigravity CLI Directly via MCP

If you want Antigravity CLI or Claude Code to query your dedicated ClickHouse Cloud instance directly during development:

```bash
# Stdio transport via uvx:
CLICKHOUSE_HOST="x8z7wq99ab.us-central1.gcp.clickhouse.cloud" \
CLICKHOUSE_USER="default" \
CLICKHOUSE_PASSWORD="YOUR_PASSWORD" \
CLICKHOUSE_PORT="8443" \
CLICKHOUSE_SECURE="true" \
CLICKHOUSE_ALLOW_WRITE_ACCESS="true" \
uvx mcp-clickhouse
```

Or configure it in your workspace `.gemini/settings.json`:

```json
{
  "mcpServers": {
    "clickhouse": {
      "command": "uvx",
      "args": ["mcp-clickhouse"],
      "env": {
        "CLICKHOUSE_HOST": "x8z7wq99ab.us-central1.gcp.clickhouse.cloud",
        "CLICKHOUSE_PORT": "8443",
        "CLICKHOUSE_USER": "default",
        "CLICKHOUSE_PASSWORD": "YOUR_PASSWORD",
        "CLICKHOUSE_SECURE": "true",
        "CLICKHOUSE_ALLOW_WRITE_ACCESS": "true"
      }
    }
  }
}
```
