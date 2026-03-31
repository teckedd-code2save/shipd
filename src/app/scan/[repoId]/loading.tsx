export default function ScanLoading() {
  return (
    <main className="page">
      <div className="loading-block" style={{ width: 220, height: 36, marginBottom: 10 }} />
      <div className="loading-block" style={{ width: 360, height: 18, marginBottom: 24 }} />
      <section className="panel" style={{ padding: 20, display: "grid", gap: 14 }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="loading-block" style={{ width: "100%", height: 84 }} />
        ))}
      </section>
    </main>
  );
}
