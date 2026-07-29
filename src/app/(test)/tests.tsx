import {
    useFocusEffect,
    useRouter,
} from 'expo-router'
import {
    ArrowRight,
    BookOpen,
    RefreshCw,
    Sparkles,
    Zap
} from 'lucide-react-native'
import {
    useCallback,
    useState,
} from 'react'
import {
    ActivityIndicator,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from 'react-native'

import { BottomNav } from '@/components/app/bottom-nav'
import { getThumbnail } from '@/lib/supabase-image'
import {
    getCourses,
    type Course,
} from '@/services/courses.service'

type QuizMode = 'quick' | 'learning'

export default function TestsScreen() {
    const router = useRouter()

    const [courses, setCourses] =
        useState<Course[]>([])

    const [isLoading, setIsLoading] =
        useState(true)

    const [isRefreshing, setIsRefreshing] =
        useState(false)

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null)

    const loadCourses = useCallback(
        async (refreshing = false) => {
            try {
                if (refreshing) {
                    setIsRefreshing(true)
                } else {
                    setIsLoading(true)
                }

                setErrorMessage(null)

                const data =
                    await getCourses()

                setCourses(data)
            } catch (error) {
                console.error(
                    'Nie udało się pobrać kursów do testów:',
                    error,
                )

                setCourses([])

                setErrorMessage(
                    'Nie udało się pobrać dostępnych kursów.',
                )
            } finally {
                setIsLoading(false)
                setIsRefreshing(false)
            }
        },
        [],
    )

    useFocusEffect(
        useCallback(() => {
            void loadCourses()
        }, [loadCourses]),
    )

    function handleRefresh() {
        void loadCourses(true)
    }

    function openQuiz(
        courseId: string,
        mode: QuizMode,
    ) {
        const questionCount =
            mode === 'quick'
                ? 10
                : 20

        router.push({
            pathname: '/(test)/[courseId]',
            params: {
                courseId,
                mode,
                count: String(
                    questionCount,
                ),
            },
        })
    }

    return (
        <View className="flex-1 bg-[#F8FAFC]">
            <BackgroundDecoration />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 56,
                    paddingBottom: 140,
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={
                            isRefreshing
                        }
                        onRefresh={
                            handleRefresh
                        }
                        tintColor="#4274D9"
                        colors={[
                            '#4274D9',
                        ]}
                        progressBackgroundColor="#FFFFFF"
                    />
                }
                showsVerticalScrollIndicator={
                    false
                }
            >
                <Header />

                <LearningInfo />

                {isLoading ? (
                    <LoadingState />
                ) : errorMessage ? (
                    <ErrorState
                        message={
                            errorMessage
                        }
                        onRetry={() =>
                            void loadCourses()
                        }
                    />
                ) : courses.length === 0 ? (
                    <EmptyState />
                ) : (
                    <View className="mt-8 gap-5">
                        {courses.map(
                            (course) => (
                                <CourseQuizCard
                                    key={
                                        course.id
                                    }
                                    course={
                                        course
                                    }
                                    onQuick={() =>
                                        openQuiz(
                                            course.id,
                                            'quick',
                                        )
                                    }
                                    onLearning={() =>
                                        openQuiz(
                                            course.id,
                                            'learning',
                                        )
                                    }
                                />
                            ),
                        )}
                    </View>
                )}
            </ScrollView>

            <BottomNav />
        </View>
    )
}

function Header() {
    return (
        <View>
            <Text className="text-[12px] font-bold uppercase tracking-[1.7px] text-[#8B92A5]">
                Testy
            </Text>

            <Text className="mt-2 text-[38px] font-semibold leading-[43px] tracking-[-1.3px] text-[#293681]">
                Ucz się przez pytania
            </Text>

            <Text className="mt-3 max-w-[345px] text-[16px] leading-6 text-[#747B8F]">
                Ćwicz na tych samych
                pytaniach, które mogą pojawić
                się podczas egzaminu.
            </Text>
        </View>
    )
}

function LearningInfo() {
    return (
        <View className="mt-7 flex-row items-start rounded-[22px] border border-[#D8E8EA] bg-[#EEF7F7] p-4">
            <View className="h-11 w-11 items-center justify-center rounded-[15px] bg-white">
                <Sparkles
                    size={21}
                    color="#4274D9"
                    strokeWidth={2.2}
                />
            </View>

            <View className="ml-3 flex-1">
                <Text className="text-[14px] font-bold text-[#293681]">
                    Tryb nauki
                </Text>

                <Text className="mt-1 text-[13px] leading-5 text-[#687087]">
                    Bez limitu czasu i bez
                    presji wyniku. Tutaj liczy
                    się zrozumienie pytań.
                </Text>
            </View>
        </View>
    )
}

