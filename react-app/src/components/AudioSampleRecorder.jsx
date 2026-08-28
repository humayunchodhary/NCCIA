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
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0); // 0 - 100 for VU meter
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPermGuide, setShowPermGuide] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

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

  // Clean up recording stream, Web Audio API context, and timer on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try { audioCtxRef.current.close(); } catch (e) {}
      audioCtxRef.current = null;
    }
    setAudioLevel(0);
  };

  const startRecording = async () => {
    setErrorMsg('');
    setShowPermGuide(false);
    audioChunksRef.current = [];
    setRecordingSeconds(0);
    setAudioLevel(0);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const isHttp = window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      if (isHttp) {
        setErrorMsg('⚠️ Browser mic recording requires HTTPS. Please attach the audio file directly below.');
      } else {
        setErrorMsg('Microphone access is not supported by your browser. Please attach your audio file below.');
      }
      setMode('upload');
      return;
    }

    try {
      // 1. Direct, robust microphone stream acquisition
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (errBasic) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
            },
          });
        } catch (errConstraint) {
          throw errBasic;
        }
      }
      streamRef.current = stream;

      // 2. Web Audio API for Real-Time Sound Visualizer (VU meter)
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioCtxRef.current = audioCtx;
          if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
          }
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 128;
          analyser.smoothingTimeConstant = 0.4;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateLevel = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const normalized = Math.min(100, Math.round((avg / 128) * 100));
            setAudioLevel(normalized);
            animFrameRef.current = requestAnimationFrame(updateLevel);
          };
          updateLevel();
        }
      } catch (eVis) {
        console.warn('VU visualizer not available', eVis);
      }

      // 3. Configure MediaRecorder with Supported MimeTypes
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
      } catch (errRec) {
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
        const ext = recorder.mimeType?.includes('ogg')
          ? 'ogg'
          : recorder.mimeType?.includes('mp4')
          ? 'mp4'
          : recorder.mimeType?.includes('wav')
          ? 'wav'
          : 'webm';

        const sampleFileName = `${label.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.${ext}`;
        const audioFile = new File([audioBlob], sampleFileName, { type: audioBlob.type });

        if (onChange) {
          onChange(audioFile);
        }

        cleanupAudio();
        setIsRecording(false);
        setIsPaused(false);
      };

      try {
        recorder.start(250);
      } catch (eStart) {
        try {
          recorder.start();
        } catch (eStart2) {
          console.warn('recorder.start fallback', eStart2);
        }
      }

      setIsRecording(true);
      setIsPaused(false);

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
      setIsRecording(false);
      setIsPaused(false);
      cleanupAudio();

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Microphone access is blocked by your browser or Windows Privacy Settings. Please allow mic or select your audio file directly below.');
        setShowPermGuide(true);
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMsg('No physical microphone device detected. Please attach your recorded audio file directly below.');
        setMode('upload');
      } else {
        setErrorMsg(`Microphone error: ${err.message || err.name}. You can attach the audio file directly below.`);
        setMode('upload');
      }
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.requestData();
      } catch (e) {}
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          const next = prev + 1;
          if (next >= targetDuration) {
            stopRecording();
          }
          return next;
        });
      }, 1000);
    }
  };

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.round((recordingSeconds / targetDuration) * 100));

  return (
    <div style={{
      border: isRecording ? '2px solid #ef4444' : '1.5px solid #cbd5e1',
      borderRadius: 10,
      padding: 14,
      background: isRecording ? '#fff5f5' : '#ffffff',
      transition: 'all 0.2s',
      boxShadow: isRecording ? '0 0 0 3px rgba(239,68,68,0.15)' : 'none',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
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
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              🎙️ Live Mic
            </button>
            <button
              type="button"
              onClick={() => setMode('upload')}
              style={{
                background: mode === 'upload' ? '#015C94' : 'transparent',
                color: mode === 'upload' ? '#fff' : '#64748b',
                border: 'none',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              📁 Attach File / USB
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div style={{ padding: '8px 12px', background: '#fee2e2', color: '#991b1b', borderRadius: 6, fontSize: 12, marginBottom: 10, border: '1px solid #fca5a5', lineHeight: 1.4 }}>
          {errorMsg}
        </div>
      )}

      {showPermGuide && (
        <div style={{ padding: 10, background: '#fef3c7', color: '#92400e', borderRadius: 6, fontSize: 11.5, marginBottom: 10, border: '1px solid #fde68a' }}>
          <strong>📌 How to enable microphone in your browser:</strong>
          <ol style={{ paddingLeft: 18, marginTop: 4, marginBottom: 4 }}>
            <li>Look at the top browser URL address bar.</li>
            <li>Click the <strong>🔒 Padlock / Settings icon</strong> next to the website address.</li>
            <li>Change <strong>Microphone</strong> permission from <em>Blocked</em> to <strong>Allow</strong>.</li>
            <li>Click <strong>Reload / Refresh</strong> page and try again.</li>
          </ol>
          <div style={{ marginTop: 6 }}>
            <button
              type="button"
              onClick={() => { setMode('upload'); setShowPermGuide(false); }}
              className="btn btn-sm"
              style={{ background: '#d97706', color: '#fff', fontSize: 11, padding: '3px 8px', borderRadius: 4, border: 'none' }}
            >
              📁 Switch to Attach File / USB
            </button>
          </div>
        </div>
      )}

      {/* ── LIVE RECORDING IN PROGRESS ── */}
      {isRecording && (
        <div style={{ padding: 14, background: '#ffffff', borderRadius: 8, border: '1px solid #fca5a5', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{
              width: 12, height: 12, borderRadius: '50%', background: isPaused ? '#f59e0b' : '#ef4444',
              display: 'inline-block', animation: isPaused ? 'none' : 'pulse 1s infinite'
            }} />
            <span style={{ fontWeight: 800, fontSize: 16, color: isPaused ? '#b45309' : '#b91c1c' }}>
              {isPaused ? '⏸️ Recording Paused:' : '🔴 Recording Voice:'} {formatSeconds(recordingSeconds)} / {formatSeconds(targetDuration)}
            </span>
          </div>

          {/* Real-time Sound Level (VU Meter) */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#64748b', marginBottom: 2 }}>
              <span>Live Mic Signal:</span>
              <span style={{ fontWeight: 700, color: audioLevel > 15 ? '#059669' : '#94a3b8' }}>
                {audioLevel > 15 ? '🎤 Voice Detected' : '🤫 Speak into microphone...'}
              </span>
            </div>
            <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                width: `${audioLevel}%`,
                height: '100%',
                background: audioLevel > 70 ? '#ef4444' : audioLevel > 35 ? '#eab308' : '#22c55e',
                transition: 'width 0.08s ease-out',
              }} />
            </div>
          </div>

          {/* Time Progress Bar */}
          <div style={{ width: '100%', height: 6, background: '#fecaca', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: '#ef4444', transition: 'width 0.3s' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            {isPaused ? (
              <button
                type="button"
                className="btn btn-sm"
                onClick={resumeRecording}
                style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 700, fontSize: 12 }}
              >
                ▶️ Resume
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-sm"
                onClick={pauseRecording}
                style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 700, fontSize: 12 }}
              >
                ⏸️ Pause
              </button>
            )}

            <button
              type="button"
              className="btn btn-sm"
              onClick={stopRecording}
              style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 700, fontSize: 12.5 }}
            >
              ⏹️ Stop &amp; Save ({recordingSeconds}s)
            </button>
          </div>
        </div>
      )}

      {/* ── NOT RECORDING: PREVIEW OR INPUT MODES ── */}
      {!isRecording && (
        <>
          {previewUrl ? (
            <div style={{ padding: 10, background: '#f8fafc', borderRadius: 8, border: '1.5px solid #cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Ready: {file?.name || (typeof file === 'string' ? file.split('/').pop() : 'recorded_sample.webm')}
                </span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange?.(null);
                      setPreviewUrl(null);
                    }}
                    style={{ marginLeft: 'auto', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 4, padding: '3px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
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
                <div style={{ textAlign: 'center', padding: '14px 10px', background: '#f8fafc', borderRadius: 8, border: '1.5px dashed #cbd5e1' }}>
                  <button
                    type="button"
                    onClick={startRecording}
                    className="btn btn-sm"
                    style={{
                      background: '#015C94', color: '#fff', border: 'none', borderRadius: 6,
                      padding: '8px 20px', fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6,
                      boxShadow: '0 2px 4px rgba(1,92,148,0.2)',
                    }}
                  >
                    🎙️ Start 30s Live Recording
                  </button>
                  <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 8 }}>
                    Click start and have the subject speak naturally into the mic for 30 seconds.
                  </div>
                </div>
              )}

              {mode === 'upload' && (
                <div style={{ padding: 10, background: '#f8fafc', borderRadius: 8, border: '1.5px dashed #94a3b8' }}>
                  {!disabled && (
                    <input
                      type="file"
                      className="cf-input"
                      accept="audio/*,.wav,.mp3,.m4a,.aac,.ogg,.webm,.flac,.amr,.wma"
                      onChange={e => {
                        const picked = e.target.files?.[0] || null;
                        if (picked) onChange?.(picked);
                      }}
                      style={{ fontSize: 12, padding: '7px 10px', background: '#fff' }}
                    />
                  )}
                  {disabled && <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>No audio sample attached</div>}
                  <span style={{ fontSize: 11, color: '#64748b', display: 'block', marginTop: 4 }}>
                    📌 Select 30-second audio recording file from USB drive, phone extraction, or Windows Voice Recorder.
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
