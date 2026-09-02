import { useState, useEffect, useRef, useCallback } from 'react';
import SoftwareGuideCharacter from '../components/SoftwareGuideCharacter';
import './SoftwareGuide.css';

const SCENES = [
  {
    id: 'intro',
    title: 'Welcome to NCCIA CMS',
    titleUr: 'NCCIA CMS mein khush amdeed',
    visual: '🛡️',
    narration:
      'Assalam o Alaikum! Main Cyber Officer Sara hoon. NCCIA Case Management System aap ko complaint se court tak poora digital workflow deta hai — fast, secure, aur transparent.',
    narrationEn:
      'Welcome! I am Cyber Officer Sara. The NCCIA Case Management System gives you a complete digital workflow from complaint to court — fast, secure, and transparent.',
    benefits: ['One portal for all circles', 'Role-based secure access', 'Live audit trail'],
  },
  {
    id: 'complaint',
    title: 'Complaint Registration',
    titleUr: 'Shikayat darj karna',
    visual: '📝',
    narration:
      'Pehla step: complaint register hoti hai — walk-in, portal, ya email se. System tracking number aur automatic SMS acknowledgment bhejta hai complainant ko.',
    narrationEn:
      'Step one: register the complaint from walk-in, portal, or email. The system issues a tracking number and sends automatic SMS acknowledgment to the complainant.',
    benefits: ['Instant tracking number', 'Bilingual SMS', 'Digital attachments'],
  },
  {
    id: 'verification',
    title: 'Verification Stage',
    titleUr: 'Tasdeeq ka marhala',
    visual: '✅',
    narration:
      'Verification Officer complaint verify karta hai, report likhta hai, aur supervisor approve karta hai. Sab kuch CMS mein lock ho jata hai — koi manual register nahi.',
    narrationEn:
      'The Verification Officer verifies the complaint, writes the report, and the supervisor approves it. Everything is locked in CMS — no manual registers.',
    benefits: ['Structured VO reports', 'Approval workflow', 'PDF archive'],
  },
  {
    id: 'enquiry',
    title: 'Enquiry & Investigation',
    titleUr: 'Tahqeek aur investigation',
    visual: '🔍',
    narration:
      'Enquiry Officer diary, evidence aur CFR record karta hai. Investigation Officer case file kholta hai — pehle wale records read-only rehte hain, nayi arrests aur activities add kar sakta hai.',
    narrationEn:
      'The Enquiry Officer records diary, evidence, and CFR. The Investigation Officer opens the case file — earlier records stay read-only while new arrests and activities can be added.',
    benefits: ['Full process history', 'IO diary lock', 'CFR to case file'],
  },
  {
    id: 'forensic',
    title: 'Digital Forensics',
    titleUr: 'Digital forensic',
    visual: '💾',
    narration:
      'IO forensic request bhejta hai, Malkhana custody track karta hai, lab report CMS par upload hoti hai. Chain of custody court ke liye ready rehti hai.',
    narrationEn:
      'The IO sends forensic requests, Malkhana tracks custody, and the lab uploads reports to CMS. Chain of custody stays court-ready.',
    benefits: ['Evidence tracking', 'Lab status updates', 'Signed forensic PDF'],
  },
  {
    id: 'court',
    title: 'Court & Legal',
    titleUr: 'Adalat aur legal',
    visual: '⚖️',
    narration:
      'Legal wing court cases, hearing dates, orders aur verdicts record karti hai. Pending trials dashboard par nazar aate hain.',
    narrationEn:
      'The legal wing records court cases, hearing dates, orders, and verdicts. Pending trials appear on the dashboard.',
    benefits: ['Hearing calendar', 'Order uploads', 'Case linkage'],
  },
  {
    id: 'sms',
    title: 'SMS Notifications',
    titleUr: 'SMS notifications',
    visual: '📱',
    narration:
      'Har important step par complainant aur officers ko SMS milta hai. SMS Log module mein poori delivery history live dikhti hai.',
    narrationEn:
      'Complainants and officers receive SMS at every important step. The SMS Log module shows full live delivery history.',
    benefits: ['English + Urdu', 'Trigger tracking', 'Delivery status'],
  },
  {
    id: 'admin',
    title: 'DSR & D.O. Letters',
    titleUr: 'DSR aur D.O. Letter',
    visual: '📊',
    narration:
      'ADA Administration live CMS data se Daily Situation Report aur monthly D.O. Letter auto-compile karti hai — QR verified official print ke saath.',
    narrationEn:
      'ADA Administration auto-compiles Daily Situation Reports and monthly D.O. Letters from live CMS data — with QR-verified official prints.',
    benefits: ['Auto-compile stats', 'Review workflow', 'QR verification'],
  },
  {
    id: 'reference',
    title: 'Reference Library',
    titleUr: 'Reference Library',
    visual: '📚',
    narration:
      'Laws, Rules, SOPs aur User Manuals ek jagah — har officer View kar sakta hai. PECA sections se le kar step-by-step SOPs tak sab yahan hai.',
    narrationEn:
      'Laws, Rules, SOPs, and User Manuals in one place — every officer can view them. From PECA sections to step-by-step SOPs, everything is here.',
    benefits: ['PECA & PPC guides', 'Official SOPs', 'Role manuals'],
  },
  {
    id: 'summary',
    title: 'Why NCCIA CMS?',
    titleUr: 'NCCIA CMS kyun?',
    visual: '🎯',
    narration:
      'Faida yeh hai: tez kaam, kam galti, poora record, DG ko live analytics, aur citizen ko tracking. Shukriya — ab apna role dashboard se shuru karein!',
    narrationEn:
      'The benefits: faster work, fewer errors, complete records, live analytics for leadership, and tracking for citizens. Thank you — start from your role dashboard now!',
    benefits: ['Speed & accuracy', 'Accountability', 'Public trust'],
  },
];

