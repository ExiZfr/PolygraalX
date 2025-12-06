"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp } from 'lucide-react';
import TelegramLoginButton from '@/components/auth/TelegramLoginButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleTelegramAuth = async (user: any) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/telegram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Authentication failed');
            }

            // Success - Redirect to Dashboard
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="border-border/50 shadow-2xl bg-card/50 backdrop-blur-xl">
                    <CardHeader className="text-center space-y-4 pb-8">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <TrendingUp className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-bold tracking-tight">
                            Polymarket <span className="text-primary">Sniper</span>
                        </CardTitle>
                        <CardDescription className="text-base">
                            Connect with Telegram to access the terminal.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center gap-4">
                            {/* Replace 'your_bot_username' with actual bot username from env or config */}
                            <TelegramLoginButton
                                botName={process.env.NEXT_PUBLIC_BOT_USERNAME || 'PolymarketSniperBot'}
                                onAuth={handleTelegramAuth}
                                buttonSize="large"
                            />

                            {isLoading && (
                                <div className="text-sm text-muted-foreground animate-pulse">
                                    Verifying credentials...
                                </div>
                            )}

                            {error && (
                                <div className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded border border-red-500/20">
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="pt-6 border-t border-border/50">
                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Secure End-to-End Encryption</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
