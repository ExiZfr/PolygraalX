"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TelegramLoginButton } from "@/components/auth/TelegramLoginButton"
import { TelegramUser } from "@/lib/types"
import { Loader2 } from "lucide-react"

// Extend Window interface for Telegram WebApp
declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                initData: string
                initDataUnsafe: {
                    user?: {
                        id: number
                        first_name: string
                        last_name?: string
                        username?: string
                        photo_url?: string
                    }
                }
                ready: () => void
                expand: () => void
            }
        }
    }
}

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isMiniApp, setIsMiniApp] = useState(false)

    useEffect(() => {
        // Function to handle Telegram authentication logic
        const initTelegram = () => {
            console.log("Checking Telegram WebApp...", window.Telegram)
            if (typeof window !== "undefined" && window.Telegram?.WebApp) {
                const tg = window.Telegram.WebApp

                // Only proceed if we are actually inside Telegram
                if (tg.initData) {
                    console.log("Telegram WebApp detected with data")
                    setIsMiniApp(true)
                    tg.ready()
                    tg.expand()
                    // Auto-login logic for Mini App
                    const user = tg.initDataUnsafe?.user
                    if (user) {
                        handleAuth({
                            id: user.id,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            username: user.username,
                            photo_url: user.photo_url,
                            auth_date: Math.floor(Date.now() / 1000),
                            hash: tg.initData, // Send raw initData as hash for backend validation
                        }, true)
                    }
                } else {
                    setIsMiniApp(false)
                }
            } else {
                setIsMiniApp(false)
            }
        }

        // Dynamically load the Telegram Script
        const script = document.createElement("script")
        script.src = "https://telegram.org/js/telegram-web-app.js"
        script.async = true
        script.onload = () => {
            setTimeout(initTelegram, 100)
        }
        document.head.appendChild(script)
    }, [])

    const handleAuth = async (user: TelegramUser, isMiniAppLogin = false) => {
        setIsLoading(true)
        setError(null)

        try {
            // If Mini App, wrap payload to hint backend about rawInitData
            const payload = isMiniAppLogin ? { rawInitData: true, user: user } : user;

            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Authentication failed")
            }

            router.push("/")
        } catch (err: any) {
            console.error("Login error:", err)
            setError(err.message || "Something went wrong")
            setIsLoading(false)
        }
    }

    const BOT_USERNAME = process.env.NEXT_PUBLIC_BOT_USERNAME || "Plmktradingbot"

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-[100px]" />
            <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-purple-600/20 blur-[100px]" />

            <div className="z-10 flex w-full max-w-md flex-col items-center gap-8 rounded-2xl border border-white/10 bg-zinc-900/50 p-8 backdrop-blur-xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                        Poly<span className="text-blue-500">GraalX</span>
                    </h1>
                    <p className="mt-2 text-zinc-400">
                        The Ultimate Polymarket Trading Terminal
                    </p>
                </div>

                {error && (
                    <div className="w-full rounded bg-red-500/10 p-3 text-center text-sm text-red-500 border border-red-500/20">
                        {error}
                    </div>
                )}

                <div className="flex flex-col items-center gap-4">
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Verifying access...
                        </div>
                    ) : !isMiniApp ? (
                        <div className="flex flex-col items-center gap-6 w-full">

                            {/* 1. Official Telegram Widget */}
                            <div className="min-h-[50px] flex items-center justify-center w-full">
                                <TelegramLoginButton
                                    botName={BOT_USERNAME}
                                    onAuth={(u) => handleAuth(u, false)}
                                    cornerRadius={20}
                                />
                            </div>

                            <div className="flex items-center gap-2 w-full max-w-[200px]">
                                <div className="h-px flex-1 bg-white/10"></div>
                                <span className="text-xs text-zinc-600">OR</span>
                                <div className="h-px flex-1 bg-white/10"></div>
                            </div>

                            {/* 2. Fallback Deep Link */}
                            <a
                                href={`https://t.me/${BOT_USERNAME}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current">
                                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.83 14.33 15.5 16.08C15.36 16.82 15.08 17.07 14.81 17.09C14.22 17.14 13.77 16.7 13.2 16.33C12.31 15.74 11.81 15.38 10.95 14.81C9.95 14.15 10.6 13.79 11.17 13.2C11.32 13.04 13.92 10.68 13.97 10.46C13.98 10.43 13.98 10.33 13.92 10.28C13.86 10.22 13.77 10.24 13.7 10.26C13.6 10.28 12.08 11.24 9.14 13.23C8.71 13.52 8.32 13.67 7.85 13.66C7.33 13.64 6.34 13.36 5.6 13.12C4.7 12.83 3.98 12.67 4.04 12.17C4.07 11.91 4.43 11.64 5.1 11.37C9.28 9.45 12.06 8.25 13.45 7.67C17.42 6.03 18.23 5.74 18.77 5.74C18.89 5.74 19.16 5.77 19.33 5.91C19.47 6.03 19.51 6.19 19.52 6.3C19.52 6.37 19.53 6.64 19.51 6.84L16.64 8.8Z" />
                                </svg>
                                Open Bot manually
                            </a>

                            <div className="mt-4 p-4 border border-zinc-800 rounded bg-black/40">
                                <p className="text-xs text-zinc-500 mb-2">DEBUG: Manual Login</p>
                                <button
                                    onClick={() => handleAuth({
                                        id: 7139453099,
                                        first_name: "Admin",
                                        auth_date: Math.floor(Date.now() / 1000),
                                        hash: "dev_bypass"
                                    })}
                                    className="text-xs text-zinc-400 underline hover:text-white"
                                >
                                    Force Login as Admin
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-zinc-400">
                            <p>Loading Telegram data...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
