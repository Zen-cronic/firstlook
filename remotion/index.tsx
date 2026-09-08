import React from "react";
import { registerRoot, Composition } from "remotion";
import { PosterPost } from "./PosterPost";
import { Teaser } from "./Teaser";
import { TeaserVertical } from "./TeaserVertical";
import { PosterPropsSchema, TeaserPropsSchema } from "./schemas";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Teaser"
        component={Teaser}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        schema={TeaserPropsSchema}
        defaultProps={{
          title: "SINTEL",
          tagline: "YOUR PAST WILL HUNT YOU DOWN",
          clips: [],
          captions: [
            { text: "IN A WORLD OF DRAGONS", startFrame: 30, durationInFrames: 90 },
            { text: "ONE SEARCH CHANGES EVERYTHING", startFrame: 150, durationInFrames: 90 },
            { text: "COMING THIS FALL", startFrame: 300, durationInFrames: 90 },
          ],
          teaserDurationInFrames: 450,
        }}
      />

      <Composition
        id="TeaserVertical"
        component={TeaserVertical}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        schema={TeaserPropsSchema}
        defaultProps={{
          title: "SINTEL",
          tagline: "YOUR PAST WILL HUNT YOU DOWN",
          clips: [],
          captions: [
            { text: "IN A WORLD OF DRAGONS", startFrame: 30, durationInFrames: 90 },
            { text: "ONE SEARCH CHANGES EVERYTHING", startFrame: 150, durationInFrames: 90 },
            { text: "COMING THIS FALL", startFrame: 300, durationInFrames: 90 },
          ],
          teaserDurationInFrames: 450,
        }}
      />

      <Composition
        id="PosterPost"
        component={PosterPost}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1350}
        schema={PosterPropsSchema}
        defaultProps={{
          title: "SINTEL",
          tagline: "FIND THE DRAGON",
          imageSrc: "",
          releaseDate: "OCTOBER 2026",
          isProxy: true,
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
