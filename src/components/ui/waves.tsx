import { View } from "react-native"
import Svg, { Path } from "react-native-svg"


export function ProfileWave() {
    return (
        <View className="absolute bottom-0 left-0 right-0 h-32">
            <Svg
                width="100%"
                height="100%"
                viewBox="0 0 400 130"
                preserveAspectRatio="none"
            >
                <Path
                    d="M0 64 C80 15 130 112 220 61 C295 18 345 90 400 52 L400 130 L0 130 Z"
                    fill="#3478D9"
                    opacity={0.25}
                />

                <Path
                    d="M0 98 C88 52 155 132 242 88 C315 53 360 104 400 80 L400 130 L0 130 Z"
                    fill="#78A4CB"
                    opacity={0.22}
                />
            </Svg>
        </View>
    )
}

export function SmallWave({
    color,
}: {
    color: string
}) {
    return (
        <View className="absolute bottom-0 left-0 right-0 h-20">
            <Svg
                width="100%"
                height="100%"
                viewBox="0 0 400 100"
                preserveAspectRatio="none"
            >
                <Path
                    d="M0 53 C78 8 145 91 230 48 C305 12 350 70 400 42 L400 100 L0 100 Z"
                    fill={color}
                    opacity={0.3}
                />

                <Path
                    d="M0 78 C92 39 160 106 248 72 C320 44 360 82 400 68 L400 100 L0 100 Z"
                    fill={color}
                    opacity={0.2}
                />
            </Svg>
        </View>
    )
}

export function HeroWave() {
    return (
        <View className="absolute bottom-0 left-0 right-0 h-28">
            <Svg
                width="100%"
                height="100%"
                viewBox="0 0 400 120"
                preserveAspectRatio="none"
            >
                <Path
                    d="M0 52 C70 18 135 96 220 54 C300 14 350 82 400 48 L400 120 L0 120 Z"
                    fill="#78A4CB"
                    opacity={0.28}
                />

                <Path
                    d="M0 84 C88 44 155 122 242 82 C315 48 360 100 400 76 L400 120 L0 120 Z"
                    fill="#F0F7FA"
                />
            </Svg>
        </View>
    )
}
