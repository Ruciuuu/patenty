import React from 'react'
import { Text, View } from 'react-native'

interface FloatingBadgeProps {
    label: string
    icon: React.ReactNode
    className?: string
    accentColor?: 'cream' | 'aqua' | 'soft-blue'
}

const accentStyles = {
    cream: {
        container: 'bg-[#F9E8A2]',
        text: 'text-[#1A3A52]',
    },
    aqua: {
        container: 'bg-[#B4E1EB]',
        text: 'text-[#1A3A52]',
    },
    'soft-blue': {
        container: 'bg-[#95BDD7]',
        text: 'text-white',
    },
}

export function FloatingBadge({
    label,
    icon,
    className = '',
    accentColor = 'aqua',
}: FloatingBadgeProps) {
    const styles = accentStyles[accentColor]

    return (
        <View
            className={`
        flex-row items-center gap-2
        rounded-2xl border border-white/60
        px-3 py-2
        shadow-lg
        ${styles.container}
        ${className}
      `}
        >
            <View>{icon}</View>

            <Text className={`text-xs font-semibold ${styles.text}`}>
                {label}
            </Text>
        </View>
    )
}