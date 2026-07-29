import { signInWithEmail } from '@/services/auth.service'
import { router } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { useState } from 'react'
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    View,
} from 'react-native'

import { AuthScreenLayout } from '../../components/auth-screen-layout'
import { PrimaryButton } from '../../components/primary-button'
import { TextInputField } from '../../components/text-input-field'

export default function LoginScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    async function handleLogin() {
        if (isLoading) {
            return
        }

        if (!email.trim() || !password) {
            Alert.alert(
                'Brak danych',
                'Podaj adres e-mail i hasło.',
            )

            return
        }

        try {
            setIsLoading(true)

            await signInWithEmail({
                email: email.trim(),
                password,
            })

            router.replace('/home')
        } catch (error) {
            console.error('Login error:', error)

            Alert.alert(
                'Błąd logowania',
                'Nieprawidłowy adres e-mail lub hasło.',
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthScreenLayout showWave={false}>
            <View className="relative flex-1 overflow-hidden bg-white">
                <BackgroundDecoration />

                <KeyboardAvoidingView
                    className="z-10 flex-1"
                    behavior={
                        Platform.OS === 'ios'
                            ? 'padding'
                            : undefined
                    }
                >
                    <View className="flex-1 px-6 pb-10 pt-14">
                        <Pressable
                            onPress={() => router.back()}
                            accessibilityRole="button"
                            accessibilityLabel="Wróć"
                            hitSlop={10}
                            className="h-11 w-11 items-center justify-center rounded-[16px] border border-[#E5EAF1] bg-white"
                            style={({ pressed }) => ({
                                transform: [
                                    {
                                        scale: pressed
                                            ? 0.96
                                            : 1,
                                    },
                                ],
                            })}
                        >
                            <ArrowLeft
                                size={20}
                                color="#293681"
                                strokeWidth={2.4}
                            />
                        </Pressable>

                        <View className="mt-12">

                            <Text className="mt-3 max-w-[340px] text-[38px] font-semibold leading-[43px] tracking-[-1.2px] text-[#293681]">
                                Kontynuuj naukę tam, gdzie skończyłeś
                            </Text>

                            <Text className="mt-4 max-w-[330px] text-[15px] leading-6 text-[#747B8F]">
                                Zaloguj się, aby wrócić do lekcji,
                                testów i swojego postępu.
                            </Text>
                        </View>

                        <View className="mt-10 gap-5">
                            <TextInputField
                                label="Adres e-mail"
                                type="email"
                                placeholder="jan.kowalski@email.pl"
                                value={email}
                                onChange={setEmail}
                            />

                            <TextInputField
                                label="Hasło"
                                type="password"
                                placeholder="Twoje hasło"
                                value={password}
                                onChange={setPassword}
                            />
                        </View>

                        <Pressable
                            accessibilityRole="button"
                            className="mt-4 self-end py-1"
                        >
                            <Text className="text-sm font-semibold text-[#4274D9]">
                                Nie pamiętasz hasła?
                            </Text>
                        </Pressable>

                        <View className="mt-8">
                            <PrimaryButton
                                label={
                                    isLoading
                                        ? 'Logowanie...'
                                        : 'Zaloguj się'
                                }
                                onPress={handleLogin}
                                variant="primary"
                                className={
                                    isLoading
                                        ? 'opacity-70'
                                        : ''
                                }
                            />
                        </View>

                        <View className="mt-auto">
                            <View className="flex-row items-center justify-center">
                                <Text className="text-sm text-[#747B8F]">
                                    Nie masz konta?
                                </Text>

                                <Pressable
                                    onPress={() =>
                                        router.push(
                                            '/(auth)/register',
                                        )
                                    }
                                    accessibilityRole="button"
                                    className="ml-1.5"
                                >
                                    <Text className="text-sm font-bold text-[#4274D9]">
                                        Zarejestruj się
                                    </Text>
                                </Pressable>
                            </View>

                            <Text className="mt-5 text-center text-[11px] leading-4 text-[#A0A6B5]">
                                Kontynuując, akceptujesz regulamin
                                i politykę prywatności.
                            </Text>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </AuthScreenLayout>
    )
}

function BackgroundDecoration() {
    return (
        <View
            pointerEvents="none"
            className="absolute inset-0 overflow-hidden"
        >
            <View className="absolute -right-36 -top-32 h-80 w-80 rounded-full bg-[#D0E7E6]/45" />

            <View className="absolute -left-36 bottom-[-80px] h-72 w-72 rounded-full bg-[#EEF3FC]" />

            <View className="absolute right-10 top-[165px] h-3 w-3 rounded-full bg-[#95CCDD]" />

            <View className="absolute right-16 top-[190px] h-2 w-2 rounded-full bg-[#4274D9]/30" />
        </View>
    )
}