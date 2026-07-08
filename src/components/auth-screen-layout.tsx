import React from 'react'
import { View } from 'react-native'
import { WaveDecoration } from './wave-decoration'

interface AuthScreenLayoutProps {
    children: React.ReactNode
    showWave?: boolean
    waveVariant?: 'large' | 'small'
}

export function AuthScreenLayout({
    children,
    showWave = true,
    waveVariant = 'small',
}: AuthScreenLayoutProps) {
    return (
        <View className="flex-1 bg-[#F0F7FA]">
            {showWave && (
                <WaveDecoration
                    variant={waveVariant}
                    className="absolute bottom-0 right-0 z-0"
                />
            )}

            <View className="relative z-10 flex-1">
                {children}
            </View>
        </View>
    )
}