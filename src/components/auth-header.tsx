import { Text, View } from 'react-native'
import Svg, { Circle, Line } from 'react-native-svg'

interface AuthHeaderProps {
    title: string
    subtitle?: string
    showLogo?: boolean
}

export function AuthHeader({
    title,
    subtitle,
    showLogo = false,
}: AuthHeaderProps) {
    return (
        <View className="mb-6 items-center gap-2">
            {showLogo && (
                <View className="mb-1 flex-row items-center gap-2">
                    <HelmioLogo size={32} />
                    <Text className="text-xl font-bold tracking-tight text-[#1A3A52]">
                        Helmio
                    </Text>
                </View>
            )}

            <Text className="text-center text-2xl leading-tight text-[#1A3A52]">
                {title}
            </Text>

            {subtitle && (
                <Text className="max-w-xs text-center text-sm leading-relaxed text-[#5A7A95]">
                    {subtitle}
                </Text>
            )}
        </View>
    )
}

interface HelmioLogoProps {
    size?: number
}

export function HelmioLogo({ size = 40 }: HelmioLogoProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 40 40">
            <Circle cx="20" cy="20" r="20" fill="#78A4CB" />

            {/* Steering wheel */}
            <Circle
                cx="20"
                cy="20"
                r="9"
                fill="none"
                stroke="white"
                strokeWidth={2.5}
            />

            <Circle cx="20" cy="20" r="3" fill="white" />

            {/* Spokes */}
            <Line
                x1="20"
                y1="8"
                x2="20"
                y2="13"
                stroke="white"
                strokeWidth={2.5}
                strokeLinecap="round"
            />
            <Line
                x1="20"
                y1="27"
                x2="20"
                y2="32"
                stroke="white"
                strokeWidth={2.5}
                strokeLinecap="round"
            />
            <Line
                x1="8"
                y1="20"
                x2="13"
                y2="20"
                stroke="white"
                strokeWidth={2.5}
                strokeLinecap="round"
            />
            <Line
                x1="27"
                y1="20"
                x2="32"
                y2="20"
                stroke="white"
                strokeWidth={2.5}
                strokeLinecap="round"
            />
        </Svg>
    )
}