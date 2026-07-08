import { router } from "expo-router"
import { useState } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import { AuthHeader } from '../../components/auth-header'
import { AuthScreenLayout } from '../../components/auth-screen-layout'
import { PrimaryButton } from '../../components/primary-button'
import { TextInputField } from '../../components/text-input-field'
import { supabase } from "../../lib/supabase"


export default function RegisterScreen() {
    /*     const [firstName, setFirstName] = useState('') */
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    /*  const [schoolCode, setSchoolCode] = useState('') */

    async function handleRegister() {
        if (!email || !password) {
            Alert.alert('Brak danych', 'Uzupełnij wszystkie pola.')
            return
        }


        const { error } = await supabase.auth.signUp({
            email,
            password
        })
    }

    return (
        <AuthScreenLayout showWave waveVariant="small">
            <View>
                <View className="px-5 pt-12">
                    <Pressable
                        onPress={() => router.back()}
                        accessibilityRole="button"
                        accessibilityLabel="Wróć"
                        className="flex-row items-center gap-1.5"
                    >
                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                            <Path
                                d="M19 12H5M12 5l-7 7 7 7"
                                stroke="#78A4CB"
                                strokeWidth={2.2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </Svg>

                        <Text className="text-sm font-medium text-[#78A4CB]">Wróć</Text>
                    </Pressable>
                </View>

                <View className="flex-1 px-6 pb-8 pt-6">
                    <AuthHeader
                        title="Dołącz do szkoły"
                        subtitle="Utwórz konto przy użyciu kodu szkoły żeglarskiej."

                    />

                    <View className="mb-5 flex-row items-start gap-3 rounded-2xl border border-[#B4E1EB] bg-[#B4E1EB]/30 px-4 py-3.5">
                        <View className="mt-0.5">
                            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                                <Path
                                    d="M22 10v6M2 10l10-5 10 5-10 5z"
                                    stroke="#78A4CB"
                                    strokeWidth={2.2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <Path
                                    d="M6 12v5c3 3 9 3 12 0v-5"
                                    stroke="#78A4CB"
                                    strokeWidth={2.2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </Svg>
                        </View>

                        <View className="flex-1">
                            <Text className="mb-0.5 text-xs font-semibold text-[#1A3A52]">
                                Rejestracja przez zaproszenie
                            </Text>
                            <Text className="text-xs leading-relaxed text-[#5A7A95]">
                                Rejestracja jest dostępna wyłącznie dla uczniów szkół
                                żeglarskich. Kod szkoły otrzymasz od swojego instruktora.
                            </Text>
                        </View>
                    </View>

                    <View className="mb-6 gap-5 rounded-3xl border border-[#D0E8F0] bg-white p-6 shadow-sm">
                        {/*     <TextInputField
                        label="Imię"
                        type="text"
                        placeholder="Jan"
                        value={firstName}
                        onChange={setFirstName}
                    /> */}

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
                            placeholder="Utwórz hasło"
                            value={password}
                            onChange={setPassword}
                        />

                        {/*  <View className="gap-1.5">
                        <TextInputField
                            label="Kod szkoły"
                            type="text"
                            placeholder="np. SZKOLA-2024"
                            value={schoolCode}
                            onChange={setSchoolCode}
                        /> */}

                        <View className="mt-1 flex-row items-center gap-1.5">
                            <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                                <Circle
                                    cx={12}
                                    cy={12}
                                    r={10}
                                    stroke="#9BBCCE"
                                    strokeWidth={2.2}
                                />
                                <Path
                                    d="M12 16v-4M12 8h.01"
                                    stroke="#9BBCCE"
                                    strokeWidth={2.2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </Svg>

                            <Text className="flex-1 text-xs text-[#9BBCCE]">
                                Kod szkoły otrzymasz od swojej szkoły żeglarskiej.
                            </Text>
                        </View>
                    </View>
                </View>

                <PrimaryButton
                    label="Utwórz konto"
                    onPress={() => handleRegister()}
                    variant="primary"
                    className="mb-5"
                />

                <View className="flex-row items-center justify-center gap-1.5 ">
                    <Text className="text-sm text-[#5A7A95]">Masz już konto?</Text>

                    <Pressable onPress={() => router.push("/(auth)/login")} accessibilityRole="button">
                        <Text className="text-sm font-semibold text-[#78A4CB]">
                            Zaloguj się →
                        </Text>
                    </Pressable>
                </View>
            </View>
        </AuthScreenLayout >
    )
}