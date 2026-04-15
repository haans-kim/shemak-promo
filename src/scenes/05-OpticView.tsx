import { SceneFrame } from "../components/SceneFrame";
import { BRAND } from "../lib/brand";

export const OpticViewScene: React.FC = () => {
  return (
    <SceneFrame background={BRAND.colors.paper}>
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 32 }}>
        <div style={{ fontSize: 40, color: BRAND.colors.muted }}>05 · Optic View</div>
        <div style={{ fontSize: 108, fontWeight: 800, color: BRAND.colors.primary }}>조직 의식 데이터 분석</div>
        <div style={{ fontSize: 36, color: BRAND.colors.muted, marginTop: 16 }}>몰입 유형 · 히트맵 · What-If 시뮬레이터</div>
      </div>
    </SceneFrame>
  );
};
