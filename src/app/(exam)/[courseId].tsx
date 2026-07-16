import React, {
    useCallback,
    useEffect,
    useMemo,
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
    useLocalSearchParams,
    useRouter,
} from 'expo-router'
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Circle,
    ClipboardCheck,
    RotateCcw,
    Trophy,
    XCircle,
} from 'lucide-react-native'

import {
    getCourses,
    type Course,
} from '@/services/courses.service'
import {
    getMistakeQuestionsWithAnswers,
    getQuestionsWithAnswers,
    type QuestionWithAnswers,
} from '@/services/questions.service'
import {
    submitExamAnswers,
    type QuestionAttemptType,
    type SubmittedQuestionResult,
} from '@/services/question-attempts.service'

type ExamMode = 'exam' | 'mistakes'

type SelectedAnswers = Record<string, string>

type SubmittedResults = Record<
    string,
    SubmittedQuestionResult
>

function getSingleParam(
    value?: string | string[]
): string | undefined {
    return Array.isArray(value)
        ? value[0]
        : value
}

function shuffleItems<T>(items: T[]): T[] {
    const shuffledItems = [...items]

    for (
        let index = shuffledItems.length - 1;
        index > 0;
        index--
    ) {
        const randomIndex = Math.floor(
            Math.random() * (index + 1)
        )

        const currentItem = shuffledItems[index]

        shuffledItems[index] =
            shuffledItems[randomIndex]

        shuffledItems[randomIndex] = currentItem
    }

    return shuffledItems
}

function shuffleQuestionAnswers(
    questions: QuestionWithAnswers[]
): QuestionWithAnswers[] {
    return questions.map((question) => ({
        ...question,
        question_answers: shuffleItems(
            question.question_answers
        ),
    }))
}

