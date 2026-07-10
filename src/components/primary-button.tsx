import { Pressable, Text } from 'react-native'

interface PrimaryButtonProps {
    label: string
    onPress?: () => void
    variant?: 'primary' | 'ghost'
    fullWidth?: boolean
    className?: string
}

export function PrimaryButton({
    label,
    onPress,
    variant = 'primary',
    fullWidth = true,
    className = '',
}: PrimaryButtonProps) {
    const base =
        'items-center justify-center rounded-3xl active:scale-95 w-[75%] mx-auto'

    const buttonVariants = {
        primary: 'bg-[#78A4CB] py-4 px-8 shadow-md',
        ghost: 'bg-transparent py-3 px-8',
    }

    const textVariants = {
        primary: 'text-white ',
        ghost: 'text-[#5A7A95] font-bold decoration-[#95BDD7]',
    }

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            className={`${base} ${buttonVariants[variant]} ${fullWidth ? 'w-full' : ''
                } ${className}`}
        >
            <Text className={`text-base font-semibold ${textVariants[variant]}`}>
                {label}
            </Text>
        </Pressable>
    )
}