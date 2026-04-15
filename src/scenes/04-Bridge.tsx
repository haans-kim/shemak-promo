import { SceneFrame } from "../components/SceneFrame";
import { BRAND } from "../lib/brand";

export const BridgeScene: React.FC = () => {
  return (
    <SceneFrame background={BRAND.colors.primary}>
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 32, color: BRAND.colors.paper }}>
        <div style={{ fontSize: 48, opacity: 0.7 }}>HR Agent를 받치는 두 축</div>
        <div style={{ display: "flex", gap: 120, marginTop: 40 }}>
          <div style={{ fontSize: 96, fontWeight: 800 }}>Optic View</div>
          <div style={{ fontSize: 96, fontWeight: 800 }}>Pan HR</div>
        </div>
      </div>
    </SceneFrame>
  );
};
