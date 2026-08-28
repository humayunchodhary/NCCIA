import { useState, useEffect, useRef } from 'react';

export default function AudioSampleRecorder({
  label = 'Voice Sample (30s)',
  file = null,
  onChange,
  disabled = false,
  targetDuration = 30, // seconds
}) {
  const [mode, setMode] = useState('record'); // 'record' | 'upload'
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  // Sync previewUrl when file prop changes
  useEffect(() => {
    if (file instanceof Blob || file instanceof File) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof file === 'string' && file) {
      setPreviewUrl(file.startsWith('http') || file.startsWith('/') ? file : `/${file}`);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  // Clean up recording stream & timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    setErrorMsg('');
    audioChunksRef.current = [];
    setRecordingSeconds(0);

    const isSecureOrigin = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (!navigator.mediaDevices?.getUserMedia) {
      if (!isSecureOrigin) {
        setErrorMsg('⚠️ Browser mic access requires HTTPS. Please switch to "File / USB" tab to attach the audio sample file directly.');
      } else {
        setErrorMsg('Microphone access is not supported by your browser. Please use "File / USB" option.');
      }
      setMode('upload');
      return;
    }

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (errConstraint) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      streamRef.current = stream;

      let mimeType = '';
      const candidateMimes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/mp4',
        'audio/aac',
      ];

      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
        for (const candidate of candidateMimes) {
          if (MediaRecorder.isTypeSupported(candidate)) {
            mimeType = candidate;
            break;
          }
        }
      }

      let recorder;
      try {
        recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      } catch (err) {
        recorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const ext = recorder.mimeType?.includes('ogg') ? 'ogg' : (recorder.mimeType?.includes('mp4') ? 'mp4' : 'webm');
        const sampleFileName = `${label.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.${ext}`;
        const audioFile = new File([audioBlob], sampleFileName, { type: audioBlob.type });

        if (onChange) {
          onChange(audioFile);
        }

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      recorder.start(250);
      setIsRecording(true);

      let currentSec = 0;
      timerRef.current = setInterval(() => {
        currentSec += 1;
        setRecordingSeconds(currentSec);

        if (currentSec >= targetDuration) {
          stopRecording();
        }
      }, 1000);
    } catch (err) {
      console.error('Microphone error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Microphone access is blocked by Windows Privacy Settings or Browser. Agar Chrome mein allow hai toh Windows Settings mein Microphone ON karein, ya File/USB se attach karein.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMsg('No active microphone found on laptop. Please check audio drivers or use "File / USB" upload.');
      } else {
        setErrorMsg(`Microphone error (${err.message || err.name}). Please use "File / USB" to attach recording.`);
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.round((recordingSeconds / targetDuration) * 100));

  return (
    <div style={{
      border: '1.5px solid #cbd5e1',
      borderRadius: 10,
      padding: 14,
      background: isRecording ? '#fff1f2' : '#ffffff',
      transition: 'all 0.2s',
      boxShadow: isRecording ? '0 0 0 3px rgba(239,68,68,0.2)' : 'none',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
        <label className="cf-label required" style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#1e293b' }}>
          🎙️ {label}
        </label>
        {!disabled && !isRecording && (
          <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: 2, borderRadius: 6 }}>
            <button
              type="button"
              onClick={() => setMode('record')}
              style={{
                background: mode === 'record' ? '#015C94' : 'transparent',
                color: mode === 'record' ? '#fff' : '#64748b',
                border: 'none',
                padding: '3px 8px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🎙️ Live Record (30s)
            </button>
            <button
              type="button"
              onClick={() => setMode('upload')}
              style={{
                background: mode === 'upload' ? '#015C94' : 'transparent',
                color: mode === 'upload' ? '#fff' : '#64748b',
                border: 'none',
                padding: '3px 8px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              📁 File / USB
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div style={{ padding: '10px 12px', background: '#fee2e2', color: '#991b1b', borderRadius: 8, fontSize: 12, marginBottom: 10, border: '1px solid #fca5a5' }}>
          <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>⚠️ Microphone Access Blocked:</span>
          </div>
          <div>{errorMsg}</div>
          <div style={{ marginTop: 8, padding: 8, background: '#ffffff', borderRadius: 6, color: '#1e293b', border: '1px solid #fecaca' }}>
            <strong style={{ display: 'block', marginBottom: 4, color: '#0f172a' }}>Chrome / Edge mein Mic Unblock karne ka tareeqa:</strong>
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: 11.5, lineHeight: 1.6 }}>
              <li>Browser ke address bar ke left side par <strong>🔒 Lock / 🎛️ Site Settings icon</strong> par click karein.</li>
              <li><strong>Microphone</strong> option ko <strong>"Allow"</strong> karein.</li>
              <li>Page reload karein ya neeche <strong>"🔄 Retry Permission"</strong> dabayein.</li>
            </ol>
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={startRecording}
              className="btn btn-sm"
              style={{ background: '#015C94', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}
            >
              🔄 Retry Permission
            </button>
            <button
              type="button"
              onClick={() => { setErrorMsg(''); setMode('upload'); }}
              className="btn btn-sm"
              style={{ background: '#475569', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}
            >
              📁 Switch to File / USB Upload
            </button>
          </div>
        </div>
      )}

      {/* RECORDING IN PROGRESS VIEW */}
      {isRecording && (
        <div style={{ padding: 12, background: '#ffffff', borderRadius: 8, border: '1px solid #fca5a5', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              width: 12, height: 12, borderRadius: '50%', background: '#ef4444',
              display: 'inline-block', animation: 'pulse 1s infinite'
            }} />
            <span style={{ fontWeight: 800, fontSize: 16, color: '#b91c1c' }}>
              Recording: {formatSeconds(recordingSeconds)} / {formatSeconds(targetDuration)}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%', height: 6, background: '#fecaca', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: '#ef4444', transition: 'width 0.3s' }} />
          </div>

          <button
            type="button"
            className="btn btn-sm"
            onClick={stopRecording}
            style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 700, fontSize: 12 }}
          >
            ⏹️ Stop Recording
          </button>
        </div>
      )}

      {/* NOT RECORDING - PREVIEW OR CONTROLS */}
      {!isRecording && (
        <>
          {previewUrl ? (
            <div style={{ padding: 8, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Audio Attached: {file?.name || 'sample_recording.webm'}
                </span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => { onChange?.(null); setPreviewUrl(null); }}
                    style={{ marginLeft: 'auto', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                  >
                    ✕ Remove / Re-record
                  </button>
                )}
              </div>
              <audio controls src={previewUrl} style={{ width: '100%', height: 36 }} />
            </div>
          ) : (
            <div>
              {mode === 'record' && !disabled && (
                <div style={{ textAlign: 'center', padding: '10px', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
                  <button
                    type="button"
                    onClick={startRecording}
                    className="btn btn-sm"
                    style={{
                      background: '#015C94', color: '#fff', border: 'none', borderRadius: 6,
                      padding: '7px 16px', fontWeight: 700, fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    🎙️ Start 30s Live Recording
                  </button>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    Subject will speak for ~30 seconds to capture reference vocal biometric characteristics.
                  </div>
                </div>
              )}

              {(mode === 'upload' || disabled) && (
                <div>
                  {!disabled && (
                    <input
                      type="file"
                      className="cf-input"
                      accept="audio/*,.wav,.mp3,.m4a,.aac,.ogg,.webm"
                      onChange={e => {
                        const picked = e.target.files?.[0] || null;
                        if (picked) onChange?.(picked);
                      }}
                      style={{ fontSize: 12, padding: '6px 10px' }}
                    />
                  )}
                  {disabled && <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>No audio sample attached</div>}
                  <span style={{ fontSize: 11, color: '#64748b', display: 'block', marginTop: 3 }}>
                    Attach 30s sample voice recording from USB or computer.
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
