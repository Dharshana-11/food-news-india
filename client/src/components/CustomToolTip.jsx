const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "#162247",
          color: "#fff",
          padding: "8px 12px",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <p style={{ margin: 0, fontWeight: 500 }}>{label}</p>
        <p style={{ margin: 0 }}>{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
