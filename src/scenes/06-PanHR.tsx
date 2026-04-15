import { SceneFrame } from "../components/SceneFrame";
import { BRAND } from "../lib/brand";

const MODULES = ["스킬 관리", "워라밸", "필요 인력 예측", "종합 대시보드"];

export const PanHRScene: React.FC = () => {
  return (
    <SceneFrame background={BRAND.colors.paper}>
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 40 }}>
        <div style={{ fontSize: 40, color: BRAND.colors.muted }}>06 · Pan HR · 네 가지 모듈</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          {MODULES.map((m, i) => (
            <div
              key={m}
              style={{
                width: 640,
                height: 220,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: BRAND.colors.primary,
                color: BRAND.colors.paper,
                fontSize: 72,
                fontWeight: 700,
                borderRadius: 24,
              }}
            >
              {i + 1}. {m}
            </div>
          ))}
        </div>
      </div>
    </SceneFrame>
  );
};
