import { ProgressBarProps } from "@/types/home"
import { View } from "react-native"

export function ProgressBar({
    value,
    trackColor,
    fillColor,
    className = '',
}: ProgressBarProps) {
    const normalizedValue = Math.min(
        100,
        Math.max(0, value),
    )

    return (
        <View
            className={`h-2 overflow-hidden rounded-full ${className}`}
            style={{
                backgroundColor: trackColor,
            }}
        >
            <View
                className="h-full rounded-full"
                style={{
                    width: `${normalizedValue}%`,
                    backgroundColor: fillColor,
                }}
            />
        </View>
    )
}
