import { SceneFrame } from "../components/SceneFrame";
import { BRAND } from "../lib/brand";

export const HRAgentScene: React.FC = () => {
  return (
    <SceneFrame background={BRAND.colors.paper}>
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 40 }}>
        <div style={{ fontSize: 40, color: BRAND.colors.muted }}>03 · HR Agent</div>
        <div style={{ fontSize: 120, fontWeight: 800, color: BRAND.colors.primary }}>경영진 · HR 임원 · 팀장</div>
        <div style={{ fontSize: 36, color: BRAND.colors.muted }}>각 역할에 맞는 AI 에이전트</div>
      </div>
    </SceneFrame>
  );
};
