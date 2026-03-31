export default function ComparisonLoading() {
  return (
    <main className="page">
      <section className="dashboard-hero" style={{ marginBottom: 24 }}>
        <div className="loading-block" style={{ width: 160, height: 18, marginBottom: 12 }} />
        <div className="loading-block" style={{ width: "46%", height: 40, marginBottom: 10 }} />
        <div className="loading-block" style={{ width: "74%", height: 20 }} />
      </section>
      <section style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <article key={index} className="panel comparison-card">
            <div className="loading-block" style={{ width: "100%", height: 160 }} />
          </article>
        ))}
      </section>
    </main>
  );
}
