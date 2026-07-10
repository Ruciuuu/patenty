import React from 'react'
import { View } from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'

export function HomeWaveMap() {
    return (
        <View className="absolute inset-0 z-0">
            <Svg width="100%" height="100%" viewBox="0 0 390 820" fill="none">
                <Path
                    d="M210 120 C250 185 165 230 205 290 C245 350 320 325 310 405 C300 485 205 465 185 545 C165 625 270 650 230 735"
                    stroke="#B4E1EB"
                    strokeWidth={42}
                    strokeLinecap="round"
                    opacity={0.35}
                />

                <Path
                    d="M210 120 C250 185 165 230 205 290 C245 350 320 325 310 405 C300 485 205 465 185 545 C165 625 270 650 230 735"
                    stroke="#78A4CB"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeDasharray="10 14"
                    opacity={0.25}
                />

                <Circle cx={210} cy={120} r={34} fill="#78A4CB" opacity={0.18} />
                <Circle cx={205} cy={290} r={32} fill="#95BDD7" opacity={0.18} />
                <Circle cx={310} cy={405} r={32} fill="#95BDD7" opacity={0.16} />
                <Circle cx={185} cy={545} r={32} fill="#95BDD7" opacity={0.16} />
                <Circle cx={230} cy={735} r={34} fill="#78A4CB" opacity={0.14} />
            </Svg>
        </View>
    )
}