export default function ExamScreen() {
    const router = useRouter()

    const params = useLocalSearchParams<{
        courseId?: string | string[]
        mode?: string | string[]
    }>()

    const courseId = getSingleParam(
        params.courseId
    )

    const requestedMode = getSingleParam(
        params.mode
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

    const [questions, setQuestions] = useState<
        QuestionWithAnswers[]
    >([])

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

    const loadExam = useCallback(async () => {
        if (!courseId) {
            setErrorMessage(
                'Brak identyfikatora kursu.'
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
                        courseId
                    )
                    : getQuestionsWithAnswers(
                        courseId
                    )

            const [coursesData, questionsData] =
                await Promise.all([
                    getCourses(),
                    questionsPromise,
                ])

            const selectedCourse =
                coursesData.find(
                    (item) => item.id === courseId
                ) ?? null

            if (!selectedCourse) {
                setCourse(null)
                setQuestions([])

                setErrorMessage(
                    'Nie znaleziono wybranego kursu.'
                )

                return
            }

            setCourse(selectedCourse)

            if (questionsData.length === 0) {
                setQuestions([])

                setErrorMessage(
                    isMistakesMode
                        ? 'Nie masz obecnie żadnych pytań do powtórki dla tego kursu.'
                        : 'Dla tego kursu nie dodano jeszcze pytań egzaminacyjnych.'
                )

                return
            }

            setQuestions(
                shuffleQuestionAnswers(
                    questionsData
                )
            )

            setSelectedAnswers({})
            setSubmittedResults({})
            setCurrentQuestionIndex(0)
            setIsFinished(false)
        } catch (error) {
            console.error(
                isMistakesMode
                    ? 'Nie udało się pobrać pytań do powtórki:'
                    : 'Nie udało się pobrać egzaminu:',
                error
            )

            setCourse(null)
            setQuestions([])
            setSelectedAnswers({})
            setSubmittedResults({})

            setErrorMessage(
                isMistakesMode
                    ? 'Nie udało się pobrać pytań do powtórki.'
                    : 'Nie udało się pobrać egzaminu.'
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

    const selectedAnswerId = currentQuestion
        ? selectedAnswers[currentQuestion.id]
        : undefined

    const answeredQuestionsCount =
        Object.keys(selectedAnswers).length

    const progressPercent =
        questions.length === 0
            ? 0
            : Math.round(
                ((currentQuestionIndex + 1) /
                    questions.length) *
                100
            )

    const score = useMemo(() => {
        return Object.values(
            submittedResults
        ).filter((result) => result.isCorrect)
            .length
    }, [submittedResults])

    const scorePercent =
        questions.length === 0
            ? 0
            : Math.round(
                (score / questions.length) * 100
            )

    function selectAnswer(
        questionId: string,
        answerId: string
    ) {
        if (isSubmitting || isFinished) {
            return
        }

        setSelectedAnswers((current) => ({
            ...current,
            [questionId]: answerId,
        }))
    }

    function goToPreviousQuestion() {
        if (isSubmitting) {
            return
        }

        setCurrentQuestionIndex((current) =>
            Math.max(current - 1, 0)
        )
    }

    async function finishExam() {
        if (isSubmitting) {
            return
        }

        const answersToSubmit = questions.map(
            (question) => ({
                questionId: question.id,
                answerId:
                    selectedAnswers[question.id],
            })
        )

        const hasMissingAnswer =
            answersToSubmit.some(
                (answer) => !answer.answerId
            )

        if (hasMissingAnswer) {
            Alert.alert(
                isMistakesMode
                    ? 'Nieukończona powtórka'
                    : 'Nieukończony egzamin',
                'Odpowiedz na wszystkie pytania przed zakończeniem.'
            )

            return
        }

        try {
            setIsSubmitting(true)

            const results =
                await submitExamAnswers({
                    answers: answersToSubmit,
                    attemptType,
                })

            const resultsByQuestion =
                results.reduce<SubmittedResults>(
                    (resultMap, result) => {
                        resultMap[result.questionId] =
                            result

                        return resultMap
                    },
                    {}
                )

            setSubmittedResults(
                resultsByQuestion
            )

            setIsFinished(true)
        } catch (error) {
            console.error(
                isMistakesMode
                    ? 'Nie udało się zapisać powtórki:'
                    : 'Nie udało się zapisać egzaminu:',
                error
            )

            Alert.alert(
                'Błąd zapisu',
                isMistakesMode
                    ? 'Nie udało się zapisać wyników powtórki. Spróbuj ponownie.'
                    : 'Nie udało się zapisać wyników egzaminu. Spróbuj ponownie.'
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    async function goToNextQuestion() {
        if (!selectedAnswerId || isSubmitting) {
            return
        }

        const isLastQuestion =
            currentQuestionIndex ===
            questions.length - 1

        if (isLastQuestion) {
            await finishExam()
            return
        }

        setCurrentQuestionIndex((current) =>
            Math.min(
                current + 1,
                questions.length - 1
            )
        )
    }

    function restartExam() {
        if (isMistakesMode) {
            void loadExam()
            return
        }

        setQuestions((currentQuestions) =>
            shuffleQuestionAnswers(
                currentQuestions
            )
        )

        setSelectedAnswers({})
        setSubmittedResults({})
        setCurrentQuestionIndex(0)
        setIsFinished(false)
    }

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F0F7FA] px-6">
                <ActivityIndicator
                    size="large"
                    color="#3478D9"
                />

                <Text className="mt-4 text-base font-semibold text-[#5A7A95]">
                    {isMistakesMode
                        ? 'Pobieranie pytań do powtórki...'
                        : 'Pobieranie egzaminu...'}
                </Text>
            </View>
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
            <View className="flex-1 bg-[#F0F7FA] px-6 pt-14">
                <Pressable
                    onPress={() => router.back()}
                    className="h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm"
                >
                    <ArrowLeft
                        size={23}
                        color="#1A3A52"
                    />
                </Pressable>

                <View className="mt-8 rounded-[28px] border border-[#DDEAF0] bg-white p-6 shadow-sm">
                    <View
                        className={`h-14 w-14 items-center justify-center rounded-2xl ${noMistakes
                            ? 'bg-[#E5F4DA]'
                            : 'bg-[#FFE8E8]'
                            }`}
                    >
                        {noMistakes ? (
                            <CheckCircle2
                                size={29}
                                color="#5D963F"
                            />
                        ) : (
                            <ClipboardCheck
                                size={29}
                                color="#C24C4C"
                            />
                        )}
                    </View>

                    <Text className="mt-5 text-2xl font-extrabold text-[#1A3A52]">
                        {noMistakes
                            ? 'Wszystko powtórzone'
                            : isMistakesMode
                                ? 'Powtórka niedostępna'
                                : 'Egzamin niedostępny'}
                    </Text>

                    <Text className="mt-3 text-base leading-relaxed text-[#5A7A95]">
                        {errorMessage ??
                            'Nie znaleziono pytań dla tego kursu.'}
                    </Text>

                    {noMistakes ? (
                        <Pressable
                            onPress={() =>
                                router.back()
                            }
                            className="mt-6 flex-row items-center justify-center rounded-2xl bg-[#3478D9] px-4 py-4"
                        >
                            <ArrowLeft
                                size={19}
                                color="white"
                            />

                            <Text className="ml-2 font-bold text-white">
                                Wróć do egzaminów
                            </Text>
                        </Pressable>
                    ) : (
                        <Pressable
                            onPress={() =>
                                void loadExam()
                            }
                            className="mt-6 flex-row items-center justify-center rounded-2xl bg-[#3478D9] px-4 py-4"
                        >
                            <RotateCcw
                                size={19}
                                color="white"
                            />

                            <Text className="ml-2 font-bold text-white">
                                Spróbuj ponownie
                            </Text>
                        </Pressable>
                    )}
                </View>
            </View>
        )
    }

    if (isFinished) {
        const isPassed =
            scorePercent >= 75

        return (
            <View className="flex-1 bg-[#F0F7FA]">
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{
                        paddingHorizontal: 24,
                        paddingTop: 56,
                        paddingBottom: 60,
                    }}
                    showsVerticalScrollIndicator={
                        false
                    }
                >
                    <Pressable
                        onPress={() =>
                            router.back()
                        }
                        className="h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm"
                    >
                        <ArrowLeft
                            size={23}
                            color="#1A3A52"
                        />
                    </Pressable>

                    <View className="mt-8 rounded-[30px] border border-[#DDEAF0] bg-white p-6 shadow-sm">
                        <View
                            className={`h-16 w-16 items-center justify-center rounded-3xl ${isPassed
                                ? 'bg-[#E5F4DA]'
                                : 'bg-[#FFE5E5]'
                                }`}
                        >
                            {isPassed ? (
                                <Trophy
                                    size={34}
                                    color="#5D963F"
                                />
                            ) : (
                                <XCircle
                                    size={34}
                                    color="#C24C4C"
                                />
                            )}
                        </View>

                        <Text className="mt-6 text-xs font-bold uppercase tracking-widest text-[#78A4CB]">
                            {isMistakesMode
                                ? 'Wynik powtórki'
                                : 'Wynik egzaminu'}
                        </Text>

                        <Text className="mt-2 text-5xl font-extrabold text-[#1A3A52]">
                            {scorePercent}%
                        </Text>

                        <Text className="mt-3 text-2xl font-extrabold text-[#1A3A52]">
                            {isMistakesMode
                                ? isPassed
                                    ? 'Dobra powtórka'
                                    : 'Warto powtórzyć ponownie'
                                : isPassed
                                    ? 'Egzamin zaliczony'
                                    : 'Egzamin niezaliczony'}
                        </Text>

                        <Text className="mt-3 text-base leading-relaxed text-[#5A7A95]">
                            Poprawne odpowiedzi:{' '}
                            {score} z{' '}
                            {questions.length}.
                        </Text>

                        {isMistakesMode && (
                            <Text className="mt-3 text-sm leading-relaxed text-[#5A7A95]">
                                Poprawnie rozwiązane
                                pytania zostały
                                przesunięte do kolejnych
                                powtórek. Błędne mogą
                                pojawić się ponownie od
                                razu.
                            </Text>
                        )}

                        <Pressable
                            onPress={
                                restartExam
                            }
                            className="mt-7 flex-row items-center justify-center rounded-2xl bg-[#3478D9] px-4 py-4"
                        >
                            <RotateCcw
                                size={20}
                                color="white"
                            />

                            <Text className="ml-2 text-base font-bold text-white">
                                {isMistakesMode
                                    ? 'Sprawdź pozostałe błędy'
                                    : 'Rozwiąż ponownie'}
                            </Text>
                        </Pressable>
                    </View>

                    <Text className="mb-4 mt-8 text-2xl font-extrabold text-[#1A3A52]">
                        Twoje odpowiedzi
                    </Text>

                    <View className="gap-4">
                        {questions.map(
                            (
                                question,
                                questionIndex
                            ) => {
                                const chosenAnswerId =
                                    selectedAnswers[
                                    question.id
                                    ]

                                const chosenAnswer =
                                    question.question_answers.find(
                                        (answer) =>
                                            answer.id ===
                                            chosenAnswerId
                                    )

                                const result =
                                    submittedResults[
                                    question.id
                                    ]

                                const isCorrect =
                                    result?.isCorrect ===
                                    true

                                return (
                                    <View
                                        key={
                                            question.id
                                        }
                                        className="rounded-[26px] border border-[#DDEAF0] bg-white p-5 shadow-sm"
                                    >
                                        <View className="flex-row items-start">
                                            <View
                                                className={`mr-3 h-10 w-10 items-center justify-center rounded-2xl ${isCorrect
                                                    ? 'bg-[#E5F4DA]'
                                                    : 'bg-[#FFE5E5]'
                                                    }`}
                                            >
                                                {isCorrect ? (
                                                    <CheckCircle2
                                                        size={
                                                            22
                                                        }
                                                        color="#5D963F"
                                                    />
                                                ) : (
                                                    <XCircle
                                                        size={
                                                            22
                                                        }
                                                        color="#C24C4C"
                                                    />
                                                )}
                                            </View>

                                            <View className="flex-1">
                                                <Text className="text-xs font-bold uppercase tracking-widest text-[#78A4CB]">
                                                    Pytanie{' '}
                                                    {questionIndex +
                                                        1}
                                                </Text>

                                                <Text className="mt-2 text-lg font-extrabold leading-6 text-[#1A3A52]">
                                                    {
                                                        question.question_text
                                                    }
                                                </Text>
                                            </View>
                                        </View>

                                        <Text className="mt-4 text-sm font-semibold text-[#5A7A95]">
                                            Twoja
                                            odpowiedź
                                        </Text>

                                        <Text
                                            className={`mt-1 text-base font-bold ${isCorrect
                                                ? 'text-[#5D963F]'
                                                : 'text-[#C24C4C]'
                                                }`}
                                        >
                                            {chosenAnswer?.answer_text ??
                                                'Brak odpowiedzi'}
                                        </Text>

                                        <View
                                            className={`mt-4 rounded-2xl p-4 ${isCorrect
                                                ? 'bg-[#F0F8EA]'
                                                : 'bg-[#FFF1F1]'
                                                }`}
                                        >
                                            <Text
                                                className={`text-sm font-bold ${isCorrect
                                                    ? 'text-[#5D963F]'
                                                    : 'text-[#C24C4C]'
                                                    }`}
                                            >
                                                {isCorrect
                                                    ? 'Odpowiedź poprawna'
                                                    : 'Odpowiedź błędna'}
                                            </Text>

                                            {isMistakesMode &&
                                                result && (
                                                    <Text className="mt-2 text-sm leading-relaxed text-[#5A7A95]">
                                                        Seria
                                                        poprawnych
                                                        odpowiedzi:{' '}
                                                        {
                                                            result.correctStreak
                                                        }
                                                        /3
                                                    </Text>
                                                )}
                                        </View>

                                        {question.explanation && (
                                            <View className="mt-4 rounded-2xl bg-[#F0F7FA] p-4">
                                                <Text className="text-sm leading-relaxed text-[#5A7A95]">
                                                    {
                                                        question.explanation
                                                    }
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                )
                            }
                        )}
                    </View>
                </ScrollView>
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
                    paddingBottom: 60,
                }}
                showsVerticalScrollIndicator={
                    false
                }
            >
                <View className="flex-row items-center justify-between">
                    <Pressable
                        onPress={() =>
                            router.back()
                        }
                        disabled={isSubmitting}
                        className="h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm"
                    >
                        <ArrowLeft
                            size={23}
                            color="#1A3A52"
                        />
                    </Pressable>

                    <View className="rounded-full bg-white px-4 py-2 shadow-sm">
                        <Text className="text-sm font-bold text-[#3478D9]">
                            {answeredQuestionsCount}/
                            {questions.length}
                        </Text>
                    </View>
                </View>

                <Text className="mt-7 text-xs font-bold uppercase tracking-widest text-[#78A4CB]">
                    {isMistakesMode
                        ? 'Powtórka błędów'
                        : 'Egzamin próbny'}
                </Text>

                <Text className="mt-2 text-3xl font-extrabold leading-tight text-[#1A3A52]">
                    {course.name}
                </Text>

                {isMistakesMode && (
                    <Text className="mt-3 text-base leading-relaxed text-[#5A7A95]">
                        Rozwiąż ponownie pytania, przy
                        których wcześniej popełniłeś
                        błąd.
                    </Text>
                )}

                <View className="mt-6">
                    <View className="mb-2 flex-row items-center justify-between">
                        <Text className="text-sm font-semibold text-[#5A7A95]">
                            Pytanie{' '}
                            {currentQuestionIndex +
                                1}{' '}
                            z {questions.length}
                        </Text>

                        <Text className="text-sm font-extrabold text-[#3478D9]">
                            {progressPercent}%
                        </Text>
                    </View>

                    <View className="h-3 overflow-hidden rounded-full bg-[#DCE9EF]">
                        <View
                            className="h-full rounded-full bg-[#3478D9]"
                            style={{
                                width: `${progressPercent}%`,
                            }}
                        />
                    </View>
                </View>

                <View className="mt-8 rounded-[30px] border border-[#DDEAF0] bg-white p-6 shadow-sm">
                    <View className="mb-5 h-14 w-14 items-center justify-center rounded-2xl bg-[#D9EEF7]">
                        <ClipboardCheck
                            size={29}
                            color="#3478D9"
                        />
                    </View>

                    <Text className="text-2xl font-extrabold leading-8 text-[#1A3A52]">
                        {
                            currentQuestion.question_text
                        }
                    </Text>

                    {currentQuestion.image_url && (
                        <Image
                            source={{
                                uri: currentQuestion.image_url,
                            }}
                            className="mt-6 h-52 w-full rounded-2xl bg-[#EAF2F5]"
                            resizeMode="contain"
                        />
                    )}

                    <Text className="mt-7 text-sm font-bold uppercase tracking-widest text-[#78A4CB]">
                        Wybierz odpowiedź
                    </Text>

                    <View className="mt-4 gap-3">
                        {currentQuestion.question_answers.map(
                            (
                                answer,
                                answerIndex
                            ) => {
                                const isSelected =
                                    answer.id ===
                                    selectedAnswerId

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
                                                answer.id
                                            )
                                        }
                                        className={`flex-row items-start rounded-2xl border p-4 ${isSelected
                                            ? 'border-[#3478D9] bg-[#EAF5F9]'
                                            : 'border-[#DDEAF0] bg-white'
                                            }`}
                                    >
                                        <View
                                            className={`mr-3 h-9 w-9 items-center justify-center rounded-full ${isSelected
                                                ? 'bg-[#3478D9]'
                                                : 'bg-[#F0F7FA]'
                                                }`}
                                        >
                                            {isSelected ? (
                                                <Check
                                                    size={
                                                        19
                                                    }
                                                    color="white"
                                                    strokeWidth={
                                                        3
                                                    }
                                                />
                                            ) : (
                                                <Circle
                                                    size={
                                                        19
                                                    }
                                                    color="#8DA7B8"
                                                />
                                            )}
                                        </View>

                                        <View className="flex-1">
                                            <Text
                                                className={`text-xs font-bold uppercase tracking-widest ${isSelected
                                                    ? 'text-[#3478D9]'
                                                    : 'text-[#8DA7B8]'
                                                    }`}
                                            >
                                                Odpowiedź{' '}
                                                {String.fromCharCode(
                                                    65 +
                                                    answerIndex
                                                )}
                                            </Text>

                                            <Text
                                                className={`mt-1 text-base font-semibold leading-6 ${isSelected
                                                    ? 'text-[#1A3A52]'
                                                    : 'text-[#5A7A95]'
                                                    }`}
                                            >
                                                {
                                                    answer.answer_text
                                                }
                                            </Text>
                                        </View>
                                    </Pressable>
                                )
                            }
                        )}
                    </View>
                </View>

                <View className="mt-6 flex-row gap-3">
                    <Pressable
                        onPress={
                            goToPreviousQuestion
                        }
                        disabled={
                            currentQuestionIndex ===
                            0 ||
                            isSubmitting
                        }
                        className={`h-14 flex-1 flex-row items-center justify-center rounded-2xl border ${currentQuestionIndex ===
                            0 ||
                            isSubmitting
                            ? 'border-[#DCE6EB] bg-[#E8F0F3]'
                            : 'border-[#C9DDE6] bg-white'
                            }`}
                    >
                        <ChevronLeft
                            size={21}
                            color={
                                currentQuestionIndex ===
                                    0 ||
                                    isSubmitting
                                    ? '#AABBC5'
                                    : '#3478D9'
                            }
                        />

                        <Text
                            className={`ml-1 font-bold ${currentQuestionIndex ===
                                0 ||
                                isSubmitting
                                ? 'text-[#AABBC5]'
                                : 'text-[#3478D9]'
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
                        className={`h-14 flex-[1.5] flex-row items-center justify-center rounded-2xl ${selectedAnswerId &&
                            !isSubmitting
                            ? 'bg-[#3478D9]'
                            : 'bg-[#AFC5D4]'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <ActivityIndicator
                                    size="small"
                                    color="white"
                                />

                                <Text className="ml-2 font-bold text-white">
                                    Zapisywanie...
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text className="font-bold text-white">
                                    {currentQuestionIndex ===
                                        questions.length -
                                        1
                                        ? isMistakesMode
                                            ? 'Zakończ powtórkę'
                                            : 'Zakończ egzamin'
                                        : 'Następne pytanie'}
                                </Text>

                                <ChevronRight
                                    size={21}
                                    color="white"
                                />
                            </>
                        )}
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    )
}