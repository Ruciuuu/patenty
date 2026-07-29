import { ChooseCourseCardProps } from "@/types/home";
import { ChevronRight } from "lucide-react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";


export function ChooseCourseCard({
    courses,
    error,
    isSaving,
    onSelectCourse,
}: ChooseCourseCardProps) {
    return (
        <View className="mb-9 overflow-hidden rounded-[30px] border border-[#E4E9F2] bg-white shadow-sm">
            <View className="p-6">
                <Text className="text-[12px] font-semibold uppercase tracking-[1.4px] text-[#4274D9]">
                    Zacznij naukę
                </Text>

                <Text className="mt-2 text-[27px] font-semibold leading-[33px] tracking-[-0.8px] text-[#293681]">
                    Ustaw swój kurs
                </Text>

                <Text className="mt-2 text-sm leading-5 text-[#747B8F]">
                    Wybierz kurs, którego chcesz się teraz uczyć.
                    Możesz później zmienić ten wybór.
                </Text>

                {error ? (
                    <Text className="mt-4 text-sm font-medium text-[#B94A48]">
                        {error}
                    </Text>
                ) : null}

                <View className="mt-5">
                    {courses.length === 0 ? (
                        <Text className="text-sm text-[#747B8F]">
                            Brak dostępnych kursów.
                        </Text>
                    ) : (
                        courses.map((item) => (
                            <Pressable
                                key={item.id}
                                disabled={isSaving}
                                onPress={() =>
                                    onSelectCourse(item.id)
                                }
                                className="mb-3 flex-row items-center rounded-[20px] border border-[#E4E9F2] bg-[#F8FAFC] p-4"
                                style={({ pressed }) => ({
                                    opacity: isSaving ? 0.6 : 1,
                                    transform: [
                                        {
                                            scale:
                                                pressed && !isSaving
                                                    ? 0.99
                                                    : 1,
                                        },
                                    ],
                                })}
                            >


                                <View className="flex-1">
                                    <Text className="text-[16px] font-semibold text-[#293681]">
                                        {item.name}
                                    </Text>

                                    {item.description ? (
                                        <Text
                                            className="mt-1 text-[13px] leading-[18px] text-[#747B8F]"
                                            numberOfLines={2}
                                        >
                                            {item.description}
                                        </Text>
                                    ) : null}
                                </View>

                                {isSaving ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#4274D9"
                                    />
                                ) : (
                                    <ChevronRight
                                        size={20}
                                        color="#8991A6"
                                    />
                                )}
                            </Pressable>
                        ))
                    )}
                </View>
            </View>
        </View>
    )
}