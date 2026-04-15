import { Composition } from "remotion";
import { Main, TOTAL_FRAMES } from "./Main";
import { IGIntroScene } from "./scenes/02-IGIntro";
import { IntroScene } from "./scenes/01-Intro";
import { HRAgentScene } from "./scenes/03-HRAgent";
import { BridgeScene } from "./scenes/04-Bridge";
import { OpticViewScene } from "./scenes/05-OpticView";
import { PanHRScene } from "./scenes/06-PanHR";
import { ClosingScene } from "./scenes/07-Closing";
import { SECTIONS, secondsToFrames } from "./lib/sections";
import { VIDEO } from "./lib/brand";

const SECTION_COMPONENTS = {
  "01": IntroScene,
  "02": IGIntroScene,
  "03": HRAgentScene,
  "04": BridgeScene,
  "05": OpticViewScene,
  "06": PanHRScene,
  "07": ClosingScene,
} as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Main"
        component={Main}
        durationInFrames={TOTAL_FRAMES}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      {(Object.keys(SECTION_COMPONENTS) as Array<keyof typeof SECTION_COMPONENTS>).map((id) => {
        const meta = SECTIONS[id];
        const Component = SECTION_COMPONENTS[id];
        return (
          <Composition
            key={id}
            id={meta.slug}
            component={Component}
            durationInFrames={secondsToFrames(meta.estimatedSeconds)}
            fps={VIDEO.fps}
            width={VIDEO.width}
            height={VIDEO.height}
          />
        );
      })}
    </>
  );
};
