import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import {
    Play, Pause, SkipBack, SkipForward,
    Volume2, VolumeX, Mic2, BookOpen,
    Sparkles, Download, Loader2, Radio,
    User, GraduationCap, AlertCircle, Headphones, Globe,
    Clapperboard, X, ChevronUp, ChevronDown,
    Upload, Music, Trash2, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { uploadPodcastEpisode, getPodcastEpisodes, deletePodcastEpisode } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/* ─── Supported languages ───────────────────────────────────────────────── */
const LANGUAGES = [
    { label: '🇬🇧 English', value: 'English', lang: 'en-US' },
    { label: '🇮🇳 Hindi', value: 'Hindi', lang: 'hi-IN' },
    { label: '🇮🇳 Tamil', value: 'Tamil', lang: 'ta-IN' },
    { label: '🇮🇳 Telugu', value: 'Telugu', lang: 'te-IN' },
    { label: '🇮🇳 Malayalam', value: 'Malayalam', lang: 'ml-IN' },
    { label: '🇮🇳 Kannada', value: 'Kannada', lang: 'kn-IN' },
    { label: '🇮🇳 Bengali', value: 'Bengali', lang: 'bn-IN' },
    { label: '🇮🇳 Marathi', value: 'Marathi', lang: 'mr-IN' },
    { label: '🇫🇷 French', value: 'French', lang: 'fr-FR' },
    { label: '🇩🇪 German', value: 'German', lang: 'de-DE' },
    { label: '🇯🇵 Japanese', value: 'Japanese', lang: 'ja-JP' },
];

/* ─── Reel gradient presets (one per segment) ──────────────────────── */
const REEL_BG = [
    'from-[#0f0c29] via-[#302b63] to-[#24243e]',
    'from-[#1a1a2e] via-[#16213e] to-[#0f3460]',
    'from-[#200122] via-[#6f0000] to-[#200122]',
    'from-[#0f2027] via-[#203a43] to-[#2c5364]',
    'from-[#11998e] via-[#38ef7d] to-[#11998e]',
    'from-[#373b44] via-[#4286f4] to-[#373b44]',
    'from-[#3a1c71] via-[#d76d77] to-[#ffaf7b]',
    'from-[#1d976c] via-[#93f9b9] to-[#1d976c]',
    'from-[#642b73] via-[#c6426e] to-[#642b73]',
    'from-[#023e8a] via-[#0096c7] to-[#023e8a]',
    'from-[#4b4453] via-[#b5838d] to-[#4b4453]',
    'from-[#005c97] via-[#363795] to-[#005c97]',
];


/* ─── Speaker style map ─────────────────────────────────────────────────── */
const STYLES = {
    Alex: {
        bg: 'from-blue-500 to-indigo-600', ring: 'ring-blue-400',
        label: 'text-blue-400', badge: 'bg-blue-50 border-blue-200 text-blue-700',
        bar: 'border-l-blue-400',
    },
    'Dr. Sage': {
        bg: 'from-emerald-400 to-teal-500', ring: 'ring-emerald-400',
        label: 'text-emerald-400', badge: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        bar: 'border-l-emerald-400',
    },
};
const FALLBACK_STYLE = {
    bg: 'from-slate-500 to-slate-700', ring: 'ring-slate-400',
    label: 'text-slate-400', badge: 'bg-slate-50 border-slate-200 text-slate-600',
    bar: 'border-l-slate-300',
};
const ICONS = { Alex: <User size={26} />, 'Dr. Sage': <GraduationCap size={26} /> };

function styleFor(speaker) {
    // Match both exact and partial (e.g. "Host" → Alex style)
    if (STYLES[speaker]) return STYLES[speaker];
    const s = String(speaker).toLowerCase();
    if (s.includes('host') || s.includes('alex')) return STYLES['Alex'];
    if (s.includes('expert') || s.includes('sage')) return STYLES['Dr. Sage'];
    return FALLBACK_STYLE;
}
function iconFor(speaker) {
    if (ICONS[speaker]) return ICONS[speaker];
    const s = String(speaker).toLowerCase();
    if (s.includes('host') || s.includes('alex')) return ICONS['Alex'];
    return ICONS['Dr. Sage'];
}

/* ─── TTS engines ───────────────────────────────────────────────── */
const speech = window.speechSynthesis;
const SPEECH_SUPPORTED = !!speech;

// Google Translate TTS lang codes for each BCP-47 code we use
const GT_LANG = {
    'hi-IN': 'hi', 'ta-IN': 'ta', 'te-IN': 'te',
    'ml-IN': 'ml', 'kn-IN': 'kn', 'bn-IN': 'bn',
    'mr-IN': 'mr', 'fr-FR': 'fr', 'de-DE': 'de', 'ja-JP': 'ja',
};

/** Split text into chunks ≤ maxLen chars on word boundaries. */
function chunkText(text, maxLen = 180) {
    const words = text.split(' ');
    const chunks = [];
    let cur = '';
    for (const w of words) {
        if ((cur + ' ' + w).length > maxLen) { if (cur) chunks.push(cur.trim()); cur = w; }
        else cur += (cur ? ' ' : '') + w;
    }
    if (cur) chunks.push(cur.trim());
    return chunks;
}

/**
 * Speak via backend TTS proxy → Google Translate audio (no CORS issues).
 * Chunks long text and plays sequentially.
 * audioRef.current is updated so the caller can stop playback.
 */
function speakGoogleTTS(text, gtCode, volume, audioRef) {
    return new Promise((resolve) => {
        const chunks = chunkText(text);
        let idx = 0;
        function next() {
            if (idx >= chunks.length) { resolve(); return; }
            const proxyUrl = `${API_URL}/ai/tts?text=${encodeURIComponent(chunks[idx])}&lang=${gtCode}`;
            const audio = new Audio(proxyUrl);
            audio.volume = Math.max(0, Math.min(1, volume));
            audioRef.current = audio;
            audio.onended = () => { idx++; next(); };
            audio.onerror = () => { idx++; next(); };   // always advance
            audio.play().catch(() => { idx++; next(); });
        }
        next();
    });
}


/** Pick Web Speech voice for English. */
function pickEnVoice(speaker, allVoices) {
    const isExpert = /sage|expert/i.test(speaker);
    const en = allVoices.filter(v => v.lang?.startsWith('en'));
    if (!en.length) return null;
    const kw = isExpert
        ? ['male', 'david', 'daniel', 'james', 'mark', 'google uk english male', 'fred']
        : ['female', 'samantha', 'zira', 'hazel', 'google us english', 'victoria', 'karen'];
    return en.find(v => kw.some(k => v.name.toLowerCase().includes(k))) || en[0];
}

/**
 * Unified speak: routes to Google TTS for non-English, Web Speech API for English.
 * @param {string} text
 * @param {string} speaker
 * @param {string[]} voices - browser voices list
 * @param {number} volume
 * @param {string} langCode - BCP-47, e.g. 'ta-IN'
 * @param {React.MutableRefObject} audioRef - holds current Audio element
 */
function speakText(text, speaker, voices, volume, langCode, audioRef) {
    if (!text?.trim()) return Promise.resolve();
    const gtCode = GT_LANG[langCode];
    if (gtCode) {
        // Non-English: use Google TTS (supports Indian languages perfectly)
        speech.cancel();
        return speakGoogleTTS(text, gtCode, volume, audioRef);
    }
    // English: use Web Speech API
    return new Promise((resolve) => {
        speech.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        const voice = pickEnVoice(speaker, voices);
        if (voice) utter.voice = voice;
        utter.lang = 'en-US';
        utter.rate = 0.92;
        utter.pitch = /sage|expert/i.test(speaker) ? 0.8 : 1.1;
        utter.volume = Math.max(0, Math.min(1, volume));
        speech.speak(utter);
        // Chrome stall watchdog
        const wd = setInterval(() => { if (!speech.speaking) { clearInterval(wd); resolve(); } }, 250);
        utter.onend = () => { clearInterval(wd); resolve(); };
        utter.onerror = () => { clearInterval(wd); resolve(); };
    });
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function Podcast() {
    const { currentUser } = useAuth();

    const [topic, setTopic] = useState('');
    const [podcast, setPodcast] = useState(null);   // { title, segments }
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]); // default English
    const [fileContext, setFileContext] = useState('');
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [segIdx, setSegIdx] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [reelMode, setReelMode] = useState(false);

    const [voices, setVoices] = useState([]);
    const langRef = useRef(LANGUAGES[0]);

    // Podcast upload state
    const [episodes, setEpisodes] = useState([]);
    const [showUpload, setShowUpload] = useState(false);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadDesc, setUploadDesc] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploadingPodcast, setIsUploadingPodcast] = useState(false);
    const [playingEpisode, setPlayingEpisode] = useState(null);
    const audioPlayerRef = useRef(null);
    const [audioProgress, setAudioProgress] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const [isEpisodePlaying, setIsEpisodePlaying] = useState(false);

    // Holds the current <Audio> element (Google TTS) so we can stop it
    const gAudioRef = useRef(null);

    // Refs to avoid stale closures inside async play loop
    const podcastRef = useRef(null);
    const segIdxRef = useRef(0);
    const isPlayingRef = useRef(false);
    const volumeRef = useRef(1);
    const isMutedRef = useRef(false);
    const loopRunning = useRef(false);

    // Keep refs in sync
    useEffect(() => { podcastRef.current = podcast; }, [podcast]);
    useEffect(() => { segIdxRef.current = segIdx; }, [segIdx]);
    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
    useEffect(() => { volumeRef.current = volume; }, [volume]);
    useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
    useEffect(() => { langRef.current = selectedLang; }, [selectedLang]);

    // Load voices
    useEffect(() => {
        if (!SPEECH_SUPPORTED) return;
        const load = () => setVoices(window.speechSynthesis.getVoices());
        load();
        window.speechSynthesis.onvoiceschanged = load;
        return () => { window.speechSynthesis.onvoiceschanged = null; speech.cancel(); };
    }, []);

    /* ── Play loop ── runs as long as isPlayingRef is true */
    const startPlayLoop = async () => {
        if (loopRunning.current) return;
        loopRunning.current = true;

        while (isPlayingRef.current) {
            const pod = podcastRef.current;
            if (!pod?.segments?.length) break;

            const idx = segIdxRef.current;
            if (idx >= pod.segments.length) {
                // reached end — stop
                setIsPlaying(false);
                setSegIdx(0);
                break;
            }

            const seg = pod.segments[idx];
            const vol = isMutedRef.current ? 0 : volumeRef.current;
            const lc = langRef.current?.lang || 'en-US';

            await speakText(seg.text, seg.speaker, voices, vol, lc, gAudioRef);

            if (!isPlayingRef.current) break;     // user paused mid-segment

            const next = idx + 1;
            if (next < pod.segments.length) {
                setSegIdx(next);
                segIdxRef.current = next;
            } else {
                // Finished all segments
                setIsPlaying(false);
                setSegIdx(0);
                break;
            }
        }

        loopRunning.current = false;
    };

    /* ── Trigger play loop when isPlaying turns true ── */
    useEffect(() => {
        if (isPlaying) {
            startPlayLoop();
        } else {
            // Stop Web Speech
            speech.cancel();
            // Stop Google TTS audio
            if (gAudioRef.current) {
                gAudioRef.current.pause();
                gAudioRef.current.src = '';
                gAudioRef.current = null;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying]);

    /* ── API call ── */
    const handleGenerate = async () => {
        if (!topic.trim()) return;
        speech.cancel();
        setIsPlaying(false);
        setIsLoading(true);
        setError('');
        setPodcast(null);
        setSegIdx(0);
        try {
            const res = await fetch(`${API_URL}/ai/podcast`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    userId: currentUser?.uid,
                    language: selectedLang.value,
                    fileContext: fileContext || undefined
                }),
            });
            const data = await res.json();
            if (res.ok && data.segments?.length) {
                setPodcast(data);
                podcastRef.current = data;
            } else {
                setError(data.error || data.details || 'Generation failed. Try again.');
            }
        } catch (e) {
            setError('Connection error — is the backend running?');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDocUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validExts = ['.pdf', '.txt', '.docx'];
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!validExts.includes(ext)) {
            setError(`Unsupported document format. Use PDF, TXT, or DOCX.`);
            e.target.value = '';
            return;
        }

        setIsUploadingDoc(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (currentUser?.uid) formData.append('userId', currentUser.uid);

            const res = await fetch(`${API_URL}/files/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                setFileContext(data.extractedText);
                setTopic(`Podcast about ${file.name}`);
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (err) {
            setError('Failed to process document: ' + err.message);
        } finally {
            setIsUploadingDoc(false);
            e.target.value = '';
        }
    };

    // ── Podcast Upload ──
    useEffect(() => {
        if (currentUser?.uid) {
            getPodcastEpisodes(currentUser.uid).then(setEpisodes).catch(console.error);
        }
    }, [currentUser]);

    const handlePodcastUpload = async (e) => {
        const audioFile = e.target.files[0];
        if (!audioFile) return;

        const validExts = ['.mp3', '.wav', '.m4a'];
        const ext = '.' + audioFile.name.split('.').pop().toLowerCase();
        if (!validExts.includes(ext)) {
            setError(`Unsupported audio format: ${ext}. Use MP3, WAV, or M4A.`);
            return;
        }

        setIsUploadingPodcast(true);
        setUploadProgress(0);
        try {
            const result = await uploadPodcastEpisode(audioFile, null, {
                title: uploadTitle || audioFile.name.replace(/\.[^.]+$/, ''),
                description: uploadDesc,
                userId: currentUser?.uid || 'dev_user',
            }, (progress) => setUploadProgress(progress));

            setEpisodes(prev => [result.episode, ...prev]);
            setUploadTitle('');
            setUploadDesc('');
            setShowUpload(false);
            e.target.value = '';
        } catch (err) {
            setError('Upload failed: ' + err.message);
        } finally {
            setIsUploadingPodcast(false);
            setUploadProgress(0);
        }
    };

    const handleDeleteEpisode = async (id) => {
        try {
            await deletePodcastEpisode(id);
            setEpisodes(prev => prev.filter(ep => ep._id !== id));
            if (playingEpisode?._id === id) {
                setPlayingEpisode(null);
                setIsEpisodePlaying(false);
            }
        } catch (err) {
            setError('Delete failed: ' + err.message);
        }
    };

    const playEpisode = (episode) => {
        setPlayingEpisode(episode);
        setIsEpisodePlaying(true);
        setAudioProgress(0);
    };

    const formatTime = (secs) => {
        if (!secs || isNaN(secs)) return '0:00';
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const togglePlay = () => {
        if (!podcast) return;
        setIsPlaying(p => !p);
    };

    const goTo = (idx) => {
        speech.cancel();
        setIsPlaying(false);
        setSegIdx(idx);
        segIdxRef.current = idx;
    };

    const exportTranscript = () => {
        if (!podcast) return;
        const body = podcast.segments.map(s => `[${s.speaker}]\n${s.text}`).join('\n\n');
        const blob = new Blob([`${podcast.title}\n${'─'.repeat(50)}\n\n${body}`], { type: 'text/plain' });
        const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${podcast.title}.txt` });
        a.click();
    };

    const seg = podcast?.segments?.[segIdx];
    const st = styleFor(seg?.speaker);

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8 pb-20">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <Radio className="text-primary" size={28} /> Study Podcast
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            AI two-speaker conversation · audio via browser speech synthesis
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Reel Mode toggle */}
                        {podcast && (
                            <button
                                onClick={() => setReelMode(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow hover:shadow-md transition-all hover:scale-105 active:scale-95"
                            >
                                <Clapperboard size={16} className="text-secondary" />
                                Reel View
                            </button>
                        )}
                        {/* Language picker */}
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl">
                            <Globe size={14} className="text-slate-400" />
                            <select
                                value={selectedLang.value}
                                onChange={e => setSelectedLang(LANGUAGES.find(l => l.value === e.target.value))}
                                className="text-sm text-slate-700 font-medium bg-transparent outline-none cursor-pointer"
                            >
                                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                            </select>
                        </div>
                        {/* Document Upload for Podcast Context */}
                        {fileContext ? (
                            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                                <BookOpen size={14} className="text-emerald-500" />
                                <span className="text-xs font-bold text-emerald-700 truncate max-w-[100px]">Doc Active</span>
                                <button onClick={() => { setFileContext(''); setTopic(''); }} className="text-emerald-500 hover:text-emerald-700 ml-1">
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <label className={`flex items-center gap-2 px-3 py-2.5 border rounded-xl font-bold text-sm cursor-pointer transition-all ${isUploadingDoc ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm'}`}>
                                {isUploadingDoc ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} className="text-slate-400" />}
                                {isUploadingDoc ? 'Extracting...' : 'PDF'}
                                <input type="file" accept=".pdf,.txt,.docx" className="hidden" onChange={handleDocUpload} disabled={isUploadingDoc} />
                            </label>
                        )}

                        <input
                            type="text"
                            placeholder="Topic (e.g. Photosynthesis)..."
                            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 w-56 flex-1"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                        />
                        <button onClick={handleGenerate} disabled={isLoading || !topic.trim()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow hover:shadow-md transition-all active:scale-95 disabled:opacity-50 min-w-fit">
                            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                            Generate
                        </button>
                    </div>
                </div>

                {/* No speech support */}
                {!SPEECH_SUPPORTED && (
                    <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl text-yellow-700 text-sm">
                        <AlertCircle size={16} /> Your browser doesn't support speech synthesis. Please use Chrome or Edge.
                    </div>
                )}

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
                            <AlertCircle size={16} className="shrink-0" /> {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading */}
                <AnimatePresence>
                    {isLoading && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="bg-slate-900 rounded-[36px] p-14 text-white text-center">
                            <div className="flex flex-col items-center gap-6">
                                <div className="flex gap-8">
                                    {['Alex', 'Dr. Sage'].map((name, i) => (
                                        <div key={name} className="flex flex-col items-center gap-2">
                                            <motion.div
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.6 }}
                                                className={`w-14 h-14 rounded-full bg-gradient-to-br ${STYLES[name].bg} flex items-center justify-center`}>
                                                <Mic2 size={22} className="text-white" />
                                            </motion.div>
                                            <span className="text-xs text-white/50 font-bold">{name}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="font-bold text-lg">Writing the podcast script…</p>
                                <div className="flex gap-1.5">
                                    {[0, 1, 2, 3, 4].map(i => (
                                        <motion.div key={i} animate={{ scaleY: [0.2, 1, 0.2] }}
                                            transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.1 }}
                                            className="w-1.5 h-6 bg-primary/40 rounded-full origin-bottom" />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Player */}
                <AnimatePresence>
                    {podcast && !isLoading && (
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Left: Player + transcript */}
                            <div className="lg:col-span-2 space-y-5">

                                {/* Player card */}
                                <div className="bg-slate-900 rounded-[36px] p-8 text-white shadow-2xl relative overflow-hidden min-h-[440px] flex flex-col items-center justify-center">
                                    {/* Background glow */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${st.bg} opacity-10 blur-3xl transition-all duration-700`} />

                                    <div className="relative z-10 flex flex-col items-center gap-6 w-full text-center">

                                        {/* Speaker avatar */}
                                        <motion.div layout
                                            animate={isPlaying ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                                            className={`w-24 h-24 bg-gradient-to-br ${st.bg} rounded-[24px] flex items-center justify-center shadow-2xl ring-4 ${st.ring} ring-offset-4 ring-offset-slate-900 transition-all duration-500`}>
                                            <span className="text-white">{iconFor(seg?.speaker)}</span>
                                        </motion.div>

                                        {/* Speaker name + progress */}
                                        <div className="space-y-1">
                                            <span className={`text-[11px] font-black uppercase tracking-[0.18em] ${st.label} flex items-center justify-center gap-1.5`}>
                                                <Headphones size={11} />
                                                {seg?.speaker || 'Loading…'} · Segment {segIdx + 1} / {podcast.segments.length}
                                            </span>
                                            <h2 className="text-xl font-bold max-w-sm">{podcast.title}</h2>
                                        </div>

                                        {/* Waveform */}
                                        <div className="flex items-center gap-[3px] w-full max-w-xs h-9">
                                            {[...Array(22)].map((_, i) => (
                                                <motion.div key={i}
                                                    animate={isPlaying
                                                        ? { scaleY: [0.1, 0.5 + (i % 5) * 0.12, 0.1] }
                                                        : { scaleY: 0.1 }}
                                                    transition={{ repeat: Infinity, duration: 0.5 + (i % 6) * 0.07, delay: i * 0.03 }}
                                                    className="flex-1 bg-white/20 rounded-full origin-center h-full" />
                                            ))}
                                        </div>

                                        {/* Controls */}
                                        <div className="flex items-center gap-8">
                                            <button onClick={() => goTo(Math.max(0, segIdx - 1))} disabled={segIdx === 0}
                                                className="text-white/40 hover:text-white transition disabled:opacity-20 hover:scale-110">
                                                <SkipBack size={22} />
                                            </button>
                                            <button onClick={togglePlay} disabled={!SPEECH_SUPPORTED}
                                                className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition disabled:opacity-40">
                                                {isPlaying
                                                    ? <Pause size={24} fill="currentColor" />
                                                    : <Play size={24} fill="currentColor" className="ml-0.5" />}
                                            </button>
                                            <button onClick={() => goTo(Math.min(podcast.segments.length - 1, segIdx + 1))}
                                                disabled={segIdx === podcast.segments.length - 1}
                                                className="text-white/40 hover:text-white transition disabled:opacity-20 hover:scale-110">
                                                <SkipForward size={22} />
                                            </button>
                                        </div>

                                        {/* Volume */}
                                        <div className="flex items-center gap-3 w-44">
                                            <button onClick={() => setIsMuted(m => !m)} className="text-white/40 hover:text-white/80 transition">
                                                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                                            </button>
                                            <input type="range" min={0} max={1} step={0.05}
                                                value={isMuted ? 0 : volume}
                                                onChange={e => { setVolume(+e.target.value); setIsMuted(false); }}
                                                className="flex-1 accent-primary cursor-pointer" />
                                        </div>
                                    </div>
                                </div>

                                {/* Transcript for current segment */}
                                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                                            <BookOpen size={15} className="text-secondary" /> Current Segment
                                        </h3>
                                        <button onClick={exportTranscript}
                                            className="text-[10px] font-bold text-slate-400 hover:text-primary flex items-center gap-1.5 transition">
                                            <Download size={12} /> Export Transcript
                                        </button>
                                    </div>
                                    <AnimatePresence mode="wait">
                                        <motion.div key={segIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full border mb-3 ${st.badge}`}>
                                                {iconFor(seg?.speaker) && React.cloneElement(iconFor(seg.speaker), { size: 11 })}
                                                {seg?.speaker}
                                            </span>
                                            <p className="text-sm text-slate-600 leading-relaxed">"{seg?.text}"</p>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Right: Segment list */}
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden self-start sticky top-6">
                                <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-800 text-sm">All Segments</h3>
                                    <span className="text-xs bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">{podcast.segments.length}</span>
                                </div>
                                <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-50">
                                    {podcast.segments.map((s, i) => {
                                        const ss = styleFor(s.speaker);
                                        const active = i === segIdx;
                                        return (
                                            <button key={i} onClick={() => goTo(i)}
                                                className={`w-full text-left px-4 py-3.5 transition hover:bg-slate-50 border-l-2 ${active ? `bg-amber-50 ${ss.bar}` : 'border-transparent'}`}>
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-8 h-8 shrink-0 rounded-xl bg-gradient-to-br ${ss.bg} flex items-center justify-center text-white text-[10px] font-bold`}>
                                                        {i + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-0.5">
                                                            <span className={`text-[10px] font-black uppercase tracking-wider ${active ? ss.label : 'text-slate-400'}`}>
                                                                {s.speaker}
                                                            </span>
                                                            {active && isPlaying && (
                                                                <span className="flex items-center gap-1 text-[9px] text-primary font-bold">
                                                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" /> Speaking
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-500 line-clamp-2">{s.text}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty state */}
                {!podcast && !isLoading && !error && (
                    <div className="bg-slate-900 rounded-[36px] p-14 text-white">
                        <div className="flex flex-col items-center gap-8 opacity-40">
                            <div className="flex gap-10">
                                {[['Alex', 'Host', STYLES['Alex'].bg, <User size={30} />], ['Dr. Sage', 'Expert', STYLES['Dr. Sage'].bg, <GraduationCap size={30} />]].map(([name, role, bg, icon]) => (
                                    <div key={name} className="flex flex-col items-center gap-3">
                                        <div className={`w-20 h-20 bg-gradient-to-br ${bg} rounded-3xl flex items-center justify-center shadow-xl text-white`}>{icon}</div>
                                        <div className="text-center"><p className="font-bold text-sm">{name}</p><p className="text-xs text-white/40">{role}</p></div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-xl">Enter a topic and click Generate</p>
                                <p className="text-sm text-white/40 mt-1">Alex &amp; Dr. Sage will discuss it in a two-voice conversation</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ Uploaded Podcast Episodes ═══════════════════════════════════════ */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Music size={20} className="text-secondary" /> Your Podcasts
                        </h2>
                        <button
                            onClick={() => setShowUpload(!showUpload)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow hover:shadow-md transition-all active:scale-95"
                        >
                            <Upload size={14} /> Upload Episode
                        </button>
                    </div>

                    {/* Upload form */}
                    <AnimatePresence>
                        {showUpload && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6">
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                                    <h3 className="font-bold text-slate-800">Upload Podcast Episode</h3>
                                    <input
                                        type="text"
                                        placeholder="Episode title..."
                                        value={uploadTitle}
                                        onChange={e => setUploadTitle(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <textarea
                                        placeholder="Description (optional)..."
                                        value={uploadDesc}
                                        onChange={e => setUploadDesc(e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                    />
                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm cursor-pointer hover:bg-slate-800 transition-colors">
                                            <Upload size={14} />
                                            {isUploadingPodcast ? `Uploading... ${uploadProgress}%` : 'Select Audio File'}
                                            <input
                                                type="file"
                                                accept=".mp3,.wav,.m4a"
                                                className="hidden"
                                                onChange={handlePodcastUpload}
                                                disabled={isUploadingPodcast}
                                            />
                                        </label>
                                        <span className="text-xs text-slate-400">MP3, WAV, or M4A (max 50MB)</span>
                                    </div>
                                    {isUploadingPodcast && (
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Audio player for uploaded episodes */}
                    <AnimatePresence>
                        {playingEpisode && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6">
                                <div className="bg-slate-900 rounded-2xl p-6 text-white">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                                            <Headphones size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-sm truncate">{playingEpisode.title}</h3>
                                            <p className="text-xs text-white/50">{playingEpisode.format?.toUpperCase()} • {(playingEpisode.fileSize / 1024 / 1024).toFixed(1)}MB</p>
                                        </div>
                                        <button onClick={() => { setPlayingEpisode(null); setIsEpisodePlaying(false); }} className="text-white/40 hover:text-white">
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <audio
                                        ref={audioPlayerRef}
                                        src={`${API_URL.replace('/api', '')}${playingEpisode.audioPath}`}
                                        autoPlay
                                        onTimeUpdate={(e) => setAudioProgress(e.target.currentTime)}
                                        onLoadedMetadata={(e) => setAudioDuration(e.target.duration)}
                                        onPlay={() => setIsEpisodePlaying(true)}
                                        onPause={() => setIsEpisodePlaying(false)}
                                        onEnded={() => setIsEpisodePlaying(false)}
                                    />
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => isEpisodePlaying ? audioPlayerRef.current?.pause() : audioPlayerRef.current?.play()}
                                            className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition"
                                        >
                                            {isEpisodePlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                                        </button>
                                        <span className="text-xs text-white/50 w-10">{formatTime(audioProgress)}</span>
                                        <div className="flex-1 relative h-2 bg-white/10 rounded-full cursor-pointer"
                                            onClick={(e) => {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                const pct = (e.clientX - rect.left) / rect.width;
                                                if (audioPlayerRef.current) audioPlayerRef.current.currentTime = pct * audioDuration;
                                            }}
                                        >
                                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${audioDuration ? (audioProgress / audioDuration * 100) : 0}%` }}></div>
                                        </div>
                                        <span className="text-xs text-white/50 w-10 text-right">{formatTime(audioDuration)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Episode list */}
                    {episodes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {episodes.map(ep => (
                                <div key={ep._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white shadow">
                                            <Music size={20} />
                                        </div>
                                        <button onClick={() => handleDeleteEpisode(ep._id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-sm truncate">{ep.title}</h4>
                                    {ep.description && <p className="text-xs text-slate-500 line-clamp-2 mt-1">{ep.description}</p>}
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                            <Clock size={10} /> {new Date(ep.createdAt).toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={() => playEpisode(ep)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:shadow-md transition-all active:scale-95"
                                        >
                                            <Play size={10} fill="currentColor" /> Play
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            <Music size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No uploaded episodes yet</p>
                            <p className="text-xs mt-1">Upload MP3, WAV, or M4A files to build your podcast library</p>
                        </div>
                    )}
                </div>

                {/* ══ Fullscreen Reel Mode — Cinematic 2D Video Stage ═══════════════ */}
                <AnimatePresence>
                    {reelMode && podcast && (() => {
                        const seg = podcast.segments[segIdx];
                        const isAlex = seg?.speaker === 'Alex';
                        const st = styleFor(seg?.speaker);
                        const words = (seg?.text || '').split(' ');
                        const estDuration = Math.max(4, (seg?.text?.length || 60) * 0.065);

                        // 2D Vector Animation Style Loops (Topic Specific)
                        const TOPIC_VIDEOS = [
                            'https://cdn.pixabay.com/video/2019/04/09/22619-328607148_large.mp4',
                            'https://cdn.pixabay.com/video/2019/09/25/27181-362241514_large.mp4',
                            'https://cdn.pixabay.com/video/2016/11/02/6249-189737525_large.mp4',
                            'https://cdn.pixabay.com/video/2020/07/20/45136-441617300_large.mp4',
                            'https://cdn.pixabay.com/video/2022/01/18/104696-666320074_large.mp4'
                        ];
                        const videoUrl = TOPIC_VIDEOS[segIdx % TOPIC_VIDEOS.length];

                        // 2D Animated Character Loops
                        const CHARACTER_VIDEOS = {
                            'Alex': 'https://cdn.pixabay.com/video/2021/04/12/70831-536967756_large.mp4',
                            'Dr. Sage': 'https://cdn.pixabay.com/video/2020/04/23/37021-412705574_large.mp4'
                        };

                        return (
                            <motion.div
                                key="reel-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden font-sans"
                            >
                                {/* ── Background Topic Video ── */}
                                <motion.div
                                    key={`video-${segIdx}`}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 0.5, scale: 1 }}
                                    transition={{ duration: 0.8 }}
                                    className="absolute inset-0 z-0 bg-slate-900"
                                >
                                    <video autoPlay loop muted playsInline className="w-full h-full object-cover" src={videoUrl} />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#0F172A] via-[#0F172ACC] to-transparent" />
                                </motion.div>

                                <div className="absolute inset-0 z-10 pointer-events-none">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
                                    <div className="w-full h-full opacity-[0.02] bg-[url('https://media.giphy.com/media/oEI9uWUicUE92/giphy.gif')]" />
                                    <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent opacity-80" />
                                </div>

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={`stage-${segIdx}`}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.05 }}
                                        className="relative z-20 w-full max-w-lg h-full flex flex-col items-center justify-between px-6 py-12"
                                    >
                                        <div className="w-full flex gap-1.5 mb-10">
                                            {podcast.segments.map((_, i) => (
                                                <div key={i} className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    {i < segIdx && <div className="h-full bg-white w-full" />}
                                                    {i === segIdx && (
                                                        <motion.div
                                                            className="h-full bg-white shadow-[0_0_10px_white]"
                                                            initial={{ width: '0%' }}
                                                            animate={{ width: isPlaying ? '100%' : '0%' }}
                                                            transition={{ duration: estDuration, ease: 'linear' }}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex-1 flex flex-col items-center justify-center relative w-full">
                                            <motion.div
                                                key={`char-${segIdx}`}
                                                initial={{ y: 50, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ type: 'spring', damping: 20 }}
                                                className="relative w-80 h-80 flex items-center justify-center p-4"
                                            >
                                                <motion.div
                                                    animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                                                    transition={{ duration: 4, repeat: Infinity }}
                                                    className={`absolute inset-0 bg-gradient-to-br ${st.bg} rounded-[40px] blur-3xl`}
                                                />

                                                <div className="relative w-full h-full rounded-[40px] overflow-hidden border-4 border-white/20 shadow-2xl bg-white/5">
                                                    <video autoPlay loop muted playsInline className="w-full h-full object-cover" src={CHARACTER_VIDEOS[seg?.speaker] || CHARACTER_VIDEOS['Alex']} />
                                                    <div className={`absolute bottom-4 left-0 right-0 py-2 bg-gradient-to-r ${st.bg} text-center`}>
                                                        <span className="text-white text-[10px] font-black uppercase tracking-[0.3em] font-sans">
                                                            {seg?.speaker} • {segIdx + 1}/{podcast.segments.length}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>

                                        <div className="w-full text-center mt-8 space-y-4">
                                            <motion.h4 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-white text-sm font-black uppercase tracking-[0.2em] opacity-40">
                                                {seg?.keyFact || 'Learning Deep Dive'}
                                            </motion.h4>

                                            <div className="min-h-[100px] flex items-center justify-center px-4">
                                                <p className="text-white text-2xl font-bold leading-tight tracking-tight">
                                                    {words.map((w, wi) => (
                                                        <motion.span
                                                            key={wi}
                                                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            transition={{ delay: 0.3 + (wi * 0.04), duration: 0.2 }}
                                                            className="inline-block mr-2"
                                                        >
                                                            {w}
                                                        </motion.span>
                                                    ))}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="w-full flex items-center justify-between pt-8">
                                            <button onClick={() => goTo(Math.max(0, segIdx - 1))} disabled={segIdx === 0}
                                                className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/20 transition disabled:opacity-0">
                                                <ChevronUp size={28} />
                                            </button>
                                            <div className="relative">
                                                <motion.button whileTap={{ scale: 0.85 }} onClick={togglePlay}
                                                    className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.4)] text-black relative z-10">
                                                    {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-2" />}
                                                </motion.button>
                                                {isPlaying && <motion.div animate={{ scale: [1, 1.5], opacity: [0.5, 0] }} transition={{ duration: 1, repeat: Infinity }} className="absolute inset-0 bg-white rounded-full z-0" />}
                                            </div>
                                            <button onClick={() => goTo(Math.min(podcast.segments.length - 1, segIdx + 1))} disabled={segIdx === podcast.segments.length - 1}
                                                className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/20 transition disabled:opacity-0">
                                                <ChevronDown size={28} />
                                            </button>
                                        </div>

                                        <button onClick={() => setReelMode(false)} className="mt-6 text-white/40 text-[10px] font-black uppercase tracking-[0.4em] hover:text-white transition">
                                            Exit Reel Mode
                                        </button>
                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>
                        );
                    })()}
                </AnimatePresence>
            </div>{/* end max-w-6xl */}

        </DashboardLayout>
    );
}
