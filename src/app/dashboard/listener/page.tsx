"use client";

import { useState, useEffect, useRef } from "react";
import { useRadar, ListenerLog, SourceType } from "@/lib/radar-context";
import { motion, AnimatePresence } from "framer-motion";
import {
    Twitter, Globe, MessageSquare, Radio, Trash2,
    Filter, ChevronDown, CheckCircle, AlertCircle, Zap, Clock
} from "lucide-react";

// Helper to get Source Icon
const SourceIcon = ({ source }: { source: SourceType }) => {
    switch (source) {
        case 'twitter': return <Twitter size={14} className="text-sky-400" />;
        case 'reddit': return <MessageSquare size={14} className="text-orange-400" />;
        case 'polymarket': return <Zap size={14} className="text-purple-400" />;
        default: return <Globe size={14} className="text-slate-400" />;
    }
};

const LogItem = ({ log }: { log: ListenerLog }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`
                group flex gap-4 p-3 border-l-2 text-sm font-mono transition-colors
                ${log.priority === 'high' ? 'border-red-500 bg-red-500/5 hover:bg-red-500/10' : 'border-slate-800 hover:bg-white/5'}
            `}
        >
            <div className="shrink-0 w-20 text-xs text-slate-500 pt-0.5">
                {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>

            <div className="shrink-0 pt-0.5">
                <SourceIcon source={log.source} />
            </div>

            <div className="flex-1 space-y-1">
                <div className={`leading-relaxed ${log.priority === 'high' ? 'text-white font-bold' : 'text-slate-300'}`}>
                    {log.message}
                </div>
                {log.type === 'signal' && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
                        <Zap size={10} /> Signal Detected
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default function ListenerPage() {
    const { logs, clearLogs } = useRadar();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [autoScroll, setAutoScroll] = useState(true);

    // Auto-scroll logic
    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, autoScroll]);

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-[#050505] p-6">

            {/* Header / Stats */}
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-white tracking-tight">Global Listener</h1>
                    <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono font-bold flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        LIVE FEED CONNECTED
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => clearLogs()}
                        className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 text-slate-400 text-xs font-bold transition-all flex items-center gap-2"
                    >
                        <Trash2 size={14} /> CLEAR
                    </button>
                    <div className="h-6 w-px bg-white/10 mx-2" />
                    <button
                        onClick={() => setAutoScroll(!autoScroll)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-2 ${autoScroll ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'border-white/10 text-slate-400'}`}
                    >
                        {autoScroll ? 'AUTO-SCROLL ON' : 'SCROLL PAUSED'}
                    </button>
                </div>
            </div>

            {/* Main Terminal Window */}
            <div className="flex-1 bg-[#0A0B10] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col relative">

                {/* Window Bar */}
                <div className="h-8 bg-[#0F1116] border-b border-white/5 flex items-center px-4 justify-between shrink-0">
                    <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                    <div className="text-[10px] text-slate-600 font-mono">
                        Console Output • {logs.length} events
                    </div>
                </div>

                {/* Content */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-2 scroll-smooth"
                    onScroll={(e) => {
                        const target = e.target as HTMLDivElement;
                        const isBottom = Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 50;
                        if (!isBottom && autoScroll) setAutoScroll(false);
                        if (isBottom && !autoScroll) setAutoScroll(true);
                    }}
                >
                    <div className="space-y-1">
                        {logs.length === 0 && (
                            <div className="text-center py-20 text-slate-600 font-mono text-sm">
                                Listening for events...
                            </div>
                        )}
                        {logs.slice().reverse().map((log) => (
                            <LogItem key={log.id} log={log} />
                        ))}
                    </div>
                </div>

                {/* Status Footer */}
                <div className="h-6 bg-[#0F1116] border-t border-white/5 flex items-center px-4 gap-4 text-[10px] font-mono text-slate-500 shrink-0">
                    <span>BUFFER: {logs.length}/500</span>
                    <span className="text-green-500">LATENCY: 12ms</span>
                    <span className="ml-auto">SOURCES: TWITTER, REDDIT, NEWS API</span>
                </div>
            </div>
        </div>
    );
}