function CourseQuizCard({
    course,
    onQuick,
    onLearning,
}: {
    course: Course
    onQuick: () => void
    onLearning: () => void
}) {
    const courseThumbnail =
        getThumbnail(
            course.image_url,
        )

    return (
        <View className="overflow-hidden rounded-[30px] border border-[#E3E8F1] bg-white">
            {/* IMAGE */}

            <View className="relative h-[175px] overflow-hidden">
                {courseThumbnail ? (
                    <Image
                        source={{
                            uri: courseThumbnail,
                        }}
                        className="h-full w-full"
                        resizeMode="cover"
                    />
                ) : (
                    <Image
                        source={require('@/assets/images/home-boat.jpg')}
                        className="h-full w-full"
                        resizeMode="cover"
                    />
                )}

                <View className="absolute inset-0 bg-[#293681]/15" />

            </View>

            {/* COURSE */}

            <View className="p-5">
                <Text
                    className="text-[24px] font-semibold leading-[30px] tracking-[-0.6px] text-[#293681]"
                    numberOfLines={2}
                >
                    {course.name}
                </Text>

                <Text
                    className="mt-2 text-[14px] leading-[21px] text-[#747B8F]"
                    numberOfLines={3}
                >
                    {course.description ??
                        'Ćwicz pytania i utrwalaj wiedzę przed egzaminem.'}
                </Text>

                {/* MODES */}

                <View className="mt-5 flex-row gap-3">
                    <QuickQuizCard
                        onPress={
                            onQuick
                        }
                    />


                </View>
            </View>
        </View>
    )
}

function QuickQuizCard({
    onPress,
}: {
    onPress: () => void
}) {
    return (
        <Pressable
            onPress={onPress}
            className="min-h-[155px] flex-1 rounded-[20px] bg-[#EEF3FC] p-4"
            style={({ pressed }) => ({
                opacity:
                    pressed
                        ? 0.86
                        : 1,
                transform: [
                    {
                        scale:
                            pressed
                                ? 0.985
                                : 1,
                    },
                ],
            })}
        >
            <View className="flex-row items-center justify-between">
                <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-white">
                    <Zap
                        size={19}
                        color="#4274D9"
                        strokeWidth={2.3}
                    />
                </View>

                <ArrowRight
                    size={18}
                    color="#4274D9"
                    strokeWidth={2.3}
                />
            </View>

            <View className="mt-auto pt-5">
                <Text className="text-[15px] font-bold text-[#293681]">
                    Szybki test
                </Text>

                <Text className="mt-1 text-[12px] leading-4 text-[#747B8F]">
                    10 pytań
                </Text>
            </View>
        </Pressable>
    )
}


function LoadingState() {
    return (
        <View className="mt-8 items-center rounded-[30px] border border-[#E3E8F1] bg-white px-6 py-12">
            <View className="h-16 w-16 items-center justify-center rounded-[22px] bg-[#EEF3FC]">
                <ActivityIndicator
                    size="large"
                    color="#4274D9"
                />
            </View>

            <Text className="mt-5 text-[20px] font-semibold text-[#293681]">
                Pobieranie testów
            </Text>

            <Text className="mt-2 max-w-[280px] text-center text-sm leading-6 text-[#747B8F]">
                Przygotowujemy dostępne
                kursy i pytania do nauki.
            </Text>
        </View>
    )
}

function ErrorState({
    message,
    onRetry,
}: {
    message: string
    onRetry: () => void
}) {
    return (
        <View className="mt-8 rounded-[30px] border border-[#E3E8F1] bg-white p-7">
            <View className="h-14 w-14 items-center justify-center rounded-[18px] bg-[#EEF3FC]">
                <RefreshCw
                    size={24}
                    color="#4274D9"
                    strokeWidth={2.2}
                />
            </View>

            <Text className="mt-5 text-[22px] font-semibold text-[#293681]">
                Nie udało się pobrać testów
            </Text>

            <Text className="mt-2 text-sm leading-6 text-[#747B8F]">
                {message}
            </Text>

            <Pressable
                onPress={onRetry}
                className="mt-6 flex-row items-center justify-center rounded-[18px] bg-[#293681] px-6 py-4"
            >
                <RefreshCw
                    size={17}
                    color="#FFFFFF"
                    strokeWidth={2.3}
                />

                <Text className="ml-2 font-bold text-white">
                    Spróbuj ponownie
                </Text>
            </Pressable>
        </View>
    )
}

function EmptyState() {
    return (
        <View className="mt-8 items-center rounded-[30px] border border-[#E3E8F1] bg-white p-8">
            <View className="h-16 w-16 items-center justify-center rounded-[22px] bg-[#EEF3FC]">
                <BookOpen
                    size={27}
                    color="#4274D9"
                    strokeWidth={2.2}
                />
            </View>

            <Text className="mt-5 text-center text-[23px] font-semibold text-[#293681]">
                Brak dostępnych testów
            </Text>

            <Text className="mt-3 max-w-[285px] text-center text-sm leading-6 text-[#747B8F]">
                Gdy pojawią się kursy z
                pytaniami, znajdziesz je właśnie
                tutaj.
            </Text>
        </View>
    )
}

function BackgroundDecoration() {
    return (
        <View
            pointerEvents="none"
            className="absolute inset-0 overflow-hidden"
        >
            <View className="absolute -right-36 -top-32 h-80 w-80 rounded-full bg-[#D0E7E6]/45" />

            <View className="absolute -left-40 top-[560px] h-72 w-72 rounded-full bg-[#EEF3FC]" />
        </View>
    )
}