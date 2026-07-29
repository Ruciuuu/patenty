import {
    useLocalSearchParams,
    useRouter,
} from 'expo-router'
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ClipboardCheck,
    Clock3,
    RotateCcw,
    X,
    XCircle
} from 'lucide-react-native'
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native'

import {
    getSingleParam,
    shuffleExamQuestions,
} from '@/domain/exam'
import { getQuestionImageUrl } from '@/lib/supabase-image'
import {
    getCourses,
    type Course,
} from '@/services/courses.service'
import {
    submitExamAnswers,
    type QuestionAttemptType,
    type SubmittedQuestionResult,
} from '@/services/question-attempts.service'
import {
    getMistakeQuestionsWithAnswers,
    getQuestionsWithAnswers,
    type QuestionWithAnswers,
} from '@/services/questions.service'

type ExamMode = 'exam' | 'mistakes'

type SelectedAnswers = Record<string, string>

type SubmittedResults = Record<
    string,
    SubmittedQuestionResult
>

const EXAM_QUESTION_COUNT = 75
const EXAM_DURATION_SECONDS = 90 * 60
const EXAM_PASSING_SCORE = 65

export default function ExamScreen() {
    const router = useRouter()

    const params = useLocalSearchParams<{
        courseId?: string | string[]
        mode?: string | string[]
    }>()

    const courseId = getSingleParam(
        params.courseId,
    )

    const requestedMode = getSingleParam(
        params.mode,
    )

    const examMode: ExamMode =
        requestedMode === 'mistakes'
            ? 'mistakes'
            : 'exam'

    const isMistakesMode =
        examMode === 'mistakes'

    const attemptType: QuestionAttemptType =
        isMistakesMode
            ? 'mistakes'
            : 'exam'

    const [course, setCourse] =
        useState<Course | null>(null)

    const [questions, setQuestions] =
        useState<QuestionWithAnswers[]>([])

    const [selectedAnswers, setSelectedAnswers] =
        useState<SelectedAnswers>({})

    const [submittedResults, setSubmittedResults] =
        useState<SubmittedResults>({})

    const [
        currentQuestionIndex,
        setCurrentQuestionIndex,
    ] = useState(0)

    const [isLoading, setIsLoading] =
        useState(true)

    const [isSubmitting, setIsSubmitting] =
        useState(false)

    const [isFinished, setIsFinished] =
        useState(false)

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null)

    const [timeLeft, setTimeLeft] =
        useState(EXAM_DURATION_SECONDS)

    const autoSubmitStarted =
        useRef(false)

    const loadExam = useCallback(async () => {
        if (!courseId) {
            setErrorMessage(
                'Brak identyfikatora kursu.',
            )
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            setErrorMessage(null)

            const questionsPromise =
                isMistakesMode
                    ? getMistakeQuestionsWithAnswers(
                        courseId,
                    )
                    : getQuestionsWithAnswers(
                        courseId,
                    )

            const [
                coursesData,
                questionsData,
            ] = await Promise.all([
                getCourses(),
                questionsPromise,
            ])

            const selectedCourse =
                coursesData.find(
                    (item) =>
                        item.id === courseId,
                ) ?? null

            if (!selectedCourse) {
                setCourse(null)
                setQuestions([])

                setErrorMessage(
                    'Nie znaleziono wybranego kursu.',
                )

                return
            }

            setCourse(selectedCourse)

            if (questionsData.length === 0) {
                setQuestions([])

                setErrorMessage(
                    isMistakesMode
                        ? 'Nie masz obecnie żadnych pytań do powtórki dla tego kursu.'
                        : 'Dla tego kursu nie dodano jeszcze pytań egzaminacyjnych.',
                )

                return
            }

            if (
                !isMistakesMode &&
                questionsData.length <
                EXAM_QUESTION_COUNT
            ) {
                setQuestions([])

                setErrorMessage(
                    `Pełny egzamin wymaga ${EXAM_QUESTION_COUNT} pytań. Dostępnych jest obecnie ${questionsData.length}.`,
                )

                return
            }

            const shuffledQuestions =
                shuffleExamQuestions(
                    questionsData,
                )

            const examQuestions =
                isMistakesMode
                    ? shuffledQuestions
                    : shuffledQuestions.slice(
                        0,
                        EXAM_QUESTION_COUNT,
                    )

            setQuestions(examQuestions)

            setSelectedAnswers({})
            setSubmittedResults({})
            setCurrentQuestionIndex(0)
            setIsFinished(false)
            setTimeLeft(
                EXAM_DURATION_SECONDS,
            )

            autoSubmitStarted.current =
                false
        } catch (error) {
            console.error(
                isMistakesMode
                    ? 'Nie udało się pobrać pytań do powtórki:'
                    : 'Nie udało się pobrać egzaminu:',
                error,
            )

            setCourse(null)
            setQuestions([])
            setSelectedAnswers({})
            setSubmittedResults({})

            setErrorMessage(
                isMistakesMode
                    ? 'Nie udało się pobrać pytań do powtórki.'
                    : 'Nie udało się pobrać egzaminu.',
            )
        } finally {
            setIsLoading(false)
        }
    }, [
        courseId,
        isMistakesMode,
    ])

    useEffect(() => {
        void loadExam()
    }, [loadExam])

    const currentQuestion =
        questions[currentQuestionIndex]

    const selectedAnswerId =
        currentQuestion
            ? selectedAnswers[
            currentQuestion.id
            ]
            : undefined

    const answeredQuestionsCount =
        Object.keys(
            selectedAnswers,
        ).length

    const progressPercent =
        questions.length === 0
            ? 0
            : Math.round(
                ((currentQuestionIndex + 1) /
                    questions.length) *
                100,
            )

    const score = useMemo(() => {
        return Object.values(
            submittedResults,
        ).filter(
            (result) =>
                result.isCorrect,
        ).length
    }, [submittedResults])

    const scorePercent =
        questions.length === 0
            ? 0
            : Math.round(
                (score /
                    questions.length) *
                100,
            )

    const formattedTime =
        useMemo(() => {
            const minutes =
                Math.floor(
                    timeLeft / 60,
                )

            const seconds =
                timeLeft % 60

            return `${String(
                minutes,
            ).padStart(
                2,
                '0',
            )}:${String(
                seconds,
            ).padStart(2, '0')}`
        }, [timeLeft])

    const isTimeLow =
        !isMistakesMode &&
        timeLeft <= 5 * 60

    function selectAnswer(
        questionId: string,
        answerId: string,
    ) {
        if (
            isSubmitting ||
            isFinished
        ) {
            return
        }

        setSelectedAnswers(
            (current) => ({
                ...current,
                [questionId]:
                    answerId,
            }),
        )
    }

    function goToPreviousQuestion() {
        if (isSubmitting) {
            return
        }

        setCurrentQuestionIndex(
            (current) =>
                Math.max(
                    current - 1,
                    0,
                ),
        )
    }

    const finishExam =
        useCallback(
            async (
                force = false,
            ) => {
                if (
                    isSubmitting ||
                    isFinished
                ) {
                    return
                }

                const answeredItems =
                    questions
                        .map(
                            (
                                question,
                            ) => ({
                                questionId:
                                    question.id,
                                answerId:
                                    selectedAnswers[
                                    question
                                        .id
                                    ],
                            }),
                        )
                        .filter(
                            (
                                answer,
                            ): answer is {
                                questionId: string
                                answerId: string
                            } =>
                                Boolean(
                                    answer.answerId,
                                ),
                        )

                const hasMissingAnswer =
                    answeredItems.length <
                    questions.length

                if (
                    hasMissingAnswer &&
                    !force
                ) {
                    Alert.alert(
                        isMistakesMode
                            ? 'Nieukończona powtórka'
                            : 'Nieukończony egzamin',
                        `Odpowiedziałeś na ${answeredItems.length} z ${questions.length} pytań.`,
                        [
                            {
                                text: 'Wróć do pytań',
                                style: 'cancel',
                            },
                            {
                                text: isMistakesMode
                                    ? 'Zakończ mimo to'
                                    : 'Oddaj egzamin',
                                style: 'destructive',
                                onPress:
                                    () => {
                                        void finishExam(
                                            true,
                                        )
                                    },
                            },
                        ],
                    )

                    return
                }

                try {
                    setIsSubmitting(
                        true,
                    )

                    /*
                     * Po upływie czasu wysyłamy wyłącznie
                     * odpowiedzi faktycznie udzielone.
                     *
                     * Brakujące pytania nie znajdą się
                     * w submittedResults, więc nie zwiększą
                     * wyniku i zostaną potraktowane jako
                     * niepoprawne przy obliczaniu 65/75.
                     */
                    if (
                        answeredItems.length >
                        0
                    ) {
                        const results =
                            await submitExamAnswers(
                                {
                                    answers:
                                        answeredItems,
                                    attemptType,
                                },
                            )

                        const resultsByQuestion =
                            results.reduce<SubmittedResults>(
                                (
                                    resultMap,
                                    result,
                                ) => {
                                    resultMap[
                                        result.questionId
                                    ] =
                                        result

                                    return resultMap
                                },
                                {},
                            )

                        setSubmittedResults(
                            resultsByQuestion,
                        )
                    } else {
                        setSubmittedResults(
                            {},
                        )
                    }

                    setIsFinished(
                        true,
                    )
                } catch (error) {
                    console.error(
                        isMistakesMode
                            ? 'Nie udało się zapisać powtórki:'
                            : 'Nie udało się zapisać egzaminu:',
                        error,
                    )

                    Alert.alert(
                        'Błąd zapisu',
                        isMistakesMode
                            ? 'Nie udało się zapisać wyników powtórki. Spróbuj ponownie.'
                            : 'Nie udało się zapisać wyników egzaminu. Spróbuj ponownie.',
                    )
                } finally {
                    setIsSubmitting(
                        false,
                    )
                }
            },
            [
                attemptType,
                isFinished,
                isMistakesMode,
                isSubmitting,
                questions,
                selectedAnswers,
            ],
        )

    useEffect(() => {
        if (
            isMistakesMode ||
            isLoading ||
            isFinished ||
            isSubmitting ||
            questions.length === 0
        ) {
            return
        }

        const timer =
            setInterval(() => {
                setTimeLeft(
                    (current) =>
                        Math.max(
                            current -
                            1,
                            0,
                        ),
                )
            }, 1000)

        return () =>
            clearInterval(timer)
    }, [
        isMistakesMode,
        isLoading,
        isFinished,
        isSubmitting,
        questions.length,
    ])

    useEffect(() => {
        if (
            isMistakesMode ||
            isLoading ||
            isFinished ||
            isSubmitting ||
            questions.length === 0 ||
            timeLeft > 0 ||
            autoSubmitStarted.current
        ) {
            return
        }

        autoSubmitStarted.current =
            true

        void finishExam(true)
    }, [
        finishExam,
        isFinished,
        isLoading,
        isMistakesMode,
        isSubmitting,
        questions.length,
        timeLeft,
    ])

    async function goToNextQuestion() {
        if (
            !selectedAnswerId ||
            isSubmitting
        ) {
            return
        }

        const isLastQuestion =
            currentQuestionIndex ===
            questions.length - 1

        if (isLastQuestion) {
            await finishExam()
            return
        }

        setCurrentQuestionIndex(
            (current) =>
                Math.min(
                    current + 1,
                    questions.length -
                    1,
                ),
        )
    }

    function restartExam() {
        void loadExam()
    }

    const questionImageUrl =
        currentQuestion?.image_url &&
            courseId
            ? getQuestionImageUrl(
                courseId,
                currentQuestion.image_url,
            )
            : undefined

    if (isLoading) {
        return (
            <LoadingState
                isMistakesMode={
                    isMistakesMode
                }
            />
        )
    }

    if (
        errorMessage ||
        !course ||
        questions.length === 0
    ) {
        const noMistakes =
            isMistakesMode &&
            course &&
            questions.length === 0

        return (
            <UnavailableState
                noMistakes={
                    Boolean(
                        noMistakes,
                    )
                }
                isMistakesMode={
                    isMistakesMode
                }
                message={
                    errorMessage ??
                    'Nie znaleziono pytań dla tego kursu.'
                }
                onBack={() =>
                    router.back()
                }
                onRetry={() =>
                    void loadExam()
                }
            />
        )
    }

    if (isFinished) {
        const isPassed =
            isMistakesMode
                ? scorePercent >= 75
                : score >=
                EXAM_PASSING_SCORE

        const unansweredCount =
            Math.max(
                questions.length -
                answeredQuestionsCount,
                0,
            )

        const incorrectCount =
            questions.length -
            score

        return (
            <ResultScreen
                score={score}
                scorePercent={
                    scorePercent
                }
                questionsCount={
                    questions.length
                }
                incorrectCount={
                    incorrectCount
                }
                unansweredCount={
                    unansweredCount
                }
                isPassed={isPassed}
                isMistakesMode={
                    isMistakesMode
                }
                questions={
                    questions
                }
                selectedAnswers={
                    selectedAnswers
                }
                submittedResults={
                    submittedResults
                }
                onBack={() =>
                    router.back()
                }
                onRestart={
                    restartExam
                }
            />
        )
    }

    return (
        <View className="flex-1 bg-[#F8FAFC]">
            <BackgroundDecoration />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 54,
                    paddingBottom: 40,
                }}
                showsVerticalScrollIndicator={
                    false
                }
            >
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <Pressable
                            onPress={() =>
                                router.back()
                            }
                            disabled={
                                isSubmitting
                            }
                            className="h-11 w-11 items-center justify-center rounded-[16px] border border-[#E4E9F2] bg-white"
                        >
                            <ArrowLeft
                                size={20}
                                color="#293681"
                                strokeWidth={
                                    2.4
                                }
                            />
                        </Pressable>

                        <View className="ml-3">
                            <Text className="text-[11px] font-bold uppercase tracking-[1.3px] text-[#8B92A5]">
                                {isMistakesMode
                                    ? 'Powtórka'
                                    : 'Egzamin próbny'}
                            </Text>

                            <Text
                                className="mt-0.5 max-w-[180px] text-sm font-semibold text-[#293681]"
                                numberOfLines={
                                    1
                                }
                            >
                                {
                                    course.name
                                }
                            </Text>
                        </View>
                    </View>

                    {!isMistakesMode ? (
                        <View
                            className={`flex-row items-center rounded-full px-3.5 py-2.5 ${isTimeLow
                                ? 'bg-[#FFF0F0]'
                                : 'bg-[#EEF3FC]'
                                }`}
                        >
                            <Clock3
                                size={16}
                                color={
                                    isTimeLow
                                        ? '#C65353'
                                        : '#4274D9'
                                }
                                strokeWidth={
                                    2.3
                                }
                            />

                            <Text
                                className={`ml-2 text-[14px] font-bold tabular-nums ${isTimeLow
                                    ? 'text-[#B24444]'
                                    : 'text-[#293681]'
                                    }`}
                            >
                                {
                                    formattedTime
                                }
                            </Text>
                        </View>
                    ) : null}
                </View>

                {isMistakesMode ? (
                    <Text className="mt-5 text-sm leading-6 text-[#747B8F]">
                        Rozwiąż ponownie
                        pytania, przy których
                        wcześniej popełniłeś
                        błąd.
                    </Text>
                ) : null}

                <View className="mt-7">
                    <View className="mb-2.5 flex-row items-center justify-between">
                        <Text className="text-[13px] font-semibold text-[#747B8F]">
                            Pytanie{' '}
                            {currentQuestionIndex +
                                1}{' '}
                            z{' '}
                            {
                                questions.length
                            }
                        </Text>

                        <Text className="text-[13px] font-bold text-[#4274D9]">
                            {answeredQuestionsCount}{' '}
                            odpowiedzi
                        </Text>
                    </View>

                    <View className="h-2 overflow-hidden rounded-full bg-[#E5EAF2]">
                        <View
                            className="h-full rounded-full bg-[#4274D9]"
                            style={{
                                width: `${progressPercent}%`,
                            }}
                        />
                    </View>
                </View>

                <View className="mt-7">
                    <Text className="text-[25px] font-semibold leading-[33px] tracking-[-0.5px] text-[#293681]">
                        {
                            currentQuestion.question_text
                        }
                    </Text>

                    {questionImageUrl ? (
                        <View className="mt-6 overflow-hidden rounded-[24px] border border-[#E4E9F2] bg-white">
                            <Image
                                source={{
                                    uri: questionImageUrl,
                                }}
                                className="h-[230px] w-full"
                                resizeMode="contain"
                            />
                        </View>
                    ) : null}

                    <View className="mt-7 gap-3">
                        {currentQuestion.question_answers.map(
                            (
                                answer,
                                answerIndex,
                            ) => {
                                const isSelected =
                                    answer.id ===
                                    selectedAnswerId

                                const answerLetter =
                                    String.fromCharCode(
                                        65 +
                                        answerIndex,
                                    )

                                return (
                                    <Pressable
                                        key={
                                            answer.id
                                        }
                                        disabled={
                                            isSubmitting
                                        }
                                        onPress={() =>
                                            selectAnswer(
                                                currentQuestion.id,
                                                answer.id,
                                            )
                                        }
                                        className={`flex-row items-center rounded-[20px] border px-4 py-4 ${isSelected
                                            ? 'border-[#4274D9] bg-[#EEF3FC]'
                                            : 'border-[#E2E7EF] bg-white'
                                            }`}
                                        style={({
                                            pressed,
                                        }) => ({
                                            opacity:
                                                pressed
                                                    ? 0.9
                                                    : 1,
                                        })}
                                    >
                                        <View
                                            className={`h-10 w-10 items-center justify-center rounded-[14px] ${isSelected
                                                ? 'bg-[#4274D9]'
                                                : 'bg-[#F4F6FA]'
                                                }`}
                                        >
                                            {isSelected ? (
                                                <Check
                                                    size={
                                                        18
                                                    }
                                                    color="#FFFFFF"
                                                    strokeWidth={
                                                        2.8
                                                    }
                                                />
                                            ) : (
                                                <Text className="text-sm font-bold text-[#7D8599]">
                                                    {
                                                        answerLetter
                                                    }
                                                </Text>
                                            )}
                                        </View>

                                        <Text
                                            className={`ml-4 flex-1 text-[15px] font-semibold leading-6 ${isSelected
                                                ? 'text-[#293681]'
                                                : 'text-[#515B71]'
                                                }`}
                                        >
                                            {
                                                answer.answer_text
                                            }
                                        </Text>
                                    </Pressable>
                                )
                            },
                        )}
                    </View>
                </View>

                <View className="mt-8 flex-row gap-3">
                    <Pressable
                        onPress={
                            goToPreviousQuestion
                        }
                        disabled={
                            currentQuestionIndex ===
                            0 ||
                            isSubmitting
                        }
                        className={`h-14 flex-1 flex-row items-center justify-center rounded-[18px] border ${currentQuestionIndex ===
                            0 ||
                            isSubmitting
                            ? 'border-[#E8EBF0] bg-[#F5F7FA]'
                            : 'border-[#DCE2EC] bg-white'
                            }`}
                    >
                        <ChevronLeft
                            size={20}
                            color={
                                currentQuestionIndex ===
                                    0 ||
                                    isSubmitting
                                    ? '#B5BBC7'
                                    : '#293681'
                            }
                        />

                        <Text
                            className={`ml-1 text-sm font-bold ${currentQuestionIndex ===
                                0 ||
                                isSubmitting
                                ? 'text-[#B5BBC7]'
                                : 'text-[#293681]'
                                }`}
                        >
                            Wstecz
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() =>
                            void goToNextQuestion()
                        }
                        disabled={
                            !selectedAnswerId ||
                            isSubmitting
                        }
                        className={`h-14 flex-[1.65] flex-row items-center justify-center rounded-[18px] ${selectedAnswerId &&
                            !isSubmitting
                            ? 'bg-[#293681]'
                            : 'bg-[#C7CDDA]'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <ActivityIndicator
                                    size="small"
                                    color="#FFFFFF"
                                />

                                <Text className="ml-2 text-sm font-bold text-white">
                                    Zapisywanie...
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text className="mr-1 text-sm font-bold text-white">
                                    {currentQuestionIndex ===
                                        questions.length -
                                        1
                                        ? isMistakesMode
                                            ? 'Zakończ'
                                            : 'Oddaj egzamin'
                                        : 'Dalej'}
                                </Text>

                                <ChevronRight
                                    size={20}
                                    color="#FFFFFF"
                                />
                            </>
                        )}
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    )
}

type ResultScreenProps = {
    score: number
    scorePercent: number
    questionsCount: number
    incorrectCount: number
    unansweredCount: number
    isPassed: boolean
    isMistakesMode: boolean
    questions: QuestionWithAnswers[]
    selectedAnswers: SelectedAnswers
    submittedResults: SubmittedResults
    onBack: () => void
    onRestart: () => void
}

function ResultScreen({
    score,
    scorePercent,
    questionsCount,
    incorrectCount,
    unansweredCount,
    isPassed,
    isMistakesMode,
    questions,
    selectedAnswers,
    submittedResults,
    onBack,
    onRestart,
}: ResultScreenProps) {
    return (
        <View className="flex-1 bg-[#F8FAFC]">
            <BackgroundDecoration />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 54,
                    paddingBottom: 60,
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
                    <View className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#4274D9]/35" />

                    <View className="absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-[#95CCDD]/10" />

                    <View className="z-10">
                        <View className="flex-row items-start justify-between">
                            <View className="flex-1 pr-4">
                                <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#95CCDD]">
                                    {isMistakesMode
                                        ? 'Wynik powtórki'
                                        : 'Wynik egzaminu'}
                                </Text>

                                <View className="mt-3 flex-row items-end">
                                    <Text className="text-[52px] font-semibold leading-[58px] tracking-[-2px] text-white">
                                        {score}
                                    </Text>

                                    <Text className="mb-2 ml-1 text-[20px] font-semibold text-white/50">
                                        /
                                        {
                                            questionsCount
                                        }
                                    </Text>
                                </View>
                            </View>


                        </View>

                        <Text className="mt-4 text-[24px] font-semibold text-white">
                            {isMistakesMode
                                ? isPassed
                                    ? 'Dobra powtórka'
                                    : 'Warto spróbować ponownie'
                                : isPassed
                                    ? 'Egzamin zdany'
                                    : 'Egzamin niezdany'}
                        </Text>

                        <Text className="mt-2 text-sm leading-6 text-white/65">
                            {isMistakesMode
                                ? `Poprawnie odpowiedziałeś na ${score} z ${questionsCount} pytań.`
                                : isPassed
                                    ? 'Osiągnąłeś wynik wymagany do zaliczenia egzaminu.'
                                    : `Do zaliczenia potrzebujesz minimum ${EXAM_PASSING_SCORE} poprawnych odpowiedzi.`}
                        </Text>
                    </View>
                </View>

                <View className="mt-5 rounded-[26px] border border-[#E3E8F1] bg-white p-5">
                    <ResultRow
                        label="Poprawne odpowiedzi"
                        value={`${score}`}
                    />

                    <ResultDivider />

                    <ResultRow
                        label="Błędne lub pominięte"
                        value={`${incorrectCount}`}
                    />

                    {unansweredCount >
                        0 ? (
                        <>
                            <ResultDivider />

                            <ResultRow
                                label="Bez odpowiedzi"
                                value={`${unansweredCount}`}
                            />
                        </>
                    ) : null}

                    <ResultDivider />

                    <ResultRow
                        label="Wynik"
                        value={`${scorePercent}%`}
                    />

                    {!isMistakesMode ? (
                        <>
                            <ResultDivider />

                            <ResultRow
                                label="Próg zaliczenia"
                                value={`${EXAM_PASSING_SCORE} / ${EXAM_QUESTION_COUNT}`}
                                accent
                            />
                        </>
                    ) : null}
                </View>

                <Pressable
                    onPress={onRestart}
                    className="mt-5 flex-row items-center justify-center rounded-[18px] bg-[#293681] px-5 py-4"
                >
                    <RotateCcw
                        size={19}
                        color="#FFFFFF"
                    />

                    <Text className="ml-2 text-[15px] font-bold text-white">
                        {isMistakesMode
                            ? 'Powtórz ponownie'
                            : 'Nowy egzamin'}
                    </Text>
                </Pressable>

                <Text className="mb-4 mt-10 text-[27px] font-semibold tracking-[-0.7px] text-[#293681]">
                    Twoje odpowiedzi
                </Text>

                <View className="gap-4">
                    {questions.map(
                        (
                            question,
                            questionIndex,
                        ) => {
                            const chosenAnswerId =
                                selectedAnswers[
                                question.id
                                ]

                            const chosenAnswer =
                                question.question_answers.find(
                                    (
                                        answer,
                                    ) =>
                                        answer.id ===
                                        chosenAnswerId,
                                )

                            const result =
                                submittedResults[
                                question.id
                                ]

                            const isCorrect =
                                result?.isCorrect ===
                                true

                            const wasAnswered =
                                Boolean(
                                    chosenAnswerId,
                                )

                            return (
                                <View
                                    key={
                                        question.id
                                    }
                                    className="rounded-[24px] border border-[#E3E8F1] bg-white p-5"
                                >
                                    <View className="flex-row items-start">
                                        <View
                                            className={`h-10 w-10 items-center justify-center rounded-[14px] ${isCorrect
                                                ? 'bg-[#EEF7F7]'
                                                : 'bg-[#FFF1F1]'
                                                }`}
                                        >
                                            {isCorrect ? (
                                                <CheckCircle2
                                                    size={
                                                        21
                                                    }
                                                    color="#4274D9"
                                                />
                                            ) : (
                                                <XCircle
                                                    size={
                                                        21
                                                    }
                                                    color="#C65353"
                                                />
                                            )}
                                        </View>

                                        <View className="ml-3 flex-1">
                                            <Text className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#9299AB]">
                                                Pytanie{' '}
                                                {questionIndex +
                                                    1}
                                            </Text>

                                            <Text className="mt-1.5 text-[16px] font-semibold leading-6 text-[#293681]">
                                                {
                                                    question.question_text
                                                }
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="mt-4 rounded-[17px] bg-[#F6F8FB] p-4">
                                        <Text className="text-[11px] font-bold uppercase tracking-[1px] text-[#9299AB]">
                                            Twoja
                                            odpowiedź
                                        </Text>

                                        <Text
                                            className={`mt-1.5 text-sm font-semibold leading-5 ${isCorrect
                                                ? 'text-[#293681]'
                                                : 'text-[#B94C4C]'
                                                }`}
                                        >
                                            {wasAnswered
                                                ? chosenAnswer?.answer_text ??
                                                'Brak odpowiedzi'
                                                : 'Brak odpowiedzi'}
                                        </Text>
                                    </View>

                                    {question.explanation ? (
                                        <View className="mt-3 rounded-[17px] bg-[#EEF3FC] p-4">
                                            <Text className="text-sm leading-6 text-[#687087]">
                                                {
                                                    question.explanation
                                                }
                                            </Text>
                                        </View>
                                    ) : null}
                                </View>
                            )
                        },
                    )}
                </View>
            </ScrollView>
        </View>
    )
}

function ResultRow({
    label,
    value,
    accent = false,
}: {
    label: string
    value: string
    accent?: boolean
}) {
    return (
        <View className="flex-row items-center justify-between">
            <Text className="text-sm text-[#747B8F]">
                {label}
            </Text>

            <Text
                className={`text-sm font-bold ${accent
                    ? 'text-[#4274D9]'
                    : 'text-[#293681]'
                    }`}
            >
                {value}
            </Text>
        </View>
    )
}

function ResultDivider() {
    return (
        <View className="my-4 h-px bg-[#EDF0F5]" />
    )
}

function LoadingState({
    isMistakesMode,
}: {
    isMistakesMode: boolean
}) {
    return (
        <View className="flex-1 items-center justify-center bg-[#F8FAFC] px-6">
            <View className="h-16 w-16 items-center justify-center rounded-[22px] border border-[#E3E8F1] bg-white">
                <ActivityIndicator
                    size="large"
                    color="#4274D9"
                />
            </View>

            <Text className="mt-5 text-[17px] font-semibold text-[#293681]">
                {isMistakesMode
                    ? 'Pobieranie powtórki...'
                    : 'Przygotowujemy egzamin...'}
            </Text>

            <Text className="mt-2 text-center text-sm text-[#747B8F]">
                {isMistakesMode
                    ? 'Ładujemy pytania, które wymagają ponownej odpowiedzi.'
                    : 'Losujemy 75 pytań z dostępnej bazy.'}
            </Text>
        </View>
    )
}

function UnavailableState({
    noMistakes,
    isMistakesMode,
    message,
    onBack,
    onRetry,
}: {
    noMistakes: boolean
    isMistakesMode: boolean
    message: string
    onBack: () => void
    onRetry: () => void
}) {
    return (
        <View className="flex-1 bg-[#F8FAFC] px-6 pt-14">
            <Pressable
                onPress={onBack}
                className="h-11 w-11 items-center justify-center rounded-[16px] border border-[#E3E8F1] bg-white"
            >
                <X
                    size={20}
                    color="#293681"
                />
            </Pressable>

            <View className="mt-8 rounded-[28px] border border-[#E3E8F1] bg-white p-6">
                <View className="h-14 w-14 items-center justify-center rounded-[18px] bg-[#EEF3FC]">
                    {noMistakes ? (
                        <CheckCircle2
                            size={27}
                            color="#4274D9"
                        />
                    ) : (
                        <ClipboardCheck
                            size={27}
                            color="#4274D9"
                        />
                    )}
                </View>

                <Text className="mt-5 text-[23px] font-semibold text-[#293681]">
                    {noMistakes
                        ? 'Wszystko powtórzone'
                        : isMistakesMode
                            ? 'Powtórka niedostępna'
                            : 'Egzamin niedostępny'}
                </Text>

                <Text className="mt-2 text-sm leading-6 text-[#747B8F]">
                    {message}
                </Text>

                <Pressable
                    onPress={
                        noMistakes
                            ? onBack
                            : onRetry
                    }
                    className="mt-6 flex-row items-center justify-center rounded-[18px] bg-[#293681] px-4 py-4"
                >
                    {noMistakes ? (
                        <ArrowLeft
                            size={18}
                            color="#FFFFFF"
                        />
                    ) : (
                        <RotateCcw
                            size={18}
                            color="#FFFFFF"
                        />
                    )}

                    <Text className="ml-2 font-bold text-white">
                        {noMistakes
                            ? 'Wróć do egzaminów'
                            : 'Spróbuj ponownie'}
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}

function BackgroundDecoration() {
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