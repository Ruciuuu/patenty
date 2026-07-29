import { AccountDataCardProps } from "@/types/account"
import React from "react"
import { ActivityIndicator, Text, View } from "react-native"



export function AccountDataCard({
    icon,
    title,
    value,
    isLoading = false,
    accent = 'blue',
}: AccountDataCardProps) {
    const isGreen = accent === 'green'

    return (
        <View className="flex-row items-center  bg-white/65 p-4">
            <View
                className={`h-12 w-12 items-center justify-center rounded-[18px] ${isGreen ? 'bg-[#DDF1D4]' : 'bg-[#D9EEF7]'
                    }`}
            >
                {isLoading ? (
                    <ActivityIndicator
                        size="small"
                        color="#3478D9"
                    />
                ) : (
                    React.cloneElement(icon, {
                        size: 25,
                        color: isGreen ? '#5B9847' : '#3478D9',
                        strokeWidth: 2.3,
                    })
                )}
            </View>

            <View className="ml-4 flex-1">
                <Text className="text-xs font-semibold uppercase tracking-wide text-[#7890A0]">
                    {title}
                </Text>

                <Text
                    className={`mt-1 text-base font-extrabold ${isGreen
                        ? 'text-[#4F833F]'
                        : 'text-[#163A59]'
                        }`}
                    numberOfLines={1}
                >
                    {value}
                </Text>
            </View>
        </View>
    )
}


