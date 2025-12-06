import { NextResponse } from 'next/server'
import { TelegramUser } from '@/lib/types'
import { validateTelegramData } from '@/lib/auth'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

// IMPORTANT: This comes from your env
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ""

export async function POST(request: Request) {
    try {
        const data: TelegramUser = await request.json()
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
        // DEV BYPASS: Allow admin to bypass signature check for testing web flow
        if (data.hash === "dev_bypass" && telegramId === ADMIN_ID) {
            console.log("Dev bypass used for admin login");
        } else {
            const isValid = validateTelegramData(data, BOT_TOKEN)
            if (!isValid) {
                return NextResponse.json(
                    { error: "Invalid authentication data" },
                    { status: 401 }
                )
            }
        }

        // 2. Check validity duration (optional but recommended)
        // Auth date is unix timestamp in seconds
        const now = Math.floor(Date.now() / 1000)
        if (now - data.auth_date > 86400) { // 24 hours
            return NextResponse.json(
                { error: "Data is outdated" },
                { status: 401 }
            )
        }



        // 3. Database Check via Supabase

        try {
            // First, try to get the user
            let { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('telegram_id', telegramId)
                .single()

            if (error && error.code === 'PGRST116') {
                // User not found -> Create them (auto-registration)
                console.log(`User ${telegramId} not found, creating new user...`)
                const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert([
                        {
                            telegram_id: telegramId,
                            username: data.username,
                            first_name: data.first_name,
                            // Auto-activate Admin, others pending/inactive by default
                            is_active: telegramId === ADMIN_ID,
                            role: telegramId === ADMIN_ID ? 'admin' : 'user'
                        }
                    ])
                    .select()
                    .single()

                if (createError) {
                    console.error("Error creating user:", createError)
                    // If creation fails but user is Admin, imply success for emergency access
                    if (telegramId !== ADMIN_ID) throw createError
                }
                user = newUser
            } else if (error) {
                console.error("Supabase Error:", error)
                // Fallback to Admin whitelist if DB fails
                if (telegramId !== ADMIN_ID) throw error
            }

            // Check Access Permissions
            // If DB user exists: verify is_active. If DB failed/missing: check if Admin ID
            const hasAccess = (user && user.is_active) || telegramId === ADMIN_ID

            if (!hasAccess) {
                return NextResponse.json(
                    { error: "Access Denied. You do not have a paid subscription." },
                    { status: 403 }
                )
            }

        } catch (dbError) {
            console.error("Database Login Error check:", dbError)
            // If authentic database logic fails, we fallback to our basic hardcoded Check for safety
            if (telegramId !== ADMIN_ID) {
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
