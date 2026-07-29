import { ContinueLearningCardProps } from "@/types/home"
import { Image } from "expo-image"
import { RotateCcw } from "lucide-react-native"
import { ActivityIndicator, Text, View } from "react-native"
import { PrimaryButton } from "./primary-button"
import { ProgressBar } from "./progress-bar"


const COLORS = {
    background: '#F8FAFC',
    surface: '#FFFFFF',

    navy: '#293681',
    blue: '#4274D9',
    aqua: '#95CCDD',
    aquaLight: '#D0E7E6',

    ink: '#1D2540',
    muted: '#6D7488',
    mutedLight: '#98A0B3',

    border: '#E7EBF2',
    softBlue: '#EEF3FC',
    softAqua: '#EEF7F7',

    danger: '#B94A48',
}

export function ContinueLearningCard({
    isLoading,
    error,
    nextLessonTitle,
    thumbnailUrl,
    progressPercent,
    completedLessons,
    totalLessons,
    isCompleted,
    buttonLabel,
    disabled,
    courseName,
    onPress,
}: ContinueLearningCardProps) {





    return (
        <View className="mb-9 overflow-hidden rounded-[30px] border border-[#E4E9F2] bg-white shadow-sm">
            <View className="relative h-[190px] overflow-hidden">
                {thumbnailUrl === "" ?

                    (
                        <View className="absolute h-full w-full bg-[#EEF3FC]" />

                    )
                    :
                    (<Image
                        source={{
                            uri: thumbnailUrl
                        }}
                        className="absolute h-full w-full"
                        contentFit="cover"
                    />)


                }

                <View className="absolute inset-0 bg-[#293681]/10" />

            </View>

            <View className="p-6">
                {isLoading ? (
                    <LoadingCourseState />
                ) : error ? (
                    <ErrorCourseState
                        message={error}
                    />
                ) : (
                    <View>
                        <Text className="text-[12px] font-semibold uppercase tracking-[1.4px] text-[#4274D9]">
                            {courseName}
                        </Text>

                        <Text
                            className="mt-2 text-[27px] font-semibold leading-[33px] tracking-[-0.8px] text-[#293681]"
                            numberOfLines={3}
                        >
                            {isCompleted
                                ? 'Świetna robota. Kurs jest ukończony.'
                                : nextLessonTitle ??
                                'Poznaj podstawy bezpiecznej żeglugi'}
                        </Text>

                        <View className="mt-3 flex-row items-center justify-between">
                            <Text className="text-sm leading-5 text-[#747B8F]">
                                {totalLessons > 0
                                    ? `${completedLessons} z ${totalLessons} lekcji ukończonych`
                                    : 'Materiały przygotowujące do egzaminu'}
                            </Text>

                            {totalLessons > 0 ? (
                                <Text className="ml-3 text-sm font-bold text-[#4274D9]">
                                    {progressPercent}%
                                </Text>
                            ) : null}
                        </View>
                    </View>
                )}

                <ProgressBar
                    value={progressPercent}
                    trackColor="#E9EDF5"
                    fillColor="#4274D9"
                    className="mt-5"
                />

                <PrimaryButton
                    label={buttonLabel}
                    disabled={disabled}
                    completed={isCompleted}
                    onPress={onPress}
                />
            </View>
        </View>
    )
}

function LoadingCourseState() {
    return (
        <View className="min-h-[104px] justify-center">
            <ActivityIndicator
                size="small"
                color="#4274D9"
            />

            <Text className="mt-3 text-center text-sm font-medium text-[#747B8F]">
                Przygotowujemy kolejną lekcję…
            </Text>
        </View>
    )
}
function ErrorCourseState({
    message,
}: {
    message: string
}) {
    return (
        <View className="min-h-[104px]">
            <View className="mb-3 h-10 w-10 items-center justify-center rounded-[14px] bg-[#FCE8E7]">
                <RotateCcw
                    size={19}
                    color={COLORS.danger}
                />
            </View>

            <Text className="text-xl font-semibold text-[#7D3330]">
                {message}
            </Text>
        </View>
    )
}