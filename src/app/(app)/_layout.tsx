import { Redirect, Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { supabase } from '@/lib/supabase'

export default function AppLayout() {
    const [loading, setLoading] = useState(true)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        async function loadSession() {
            const {
                data: { session },
            } = await supabase.auth.getSession()

            setIsLoggedIn(!!session)
            setLoading(false)
        }

        loadSession()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session)
            setLoading(false)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator />
            </View>
        )
    }

    if (!isLoggedIn) {
        return <Redirect href="/onboarding" />
    }

    return <Stack screenOptions={{ headerShown: false }} />
}