const SCENE_MS = 14000;

export default function SoftwareGuide() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [lang, setLang] = useState('ur'); // ur | en | both
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const speechRef = useRef(null);
  const scene = SCENES[sceneIndex];

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const speakScene = useCallback((index) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    stopSpeech();
    const s = SCENES[index];
    const text = lang === 'en' ? s.narrationEn : lang === 'both' ? `${s.narrationEn} ${s.narration}` : s.narration;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.92;
    utter.pitch = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => lang !== 'en' && v.lang.startsWith('ur'))
      || voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
      || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utter.voice = preferred;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    speechRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [lang, stopSpeech]);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  }, []);

  const goToScene = useCallback((index, shouldPlay = playing) => {
    clearTimers();
    stopSpeech();
    const i = ((index % SCENES.length) + SCENES.length) % SCENES.length;
    setSceneIndex(i);
    setProgress(0);
    if (shouldPlay) setPlaying(true);
    else if (shouldPlay === false) setPlaying(false);
  }, [clearTimers, playing, stopSpeech]);

  useEffect(() => {
    if (!playing) {
      clearTimers();
      return undefined;
    }
    setProgress(0);
    speakScene(sceneIndex);
    const start = Date.now();
    progressRef.current = setInterval(() => {
      setProgress(Math.min(100, ((Date.now() - start) / SCENE_MS) * 100));
    }, 120);
    timerRef.current = setTimeout(() => {
      setSceneIndex(i => (i + 1) % SCENES.length);
    }, SCENE_MS);
    return clearTimers;
  }, [playing, sceneIndex, lang, clearTimers, speakScene]);

  useEffect(() => () => { clearTimers(); stopSpeech(); }, [clearTimers, stopSpeech]);

  const togglePlay = () => setPlaying(p => !p);

  return (
    <div className="page-content software-guide-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Software Guide Video</h1>
          <p className="page-subtitle">AI-style animated tour — NCCIA CMS benefits &amp; workflow (Roman Urdu + English)</p>
          <div className="title-underline" />
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select className="cf-input" style={{ width: 'auto', minWidth: 120 }} value={lang} onChange={e => setLang(e.target.value)}>
            <option value="ur">Roman Urdu</option>
            <option value="en">English</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>

      <div className="sg-player">
        <div className="sg-screen">
          <div className="sg-scene-bg" data-scene={scene.id} />
          <div className="sg-scene-visual" key={scene.id}>{scene.visual}</div>
          <div className="sg-scene-badge">Scene {sceneIndex + 1} / {SCENES.length}</div>

          <div className="sg-stage">
            <div className="sg-character-wrap">
              <SoftwareGuideCharacter speaking={speaking || playing} wave={scene.id === 'intro'} size={260} />
            </div>
            <div className="sg-bubble" key={scene.id}>
              <div className="sg-bubble-title">{scene.title}</div>
              <div className="sg-bubble-ur">{scene.titleUr}</div>
              <p className="sg-bubble-text">{lang === 'en' ? scene.narrationEn : scene.narration}</p>
              {lang === 'both' && <p className="sg-bubble-text sg-bubble-en">{scene.narrationEn}</p>}
              <div className="sg-benefits-inline">
                {scene.benefits.map(b => (
                  <span key={b} className="sg-benefit-chip">{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="sg-controls">
          <button type="button" className="btn btn-primary btn-sm" onClick={togglePlay}>
            {playing ? '⏸ Pause' : '▶ Play'}
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => goToScene(sceneIndex - 1, playing)}>⏮ Prev</button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => goToScene(sceneIndex + 1, playing)}>Next ⏭</button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => speakScene(sceneIndex)}>🔊 Replay voice</button>
          <div className="sg-progress-wrap">
            <div className="sg-progress-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="sg-chapters">
          {SCENES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`sg-chapter${i === sceneIndex ? ' active' : ''}`}
              onClick={() => goToScene(i, false)}
            >
              <span>{s.visual}</span>
              <small>{s.title}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><span className="card-title">Quick workflow map</span></div>
        <div className="card-body sg-flow-map">
          {['Complaint', 'Verification', 'Enquiry', 'Case / FIR', 'Forensic', 'Court', 'Closed'].map((step, i, arr) => (
            <div key={step} className="sg-flow-step">
              <div className="sg-flow-node">{i + 1}</div>
              <div className="sg-flow-label">{step}</div>
              {i < arr.length - 1 && <div className="sg-flow-arrow">→</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
