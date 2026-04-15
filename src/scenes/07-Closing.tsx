import { SceneFrame } from "../components/SceneFrame";
import { BRAND } from "../lib/brand";

export const ClosingScene: React.FC = () => {
  return (
    <SceneFrame background={BRAND.colors.primary}>
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 32, color: BRAND.colors.paper }}>
        <div style={{ fontSize: 56, opacity: 0.8 }}>데이터로, 조직을 읽다.</div>
        <div style={{ display: "flex", gap: 32, alignItems: "baseline", marginTop: 24 }}>
          <div style={{ fontSize: 60, opacity: 0.7 }}>인싸이트그룹</div>
          <div style={{ fontSize: 200, fontWeight: 800, letterSpacing: -6 }}>쉐막</div>
        </div>
      </div>
    </SceneFrame>
  );
};
