"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TelegramLoginButton } from "@/components/auth/TelegramLoginButton"
import { TelegramUser } from "@/lib/types"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleAuth = async (user: TelegramUser) => {
        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Authentication failed")
            }

            // Success - Redirect to Dashboard
            router.push("/")
        } catch (err: any) {
            console.error("Login error:", err)
            setError(err.message || "Something went wrong")
            setIsLoading(false)
        }
    }

    // NOTE: This usually comes from env vars (NEXT_PUBLIC_BOT_USERNAME)
    const BOT_USERNAME = process.env.NEXT_PUBLIC_BOT_USERNAME || "Plmktradingbot"

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-[100px]" />
            <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-purple-600/20 blur-[100px]" />

            <div className="z-10 flex w-full max-w-md flex-col items-center gap-8 rounded-2xl border border-white/10 bg-zinc-900/50 p-8 backdrop-blur-xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                        Poly<span className="text-blue-500">Bot</span> Dashboard
                    </h1>
                    <p className="mt-2 text-zinc-400">
                        Exclusive access for verified subscribers.
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
                    ) : (
                        <TelegramLoginButton
                            botName={BOT_USERNAME}
                            onAuth={handleAuth}
                        />
                    )}

                    <p className="text-xs text-zinc-600 max-w-[200px] text-center">
                        By logging in using Telegram, you confirm you have a paid subscription.
                    </p>
                </div>
            </div>
        </div>
    )
}
