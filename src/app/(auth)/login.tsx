import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { AuthHeader } from '../../components/auth-header'
import { AuthScreenLayout } from '../../components/auth-screen-layout'
import { PrimaryButton } from '../../components/primary-button'
import { TextInputField } from '../../components/text-input-field'

interface LoginScreenProps {
    onLogin?: () => void
    onForgotPassword?: () => void
    onJoinSchool?: () => void
    onBack?: () => void
}

export default function LoginScreen({
    onLogin,
    onForgotPassword,
    onJoinSchool,
    onBack,
}: LoginScreenProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    return (
        <AuthScreenLayout showWave waveVariant="small">
            {/* Back arrow */}
            <View className="px-5 pt-12 pb-0">
                <Pressable
                    onPress={onBack}
                    accessibilityRole="button"
                    accessibilityLabel="Wróć"
                    className="flex-row items-center gap-1.5"
                >
                    <Svg
                        width={18}
                        height={18}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#78A4CB"
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <Path d="M19 12H5M12 5l-7 7 7 7" />
                    </Svg>

                    <Text className="text-[#78A4CB]  text-sm">
                        Wróć
                    </Text>
                </Pressable>
            </View>

            <View className="flex-1 px-6 py-8">
                {/* Header */}
                <AuthHeader
                    title="Witaj z powrotem"
                    subtitle="Zaloguj się na swoje konto ucznia."
                />

                {/* Form card */}
                <View className="bg-white rounded-3xl p-6 shadow-sm border border-[#D0E8F0] flex-col gap-5 mb-6">
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

                    {/* Forgot password */}
                    <View className="items-end">
                        <Pressable
                            onPress={onForgotPassword}
                            accessibilityRole="button"
                        >
                            <Text className="text-xs text-[#78A4CB] font-medium">
                                Nie pamiętasz hasła?
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Primary CTA */}
                <PrimaryButton
                    label="Zaloguj się"
                    onPress={onLogin}
                    variant="primary"
                    className="mb-6"
                />

                {/* Divider */}
                <View className="flex-row items-center gap-3 mb-6">
                    <View className="flex-1 h-px bg-[#D0E8F0]" />
                    <Text className="text-xs text-[#9BBCCE] font-medium">
                        lub
                    </Text>
                    <View className="flex-1 h-px bg-[#D0E8F0]" />
                </View>

                {/* Join school */}
                <View className="items-center gap-1.5">
                    <Text className="text-sm text-[#5A7A95]">
                        Nie masz konta?
                    </Text>

                    <Pressable
                        onPress={onJoinSchool}
                        accessibilityRole="button"
                    >
                        <Text className="text-sm  text-[#78A4CB]">
                            Zarejestruj się →
                        </Text>
                    </Pressable>
                </View>
            </View>
        </AuthScreenLayout>
    )
}