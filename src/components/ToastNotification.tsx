"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, AlertCircle, CheckCircle, Info } from "lucide-react";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info" | "market";

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message: string;
    duration?: number;
}

interface ToastNotificationProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

export function ToastNotification({ toasts, onRemove }: ToastNotificationProps) {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
                ))}
            </AnimatePresence>
        </div>
    );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const [progress, setProgress] = useState(100);
    const duration = toast.duration || 5000;

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev - (100 / duration * 50);
                if (newProgress <= 0) {
                    onRemove(toast.id);
                    return 0;
                }
                return newProgress;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [toast.id, duration, onRemove]);

    const config = {
        success: {
            icon: CheckCircle,
            bg: "bg-gradient-to-r from-green-500/20 to-emerald-500/20",
            border: "border-green-500/30",
            text: "text-green-300",
            iconColor: "text-green-400",
            progressBg: "bg-green-500"
        },
        error: {
            icon: AlertCircle,
            bg: "bg-gradient-to-r from-red-500/20 to-rose-500/20",
            border: "border-red-500/30",
            text: "text-red-300",
            iconColor: "text-red-400",
            progressBg: "bg-red-500"
        },
        warning: {
            icon: AlertCircle,
            bg: "bg-gradient-to-r from-yellow-500/20 to-orange-500/20",
            border: "border-yellow-500/30",
            text: "text-yellow-300",
            iconColor: "text-yellow-400",
            progressBg: "bg-yellow-500"
        },
        info: {
            icon: Info,
            bg: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20",
            border: "border-blue-500/30",
            text: "text-blue-300",
            iconColor: "text-blue-400",
            progressBg: "bg-blue-500"
        },
        market: {
            icon: TrendingUp,
            bg: "bg-gradient-to-r from-purple-500/20 to-pink-500/20",
            border: "border-purple-500/30",
            text: "text-purple-300",
            iconColor: "text-purple-400",
            progressBg: "bg-purple-500"
        }
    };

    const style = config[toast.type];
    const Icon = style.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`${style.bg} ${style.border} backdrop-blur-xl border rounded-2xl p-4 shadow-2xl relative overflow-hidden min-w-[320px]`}
        >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative flex items-start gap-3">
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className={`${style.iconColor} mt-0.5`}
                >
                    <Icon size={20} />
                </motion.div>

                <div className="flex-1">
                    <h4 className={`font-semibold ${style.text} mb-1`}>{toast.title}</h4>
                    <p className="text-sm text-slate-300">{toast.message}</p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onRemove(toast.id)}
                    className="text-slate-400 hover:text-white transition"
                >
                    <X size={18} />
                </motion.button>
            </div>

            {/* Progress bar */}
            <motion.div
                className={`absolute bottom-0 left-0 h-1 ${style.progressBg} opacity-50`}
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.05, ease: "linear" }}
            />
        </motion.div>
    );
}

// Hook pour utiliser les toasts
export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (toast: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { ...toast, id }]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return {
        toasts,
        addToast,
        removeToast,
        showSuccess: (title: string, message: string) => addToast({ type: "success", title, message }),
        showError: (title: string, message: string) => addToast({ type: "error", title, message }),
        showWarning: (title: string, message: string) => addToast({ type: "warning", title, message }),
        showInfo: (title: string, message: string) => addToast({ type: "info", title, message }),
        showMarket: (title: string, message: string) => addToast({ type: "market", title, message, duration: 7000 }),
    };
}
