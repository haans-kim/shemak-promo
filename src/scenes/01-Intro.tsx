import { SceneFrame } from "../components/SceneFrame";
import { BRAND } from "../lib/brand";

export const IntroScene: React.FC = () => {
  return (
    <SceneFrame background={BRAND.colors.paper}>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div style={{ fontSize: 56, color: BRAND.colors.muted }}>매년 서베이, 하고 계시죠?</div>
        <div style={{ fontSize: 96, fontWeight: 700 }}>누가 떠날지, 보이시나요?</div>
      </div>
    </SceneFrame>
  );
};
