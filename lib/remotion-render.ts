import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import http from "node:http";
import path from "node:path";
import fs from "node:fs";

let bundleLocation: string | null = null;
let staticServerUrl: string | null = null;
let serverInstance: http.Server | null = null;

export async function ensureBundle(): Promise<string> {
  if (bundleLocation) return bundleLocation;

  const entryPoint = path.resolve(process.cwd(), "remotion/index.tsx");
  console.log("Bundling Remotion entry point:", entryPoint);

  bundleLocation = await bundle({
    entryPoint,
    onProgress: (progress) => {
      if (progress % 25 === 0) {
        console.log(`Remotion bundling progress: ${progress}%`);
      }
    },
  });

  console.log("Remotion bundling complete:", bundleLocation);
  return bundleLocation;
}

export async function ensureStaticServer(): Promise<string> {
  if (staticServerUrl) return staticServerUrl;

  const storageDir = process.env.STORAGE_DIR
    ? path.resolve(process.cwd(), process.env.STORAGE_DIR)
    : path.resolve(process.cwd(), "storage");

  const publicDir = path.resolve(process.cwd(), "public");

  return new Promise((resolve) => {
    serverInstance = http.createServer((req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

      const reqUrl = req.url || "/";
      let filePath = "";

      if (reqUrl.startsWith("/storage/")) {
        filePath = path.join(storageDir, reqUrl.replace("/storage/", ""));
      } else if (reqUrl.startsWith("/api/media/")) {
        filePath = path.join(storageDir, reqUrl.replace("/api/media/", ""));
      } else {
        filePath = path.join(publicDir, reqUrl);
      }

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes: Record<string, string> = {
          ".mp4": "video/mp4",
          ".webm": "video/webm",
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".mp3": "audio/mpeg",
        };

        res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.statusCode = 404;
        res.end("Not Found");
      }
    });

    serverInstance.listen(0, "127.0.0.1", () => {
      const addr = serverInstance?.address();
      if (addr && typeof addr === "object") {
        staticServerUrl = `http://127.0.0.1:${addr.port}`;
        console.log("Static media server running at:", staticServerUrl);
        resolve(staticServerUrl);
      }
    });
  });
}

export async function renderComposition({
  compositionId,
  inputProps,
  outputPath,
}: {
  compositionId: string;
  inputProps: any;
  outputPath: string;
}): Promise<string> {
  const bundlePath = await ensureBundle();
  const serverUrl = await ensureStaticServer();

  // Rewrite file paths in inputProps to static server URLs if needed
  const sanitizedProps = JSON.parse(JSON.stringify(inputProps));
  if (Array.isArray(sanitizedProps.clips)) {
    sanitizedProps.clips = sanitizedProps.clips.map((clip: any) => {
      if (clip.src && !clip.src.startsWith("http")) {
        clip.src = `${serverUrl}/${clip.src.replace(/^\//, "")}`;
      }
      return clip;
    });
  }
  if (sanitizedProps.imageSrc && !sanitizedProps.imageSrc.startsWith("http")) {
    sanitizedProps.imageSrc = `${serverUrl}/${sanitizedProps.imageSrc.replace(/^\//, "")}`;
  }
  if (sanitizedProps.audioSrc && !sanitizedProps.audioSrc.startsWith("http")) {
    sanitizedProps.audioSrc = `${serverUrl}/${sanitizedProps.audioSrc.replace(/^\//, "")}`;
  }

  const composition = await selectComposition({
    serveUrl: bundlePath,
    id: compositionId,
    inputProps: sanitizedProps,
  });

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  if (compositionId === "PosterPost") {
    console.log(`Rendering poster still image for composition ${compositionId}...`);
    await renderStill({
      composition,
      serveUrl: bundlePath,
      output: outputPath,
      inputProps: sanitizedProps,
      imageFormat: "jpeg",
    });
  } else {
    console.log(`Rendering video media for composition ${compositionId}...`);
    await renderMedia({
      composition,
      serveUrl: bundlePath,
      outputLocation: outputPath,
      inputProps: sanitizedProps,
      codec: "h264",
    });
  }

  console.log(`Render complete! Output saved to: ${outputPath}`);
  return outputPath;
}
