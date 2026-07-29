import { supabase } from '@/lib/supabase'

export type QuestionAttemptType =
    | 'exam'
    | 'mistakes'
    | 'practice'

export type SubmitQuestionAttemptParams = {
    questionId: string
    answerId: string
    attemptType?: QuestionAttemptType
}

export type SubmittedQuestionResult = {
    attemptId: string
    questionId: string
    answerId: string
    isCorrect: boolean
    correctAnswerId: string
    status: 'new' | 'learning' | 'review' | 'mastered'
    correctStreak: number
    nextReviewAt: string | null
}

type SubmitQuestionAttemptRpcRow = {
    attempt_id: string
    answer_is_correct: boolean
    correct_answer_id: string
    question_status: SubmittedQuestionResult['status']
    current_correct_streak: number
    review_at: string | null
}
/**
 * Wysyła jedną odpowiedź użytkownika.
 *
 * RPC:
 * - sprawdza, czy odpowiedź należy do pytania,
 * - sprawdza poprawność,
 * - zwraca ID prawidłowej odpowiedzi,
 * - zapisuje próbę,
 * - aktualizuje postęp użytkownika.
 */
export async function submitQuestionAttempt({
    questionId,
    answerId,
    attemptType = 'practice',
}: SubmitQuestionAttemptParams): Promise<SubmittedQuestionResult> {
    const { data, error } = await supabase.rpc(
        'submit_question_attempt',
        {
            p_question_id: questionId,
            p_answer_id: answerId,
            p_attempt_type: attemptType,
        },
    )

    if (error) {
        console.error(
            'Błąd zapisywania odpowiedzi użytkownika:',
            {
                questionId,
                answerId,
                attemptType,
                error,
            },
        )

        throw error
    }

    const result = Array.isArray(data)
        ? (data[0] as SubmitQuestionAttemptRpcRow | undefined)
        : (data as SubmitQuestionAttemptRpcRow | null)

    if (!result) {
        throw new Error(
            'Funkcja submit_question_attempt nie zwróciła wyniku.',
        )
    }
    return {
        attemptId: result.attempt_id,
        questionId,
        answerId,
        isCorrect: result.answer_is_correct,
        correctAnswerId: result.correct_answer_id,
        status: result.question_status,
        correctStreak: result.current_correct_streak,
        nextReviewAt: result.review_at,
    }
}

/* =========================================================
   PRACTICE / TEST
   ========================================================= */

export type SubmitPracticeAnswerParams = {
    questionId: string
    answerId: string
}

/**
 * Odpowiedź w trybie nauki.
 *
 * Używamy osobnej funkcji głównie po to, żeby komponenty
 * testów nie musiały pamiętać o attemptType: 'practice'.
 */
export async function submitPracticeAnswer({
    questionId,
    answerId,
}: SubmitPracticeAnswerParams): Promise<SubmittedQuestionResult> {
    return submitQuestionAttempt({
        questionId,
        answerId,
        attemptType: 'practice',
    })
}

/* =========================================================
   EXAM
   ========================================================= */

export type ExamAnswerToSubmit = {
    questionId: string
    answerId: string
}

export type SubmitExamAnswersParams = {
    answers: ExamAnswerToSubmit[]
    attemptType?: QuestionAttemptType
}

/**
 * Wysyła wszystkie odpowiedzi z zakończonego egzaminu.
 */
export async function submitExamAnswers({
    answers,
    attemptType = 'exam',
}: SubmitExamAnswersParams): Promise<SubmittedQuestionResult[]> {
    if (answers.length === 0) {
        return []
    }

    const results: SubmittedQuestionResult[] = []

    for (const answer of answers) {
        try {
            const result = await submitQuestionAttempt({
                questionId: answer.questionId,
                answerId: answer.answerId,
                attemptType,
            })

            results.push(result)
        } catch (error) {
            console.error(
                'Nie udało się zapisać odpowiedzi z egzaminu:',
                {
                    questionId: answer.questionId,
                    answerId: answer.answerId,
                    attemptType,
                    error,
                },
            )

            throw error
        }
    }

    return results
}

/* =========================================================
   REVIEWS
   ========================================================= */

export async function getQuestionAttempts(
    currentDate: string,
    userId: string,
) {
    const { data, error } = await supabase
        .from('user_question_progress')
        .select(`
            question:questions!inner (
                course_id
            )
        `)
        .eq('user_id', userId)
        .in('status', ['learning', 'review'])
        .or(
            `next_review_at.is.null,next_review_at.lte.${currentDate}`,
        )

    if (error) {
        console.error(
            'Nie udało się pobrać pytań do powtórki:',
            error,
        )

        throw error
    }

    return data
}