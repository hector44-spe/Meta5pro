export default function MobileTradingStats() {
  return (
    <div className="dashboard-mobile-trading-stats">
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "12.5px", color: "var(--color-text-secondary, rgba(255, 255, 255, 0.6))", fontWeight: 500 }}>
            Trading progress
          </span>
          <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#fff" }}>0%</span>
        </div>
        <div style={{ width: "100%", height: "5px", borderRadius: "9999px", backgroundColor: "rgba(255, 255, 255, 0.06)", overflow: "hidden" }}>
          <div style={{ width: "100%", height: "100%", backgroundColor: "#01b28b" }} />
        </div>
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "12.5px", color: "var(--color-text-secondary, rgba(255, 255, 255, 0.6))", fontWeight: 500 }}>
            Signal strength
          </span>
          <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#ff3344" }}>0%</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(15, 1fr)", gap: "4px", height: "7px" }}>
          {Array.from({ length: 15 }).map((_, index) => (
            <div key={index} style={{ height: "100%", borderRadius: "2px", backgroundColor: "#ef4444" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
