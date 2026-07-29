import { ResultScreenProps } from "@/types/test"
import { ArrowLeft, Brain, CheckCircle2, ChevronRight, RotateCcw, Sparkles } from "lucide-react-native"
import { Pressable, ScrollView, Text, View } from "react-native"

export function ResultScreen({
    mode,
    correctAnswers,
    incorrectAnswers,
    questionsCount,
    hasMistakes,
    onBack,
    onRestart,
    onRepeatMistakes,
}: ResultScreenProps) {
    const scorePercent =
        questionsCount === 0
            ? 0
            : Math.round(
                (correctAnswers /
                    questionsCount) *
                100,
            )

    const message =
        scorePercent >= 90
            ? 'Świetna robota'
            : scorePercent >= 70
                ? 'Dobrze Ci idzie'
                : 'Jeszcze trochę praktyki'

    return (
        <View className="flex-1 bg-[#F8FAFC]">
            <BackgroundDecoration />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 54,
                    paddingBottom: 50,
                }}
                showsVerticalScrollIndicator={
                    false
                }
            >
                <Pressable
                    onPress={onBack}
                    className="h-11 w-11 items-center justify-center rounded-[16px] border border-[#E4E9F2] bg-white"
                >
                    <ArrowLeft
                        size={20}
                        color="#293681"
                    />
                </Pressable>

                <View className="mt-8 overflow-hidden rounded-[30px] bg-[#293681] p-6">
                    <View className="absolute -right-14 -top-16 h-52 w-52 rounded-full bg-[#4274D9]/30" />

                    <View className="absolute -bottom-20 left-8 h-40 w-40 rounded-full bg-[#95CCDD]/10" />

                    <View className="z-10">
                        <View className="flex-row items-start justify-between">
                            <View>
                                <Text className="text-[11px] font-bold uppercase tracking-[1.4px] text-[#95CCDD]">
                                    {mode ===
                                        'learning'
                                        ? 'Sesja nauki'
                                        : 'Szybki test'}
                                </Text>

                                <View className="mt-3 flex-row items-end">
                                    <Text className="text-[52px] font-semibold leading-[58px] tracking-[-2px] text-white">
                                        {
                                            correctAnswers
                                        }
                                    </Text>

                                    <Text className="mb-2 ml-1 text-[20px] font-semibold text-white/50">
                                        /
                                        {
                                            questionsCount
                                        }
                                    </Text>
                                </View>
                            </View>

                            <View className="h-14 w-14 items-center justify-center rounded-[19px] bg-white/10">
                                <Brain
                                    size={27}
                                    color="#95CCDD"
                                    strokeWidth={
                                        2.2
                                    }
                                />
                            </View>
                        </View>

                        <Text className="mt-4 text-[24px] font-semibold text-white">
                            {message}
                        </Text>

                        <Text className="mt-2 text-sm leading-6 text-white/65">
                            {hasMistakes
                                ? 'Możesz powtórzyć błędne pytania albo rozpocząć nowy zestaw.'
                                : 'Wszystkie pytania w tej sesji zostały rozwiązane poprawnie.'}
                        </Text>
                    </View>
                </View>

                <View className="mt-5 flex-row gap-3">
                    <StatCard
                        label="Poprawne"
                        value={
                            correctAnswers
                        }
                        variant="primary"
                    />

                    <StatCard
                        label="Do powtórki"
                        value={
                            incorrectAnswers
                        }
                        variant="light"
                    />
                </View>

                {hasMistakes ? (
                    <Pressable
                        onPress={
                            onRepeatMistakes
                        }
                        className="mt-5 flex-row items-center justify-between rounded-[22px] border border-[#D8E8EA] bg-[#EEF7F7] p-5"
                        style={({ pressed }) => ({
                            opacity:
                                pressed
                                    ? 0.86
                                    : 1,
                        })}
                    >
                        <View className="flex-row items-center">
                            <View className="h-11 w-11 items-center justify-center rounded-[15px] bg-white">
                                <RotateCcw
                                    size={20}
                                    color="#4274D9"
                                />
                            </View>

                            <View className="ml-3">
                                <Text className="text-[15px] font-bold text-[#293681]">
                                    Powtórz błędy
                                </Text>

                                <Text className="mt-1 text-[12px] text-[#747B8F]">
                                    {
                                        incorrectAnswers
                                    }{' '}
                                    pytań do
                                    przećwiczenia
                                </Text>
                            </View>
                        </View>

                        <ChevronRight
                            size={20}
                            color="#4274D9"
                        />
                    </Pressable>
                ) : (
                    <View className="mt-5 flex-row items-start rounded-[22px] border border-[#D0E7E6] bg-[#EEF7F7] p-5">
                        <CheckCircle2
                            size={21}
                            color="#4274D9"
                        />

                        <View className="ml-3 flex-1">
                            <Text className="font-bold text-[#293681]">
                                Wszystko opanowane
                            </Text>

                            <Text className="mt-1 text-sm leading-5 text-[#65758B]">
                                W tej sesji nie
                                masz żadnych błędnych
                                odpowiedzi.
                            </Text>
                        </View>
                    </View>
                )}

                <Pressable
                    onPress={onRestart}
                    className="mt-4 flex-row items-center justify-center rounded-[18px] bg-[#293681] px-5 py-4"
                >
                    <Sparkles
                        size={18}
                        color="#95CCDD"
                    />

                    <Text className="ml-2 text-[15px] font-bold text-white">
                        Nowy zestaw
                    </Text>
                </Pressable>

                <Pressable
                    onPress={onBack}
                    className="mt-3 items-center py-3"
                >
                    <Text className="text-sm font-semibold text-[#4274D9]">
                        Wróć do testów
                    </Text>
                </Pressable>
            </ScrollView>
        </View>
    )
}


function StatCard({
    label,
    value,
    variant,
}: {
    label: string
    value: number
    variant: 'primary' | 'light'
}) {
    const isPrimary =
        variant === 'primary'

    return (
        <View
            className={`flex-1 rounded-[22px] p-5 ${isPrimary
                ? 'bg-[#293681]'
                : 'border border-[#E3E8F1] bg-white'
                }`}
        >
            <Text
                className={`text-[28px] font-semibold ${isPrimary
                    ? 'text-white'
                    : 'text-[#293681]'
                    }`}
            >
                {value}
            </Text>

            <Text
                className={`mt-1 text-[12px] font-semibold ${isPrimary
                    ? 'text-white/60'
                    : 'text-[#747B8F]'
                    }`}
            >
                {label}
            </Text>
        </View>
    )
}


export function BackgroundDecoration() {
    return (
        <View
            pointerEvents="none"
            className="absolute inset-0 overflow-hidden"
        >
            <View className="absolute -right-36 -top-32 h-80 w-80 rounded-full bg-[#D0E7E6]/40" />

            <View className="absolute -left-40 top-[620px] h-72 w-72 rounded-full bg-[#EEF3FC]" />
        </View>
    )
}