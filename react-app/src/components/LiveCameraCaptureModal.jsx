import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * LiveCameraCaptureModal
 * Opens a modal with live webcam feed, camera switcher, capture snapshot, and preview/retake.
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - onCapture: (file: File) => void
 * - title: string (e.g. "Capture Complainant Photo", "Capture Accused Photo", "Capture Witness Photo")
 */
export default function LiveCameraCaptureModal({ open, onClose, onCapture, title = 'Capture Photo' }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [capturedDataUrl, setCapturedDataUrl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Stop current active stream
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Start camera stream
  const startCamera = useCallback(async (deviceId = null) => {
    setError('');
    setLoading(true);
    setCapturedDataUrl(null);

    // Stop previous track if running
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Webcam access is not supported by your browser. Please use the direct file upload option below.');
      setLoading(false);
      return;
    }

    try {
      let mediaStream;
      try {
        const constraints = {
          video: deviceId
            ? { deviceId: { exact: deviceId } }
            : { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        };
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (innerErr) {
        // Fallback to basic video constraint if ideal constraints fail
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Enumerate available cameras
      try {
        const devList = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = devList.filter(d => d.kind === 'videoinput');
        setDevices(videoDevs);
        if (!selectedDeviceId && videoDevs.length > 0) {
          setSelectedDeviceId(videoDevs[0].deviceId);
        }
      } catch {
        // Enumerate fallback
      }
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission was blocked by your browser. Please follow the quick steps below to allow access:');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No webcam or camera device found on this computer. You can upload a photo file directly below.');
      } else {
        setError(err.message || 'Unable to start camera feed.');
      }
    } finally {
      setLoading(false);
    }
  }, [stream, selectedDeviceId]);

  // Handle open / close lifecycle
  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopStream();
      setCapturedDataUrl(null);
      setError('');
    }
    return () => {
      stopStream();
    };
  }, [open]);

  // Change camera device
  const handleDeviceChange = (e) => {
    const devId = e.target.value;
    setSelectedDeviceId(devId);
    startCamera(devId);
  };

  // Capture frame
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedDataUrl(dataUrl);
    stopStream();
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedDataUrl(null);
    startCamera(selectedDeviceId);
  };

  // Confirm photo and create File object
  const confirmPhoto = () => {
    if (!capturedDataUrl) return;

    // Convert dataUrl to Blob -> File
    const arr = capturedDataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    const filename = `photo_${Date.now()}.jpg`;
    const file = new File([blob], filename, { type: 'image/jpeg', lastModified: Date.now() });

    onCapture(file);
    onClose();
  };

  // Fallback direct system camera / photo input
  const handleFallbackFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          maxWidth: 620,
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #015C94, #003666)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{title}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Live Webcam / Direct Camera Snapshot</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 22,
              cursor: 'pointer',
              color: '#94a3b8',
              lineHeight: 1,
              padding: 4,
            }}
          >
            &times;
          </button>
        </div>

        {/* Body Viewport */}
        <div style={{ padding: 20 }}>
          {error && (
            <div
              style={{
                background: '#fff1f2',
                border: '1.5px solid #fda4af',
                borderRadius: 10,
                padding: '14px 16px',
                marginBottom: 16,
                fontSize: 13,
                color: '#9f1239',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                ⚠️ Camera Permission Notice
              </div>
              <div style={{ marginBottom: 8 }}>{error}</div>
              <ol style={{ margin: '0 0 12px 18px', padding: 0, lineHeight: 1.6, fontSize: 12.5 }}>
                <li>Browser address bar mein top-left par <strong>🔒 Padlock / 🎛️ Tune Icon</strong> par click karein.</li>
                <li><strong>Camera</strong> option ko <strong>"Allow"</strong> (toggle ON) karein.</li>
                <li>Neechay <strong>"Retry Camera"</strong> button click karein.</li>
              </ol>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => startCamera(selectedDeviceId)}
                  className="btn btn-sm btn-primary"
                  style={{ fontSize: 12, padding: '5px 14px', background: '#e11d48', borderColor: '#e11d48' }}
                >
                  🔄 Retry Camera
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-sm btn-outline"
                  style={{ fontSize: 12, padding: '5px 14px' }}
                >
                  📁 Upload Photo File
                </button>
              </div>
            </div>
          )}

          {/* Camera Selection Dropdown */}
          {!capturedDataUrl && devices.length > 1 && (
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Select Camera:</label>
              <select
                value={selectedDeviceId}
                onChange={handleDeviceChange}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                }}
              >
                {devices.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Camera ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Video or Captured Image Viewport */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4/3',
              maxHeight: 360,
              background: '#090d16',
              borderRadius: 12,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
            }}
          >
            {capturedDataUrl ? (
              <img
                src={capturedDataUrl}
                alt="Captured Snapshot"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}

            {loading && !capturedDataUrl && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 14,
                  background: 'rgba(0,0,0,0.6)',
                }}
              >
                Initializing camera feed...
              </div>
            )}

            {/* Target Face Guide Oval */}
            {!capturedDataUrl && !error && (
              <div
                style={{
                  position: 'absolute',
                  width: '50%',
                  height: '65%',
                  border: '2px dashed rgba(255, 255, 255, 0.45)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Controls */}
          <div
            style={{
              marginTop: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="user"
                style={{ display: 'none' }}
                onChange={handleFallbackFile}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-outline btn-sm"
                style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload from Files / Phone Camera
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {capturedDataUrl ? (
                <>
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: 13, fontWeight: 600 }}
                  >
                    🔄 Retake Photo
                  </button>
                  <button
                    type="button"
                    onClick={confirmPhoto}
                    className="btn btn-primary btn-sm"
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      borderColor: '#059669',
                    }}
                  >
                    ✓ Use This Photo
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={capturePhoto}
                  disabled={loading || !!error}
                  className="btn btn-primary"
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    padding: '8px 22px',
                    borderRadius: 30,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'linear-gradient(135deg, #015C94, #003666)',
                  }}
                >
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: '#ef4444',
                      display: 'inline-block',
                      boxShadow: '0 0 8px #ef4444',
                    }}
                  />
                  Capture Photo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
