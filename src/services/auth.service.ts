// src/features/auth/auth.service.ts

import { supabase } from '@/lib/supabase';
import type { LoginCredentials, SignUpCredentials } from '@/types/auth';

export async function signInWithEmail({
    email,
    password,
}: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
    });

    if (error) {
        throw error;
    }

    return data;
}


export async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw error;
    }
}


// Sprawdzam tutaj czy uczeń został zaproszony
export async function signUpWithEmail({
    email,
    password,

}: SignUpCredentials) {
    const normalizedEmail = email
        .trim()
        .toLowerCase()

    const { data, error } =
        await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
                data: {
                    account_type: 'student',
                },
            },
        })



    return { data, error }
}