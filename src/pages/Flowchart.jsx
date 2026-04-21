import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import {
    GitBranch, Download, Copy, Check, Sparkles,
    ZoomIn, ZoomOut, RotateCcw, Code2, Eye,
    Loader2, Sun, Moon, AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';
import mermaid from 'mermaid';

const API_URL = API_BASE_URL;
const EXAMPLE_TOPICS = ['Photosynthesis', 'Machine Learning', 'DNA Replication', 'OSI Model', 'React Lifecycle'];

// ── Mermaid one-time global init ──────────────────────────────────────────
mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });

// ── Clean AI output: find first diagram keyword and slice from there ──────
const DIAGRAM_RE = /^(flowchart|graph\s+\w+|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie)/m;

/**
 * Fix common Mermaid syntax issues from AI output:
 * Bare parentheses/brackets/braces without node IDs.
 */
function sanitizeMermaidSyntax(code) {
    let nodeCounter = 200;
    return code.split('\n').map(line => {
        // Fix `A --> (Label)` → `A --> N200(Label)`
        line = line.replace(
            /(-->|---|-.->|==>)\s*\(([^)]+)\)/g,
            (m, arrow, label) => `${arrow} N${nodeCounter++}(${label})`
        );
        // Fix `A --> [Label]` → `A --> N201[Label]`
        line = line.replace(
            /(-->|---|-.->|==>)\s*\[([^\]]+)\]/g,
            (m, arrow, label) => `${arrow} N${nodeCounter++}[${label}]`
        );
        // Fix `A --> {Label}` → `A --> N202{Label}`
        line = line.replace(
            /(-->|---|-.->|==>)\s*\{([^}]+)\}/g,
            (m, arrow, label) => `${arrow} N${nodeCounter++}{${label}}`
        );
        return line;
    }).join('\n');
}

