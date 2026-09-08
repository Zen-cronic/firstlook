import { processNextRenderJob } from "./render";

async function runWorkerLoop() {
  console.log("[Worker] Starting Agentic Cinema render worker loop...");
  while (true) {
    try {
      const processed = await processNextRenderJob();
      if (!processed) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (err) {
      console.error("[Worker] Error in loop:", err);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

runWorkerLoop();
