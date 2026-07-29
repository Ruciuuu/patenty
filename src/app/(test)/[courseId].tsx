import {
    useLocalSearchParams,
    useRouter,
} from 'expo-router'
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    ChevronRight,
    Lightbulb,
    X
} from 'lucide-react-native'
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native'

import { BackgroundDecoration, ResultScreen } from '@/components/(test)/result-screen'
import { ErrorState, LoadingState } from '@/components/(test)/states'
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
    type SubmittedQuestionResult,
} from '@/services/question-attempts.service'
import {
    getQuestionsWithAnswers,
    type QuestionWithAnswers,
} from '@/services/questions.service'

type QuizMode = 'quick' | 'learning'

type SelectedAnswers = Record<string, string>

type QuizResults = Record<
    string,
    SubmittedQuestionResult
>

type ResultWithCorrectAnswer =
    SubmittedQuestionResult & {
        correctAnswerId?: string | null
        correct_answer_id?: string | null
    }

type AnswerCorrectFields = {
    is_correct?: boolean
    isCorrect?: boolean
}

const QUICK_QUIZ_COUNT = 10
const LEARNING_QUIZ_COUNT = 20

function getCorrectAnswerId(
    question: QuestionWithAnswers,
    result?: SubmittedQuestionResult,
): string | undefined {
    /*
     * Najpierw próbujemy pobrać ID poprawnej odpowiedzi
     * z odpowiedzi backendu.
     */
    if (result) {
        const extendedResult =
            result as ResultWithCorrectAnswer

        const resultCorrectAnswerId =
            extendedResult.correctAnswerId ??
            extendedResult.correct_answer_id

        if (resultCorrectAnswerId) {
            return resultCorrectAnswerId
        }
    }

    /*
     * Jeżeli backend zwraca przy odpowiedziach
     * is_correct / isCorrect, możemy znaleźć ją tutaj.
     */
    const correctAnswer =
        question.question_answers.find(
            (answer) => {
                const extendedAnswer =
                    answer as typeof answer &
                    AnswerCorrectFields

                return (
                    extendedAnswer.is_correct === true ||
                    extendedAnswer.isCorrect === true
                )
            },
        )

    return correctAnswer?.id
}

