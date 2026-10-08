"use client";
import { useState } from 'react';
import dynamic from 'next/dynamic';
import PhotoInspector from '../components/PhotoInspector';

const LeafletMap = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
      color: '#94a3b8'
    }}>
      Initializing Leaflet Geospatial Environment...
    </div>
  ),
});

export default function Home() {
  const [activeTab, setActiveTab] = useState('inspector'); // default to 'inspector' so user immediately sees the photo upload accuracy feature
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDetectionPinned = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('map');
  };

  return (
    <main style={{
      padding: '24px',
      background: 'linear-gradient(180deg, #090d16 0%, #0f172a 100%)',
      minHeight: '100vh',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Navigation & Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px',
        borderBottom: '1px solid #1e293b',
        paddingBottom: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🦟</span>
            <h1 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: '800',
              letterSpacing: '-0.03em',
              background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              serv_aerial
            </h1>
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              padding: '3px 8px',
              borderRadius: '9999px',
              background: 'rgba(56, 189, 248, 0.1)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              letterSpacing: '0.04em'
            }}>
              EDGE AI v1.0
            </span>
          </div>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '13px' }}>
            Autonomous Vector Habitat Surveillance & Neural Detection Pipeline
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div style={{
          display: 'flex',
          background: '#1e293b',
          borderRadius: '10px',
          padding: '4px',
          border: '1px solid #334155'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('inspector')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'inspector' ? '#0284c7' : 'transparent',
              color: activeTab === 'inspector' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease',
              boxShadow: activeTab === 'inspector' ? '0 2px 8px rgba(2, 132, 199, 0.4)' : 'none'
            }}
          >
            <span>📸</span> Photo Accuracy Tester
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('map')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'map' ? '#0284c7' : 'transparent',
              color: activeTab === 'map' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease',
              boxShadow: activeTab === 'map' ? '0 2px 8px rgba(2, 132, 199, 0.4)' : 'none'
            }}
          >
            <span>🗺️</span> Surveillance GIS Map
          </button>
        </div>
      </header>

      {/* Main Tab Content */}
      {activeTab === 'inspector' ? (
        <div>
          <PhotoInspector onDetectionPinned={handleDetectionPinned} />
        </div>
      ) : (
        <div>
          {/* Map Section */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              Real-time geospatial overlay of identified breeding hazards.
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('inspector')}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#38bdf8',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              + Upload New Photo to Test Accuracy
            </button>
          </div>

          <section style={{
            height: '75vh',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid #334155',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <LeafletMap refreshKey={refreshKey} />
          </section>
        </div>
      )}
    </main>
  );
}
