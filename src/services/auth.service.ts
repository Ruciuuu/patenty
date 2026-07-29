// src/features/auth/auth.service.ts

import { supabase } from '@/lib/supabase'
import type {
    LoginCredentials,
    SignUpCredentials,
} from '@/types/auth'
import {
    FunctionsHttpError,
} from '@supabase/supabase-js'

export async function signInWithEmail({
    email,
    password,
}: LoginCredentials) {
    const { data, error } =
        await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        })

    if (error) {
        throw error
    }

    return data
}

export async function signOut() {
    const { error } =
        await supabase.auth.signOut()

    if (error) {
        throw error
    }
}

export async function signUpWithEmail({
    email,
    password,
    invitationCode,
}: SignUpCredentials) {
    const normalizedEmail =
        email.trim().toLowerCase()

    const normalizedCode =
        invitationCode
            .replace(/\D/g, '')
            .slice(0, 6)

    const { data, error } =
        await supabase.functions.invoke(
            'hyper-handler',
            {
                body: {
                    email: normalizedEmail,
                    password,
                    invitationCode:
                        normalizedCode,
                },
            },
        )

    if (error) {
        if (
            error instanceof
            FunctionsHttpError
        ) {
            try {
                const response =
                    await error.context.json()

                console.error(
                    'Registration Edge Function failed:',
                    response,
                )

                console.error(
                    'Registration debug:',
                    {
                        stage:
                            response?.stage ??
                            null,
                        error:
                            response?.error ??
                            null,
                        code:
                            response?.code ??
                            null,
                        details:
                            response?.details ??
                            null,
                        hint:
                            response?.hint ??
                            null,
                        field:
                            response?.field ??
                            null,
                    },
                )

                return {
                    data: null,
                    error:
                        response?.error ??
                        'Nie udało się utworzyć konta.',
                    field:
                        response?.field ??
                        null,
                }
            } catch (parseError) {
                console.error(
                    'Nie udało się odczytać odpowiedzi Edge Function:',
                    parseError,
                )

                return {
                    data: null,
                    error:
                        'Serwer zwrócił nieprawidłową odpowiedź.',
                    field: null,
                }
            }
        }

        console.error(
            'Edge Function invoke failed:',
            error,
        )

        return {
            data: null,
            error:
                'Nie udało się połączyć z serwerem.',
            field: null,
        }
    }

    if (!data?.success) {
        console.error(
            'Registration returned unsuccessful response:',
            data,
        )

        return {
            data: null,
            error:
                data?.error ??
                'Nie udało się utworzyć konta.',
            field:
                data?.field ??
                null,
        }
    }

    /*
     * Konto zostało utworzone i potwierdzone
     * w Edge Function, więc logujemy
     * użytkownika automatycznie.
     */
    const {
        data: signInData,
        error: signInError,
    } =
        await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
        })

    if (signInError) {
        console.error(
            'Automatic sign in failed:',
            signInError,
        )

        return {
            data: null,
            error:
                'Konto zostało utworzone, ale automatyczne logowanie nie powiodło się.',
            field: null,
        }
    }

    return {
        data: signInData,
        error: null,
        field: null,
    }
}