export default function TestScreen() {
    const router = useRouter()

    const params = useLocalSearchParams<{
        courseId?: string | string[]
        mode?: string | string[]
        count?: string | string[]
    }>()

    const courseId = getSingleParam(
        params.courseId,
    )

    const requestedMode = getSingleParam(
        params.mode,
    )

    const requestedCount = Number(
        getSingleParam(params.count),
    )

    const quizMode: QuizMode =
        requestedMode === 'learning'
            ? 'learning'
            : 'quick'

    const defaultQuestionCount =
        quizMode === 'learning'
            ? LEARNING_QUIZ_COUNT
            : QUICK_QUIZ_COUNT

    const questionCount =
        Number.isFinite(requestedCount) &&
            requestedCount > 0
            ? requestedCount
            : defaultQuestionCount

    const [course, setCourse] =
        useState<Course | null>(null)

    const [questions, setQuestions] =
        useState<QuestionWithAnswers[]>([])

    const [
        selectedAnswers,
        setSelectedAnswers,
    ] = useState<SelectedAnswers>({})

    const [results, setResults] =
        useState<QuizResults>({})

    const [
        currentQuestionIndex,
        setCurrentQuestionIndex,
    ] = useState(0)

    const [isLoading, setIsLoading] =
        useState(true)

    const [isChecking, setIsChecking] =
        useState(false)

    const [isFinished, setIsFinished] =
        useState(false)

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null)

    const loadQuiz = useCallback(async () => {
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

            const [
                coursesData,
                questionsData,
            ] = await Promise.all([
                getCourses(),

                getQuestionsWithAnswers(
                    courseId,
                ),
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

            if (
                questionsData.length === 0
            ) {
                setQuestions([])

                setErrorMessage(
                    'Dla tego kursu nie dodano jeszcze pytań.',
                )

                return
            }

            const shuffled =
                shuffleExamQuestions(
                    questionsData,
                )

            const quizQuestions =
                shuffled.slice(
                    0,
                    Math.min(
                        questionCount,
                        shuffled.length,
                    ),
                )

            setQuestions(
                quizQuestions,
            )

            setSelectedAnswers({})
            setResults({})
            setCurrentQuestionIndex(0)
            setIsFinished(false)
        } catch (error) {
            console.error(
                'Nie udało się pobrać testu:',
                error,
            )

            setCourse(null)
            setQuestions([])
            setSelectedAnswers({})
            setResults({})

            setErrorMessage(
                'Nie udało się przygotować testu.',
            )
        } finally {
            setIsLoading(false)
        }
    }, [
        courseId,
        questionCount,
    ])

    useEffect(() => {
        void loadQuiz()
    }, [loadQuiz])

    const currentQuestion =
        questions[currentQuestionIndex]

    const selectedAnswerId =
        currentQuestion
            ? selectedAnswers[
            currentQuestion.id
            ]
            : undefined

    const currentResult =
        currentQuestion
            ? results[
            currentQuestion.id
            ]
            : undefined

    const isAnswerChecked =
        Boolean(currentResult)

    const correctAnswerId =
        currentQuestion
            ? getCorrectAnswerId(
                currentQuestion,
                currentResult,
            )
            : undefined

    const correctAnswersCount =
        useMemo(() => {
            return Object.values(
                results,
            ).filter(
                (result) =>
                    result.isCorrect,
            ).length
        }, [results])

    const checkedQuestionsCount =
        Object.keys(results).length

    const incorrectAnswersCount =
        checkedQuestionsCount -
        correctAnswersCount

    const progressPercent =
        questions.length === 0
            ? 0
            : Math.round(
                ((currentQuestionIndex +
                    1) /
                    questions.length) *
                100,
            )

    const questionImageUrl =
        currentQuestion?.image_url &&
            courseId
            ? getQuestionImageUrl(
                courseId,
                currentQuestion.image_url,
            )
            : undefined

    function selectAnswer(
        questionId: string,
        answerId: string,
    ) {
        if (
            isChecking ||
            isAnswerChecked
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

    async function checkAnswer() {
        if (
            !currentQuestion ||
            !selectedAnswerId ||
            isChecking ||
            isAnswerChecked
        ) {
            return
        }

        try {
            setIsChecking(true)

            const submitted =
                await submitExamAnswers({
                    answers: [
                        {
                            questionId:
                                currentQuestion.id,

                            answerId:
                                selectedAnswerId,
                        },
                    ],

                    /*
                     * Docelowo najlepiej dodać
                     * attemptType: 'test'.
                     */
                    attemptType: 'exam',
                })

            const result =
                submitted[0]

            if (!result) {
                throw new Error(
                    'Brak wyniku odpowiedzi.',
                )
            }

            setResults(
                (current) => ({
                    ...current,

                    [currentQuestion.id]:
                        result,
                }),
            )
        } catch (error) {
            console.error(
                'Nie udało się sprawdzić odpowiedzi:',
                error,
            )
        } finally {
            setIsChecking(false)
        }
    }

    function goToNextQuestion() {
        if (!isAnswerChecked) {
            return
        }

        const isLastQuestion =
            currentQuestionIndex ===
            questions.length - 1

        if (isLastQuestion) {
            setIsFinished(true)
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

    function restartQuiz() {
        void loadQuiz()
    }

    function repeatMistakes() {
        const incorrectQuestions =
            questions.filter(
                (question) =>
                    results[
                        question.id
                    ]?.isCorrect ===
                    false,
            )

        if (
            incorrectQuestions.length ===
            0
        ) {
            return
        }

        setQuestions(
            shuffleExamQuestions(
                incorrectQuestions,
            ),
        )

        setSelectedAnswers({})
        setResults({})
        setCurrentQuestionIndex(0)
        setIsFinished(false)
    }

    if (isLoading) {
        return <LoadingState />
    }

    if (
        errorMessage ||
        !course ||
        questions.length === 0
    ) {
        return (
            <ErrorState
                message={
                    errorMessage ??
                    'Nie znaleziono pytań.'
                }
                onBack={() =>
                    router.back()
                }
                onRetry={() =>
                    void loadQuiz()
                }
            />
        )
    }

    if (isFinished) {
        return (
            <ResultScreen
                mode={quizMode}
                correctAnswers={
                    correctAnswersCount
                }
                incorrectAnswers={
                    incorrectAnswersCount
                }
                questionsCount={
                    questions.length
                }
                hasMistakes={
                    incorrectAnswersCount > 0
                }
                onBack={() =>
                    router.back()
                }
                onRestart={
                    restartQuiz
                }
                onRepeatMistakes={
                    repeatMistakes
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
                {/* HEADER */}

                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <Pressable
                            onPress={() =>
                                router.back()
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
                                {quizMode ===
                                    'learning'
                                    ? 'Tryb nauki'
                                    : 'Szybki test'}
                            </Text>

                            <Text
                                className="mt-0.5 max-w-[185px] text-sm font-semibold text-[#293681]"
                                numberOfLines={
                                    1
                                }
                            >
                                {course.name}
                            </Text>
                        </View>
                    </View>

                    <View className="rounded-full bg-[#EEF7F7] px-3.5 py-2">
                        <Text className="text-[13px] font-bold text-[#293681]">
                            {
                                correctAnswersCount
                            }{' '}
                            ✓
                        </Text>
                    </View>
                </View>

                {/* PROGRESS */}

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
                            {progressPercent}%
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

                {/* QUESTION */}

                <View className="mt-8">
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

                    {/* ANSWERS */}

                    <View className="mt-7 gap-3">
                        {currentQuestion.question_answers.map(
                            (
                                answer,
                                answerIndex,
                            ) => {
                                const isSelected =
                                    answer.id ===
                                    selectedAnswerId

                                const isCorrectAnswer =
                                    isAnswerChecked &&
                                    answer.id ===
                                    correctAnswerId

                                const selectedIsCorrect =
                                    isSelected &&
                                    currentResult?.isCorrect ===
                                    true

                                const selectedIsWrong =
                                    isSelected &&
                                    currentResult?.isCorrect ===
                                    false

                                const answerLetter =
                                    String.fromCharCode(
                                        65 +
                                        answerIndex,
                                    )

                                let containerClass =
                                    'border-[#E2E7EF] bg-white'

                                let letterClass =
                                    'bg-[#F4F6FA]'

                                let letterTextClass =
                                    'text-[#7D8599]'

                                let answerTextClass =
                                    'text-[#515B71]'

                                /*
                                 * Zaznaczona odpowiedź
                                 * przed sprawdzeniem.
                                 */
                                if (
                                    isSelected &&
                                    !isAnswerChecked
                                ) {
                                    containerClass =
                                        'border-[#4274D9] bg-[#EEF3FC]'

                                    letterClass =
                                        'bg-[#4274D9]'

                                    letterTextClass =
                                        'text-white'

                                    answerTextClass =
                                        'text-[#293681]'
                                }

                                /*
                                 * Wybrana poprawnie.
                                 */
                                if (
                                    selectedIsCorrect
                                ) {
                                    containerClass =
                                        'border-[#95CCDD] bg-[#EEF7F7]'

                                    letterClass =
                                        'bg-[#4274D9]'

                                    letterTextClass =
                                        'text-white'

                                    answerTextClass =
                                        'text-[#293681]'
                                }

                                /*
                                 * Wybrana błędnie.
                                 */
                                if (
                                    selectedIsWrong
                                ) {
                                    containerClass =
                                        'border-[#E6BABA] bg-[#FFF3F3]'

                                    letterClass =
                                        'bg-[#C65353]'

                                    letterTextClass =
                                        'text-white'

                                    answerTextClass =
                                        'text-[#A64242]'
                                }

                                /*
                                 * Jeżeli użytkownik odpowiedział źle,
                                 * pokazujemy poprawną odpowiedź.
                                 */
                                if (
                                    isCorrectAnswer &&
                                    currentResult?.isCorrect ===
                                    false
                                ) {
                                    containerClass =
                                        'border-[#95CCDD] bg-[#EEF7F7]'

                                    letterClass =
                                        'bg-[#4274D9]'

                                    letterTextClass =
                                        'text-white'

                                    answerTextClass =
                                        'text-[#293681]'
                                }

                                return (
                                    <Pressable
                                        key={
                                            answer.id
                                        }
                                        disabled={
                                            isChecking ||
                                            isAnswerChecked
                                        }
                                        onPress={() =>
                                            selectAnswer(
                                                currentQuestion.id,
                                                answer.id,
                                            )
                                        }
                                        className={`flex-row items-center rounded-[20px] border px-4 py-4 ${containerClass}`}
                                        style={({
                                            pressed,
                                        }) => ({
                                            opacity:
                                                pressed &&
                                                    !isAnswerChecked
                                                    ? 0.9
                                                    : 1,
                                        })}
                                    >
                                        <View
                                            className={`h-10 w-10 items-center justify-center rounded-[14px] ${letterClass}`}
                                        >
                                            {selectedIsWrong ? (
                                                <X
                                                    size={
                                                        18
                                                    }
                                                    color="#FFFFFF"
                                                    strokeWidth={
                                                        2.8
                                                    }
                                                />
                                            ) : isCorrectAnswer ? (
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
                                                <Text
                                                    className={`text-sm font-bold ${letterTextClass}`}
                                                >
                                                    {
                                                        answerLetter
                                                    }
                                                </Text>
                                            )}
                                        </View>

                                        <Text
                                            className={`ml-4 flex-1 text-[15px] font-semibold leading-6 ${answerTextClass}`}
                                        >
                                            {
                                                answer.answer_text
                                            }
                                        </Text>

                                        {isCorrectAnswer &&
                                            isAnswerChecked ? (
                                            <View className="ml-3 rounded-full bg-white/80 px-2.5 py-1.5">
                                                <Text className="text-[10px] font-bold uppercase tracking-[0.7px] text-[#4274D9]">
                                                    Poprawna
                                                </Text>
                                            </View>
                                        ) : null}
                                    </Pressable>
                                )
                            },
                        )}
                    </View>

                    {/* EXPLANATION */}

                    {isAnswerChecked &&
                        currentQuestion.explanation ? (
                        <View className="mt-5 flex-row items-start rounded-[20px] bg-[#EEF3FC] p-4">
                            <Lightbulb
                                size={18}
                                color="#4274D9"
                                strokeWidth={
                                    2.2
                                }
                            />

                            <View className="ml-3 flex-1">
                                <Text className="text-[11px] font-bold uppercase tracking-[1px] text-[#8B92A5]">
                                    Wyjaśnienie
                                </Text>

                                <Text className="mt-1.5 text-[14px] leading-6 text-[#59647A]">
                                    {
                                        currentQuestion.explanation
                                    }
                                </Text>
                            </View>
                        </View>
                    ) : null}
                </View>

                {/* ACTION */}

                <View className="mt-7">
                    {!isAnswerChecked ? (
                        <Pressable
                            onPress={() =>
                                void checkAnswer()
                            }
                            disabled={
                                !selectedAnswerId ||
                                isChecking
                            }
                            className={`h-14 flex-row items-center justify-center rounded-[18px] ${selectedAnswerId &&
                                !isChecking
                                ? 'bg-[#293681]'
                                : 'bg-[#C7CDDA]'
                                }`}
                        >
                            {isChecking ? (
                                <>
                                    <ActivityIndicator
                                        size="small"
                                        color="#FFFFFF"
                                    />

                                    <Text className="ml-2 text-[15px] font-bold text-white">
                                        Sprawdzanie...
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2
                                        size={19}
                                        color="#FFFFFF"
                                    />

                                    <Text className="ml-2 text-[15px] font-bold text-white">
                                        Sprawdź odpowiedź
                                    </Text>
                                </>
                            )}
                        </Pressable>
                    ) : (
                        <Pressable
                            onPress={
                                goToNextQuestion
                            }
                            className="h-14 flex-row items-center justify-center rounded-[18px] bg-[#293681]"
                        >
                            <Text className="mr-2 text-[15px] font-bold text-white">
                                {currentQuestionIndex ===
                                    questions.length -
                                    1
                                    ? 'Zobacz wynik'
                                    : 'Następne pytanie'}
                            </Text>

                            <ChevronRight
                                size={20}
                                color="#FFFFFF"
                                strokeWidth={
                                    2.4
                                }
                            />
                        </Pressable>
                    )}
                </View>
            </ScrollView>
        </View>
    )
}



