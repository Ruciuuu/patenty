import { signUpWithEmail } from '@/services/auth.service'
import { router } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { useState } from 'react'
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native'

import { AuthScreenLayout } from '../../components/auth-screen-layout'
import { PrimaryButton } from '../../components/primary-button'
import { TextInputField } from '../../components/text-input-field'

export default function RegisterScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [invitationCode, setInvitationCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    async function handleRegister() {
        if (isLoading) {
            return
        }

        if (
            !email.trim() ||
            !password ||
            !invitationCode.trim()
        ) {
            Alert.alert(
                'Brak danych',
                'Uzupełnij wszystkie pola.',
            )

            return
        }

        if (password.length < 6) {
            Alert.alert(
                'Hasło jest za krótkie',
                'Hasło powinno zawierać przynajmniej 6 znaków.',
            )

            return
        }

        try {
            setIsLoading(true)

            const { data, error } = await signUpWithEmail({
                email: email.trim(),
                password,
                invitationCode: invitationCode.trim(),
            })

            if (error) {
                Alert.alert(
                    'Nie udało się utworzyć konta',
                    'Sprawdź adres e-mail oraz kod zaproszenia.',
                )

                return
            }

            if (data) {
                Alert.alert(
                    'Sprawdź swoją skrzynkę',
                    'Wysłaliśmy wiadomość z linkiem weryfikacyjnym na podany adres e-mail.',
                    [
                        {
                            text: 'Przejdź do logowania',
                            onPress: () =>
                                router.replace('/(auth)/login'),
                        },
                    ],
                )
            }
        } catch (error) {
            console.error('Register error:', error)

            Alert.alert(
                'Błąd rejestracji',
                'Nie udało się utworzyć konta. Spróbuj ponownie.',
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
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{
                            paddingHorizontal: 24,
                            paddingTop: 56,
                            paddingBottom: 32,
                            flexGrow: 1,
                        }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* BACK */}

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

                        {/* HEADER */}

                        <View className="mt-10">


                            <Text className="mt-3 max-w-[340px] text-[38px] font-semibold leading-[43px] tracking-[-1.2px] text-[#293681]">
                                Rozpocznij swoją naukę
                            </Text>

                            <Text className="mt-4 max-w-[330px] text-[15px] leading-6 text-[#747B8F]">
                                Utwórz konto za pomocą adresu e-mail
                                przypisanego do Twojej szkoły.
                            </Text>
                        </View>

                        {/* INVITATION INFO */}

                        <View className="mt-7 flex-row items-start rounded-[20px] bg-[#F2F7F8] px-4 py-4">
                            <View className="mt-1 h-2.5 w-2.5 rounded-full bg-[#95CCDD]" />

                            <View className="ml-3 flex-1">
                                <Text className="text-[13px] font-bold text-[#293681]">
                                    Rejestracja przez zaproszenie
                                </Text>

                                <Text className="mt-1 text-[13px] leading-5 text-[#747B8F]">
                                    Twój adres e-mail musi wcześniej
                                    zostać dodany przez szkołę do listy
                                    uczniów.
                                </Text>
                            </View>
                        </View>

                        {/* FORM */}

                        <View className="mt-8 gap-5">
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
                                placeholder="Minimum 6 znaków"
                                value={password}
                                onChange={setPassword}
                            />

                            <TextInputField
                                label="Kod zaproszenia"
                                type="text"
                                placeholder="np. 123456"
                                value={invitationCode}
                                onChange={setInvitationCode}
                            />
                        </View>

                        {/* CTA */}

                        <View className="mt-8">
                            <PrimaryButton
                                label={
                                    isLoading
                                        ? 'Tworzenie konta...'
                                        : 'Utwórz konto'
                                }
                                onPress={handleRegister}
                                variant="primary"
                                className={
                                    isLoading
                                        ? 'opacity-70'
                                        : ''
                                }
                            />
                        </View>

                        {/* LOGIN */}

                        <View className="mt-auto pt-10">
                            <View className="flex-row items-center justify-center">
                                <Text className="text-sm text-[#747B8F]">
                                    Masz już konto?
                                </Text>

                                <Pressable
                                    onPress={() =>
                                        router.push(
                                            '/(auth)/login',
                                        )
                                    }
                                    accessibilityRole="button"
                                    className="ml-1.5"
                                >
                                    <Text className="text-sm font-bold text-[#4274D9]">
                                        Zaloguj się
                                    </Text>
                                </Pressable>
                            </View>

                            <Text className="mt-5 text-center text-[11px] leading-4 text-[#A0A6B5]">
                                Tworząc konto, akceptujesz regulamin
                                i politykę prywatności.
                            </Text>
                        </View>
                    </ScrollView>
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

            <View className="absolute right-10 top-[165px] h-3 w-3 rounded-full bg-[#95CCDD]" />

            <View className="absolute right-16 top-[190px] h-2 w-2 rounded-full bg-[#4274D9]/30" />

            <View className="absolute -left-36 bottom-[-80px] h-72 w-72 rounded-full bg-[#EEF3FC]" />
        </View>
    )
}