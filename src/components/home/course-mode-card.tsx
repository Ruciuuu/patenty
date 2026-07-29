import { CourseModeCardProps } from "@/types/home";
import { ArrowUpRight, BookOpen } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { ProgressBar } from "./progress-bar";

export function CourseModeCard({
    progressPercent,
    completedLessons,
    totalLessons,
    isLoading,
    onPress,
}: CourseModeCardProps) {
    return (
        <Pressable
            onPress={onPress}
            disabled={isLoading}
            className="min-h-[246px] overflow-hidden rounded-[28px] border border-[#E4E9F2] bg-white p-5"
            style={({ pressed }) => ({
                opacity: isLoading ? 0.65 : 1,
                transform: [
                    {
                        scale:
                            pressed && !isLoading
                                ? 0.98
                                : 1,
                    },
                ],
            })}
        >
            <View className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-[#D0E7E6]/60" />

            <View className="z-10 flex-1 justify-between">
                <View className="flex-row items-start justify-between">
                    <View className="h-12 w-12 items-center justify-center rounded-[17px] bg-[#EDF3FC]">
                        <BookOpen
                            size={23}
                            color="#4274D9"
                            strokeWidth={2.1}
                        />
                    </View>

                    <ArrowUpRight
                        size={20}
                        color="#8991A6"
                    />
                </View>

                <View className="mt-7">
                    <Text className="text-[23px] font-semibold leading-7 tracking-[-0.5px] text-[#293681]">
                        Kurs
                    </Text>

                    <Text className="mt-2 text-[13px] leading-[19px] text-[#747B8F]">
                        Krótkie lekcje i najważniejsze
                        zagadnienia.
                    </Text>
                </View>

                <View className="mt-5">
                    <ProgressBar
                        value={progressPercent}
                        trackColor="#E9EDF5"
                        fillColor="#4274D9"
                    />

                    <Text className="mt-3 text-xs font-semibold text-[#687087]">
                        {completedLessons}/
                        {totalLessons} lekcji
                    </Text>
                </View>
            </View>
        </Pressable>
    )
}