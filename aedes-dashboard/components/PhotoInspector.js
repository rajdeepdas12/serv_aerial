"use client";
import { useState, useRef } from 'react';

export default function PhotoInspector({ onDetectionPinned }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [pinnedSuccess, setPinnedSuccess] = useState(false);
  const [confThreshold, setConfThreshold] = useState(0.25);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
      setPinnedSuccess(false);
    }
  };

  const loadSample = async (samplePath, filename) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setPinnedSuccess(false);
      const res = await fetch(samplePath);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(samplePath);
      await runInference(file);
    } catch (err) {
      setError("Failed to load sample image.");
      setLoading(false);
    }
  };

  const runInference = async (fileToUse = selectedFile) => {
    if (!fileToUse) {
      setError("Please select or upload an image first.");
      return;
    }

    setLoading(true);
    setError(null);
    setPinnedSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', fileToUse);

      const response = await fetch('/api/detect', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Inference failed');
      }

      setResult(data);
    } catch (err) {
      setError(err.message || 'Error communicating with AI detection engine.');
    } finally {
      setLoading(false);
    }
  };

  const pinToMap = async () => {
    if (!result || !result.detections || result.detections.length === 0) return;
    const topDetection = result.detections[0];

    try {
      const res = await fetch('/api/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `manual_${Date.now()}`,
          image: result.annotated_image_url || result.original_image_url,
          label: topDetection.label,
          confidence: topDetection.confidence,
        }),
      });

      if (res.ok) {
        setPinnedSuccess(true);
        if (onDetectionPinned) {
          onDetectionPinned();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.95)',
      borderRadius: '16px',
      border: '1px solid #334155',
      padding: '24px',
      color: '#f8fafc',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Top Banner / Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 10px #10b981'
            }}></span>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', letterSpacing: '-0.02em', color: '#f8fafc' }}>
              Photo Accuracy & Habitat Identification
            </h2>
          </div>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '13px' }}>
            Upload drone/field photography to test YOLO detection accuracy, inspect confidence scores, and verify vector breeding sites.
          </p>
        </div>

        {/* Model status tag */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#1e293b',
          padding: '6px 14px',
          borderRadius: '9999px',
          border: '1px solid #334155',
          fontSize: '12px',
          color: '#cbd5e1'
        }}>
          <span style={{ color: '#38bdf8', fontWeight: '600' }}>Active Model:</span>
          <code style={{ color: '#a78bfa', background: '#0f172a', padding: '2px 6px', borderRadius: '4px' }}>
            {result ? result.model_file : 'best.pt / yolov8n.pt'}
          </code>
        </div>
      </div>

      {/* Main Grid: Upload & Controls on Left, Results on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* LEFT COLUMN: Upload & Preview */}
        <div>
          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed #475569',
              borderRadius: '12px',
              padding: '28px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              background: selectedFile ? '#0f172a' : 'rgba(30, 41, 59, 0.5)',
              transition: 'all 0.2s ease',
              marginBottom: '16px'
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = '#38bdf8')}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = '#475569')}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📸</div>
            <p style={{ margin: 0, fontWeight: '600', fontSize: '15px', color: '#f1f5f9' }}>
              {selectedFile ? selectedFile.name : 'Click to Upload or Drag Photo'}
            </p>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '12px' }}>
              Supports JPG, PNG, WEBP (Evaluated at 640x640)
            </p>
          </div>

          {/* Quick Samples Section */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Or Try Immediate Samples:
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => loadSample('/samples/sample_bottle.jpg', 'sample_bottle.jpg')}
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#e2e8f0',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🍾 Discarded Bottle
              </button>
              <button
                type="button"
                onClick={() => loadSample('/samples/sample_tire.jpg', 'sample_tire.jpg')}
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#e2e8f0',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🛞 Stagnant Tire
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            disabled={!selectedFile || loading}
            onClick={() => runInference()}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              background: loading
                ? '#475569'
                : 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: '600',
              fontSize: '14px',
              cursor: loading || !selectedFile ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? (
              <>
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚙️</span>
                Running Neural Inference & Accuracy Calc...
              </>
            ) : (
              <>
                <span>🔍</span>
                Identify & Compute Detection Accuracy
              </>
            )}
          </button>

          {error && (
            <div style={{
              marginTop: '14px',
              padding: '10px 14px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '13px'
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Results & Accuracy Cards */}
        <div>
          {result ? (
            <div>
              {/* Accuracy & Risk Metrics Ribbon */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '16px'
              }}>
                {/* Accuracy Card */}
                <div style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>
                    Top Accuracy
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#38bdf8', marginTop: '2px' }}>
                    {result.highest_accuracy_pct}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Confidence Score
                  </div>
                </div>

                {/* Risk Evaluation */}
                <div style={{
                  background: result.has_breeding_hazard
                    ? 'rgba(239, 68, 68, 0.12)'
                    : 'rgba(16, 185, 129, 0.12)',
                  padding: '14px',
                  borderRadius: '10px',
                  border: `1px solid ${result.has_breeding_hazard ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>
                    Risk Status
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '800',
                    color: result.has_breeding_hazard ? '#f43f5e' : '#10b981',
                    marginTop: '6px'
                  }}>
                    {result.has_breeding_hazard ? '⚠️ HIGH THREAT' : '✅ SAFE / CLEAR'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {result.total_detections} object(s) found
                  </div>
                </div>

                {/* Latency */}
                <div style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>
                    Inference Time
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#a78bfa', marginTop: '2px' }}>
                    {result.inference_time_ms}ms
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    YOLOv8 Edge Speed
                  </div>
                </div>
              </div>

              {/* Image View with Toggle */}
              <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid #334155', marginBottom: '16px', background: '#000' }}>
                <img
                  src={showOriginal ? result.original_image_url : (result.annotated_image_url || result.original_image_url)}
                  alt="Detection View"
                  style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', display: 'block' }}
                />
                <button
                  type="button"
                  onClick={() => setShowOriginal(!showOriginal)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid #475569',
                    color: '#f8fafc',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  {showOriginal ? '👁️ View AI Bounding Boxes' : '🖼️ View Original'}
                </button>
              </div>

              {/* Detected Objects List */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Identified Objects & Accuracy:
                </div>
                {result.detections.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                    No objects passed the confidence threshold ($&gt; 20\%$).
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.detections.map((det, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#1e293b',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #334155',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '700', fontSize: '14px', color: '#f1f5f9' }}>
                              {det.label}
                            </span>
                            <span style={{
                              fontSize: '11px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: det.is_breeding_site ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                              color: det.is_breeding_site ? '#fca5a5' : '#cbd5e1'
                            }}>
                              {det.risk_level}
                            </span>
                          </div>
                          {/* Accuracy bar */}
                          <div style={{
                            width: '100%',
                            height: '6px',
                            background: '#334155',
                            borderRadius: '9999px',
                            marginTop: '6px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: det.confidence_pct,
                              height: '100%',
                              background: det.accuracy_score >= 70
                                ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                                : 'linear-gradient(90deg, #f59e0b, #ef4444)',
                              borderRadius: '9999px'
                            }} />
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '16px', fontWeight: '800', color: '#38bdf8' }}>
                            {det.confidence_pct}
                          </span>
                          <div style={{ fontSize: '10px', color: '#64748b' }}>Accuracy</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pin to Live Map Action */}
              {result.has_breeding_hazard && (
                <div>
                  <button
                    type="button"
                    onClick={pinToMap}
                    disabled={pinnedSuccess}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      background: pinnedSuccess ? '#059669' : '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: pinnedSuccess ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: pinnedSuccess ? 'none' : '0 4px 12px rgba(220, 38, 38, 0.35)'
                    }}
                  >
                    {pinnedSuccess ? '✅ Pinned to Live Surveillance Map!' : '📍 Pin Detection to Surveillance Map'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div style={{
              height: '100%',
              minHeight: '260px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed #334155',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              background: 'rgba(30, 41, 59, 0.2)'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '10px', opacity: 0.6 }}>🎯</div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#cbd5e1' }}>
                Awaiting Photo Inference
              </h3>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748b', maxWidth: '300px' }}>
                Select an image on the left or click one of the quick test samples to evaluate bounding boxes, class classification, and confidence accuracy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
