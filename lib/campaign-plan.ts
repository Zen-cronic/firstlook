import { generateJSON } from "./llm";

export interface CampaignPlan {
  filmTitle: string;
  tagline: string;
  targetAudienceAngle: string;
  captions: {
    text: string;
    startFrame: number;
    durationInFrames: number;
  }[];
  socialPosts: {
    platform: "tiktok" | "instagram" | "x";
    assetKind: "teaser" | "teaser_vertical" | "poster";
    captionText: string;
    scheduledDaysOffset: number; // days prior to release
  }[];
}

export async function createCampaignPlan(brief: {
  title: string;
  logline: string;
  genre: string;
  targetAudience: string;
  releaseDate: string;
  assets: { filename: string; duration: number }[];
}): Promise<CampaignPlan> {
  const prompt = `
Create a spoiler-safe marketing campaign plan for the film below based strictly on its ground-truth assets:

Film Details:
- Title: "${brief.title}"
- Logline: "${brief.logline}"
- Genre: "${brief.genre}"
- Target Audience: "${brief.targetAudience}"
- Release Date: "${brief.releaseDate}"
- Available Video Clips: ${JSON.stringify(brief.assets)}

Return a JSON object matching this TypeScript interface:
{
  "filmTitle": string,
  "tagline": string,
  "targetAudienceAngle": string,
  "captions": [
    { "text": string (short kinetic hook in ALL CAPS), "startFrame": number, "durationInFrames": number }
  ],
  "socialPosts": [
    {
      "platform": "tiktok" | "instagram" | "x",
      "assetKind": "teaser" | "teaser_vertical" | "poster",
      "captionText": string (punchy platform-native caption with hashtags),
      "scheduledDaysOffset": number (-30 to -1 days before release)
    }
  ]
}

Constraints:
1. Do NOT reveal major plot spoilers or ending twists.
2. Provide 3 punchy video caption chips (e.g. "IN A WORLD OF DRAGONS", "ONE SEARCH CHANGES EVERYTHING", "COMING THIS FALL").
3. Provide at least 3 social posts across TikTok, Instagram, and X.
`;

  return await generateJSON<CampaignPlan>(prompt);
}
