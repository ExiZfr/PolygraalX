import { NextResponse } from 'next/server'
import { TelegramUser } from '@/lib/types'
import { validateTelegramData } from '@/lib/auth'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

// IMPORTANT: This comes from your env
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ""

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Handle "rawInitData" case (future proofing) or standard TelegramUser object
        const data: TelegramUser = body.rawInitData ? body.user : body;

        const telegramId = Number(data.id);
        const ADMIN_ID = 7139453099;

        if (!BOT_TOKEN) {
            console.error("TELEGRAM_BOT_TOKEN is not defined")
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            )
        }

        // 1. Validate the cryptographic signature
        let isValid = false;

        // EMERGENCY ADMIN BYPASS
        // Allows the admin to login even if the hash check fails (e.g. Mini App format issues)
        if (telegramId === ADMIN_ID) {
            console.log(`Bypassing auth check for Admin ID ${telegramId}`);
            isValid = true;
        } else if (data.hash === "dev_bypass") {
            // Keep manual dev bypass check
            isValid = false;
        } else {
            isValid = validateTelegramData(data, BOT_TOKEN)
            if (!isValid) {
                console.error("Auth Failed for user", telegramId);
                console.error("Data received:", JSON.stringify(data));
            }
        }

        // Allow dev bypass if Admin ID matches
        if (data.hash === "dev_bypass" && telegramId === ADMIN_ID) isValid = true;

        if (!isValid) {
            return NextResponse.json(
                { error: "Invalid authentication data" },
                { status: 401 }
            )
        }

        // 2. Check validity duration
        const now = Math.floor(Date.now() / 1000)
        // Skip check for Admin Bypass
        if (telegramId !== ADMIN_ID && data.hash !== "dev_bypass" && now - data.auth_date > 86400) {
            return NextResponse.json(
                { error: "Data is outdated" },
                { status: 401 }
            )
        }

        // 3. Database Check via Prisma
        try {
            const isAdmin = telegramId === ADMIN_ID;

            console.log(`[Auth] Attempting DB Upsert for ${telegramId} (Admin: ${isAdmin})`);

            // Wrap DB call with timeout to prevent infinite hanging
            const dbCall = prisma.user.upsert({
                where: { id: telegramId },
                update: {
                    username: data.username,
                    firstName: data.first_name,
                    lastName: data.last_name,
                    photoUrl: data.photo_url,
                    ...(isAdmin ? { role: 'admin', isActive: true } : {})
                },
                create: {
                    id: telegramId,
                    username: data.username,
                    firstName: data.first_name,
                    lastName: data.last_name,
                    photoUrl: data.photo_url,
                    isActive: isAdmin,
                    role: isAdmin ? 'admin' : 'user'
                }
            });

            // 5 second timeout
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Database Timeout (5s)")), 5000)
            );

            // Race DB vs Timeout
            const user: any = await Promise.race([dbCall, timeoutPromise]);
            console.log(`[Auth] DB Success for ${telegramId}`);

            // Check Access Permissions
            const hasAccess = user.isActive || isAdmin

            if (!hasAccess) {
                return NextResponse.json(
                    { error: "Access Denied. You do not have a paid subscription." },
                    { status: 403 }
                )
            }

        } catch (dbError) {
            console.error("Database Login Error:", dbError)

            // FAIL-SAFE: Allow Admin even if DB dies
            if (telegramId === ADMIN_ID) {
                console.warn("⚠️ EMERGENCY ADMIN LOGIN - Bypassing Database Check ⚠️");
                // We proceed to set the cookie below
            } else {
                return NextResponse.json(
                    { error: "Database Connection Failed" },
                    { status: 500 }
                )
            }
        }

        // 4. Set Session Cookie
        const cookieStore = await cookies()
        cookieStore.set('session', JSON.stringify({
            id: telegramId,
            username: data.username,
            photo_url: data.photo_url,
            is_admin: telegramId === ADMIN_ID
        }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Auth Error:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
