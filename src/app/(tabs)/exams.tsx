import React, {
    useCallback,
    useState,
} from 'react'
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native'
import {
    useFocusEffect,
    useRouter,
} from 'expo-router'
import {
    ChevronRight,
    ClipboardCheck,
    RotateCcw,
} from 'lucide-react-native'

import { BottomNav } from '@/components/app/bottom-nav'
import { supabase } from '@/lib/supabase'
import {
    getCourses,
    type Course,
} from '@/services/courses.service'

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
    count: number
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

    const { data, error } = await supabase
        .from('user_question_progress')
        .select(`
            question:questions!inner (
                course_id
            )
        `)
        .eq('user_id', user.id)
        .in('status', ['learning', 'review'])
        .or(
            `next_review_at.is.null,next_review_at.lte.${currentDate}`
        )

    if (error) {
        console.error(
            'Nie udało się pobrać pytań do powtórki:',
            error
        )

        throw error
    }

    const progressRows =
        (data ?? []) as unknown as MistakeProgressRow[]

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
        {}
    )
}

export default function ExamsScreen() {
    const router = useRouter()

    const [courses, setCourses] = useState<
        Course[]
    >([])

    const [
        mistakeCounts,
        setMistakeCounts,
    ] = useState<MistakeCountsByCourse>({})

    const [isLoading, setIsLoading] =
        useState(true)

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null)

    const [
        mistakesWarning,
        setMistakesWarning,
    ] = useState<string | null>(null)

    const loadCourses = useCallback(async () => {
        try {
            setIsLoading(true)
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
                    error
                )

                setMistakeCounts({})

                setMistakesWarning(
                    'Nie udało się pobrać informacji o pytaniach do powtórki.'
                )
            }
        } catch (error) {
            console.error(
                'Nie udało się pobrać kursów do egzaminów:',
                error
            )

            setCourses([])
            setMistakeCounts({})

            setErrorMessage(
                'Nie udało się pobrać dostępnych kursów.'
            )
        } finally {
            setIsLoading(false)
        }
    }, [])

    useFocusEffect(
        useCallback(() => {
            void loadCourses()
        }, [loadCourses])
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

    function openMistakesExam(
        courseId: string
    ) {
        router.push({
            pathname: '/(exam)/[courseId]',
            params: {
                courseId,
                mode: 'mistakes',
            },
        })
    }

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F0F7FA] px-6">
                <ActivityIndicator
                    size="large"
                    color="#3478D9"
                />

                <Text className="mt-4 text-base font-semibold text-[#5A7A95]">
                    Pobieranie kursów...
                </Text>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-[#F0F7FA]">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingTop: 56,
                    paddingBottom: 130,
                }}
                showsVerticalScrollIndicator={
                    false
                }
            >
                <Text className="text-sm font-semibold uppercase tracking-widest text-[#78A4CB]">
                    Egzaminy próbne
                </Text>

                <Text className="mt-2 text-4xl font-extrabold leading-tight text-[#1A3A52]">
                    Wybierz kurs
                </Text>

                <Text className="mt-3 max-w-sm text-base leading-relaxed text-[#5A7A95]">
                    Rozwiąż pełny egzamin albo
                    powtórz pytania, przy których
                    wcześniej popełniłeś błąd.
                </Text>

                {mistakesWarning && (
                    <View className="mt-6 rounded-2xl border border-[#F0DFB8] bg-[#FFF9E8] p-4">
                        <Text className="text-sm font-semibold leading-relaxed text-[#8A6A24]">
                            {mistakesWarning}
                        </Text>
                    </View>
                )}

                {errorMessage ? (
                    <View className="mt-8 rounded-[28px] border border-[#F2D4D4] bg-white p-6 shadow-sm">
                        <Text className="text-xl font-extrabold text-[#1A3A52]">
                            Nie udało się pobrać
                            kursów
                        </Text>

                        <Text className="mt-3 text-base leading-relaxed text-[#5A7A95]">
                            {errorMessage}
                        </Text>

                        <Pressable
                            onPress={() =>
                                void loadCourses()
                            }
                            className="mt-6 flex-row items-center justify-center rounded-2xl bg-[#3478D9] px-4 py-3"
                        >
                            <RotateCcw
                                size={19}
                                color="white"
                            />

                            <Text className="ml-2 font-bold text-white">
                                Spróbuj ponownie
                            </Text>
                        </Pressable>
                    </View>
                ) : courses.length === 0 ? (
                    <View className="mt-8 rounded-[28px] border border-[#DDEAF0] bg-white p-6 shadow-sm">
                        <Text className="text-xl font-extrabold text-[#1A3A52]">
                            Brak kursów
                        </Text>

                        <Text className="mt-3 text-base leading-relaxed text-[#5A7A95]">
                            W bazie nie ma jeszcze
                            kursów, dla których można
                            rozpocząć egzamin.
                        </Text>
                    </View>
                ) : (
                    <View className="mt-8 gap-5">
                        {courses.map((course) => {
                            const mistakeCount =
                                mistakeCounts[
                                course.id
                                ] ?? 0

                            const hasMistakes =
                                mistakeCount > 0

                            return (
                                <View
                                    key={course.id}
                                    className="rounded-[28px] border border-[#DDEAF0] bg-white p-5 shadow-sm"
                                >
                                    <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#D9EEF7]">
                                        <ClipboardCheck
                                            size={30}
                                            color="#3478D9"
                                            strokeWidth={
                                                2.2
                                            }
                                        />
                                    </View>

                                    <Text className="mt-5 text-xs font-bold uppercase tracking-widest text-[#78A4CB]">
                                        Dostępny
                                        egzamin
                                    </Text>

                                    <Text className="mt-2 text-2xl font-extrabold leading-tight text-[#1A3A52]">
                                        Egzamin dla
                                        kursu
                                    </Text>

                                    <Text className="mt-2 text-xl font-extrabold leading-tight text-[#3478D9]">
                                        {course.name}
                                    </Text>

                                    {course.description && (
                                        <Text className="mt-3 text-base leading-relaxed text-[#5A7A95]">
                                            {
                                                course.description
                                            }
                                        </Text>
                                    )}

                                    <View className="mt-5 rounded-2xl bg-[#F0F7FA] p-4">
                                        <Text className="text-xs font-bold uppercase tracking-widest text-[#78A4CB]">
                                            Powtórki
                                            błędów
                                        </Text>

                                        <Text
                                            className={`mt-2 text-base font-extrabold ${hasMistakes
                                                    ? 'text-[#C06A3B]'
                                                    : 'text-[#5D963F]'
                                                }`}
                                        >
                                            {hasMistakes
                                                ? getQuestionCountLabel(
                                                    mistakeCount
                                                )
                                                : 'Brak pytań do powtórki'}
                                        </Text>

                                        <Text className="mt-1 text-sm leading-relaxed text-[#5A7A95]">
                                            {hasMistakes
                                                ? 'Te pytania są obecnie gotowe do ponownego rozwiązania.'
                                                : 'Błędnie rozwiązane pytania pojawią się tutaj automatycznie.'}
                                        </Text>
                                    </View>

                                    <Pressable
                                        onPress={() =>
                                            openExam(
                                                course.id
                                            )
                                        }
                                        className="mt-6 flex-row items-center justify-between rounded-2xl bg-[#3478D9] px-4 py-4"
                                    >
                                        <Text className="text-base font-bold text-white">
                                            Zrób egzamin
                                        </Text>

                                        <ChevronRight
                                            size={21}
                                            color="white"
                                        />
                                    </Pressable>

                                    <Pressable
                                        onPress={() =>
                                            openMistakesExam(
                                                course.id
                                            )
                                        }
                                        disabled={
                                            !hasMistakes
                                        }
                                        className={`mt-3 flex-row items-center justify-between rounded-2xl border px-4 py-4 ${hasMistakes
                                                ? 'border-[#3478D9] bg-white'
                                                : 'border-[#DCE6EB] bg-[#E8F0F3]'
                                            }`}
                                    >
                                        <View className="flex-row items-center">
                                            <RotateCcw
                                                size={
                                                    19
                                                }
                                                color={
                                                    hasMistakes
                                                        ? '#3478D9'
                                                        : '#AABBC5'
                                                }
                                            />

                                            <Text
                                                className={`ml-2 text-base font-bold ${hasMistakes
                                                        ? 'text-[#3478D9]'
                                                        : 'text-[#AABBC5]'
                                                    }`}
                                            >
                                                Powtórz
                                                błędne
                                            </Text>
                                        </View>

                                        <ChevronRight
                                            size={21}
                                            color={
                                                hasMistakes
                                                    ? '#3478D9'
                                                    : '#AABBC5'
                                            }
                                        />
                                    </Pressable>
                                </View>
                            )
                        })}
                    </View>
                )}
            </ScrollView>

            <BottomNav />
        </View>
    )
}