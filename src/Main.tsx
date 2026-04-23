import React from "react";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { IntroScene } from "./scenes/01-Intro";
import { IGIntroScene } from "./scenes/02-IGIntro";
import { HRAgentScene } from "./scenes/03-HRAgent";
import { BridgeScene } from "./scenes/04-Bridge";
import { OpticViewScene } from "./scenes/05-OpticView";
import { PanHRScene } from "./scenes/06-PanHR";
import { FoundationScene } from "./scenes/08-Foundation";
import { ClosingScene } from "./scenes/09-Closing";
import { SECTIONS, secondsToFrames } from "./lib/sections";

const order = ["01", "02", "03", "04", "05", "06", "08", "09"] as const;
const components = {
  "01": IntroScene,
  "02": IGIntroScene,
  "03": HRAgentScene,
  "04": BridgeScene,
  "05": OpticViewScene,
  "06": PanHRScene,
  "08": FoundationScene,
  "09": ClosingScene,
} as const;

// v18 #6: 08→09 흰 화면 해결 — 모든 섹션 경계에 15f(0.5s) fade crossfade
// CLAUDE.md: "Default to fade + linearTiming({ durationInFrames: 15-20 })"
// transition duration은 각 섹션 playable length에서 overlap 차감됨 — 각 섹션 audio 앞뒤 silence 안에서 흡수
const TRANSITION_FRAMES = 15;

export const Main: React.FC = () => {
  return (
    <TransitionSeries>
      {order.map((id, i) => {
        const meta = SECTIONS[id];
        const duration = secondsToFrames(meta.estimatedSeconds);
        const Component = components[id];
        return (
          <React.Fragment key={id}>
            <TransitionSeries.Sequence durationInFrames={duration}>
              <Component />
            </TransitionSeries.Sequence>
            {i < order.length - 1 && (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
              />
            )}
          </React.Fragment>
        );
      })}
    </TransitionSeries>
  );
};

// transitions가 인접 섹션과 overlap되므로 TOTAL_FRAMES에서 transition 총합 차감
export const TOTAL_FRAMES =
  order.reduce((sum, id) => sum + secondsToFrames(SECTIONS[id].estimatedSeconds), 0)
  - (order.length - 1) * TRANSITION_FRAMES;
