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
    status: 'new' | 'learning' | 'review' | 'mastered'
    correctStreak: number
    nextReviewAt: string | null
}

type SubmitQuestionAttemptRpcRow = {
    attempt_id: string
    answer_is_correct: boolean
    question_status: SubmittedQuestionResult['status']
    current_correct_streak: number
    review_at: string | null
}

/**
 * Wysyła jedną odpowiedź użytkownika do bazy.
 *
 * Poprawność odpowiedzi jest sprawdzana przez funkcję RPC
 * `submit_question_attempt`, a nie w aplikacji.
 *
 * Funkcja RPC:
 * - sprawdza, czy odpowiedź należy do pytania,
 * - sprawdza, czy odpowiedź jest poprawna,
 * - zapisuje próbę w `user_question_attempts`,
 * - aktualizuje `user_question_progress`.
 */
export async function submitQuestionAttempt({
    questionId,
    answerId,
    attemptType = 'exam',
}: SubmitQuestionAttemptParams): Promise<SubmittedQuestionResult> {
    const { data, error } = await supabase.rpc(
        'submit_question_attempt',
        {
            p_question_id: questionId,
            p_answer_id: answerId,
            p_attempt_type: attemptType,
        }
    )

    if (error) {
        console.error(
            'Błąd zapisywania odpowiedzi użytkownika:',
            {
                questionId,
                answerId,
                attemptType,
                error,
            }
        )

        throw error
    }

    const result = Array.isArray(data)
        ? (data[0] as SubmitQuestionAttemptRpcRow | undefined)
        : (data as SubmitQuestionAttemptRpcRow | null)

    if (!result) {
        throw new Error(
            'Funkcja submit_question_attempt nie zwróciła wyniku.'
        )
    }

    return {
        attemptId: result.attempt_id,
        questionId,
        answerId,
        isCorrect: result.answer_is_correct,
        status: result.question_status,
        correctStreak: result.current_correct_streak,
        nextReviewAt: result.review_at,
    }
}

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
 *
 * Odpowiedzi są zapisywane kolejno, aby:
 * - zachować kolejność,
 * - łatwiej wskazać pytanie, przy którym wystąpił błąd,
 * - nie wykonywać wielu równoległych aktualizacji postępu.
 *
 * Uwaga:
 * ta funkcja nie jest jedną transakcją bazodanową.
 * Jeśli zapis zatrzyma się w połowie, wcześniejsze odpowiedzi
 * mogą być już zapisane. Docelowo można zastąpić ją jednym RPC,
 * które zapisze cały egzamin w jednej transakcji.
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
                }
            )

            throw error
        }
    }

    return results
}