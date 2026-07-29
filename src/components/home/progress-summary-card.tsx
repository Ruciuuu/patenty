import { ProgressSummaryCardProps } from "@/types/home";
import { Pressable, Text, View } from "react-native";
import { ProgressRing } from "./progress-ring";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

export function ProgressSummaryCard({
    progressPercent,
    completedLessons,
    totalLessons,
    isCompleted,
    onPress,
}: ProgressSummaryCardProps) {
    return (
        <Pressable
            onPress={onPress}
            className="mt-4 overflow-hidden rounded-[30px] bg-[#293681] p-5"
            style={({ pressed }) => ({
                transform: [
                    {
                        scale: pressed
                            ? 0.988
                            : 1,
                    },
                ],
            })}
        >
            <DarkCardDecoration />

            <View className="z-10 flex-row items-center">
                <View className="mr-4">
                    <ProgressRing
                        value={progressPercent}
                        size={72}
                        dark
                    />
                </View>

                <View className="flex-1">
                    <Text className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#95CCDD]">
                        Twój postęp
                    </Text>

                    <Text className="mt-2 text-[19px] font-semibold leading-6 text-white">
                        {isCompleted
                            ? 'Kurs ukończony'
                            : totalLessons > 0
                                ? `${completedLessons} z ${totalLessons} lekcji za Tobą`
                                : 'Pierwsza lekcja czeka'}
                    </Text>

                    <Text className="mt-1 text-[13px] leading-[18px] text-white/65">
                        {isCompleted
                            ? 'Możesz wrócić do dowolnego tematu.'
                            : 'Regularność jest ważniejsza niż długie sesje.'}
                    </Text>
                </View>


            </View>
        </Pressable>
    )
}


function DarkCardDecoration() {
    return (
        <View
            pointerEvents="none"
            className="absolute inset-0"
        >
            <Svg
                width="100%"
                height="100%"
                viewBox="0 0 400 160"
                preserveAspectRatio="none"
            >
                <Defs>
                    <LinearGradient
                        id="darkGlow"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                    >
                        <Stop
                            offset="0"
                            stopColor="#4274D9"
                            stopOpacity="0.45"
                        />

                        <Stop
                            offset="1"
                            stopColor="#293681"
                            stopOpacity="0"
                        />
                    </LinearGradient>
                </Defs>

                <Path
                    d="M190 -20 C260 34 298 22 430 110 L430 -20 Z"
                    fill="url(#darkGlow)"
                />
            </Svg>
        </View>
    )
}