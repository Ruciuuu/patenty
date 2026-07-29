import { PrimaryButtonProps } from "@/types/home";
import { ChevronRight, Play, RotateCcw } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

export function PrimaryButton({
    label,
    disabled,
    completed,
    onPress,
}: PrimaryButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            className={`mt-5 flex-row items-center justify-between rounded-[18px] px-5 py-4 ${disabled
                ? 'bg-[#E9ECF4]'
                : 'bg-[#293681]'
                }`}
            style={({ pressed }) => ({
                opacity: disabled ? 0.7 : 1,
                transform: [
                    {
                        scale:
                            pressed && !disabled
                                ? 0.985
                                : 1,
                    },
                ],
            })}
        >
            <View className="flex-row items-center">
                {completed ? (
                    <RotateCcw
                        size={18}
                        color={
                            disabled
                                ? '#9298A9'
                                : '#FFFFFF'
                        }
                    />
                ) : (
                    <Play
                        size={18}
                        color={
                            disabled
                                ? '#9298A9'
                                : '#FFFFFF'
                        }
                        fill={
                            disabled
                                ? '#9298A9'
                                : '#FFFFFF'
                        }
                    />
                )}

                <Text
                    className={`ml-3 text-[15px] font-bold ${disabled
                        ? 'text-[#9298A9]'
                        : 'text-white'
                        }`}
                >
                    {label}
                </Text>
            </View>

            <ChevronRight
                size={20}
                color={
                    disabled
                        ? '#9298A9'
                        : '#FFFFFF'
                }
            />
        </Pressable>
    )
}