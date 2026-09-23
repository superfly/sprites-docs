export const BillingCalculator = () => {
  const VCPUS = 8;
  const RAM_GB = 4;
  const HOURLY_RATES = { cpu: 0.07, ram: 0.04375, storage: 0.02 };
  const PLAN = { name: "Level 10", price: 20, maxSprites: 10, cpuHours: 450, ramGBHours: 1800, storageGB: 50 };
  const PAYG = { name: "Pay As You Go", price: 0, maxSprites: 3, cpuHours: 0, ramGBHours: 0, storageGB: 0 };

  const [billingMode, setBillingMode] = useState("payg");
  const [sprites, setSprites] = useState(1);
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [storageGB, setStorageGB] = useState(10);

  const plan = billingMode === "plan" ? PLAN : PAYG;
  const isPAYG = billingMode === "payg";
  const effectiveSprites = Math.min(sprites, plan.maxSprites);

  const weeksPerMonth = 4.33;
  const activeHoursPerMonth = hoursPerDay * daysPerWeek * weeksPerMonth * effectiveSprites;

  const cpuHoursUsed = VCPUS * activeHoursPerMonth;
  const ramGBHoursUsed = RAM_GB * activeHoursPerMonth;
  const storageGBUsed = storageGB * effectiveSprites;

  const cpuCost = Math.max(0, cpuHoursUsed - plan.cpuHours) * HOURLY_RATES.cpu;
  const ramCost = Math.max(0, ramGBHoursUsed - plan.ramGBHours) * HOURLY_RATES.ram;
  const storageCost = Math.max(0, storageGBUsed - plan.storageGB) * HOURLY_RATES.storage;
  const usageCost = cpuCost + ramCost + storageCost;
  const totalCost = plan.price + usageCost;
  const withinPlan = !isPAYG && usageCost === 0;

  const fieldStyle = { display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.875rem" };
  const inputStyle = {
    padding: "0.375rem 0.5rem",
    border: "1px solid var(--gray-200)",
    borderRadius: "6px",
    fontFamily: "inherit",
  };

  return (
    <div style={{ border: "1px solid var(--gray-200)", borderRadius: "12px", padding: "1.25rem", margin: "1.5rem 0" }}>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        <button
          type="button"
          onClick={() => setBillingMode("payg")}
          style={{
            padding: "0.375rem 0.75rem",
            borderRadius: "999px",
            border: "1px solid var(--gray-200)",
            background: isPAYG ? "var(--primary)" : "transparent",
            color: isPAYG ? "white" : "inherit",
            cursor: "pointer",
          }}
        >
          Pay As You Go
        </button>
        <button
          type="button"
          onClick={() => setBillingMode("plan")}
          style={{
            padding: "0.375rem 0.75rem",
            borderRadius: "999px",
            border: "1px solid var(--gray-200)",
            background: !isPAYG ? "var(--primary)" : "transparent",
            color: !isPAYG ? "white" : "inherit",
            cursor: "pointer",
          }}
        >
          Level 10 Plan ($20/mo)
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "1rem",
          marginBottom: "1.25rem",
        }}
      >
        <label style={fieldStyle}>
          Sprites
          <input
            style={inputStyle}
            type="number"
            min={1}
            max={plan.maxSprites}
            value={effectiveSprites}
            onChange={(e) => setSprites(Number(e.target.value) || 1)}
          />
        </label>
        <label style={fieldStyle}>
          Hours / day
          <input
            style={inputStyle}
            type="number"
            min={0.5}
            max={24}
            step={0.5}
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(Number(e.target.value) || 0)}
          />
        </label>
        <label style={fieldStyle}>
          Days / week
          <input
            style={inputStyle}
            type="number"
            min={1}
            max={7}
            value={daysPerWeek}
            onChange={(e) => setDaysPerWeek(Number(e.target.value) || 1)}
          />
        </label>
        <label style={fieldStyle}>
          Storage (GB)
          <input
            style={inputStyle}
            type="number"
            min={1}
            max={100}
            value={storageGB}
            onChange={(e) => setStorageGB(Number(e.target.value) || 1)}
          />
        </label>
      </div>

      <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)", marginBottom: "1rem" }}>
        ~{activeHoursPerMonth.toFixed(0)} active hours/mo · {cpuHoursUsed.toFixed(0)} CPU-hrs ·{" "}
        {ramGBHoursUsed.toFixed(0)} GB-hrs RAM · {storageGBUsed.toFixed(0)} GB storage
      </div>

      <div
        style={{
          borderTop: "1px solid var(--gray-200)",
          paddingTop: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <div>
          <strong>Estimated total</strong>{" "}
          {withinPlan && <span style={{ fontSize: "0.75rem", color: "#10b981" }}>Within plan</span>}
        </div>
        <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
          ${totalCost.toFixed(2)}
          <span style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--gray-500)" }}>/mo</span>
        </div>
      </div>
    </div>
  );
};
