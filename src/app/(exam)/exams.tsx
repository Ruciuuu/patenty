import {
    useFocusEffect,
    useRouter,
} from 'expo-router'
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    ClipboardCheck,
    RefreshCw,
    RotateCcw,
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

import { Header } from '@/components/(exam)/Header'
import { BottomNav } from '@/components/app/bottom-nav'
import { supabase } from '@/lib/supabase'
import { getThumbnail } from '@/lib/supabase-image'
import {
    getCourses,
    type Course,
} from '@/services/courses.service'
import { getQuestionAttempts } from '@/services/question-attempts.service'

type MistakeCountsByCourse = Record<string, number>

type QuestionCourseRelation = {
    course_id: string
}

type MistakeProgressRow = {
    question:
    | QuestionCourseRelation
    | QuestionCourseRelation[]
    | null
}


function getQuestionCountLabel(
    count: number,
): string {
    if (count === 1) {
        return '1 pytanie do powtórki'
    }

    const lastDigit = count % 10
    const lastTwoDigits = count % 100

    const usesPytania =
        lastDigit >= 2 &&
        lastDigit <= 4 &&
        !(
            lastTwoDigits >= 12 &&
            lastTwoDigits <= 14
        )

    if (usesPytania) {
        return `${count} pytania do powtórki`
    }

    return `${count} pytań do powtórki`
}

async function getMistakeCountsByCourse(): Promise<MistakeCountsByCourse> {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
        throw userError
    }

    if (!user) {
        return {}
    }

    const currentDate = new Date().toISOString()
    const userId = user.id
    const questionAttemptsData = await getQuestionAttempts(currentDate, userId);




    const progressRows =
        (questionAttemptsData ?? []) as unknown as MistakeProgressRow[]

    return progressRows.reduce<MistakeCountsByCourse>(
        (counts, row) => {
            const questionRelation =
                Array.isArray(row.question)
                    ? row.question[0]
                    : row.question

            const relatedCourseId =
                questionRelation?.course_id

            if (!relatedCourseId) {
                return counts
            }

            counts[relatedCourseId] =
                (counts[relatedCourseId] ?? 0) + 1

            return counts
        },
        {},
    )
}

export default function ExamsScreen() {
    const router = useRouter()

    const [courses, setCourses] =
        useState<Course[]>([])

    const [mistakeCounts, setMistakeCounts] =
        useState<MistakeCountsByCourse>({})

    const [isLoading, setIsLoading] =
        useState(true)

    const [isRefreshing, setIsRefreshing] =
        useState(false)

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null)

    const [mistakesWarning, setMistakesWarning] =
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
                setMistakesWarning(null)

                const coursesData =
                    await getCourses()

                setCourses(coursesData)

                try {
                    const counts =
                        await getMistakeCountsByCourse()

                    setMistakeCounts(counts)
                } catch (error) {
                    console.error(
                        'Nie udało się pobrać liczników powtórek:',
                        error,
                    )

                    setMistakeCounts({})

                    setMistakesWarning(
                        'Nie udało się pobrać informacji o pytaniach do powtórki.',
                    )
                }
            } catch (error) {
                console.error(
                    'Nie udało się pobrać kursów do egzaminów:',
                    error,
                )

                setCourses([])
                setMistakeCounts({})

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

    function openExam(courseId: string) {
        router.push({
            pathname: '/(exam)/[courseId]',
            params: {
                courseId,
                mode: 'exam',
            },
        })
    }

    function openMistakesExam(courseId: string) {
        router.push({
            pathname: '/(exam)/[courseId]',
            params: {
                courseId,
                mode: 'mistakes',
            },
        })
    }

    function handleRefresh() {
        void loadCourses(true)
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
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor="#4274D9"
                        colors={['#4274D9']}
                        progressBackgroundColor="#FFFFFF"
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                <Header />

                {mistakesWarning ? (
                    <WarningCard
                        message={mistakesWarning}
                    />
                ) : null}

                {isLoading ? (
                    <LoadingState />
                ) : errorMessage ? (
                    <ErrorState
                        message={errorMessage}
                        onRetry={() =>
                            void loadCourses()
                        }
                    />
                ) : courses.length === 0 ? (
                    <EmptyState />
                ) : (
                    <View className="mt-8 gap-5">
                        {courses.map((course) => {
                            const mistakeCount =
                                mistakeCounts[
                                course.id
                                ] ?? 0

                            return (
                                <ExamCourseCard
                                    key={course.id}
                                    course={course}
                                    mistakeCount={
                                        mistakeCount
                                    }
                                    onOpenExam={() =>
                                        openExam(
                                            course.id,
                                        )
                                    }
                                    onOpenMistakes={() =>
                                        openMistakesExam(
                                            course.id,
                                        )
                                    }
                                />
                            )
                        })}
                    </View>
                )}
            </ScrollView>

            <BottomNav />
        </View>
    )
}