function extractMermaidCode(raw = '') {
    // Try to find a known diagram declaration
    const m = DIAGRAM_RE.exec(raw);
    let code;
    if (m) {
        // Remove trailing ``` fence if present
        code = raw.slice(m.index).replace(/\n```[\s\S]*$/, '').trim();
    } else {
        // Fallback: strip all ``` fences and return
        code = raw.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
    }
    // Sanitize common AI syntax mistakes
    return sanitizeMermaidSyntax(code);
}

// ── Unique render ID counter ──────────────────────────────────────────────
let uid = 0;

const Flowchart = () => {
    const { currentUser } = useAuth();
    const [zoom, setZoom] = useState(100);
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mermaidCode, setMermaidCode] = useState('');
    const [svgHtml, setSvgHtml] = useState('');
    const [fetchError, setFetchError] = useState('');
    const [renderError, setRenderError] = useState('');
    const [activeTab, setActiveTab] = useState('preview');
    const [copied, setCopied] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const renderSeq = useRef(0);

    // ── Re-render whenever code or theme changes ──────────────────────────
    useEffect(() => {
        if (!mermaidCode.trim()) { setSvgHtml(''); return; }
        const seq = ++renderSeq.current;
        setRenderError('');
        setSvgHtml('');

        // Re-initialize with correct theme before every render
        mermaid.initialize({
            startOnLoad: false,
            theme: isDark ? 'dark' : 'default',
            securityLevel: 'loose',
            flowchart: { curve: 'basis', useMaxWidth: true, htmlLabels: true },
        });

        const elementId = `mermaid-${++uid}`;

        mermaid.render(elementId, mermaidCode)
            .then(({ svg }) => {
                if (seq === renderSeq.current) setSvgHtml(svg);
            })
            .catch(err => {
                if (seq === renderSeq.current) {
                    console.error('Mermaid render error:', err);
                    setRenderError(err?.message || String(err));
                }
            });
    }, [mermaidCode, isDark]);

    // ── Generate from backend ─────────────────────────────────────────────
    const handleGenerate = async (topicOverride) => {
        const t = (topicOverride || topic).trim();
        if (!t) return;
        if (topicOverride) setTopic(topicOverride);
        setIsLoading(true);
        setFetchError('');
        setRenderError('');
        setSvgHtml('');
        setMermaidCode('');
        try {
            const res = await fetch(`${API_URL}/ai/flowchart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: t, userId: currentUser?.uid }),
            });
            const data = await res.json();
            if (res.ok && data.mermaidCode) {
                setMermaidCode(extractMermaidCode(data.mermaidCode));
                setActiveTab('preview');
            } else {
                setFetchError(data.error || data.details || 'Generation failed — please try again.');
            }
        } catch (err) {
            console.error('Flowchart fetch error:', err);
            setFetchError('Connection error — make sure the backend is running on port 5000.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!mermaidCode) return;
        await navigator.clipboard.writeText(mermaidCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadSVG = () => {
        if (!svgHtml) return;
        const blob = new Blob([svgHtml], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${topic || 'flowchart'}.svg`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const hasContent = !!mermaidCode.trim();
    const isRendering = hasContent && !svgHtml && !renderError && !isLoading;

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6 pb-20">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <GitBranch className="text-secondary" size={30} />
                            AI Flowchart
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm">
                            Generate Mermaid diagrams from any topic — live preview + editable code
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <input
                            type="text"
                            placeholder="Enter topic (e.g. TCP/IP)..."
                            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 w-64"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                        />
                        <button
                            onClick={() => handleGenerate()}
                            disabled={isLoading || !topic.trim()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                            Generate
                        </button>
                    </div>
                </div>

                {/* ── Quick topics ── */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-400 font-medium">Quick:</span>
                    {EXAMPLE_TOPICS.map(t => (
                        <button key={t} onClick={() => handleGenerate(t)} disabled={isLoading}
                            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 font-medium border border-slate-200 hover:border-amber-200 transition-all disabled:opacity-40">
                            {t}
                        </button>
                    ))}
                </div>

                {/* ── API error ── */}
                <AnimatePresence>
                    {fetchError && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
                            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                            <span><strong>Generation Error:</strong> {fetchError}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Main Canvas ── */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/80 flex-wrap gap-3">
                        {/* Tabs */}
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
                            {[['preview', <Eye size={13} />, 'Preview'], ['code', <Code2 size={13} />, 'Mermaid Code']].map(([tab, icon, label]) => (
                                <button key={tab} onClick={() => setActiveTab(tab)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                                    {icon} {label}
                                </button>
                            ))}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                <button onClick={() => setZoom(z => Math.max(30, z - 10))} className="text-slate-500 hover:text-slate-900 p-0.5"><ZoomOut size={13} /></button>
                                <span className="text-xs font-bold text-slate-700 w-9 text-center">{zoom}%</span>
                                <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="text-slate-500 hover:text-slate-900 p-0.5"><ZoomIn size={13} /></button>
                            </div>
                            <button onClick={() => setZoom(100)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"><RotateCcw size={13} /></button>
                            <button onClick={() => setIsDark(d => !d)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
                                {isDark ? <Sun size={13} /> : <Moon size={13} />}
                            </button>
                            {hasContent && (
                                <button onClick={handleCopy}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all">
                                    {copied ? <><Check size={12} className="text-green-500" />Copied!</> : <><Copy size={12} />Copy</>}
                                </button>
                            )}
                            {svgHtml && (
                                <button onClick={handleDownloadSVG}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all">
                                    <Download size={12} /> SVG
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Canvas Body */}
                    <div
                        className={`relative min-h-[560px] overflow-auto transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
                        style={{
                            backgroundImage: isDark
                                ? 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)'
                                : 'radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                        }}
                    >
                        {/* Loading spinner */}
                        {isLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-inherit">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                    <GitBranch className="absolute inset-0 m-auto text-primary" size={20} />
                                </div>
                                <p className={`text-sm font-medium ${isDark ? 'text-white/50' : 'text-slate-400'} animate-pulse`}>
                                    AI is building your diagram…
                                </p>
                            </div>
                        )}

                        {/* Rendering spinner */}
                        {isRendering && !isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center z-10 bg-inherit">
                                <Loader2 className={`animate-spin ${isDark ? 'text-white/30' : 'text-slate-300'}`} size={28} />
                            </div>
                        )}

                        {/* Preview tab */}
                        {!isLoading && activeTab === 'preview' && (
                            <>
                                {renderError && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
                                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 max-w-lg text-center space-y-3">
                                            <AlertTriangle className="mx-auto text-amber-500" size={28} />
                                            <p className="text-amber-700 font-bold text-sm">Diagram could not be rendered</p>
                                            <p className="text-amber-600 text-xs font-mono bg-amber-100 rounded-lg p-3 text-left break-all">{renderError}</p>
                                            <p className="text-amber-600 text-xs">Switch to <strong>Mermaid Code</strong> tab to fix the syntax, then come back to Preview.</p>
                                        </div>
                                    </div>
                                )}

                                {svgHtml && (
                                    <AnimatePresence>
                                        <motion.div
                                            key={mermaidCode}
                                            initial={{ opacity: 0, scale: 0.97 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex justify-center p-10 min-h-[560px] items-start"
                                            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center top' }}
                                            dangerouslySetInnerHTML={{ __html: svgHtml }}
                                        />
                                    </AnimatePresence>
                                )}

                                {!svgHtml && !renderError && !isLoading && !isRendering && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8 text-center">
                                        <GitBranch size={52} className={isDark ? 'text-white/15' : 'text-slate-200'} />
                                        <div>
                                            <p className={`font-bold text-sm uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-slate-300'}`}>
                                                Enter a topic above to generate a flowchart
                                            </p>
                                            <p className={`text-xs mt-1 ${isDark ? 'text-white/15' : 'text-slate-300'}`}>
                                                Powered by Mermaid.js · same engine as GitHub &amp; Notion
                                            </p>
                                        </div>
                                        <pre className={`text-xs text-left px-5 py-3 rounded-xl border font-mono ${isDark ? 'bg-slate-800 border-slate-700 text-green-400/40' : 'bg-white border-slate-200 text-slate-300'}`}>
                                            {`flowchart TD
    A[Topic] --> B[Concept]
    B --> C[(Detail)]`}
                                        </pre>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Code tab */}
                        {!isLoading && activeTab === 'code' && (
                            <div className="p-6">
                                <p className={`text-xs mb-3 font-medium ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                                    Edit the Mermaid syntax below — switch to Preview to see changes:
                                </p>
                                <textarea
                                    value={mermaidCode}
                                    onChange={e => setMermaidCode(extractMermaidCode(e.target.value))}
                                    placeholder={`flowchart TD\n    A[Start] --> B[Process]\n    B --> C{Decision}\n    C -->|Yes| D[Result]\n    C -->|No| E[Error]`}
                                    className={`w-full h-[480px] font-mono text-sm p-4 rounded-2xl border resize-none outline-none focus:ring-2 focus:ring-primary/30 transition-all ${isDark ? 'bg-slate-800 text-green-300 border-slate-600' : 'bg-white text-slate-800 border-slate-200'}`}
                                    spellCheck={false}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Status bar */}
                {hasContent && (
                    <div className={`flex items-center justify-between text-xs px-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                        <span>{mermaidCode.split('\n').length} lines</span>
                        <span className="flex items-center gap-1.5">
                            {svgHtml && <><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Rendered</>}
                            {renderError && <><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Syntax error</>}
                            {isRendering && <><span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse inline-block" /> Rendering…</>}
                        </span>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Flowchart;
