export default function ChatLoading() {
  return (
    <main className="chat-page">
      <section className="chat-shell">
        <div className="chat-topbar">
          <div className="loading-block" style={{ width: 220, height: 42 }} />
          <div style={{ display: "flex", gap: 10 }}>
            <div className="loading-circle" />
            <div className="loading-circle" />
            <div className="loading-circle" />
          </div>
        </div>
        <div className="chat-layout">
          <aside className="chat-sidebar panel" style={{ minHeight: 520 }}>
            <div className="loading-block" style={{ width: "100%", height: 180 }} />
            <div className="loading-block" style={{ width: "100%", height: 120 }} />
            <div className="loading-block" style={{ width: "100%", height: 120 }} />
          </aside>
          <section className="chat-workspace panel">
            <div className="loading-block" style={{ width: "calc(100% - 48px)", height: 110, margin: 24 }} />
            <div style={{ padding: "0 24px 24px", display: "grid", gap: 16 }}>
              <div className="loading-block" style={{ width: "72%", height: 28 }} />
              <div className="loading-block" style={{ width: "58%", height: 28 }} />
              <div className="loading-block" style={{ width: "81%", height: 28 }} />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
