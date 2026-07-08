import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import Svg, { Circle, Line, Path } from 'react-native-svg'

interface TextInputFieldProps {
    label: string
    placeholder?: string
    type?: 'text' | 'email' | 'password'
    value?: string
    onChange?: (value: string) => void
    className?: string
}

export function TextInputField({
    label,
    placeholder,
    type = 'text',
    value,
    onChange,
    className = '',
}: TextInputFieldProps) {
    const [showPassword, setShowPassword] = useState(false)

    const isPassword = type === 'password'

    return (
        <View className={`gap-1.5 ${className}`}>
            <Text className="text-xs font-semibold uppercase tracking-wide text-[#5A7A95]">
                {label}
            </Text>

            <View className="relative">
                <TextInput
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={isPassword && !showPassword}
                    keyboardType={type === 'email' ? 'email-address' : 'default'}
                    autoCapitalize={type === 'email' ? 'none' : 'sentences'}
                    autoCorrect={false}
                    placeholderTextColor="#9BBCCE"
                    className="w-full rounded-2xl border border-[#D0E8F0] bg-white px-4 py-3.5 pr-12 text-base text-[#1A3A52]"
                />

                {isPassword && (
                    <Pressable
                        onPress={() => setShowPassword((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                        accessibilityRole="button"
                        accessibilityLabel={
                            showPassword ? 'Ukryj hasło' : 'Pokaż hasło'
                        }
                    >
                        {showPassword ? (
                            <Svg width={20} height={20} viewBox="0 0 24 24">
                                <Path
                                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                                    stroke="#9BBCCE"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                />
                                <Line
                                    x1="1"
                                    y1="1"
                                    x2="23"
                                    y2="23"
                                    stroke="#9BBCCE"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                />
                            </Svg>
                        ) : (
                            <Svg width={20} height={20} viewBox="0 0 24 24">
                                <Path
                                    d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                                    stroke="#9BBCCE"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                />
                                <Circle
                                    cx={12}
                                    cy={12}
                                    r={3}
                                    stroke="#9BBCCE"
                                    strokeWidth={2}
                                    fill="none"
                                />
                            </Svg>
                        )}
                    </Pressable>
                )}
            </View>
        </View>
    )
}