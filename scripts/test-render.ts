import { renderComposition } from "../lib/remotion-render";
import path from "node:path";

async function main() {
  console.log("Testing Remotion headless render engine...");
  const outputPath = path.resolve(process.cwd(), "storage/renders/test_teaser.mp4");

  await renderComposition({
    compositionId: "Teaser",
    inputProps: {
      title: "SINTEL",
      tagline: "YOUR PAST WILL HUNT YOU DOWN",
      clips: [],
      captions: [
        { text: "IN A WORLD OF DRAGONS", startFrame: 30, durationInFrames: 90 },
        { text: "ONE SEARCH CHANGES EVERYTHING", startFrame: 150, durationInFrames: 90 },
        { text: "COMING THIS FALL", startFrame: 300, durationInFrames: 90 },
      ],
      teaserDurationInFrames: 300,
    },
    outputPath,
  });

  console.log("Headless render test completed! MP4 file written to:", outputPath);
}

main().catch((err) => {
  console.error("Render test failed:", err);
  process.exit(1);
});
