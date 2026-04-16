import { Sequence } from "remotion";
import { IntroScene } from "./scenes/01-Intro";
import { IGIntroScene } from "./scenes/02-IGIntro";
import { HRAgentScene } from "./scenes/03-HRAgent";
import { BridgeScene } from "./scenes/04-Bridge";
import { OpticViewScene } from "./scenes/05-OpticView";
import { PanHRScene } from "./scenes/06-PanHR";
import { SynergyScene } from "./scenes/07-Synergy";
import { FoundationScene } from "./scenes/08-Foundation";
import { ClosingScene } from "./scenes/09-Closing";
import { SECTIONS, secondsToFrames } from "./lib/sections";

const order = ["01", "02", "03", "04", "05", "06", "07", "08", "09"] as const;
const components = {
  "01": IntroScene,
  "02": IGIntroScene,
  "03": HRAgentScene,
  "04": BridgeScene,
  "05": OpticViewScene,
  "06": PanHRScene,
  "07": SynergyScene,
  "08": FoundationScene,
  "09": ClosingScene,
} as const;

export const Main: React.FC = () => {
  let offset = 0;
  return (
    <>
      {order.map((id) => {
        const meta = SECTIONS[id];
        const duration = secondsToFrames(meta.estimatedSeconds);
        const from = offset;
        offset += duration;
        const Component = components[id];
        return (
          <Sequence key={id} from={from} durationInFrames={duration}>
            <Component />
          </Sequence>
        );
      })}
    </>
  );
};

export const TOTAL_FRAMES = order.reduce(
  (sum, id) => sum + secondsToFrames(SECTIONS[id].estimatedSeconds),
  0,
);