function ExamCourseCard({
    course,
    mistakeCount,
    onOpenExam,
    onOpenMistakes,
}: {
    course: Course
    mistakeCount: number
    onOpenExam: () => void
    onOpenMistakes: () => void
}) {
    const hasMistakes =
        mistakeCount > 0

    const courseThumbnail = getThumbnail(course.image_url)
    console.log(courseThumbnail)

    return (
        <View className="overflow-hidden rounded-[30px] border border-[#E3E8F1] bg-white">
            {/* IMAGE */}

            <View className="relative h-[175px] overflow-hidden">
                <Image
                    source={{
                        uri: courseThumbnail
                    }}
                    className="h-full w-full"
                    resizeMode="cover"
                />

                <View className="absolute inset-0 bg-[#293681]/20" />

            </View>

            {/* CONTENT */}

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
                        'Sprawdź swoją wiedzę i przygotuj się do egzaminu.'}
                </Text>

                {/* MISTAKES INFO */}

                <View className="mt-5 flex-row items-center rounded-[18px] bg-[#F6F8FB] px-4 py-3.5">
                    <View
                        className={`h-10 w-10 items-center justify-center rounded-[14px] ${hasMistakes
                            ? 'bg-[#EEF3FC]'
                            : 'bg-[#EEF7F7]'
                            }`}
                    >
                        {hasMistakes ? (
                            <RotateCcw
                                size={18}
                                color="#4274D9"
                                strokeWidth={2.3}
                            />
                        ) : (
                            <CheckCircle2
                                size={19}
                                color="#4274D9"
                                strokeWidth={2.3}
                            />
                        )}
                    </View>

                    <View className="ml-3 flex-1">
                        <Text className="text-[11px] font-bold uppercase tracking-[1px] text-[#9299AB]">
                            Powtórka błędów
                        </Text>

                        <Text className="mt-1 text-[14px] font-semibold text-[#293681]">
                            {hasMistakes
                                ? getQuestionCountLabel(
                                    mistakeCount,
                                )
                                : 'Brak pytań do powtórki'}
                        </Text>
                    </View>

                    {hasMistakes ? (
                        <View className="min-w-[38px] items-center justify-center rounded-full bg-[#EEF3FC] px-3 py-2">
                            <Text className="text-[14px] font-bold text-[#4274D9]">
                                {mistakeCount}
                            </Text>
                        </View>
                    ) : null}
                </View>

                {/* ACTIONS */}

                <View className="mt-4 flex-row gap-3">
                    <Pressable
                        onPress={onOpenExam}
                        className="flex-1 rounded-[20px] bg-[#293681] p-4"
                        style={({ pressed }) => ({
                            opacity:
                                pressed
                                    ? 0.9
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
                            <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-white/10">
                                <ClipboardCheck
                                    size={19}
                                    color="#95CCDD"
                                    strokeWidth={2.2}
                                />
                            </View>

                            <ArrowRight
                                size={18}
                                color="#FFFFFF"
                                strokeWidth={2.3}
                            />
                        </View>

                        <Text className="mt-5 text-[15px] font-bold text-white">
                            Pełny egzamin
                        </Text>

                        <Text className="mt-1 text-[11px] leading-4 text-white/60">
                            Rozpocznij symulację
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={onOpenMistakes}
                        disabled={!hasMistakes}
                        className={`flex-1 rounded-[20px] p-4 ${hasMistakes
                            ? 'bg-[#EEF3FC]'
                            : 'bg-[#F5F7FA]'
                            }`}
                        style={({ pressed }) => ({
                            opacity:
                                !hasMistakes
                                    ? 0.55
                                    : pressed
                                        ? 0.85
                                        : 1,

                            transform: [
                                {
                                    scale:
                                        pressed &&
                                            hasMistakes
                                            ? 0.985
                                            : 1,
                                },
                            ],
                        })}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-white">
                                {hasMistakes ? (
                                    <RotateCcw
                                        size={19}
                                        color="#4274D9"
                                        strokeWidth={2.2}
                                    />
                                ) : (
                                    <CheckCircle2
                                        size={19}
                                        color="#A9B0BF"
                                        strokeWidth={2.2}
                                    />
                                )}
                            </View>

                            {hasMistakes ? (
                                <ArrowRight
                                    size={18}
                                    color="#4274D9"
                                    strokeWidth={2.3}
                                />
                            ) : null}
                        </View>

                        <Text
                            className={`mt-5 text-[15px] font-bold ${hasMistakes
                                ? 'text-[#293681]'
                                : 'text-[#9AA2B3]'
                                }`}
                        >
                            Powtórka
                        </Text>

                        <Text
                            className={`mt-1 text-[11px] leading-4 ${hasMistakes
                                ? 'text-[#747B8F]'
                                : 'text-[#A9B0BF]'
                                }`}
                        >
                            {hasMistakes
                                ? 'Powtórz błędne pytania'
                                : 'Wszystko opanowane'}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    )
}

function WarningCard({
    message,
}: {
    message: string
}) {
    return (
        <View className="mt-6 flex-row items-start rounded-[22px] border border-[#DCE8EC] bg-[#EEF7F7] p-4">
            <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-white">
                <AlertTriangle
                    size={19}
                    color="#4274D9"
                    strokeWidth={2.2}
                />
            </View>

            <View className="ml-3 flex-1">
                <Text className="text-sm font-bold text-[#293681]">
                    Niepełne dane
                </Text>

                <Text className="mt-1 text-[13px] leading-5 text-[#687087]">
                    {message}
                </Text>
            </View>
        </View>
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
                Pobieranie egzaminów
            </Text>

            <Text className="mt-2 max-w-[280px] text-center text-sm leading-6 text-[#747B8F]">
                Przygotowujemy dostępne kursy oraz pytania
                do powtórki.
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
                Nie udało się pobrać egzaminów
            </Text>

            <Text className="mt-2 text-sm leading-6 text-[#747B8F]">
                {message}
            </Text>

            <Pressable
                onPress={onRetry}
                className="mt-6 flex-row items-center justify-center rounded-[18px] bg-[#293681] px-6 py-4"
                style={({ pressed }) => ({
                    opacity:
                        pressed
                            ? 0.9
                            : 1,
                })}
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
                <ClipboardCheck
                    size={27}
                    color="#4274D9"
                    strokeWidth={2.2}
                />
            </View>

            <Text className="mt-5 text-center text-[23px] font-semibold text-[#293681]">
                Brak dostępnych egzaminów
            </Text>

            <Text className="mt-3 max-w-[285px] text-center text-sm leading-6 text-[#747B8F]">
                Gdy pojawią się kursy z egzaminami,
                znajdziesz je właśnie tutaj.
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