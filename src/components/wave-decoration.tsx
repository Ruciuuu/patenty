import { View } from 'react-native'
import Svg, { Circle, Ellipse, Path } from 'react-native-svg'

interface WaveDecorationProps {
    variant?: 'large' | 'small'
    className?: string
}

export function WaveDecoration({
    variant = 'large',
    className = '',
}: WaveDecorationProps) {
    if (variant === 'small') {
        return (
            <View className={`absolute overflow-hidden ${className}`}>
                <Svg width={220} height={140} viewBox="0 0 220 140">
                    <Ellipse
                        cx={160}
                        cy={110}
                        rx={130}
                        ry={90}
                        fill="#B4E1EB"
                        opacity={0.35}
                    />

                    <Ellipse
                        cx={190}
                        cy={125}
                        rx={100}
                        ry={70}
                        fill="#95BDD7"
                        opacity={0.28}
                    />

                    <Path
                        d="M0 80 Q40 55 80 75 Q120 95 160 65 Q190 45 220 55 L220 140 L0 140 Z"
                        fill="#78A4CB"
                        opacity={0.18}
                    />
                </Svg>
            </View>
        )
    }

    return (
        <View className={`absolute overflow-hidden ${className}`}>
            <Svg width={320} height={380} viewBox="0 0 320 380">
                {/* Back blob */}
                <Ellipse
                    cx={220}
                    cy={260}
                    rx={200}
                    ry={170}
                    fill="#B4E1EB"
                    opacity={0.4}
                />

                {/* Mid wave */}
                <Path
                    d="M60 380 Q80 280 160 240 Q220 210 280 230 Q320 245 320 260 L320 380 Z"
                    fill="#95BDD7"
                    opacity={0.55}
                />

                {/* Front wave */}
                <Path
                    d="M100 380 Q130 310 200 290 Q250 275 295 295 Q318 305 320 320 L320 380 Z"
                    fill="#78A4CB"
                    opacity={0.7}
                />

                {/* Highlight */}
                <Circle
                    cx={260}
                    cy={220}
                    r={48}
                    fill="none"
                    stroke="#F9E8A2"
                    strokeWidth={3}
                    opacity={0.5}
                />

                <Circle
                    cx={260}
                    cy={220}
                    r={32}
                    fill="#F9E8A2"
                    opacity={0.18}
                />

                {/* Dots */}
                <Circle
                    cx={130}
                    cy={300}
                    r={6}
                    fill="#F9E8A2"
                    opacity={0.6}
                />

                <Circle
                    cx={155}
                    cy={270}
                    r={4}
                    fill="#F9E8A2"
                    opacity={0.4}
                />

                <Circle
                    cx={100}
                    cy={340}
                    r={3}
                    fill="#FFFFFF"
                    opacity={0.5}
                />
            </Svg>
        </View>
    )
}