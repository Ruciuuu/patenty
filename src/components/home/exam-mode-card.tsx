import { ChevronRight, ClipboardCheck } from "lucide-react-native"
import { Pressable, Text, View } from "react-native"
import Svg, { Path } from "react-native-svg"

export function ExamModeCard({
    onPress,
}: {
    onPress: () => void
}) {
    return (
        <Pressable
            onPress={onPress}
            className="min-h-[246px] overflow-hidden rounded-[28px] border border-[#DCE5F4] bg-[#F3F6FC] p-5"
            style={({ pressed }) => ({
                transform: [
                    {
                        scale: pressed
                            ? 0.98
                            : 1,
                    },
                ],
            })}
        >
            <ExamCardDecoration />

            <View className="z-10 flex-1 justify-between">
                <View className="flex-row items-start justify-between">
                    <View className="h-12 w-12 items-center justify-center rounded-[17px] bg-white">
                        <ClipboardCheck
                            size={24}
                            color="#293681"
                            strokeWidth={2.1}
                        />
                    </View>


                </View>

                <View className="mt-7">
                    <Text className="text-[23px] font-semibold leading-7 tracking-[-0.5px] text-[#293681]">
                        Egzaminy
                    </Text>

                    <Text className="mt-2 text-[13px] leading-[19px] text-[#687087]">
                        Sprawdź gotowość na pełnym
                        zestawie pytań.
                    </Text>
                </View>

                <View className="mt-5 flex-row items-center justify-between">
                    <Text className="text-xs font-bold text-[#4274D9]">
                        Rozpocznij
                    </Text>

                    <View className="h-9 w-9 items-center justify-center rounded-full bg-[#293681]">
                        <ChevronRight
                            size={18}
                            color="#FFFFFF"
                        />
                    </View>
                </View>
            </View>
        </Pressable>
    )
}


function ExamCardDecoration() {
    return (
        <View
            pointerEvents="none"
            className="absolute bottom-0 left-0 right-0 h-28 opacity-40"
        >
            <Svg
                width="100%"
                height="100%"
                viewBox="0 0 200 120"
                preserveAspectRatio="none"
            >
                <Path
                    d="M-20 104 C24 42 60 126 104 72 C137 31 170 86 220 31"
                    fill="none"
                    stroke="#95CCDD"
                    strokeWidth="2"
                />

                <Path
                    d="M-12 116 C35 58 67 136 112 86 C151 45 177 100 220 57"
                    fill="none"
                    stroke="#95CCDD"
                    strokeWidth="2"
                />

                <Path
                    d="M-25 88 C17 31 55 108 99 54 C140 8 171 68 220 16"
                    fill="none"
                    stroke="#95CCDD"
                    strokeWidth="2"
                />
            </Svg>
        </View>
    )
}
