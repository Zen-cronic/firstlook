import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  console.log("Initializing mcp-clickhouse stdio transport...");
  const transport = new StdioClientTransport({
    command: "uvx",
    args: ["mcp-clickhouse"],
    env: {
      ...process.env,
      CLICKHOUSE_HOST: "sql-clickhouse.clickhouse.com",
      CLICKHOUSE_PORT: "8443",
      CLICKHOUSE_USER: "demo",
      CLICKHOUSE_PASSWORD: "",
      CLICKHOUSE_SECURE: "true",
      CLICKHOUSE_VERIFY: "true",
    },
  });

  const client = new Client(
    { name: "agentic-cinema-ch-client", version: "1.0.0" },
    { capabilities: {} }
  );

  await client.connect(transport);
  console.log("Connected to mcp-clickhouse MCP server!");

  const tools = await client.listTools();
  console.log("Exposed MCP tools:", tools.tools.map((t) => ({ name: t.name, description: t.description })));

  const query = `
    SELECT
      count() AS videos,
      round(median(like_count / greatest(view_count, 1)) * 100, 2) AS median_engaged_pct,
      round(quantile(0.9)(like_count / greatest(view_count, 1)) * 100, 2) AS p90_engaged_pct,
      round(median(view_count)) AS median_views,
      (SELECT count() FROM youtube.youtube) AS rows_scanned
    FROM youtube.youtube
    WHERE view_count > 5000
      AND positionCaseInsensitive(title, 'official trailer') > 0
  `;

  console.log("Executing 4.56B-row benchmark query via mcp-clickhouse run_query tool...");
  const toolName = tools.tools.find((t) => t.name.includes("query") || t.name.includes("run"))?.name || "run_query";
  
  const result = await client.callTool({
    name: toolName,
    arguments: { query },
  });

  console.log("MCP Query Result:", JSON.stringify(result, null, 2));

  await client.close();
  console.log("MCP Client disconnected successfully.");
}

main().catch((err) => {
  console.error("MCP ClickHouse Test Error:", err);
  process.exit(1);
});
