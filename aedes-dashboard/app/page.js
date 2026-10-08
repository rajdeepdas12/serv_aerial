"use client";
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => <p style={{ padding: '20px' }}>Initializing Map Environment...</p>,
});

export default function Home() {
  return (
    <main style={{ padding: '24px', background: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>serv_aerial</h1>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '14px' }}>Autonomous Vector Habitat Surveillance</p>
        </div>
      </header>
      <section style={{ height: '75vh', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }}>
        <LeafletMap />
      </section>
    </main>
  );
}
