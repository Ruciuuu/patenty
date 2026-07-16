import { supabase } from '@/lib/supabase'

export type QuestionAnswer = {
    id: string
    question_id: string
    answer_text: string
    position: number
}

export type QuestionWithAnswers = {
    id: string
    course_id: string
    question_text: string
    explanation: string | null
    image_url: string | null
    position: number | null
    question_answers: QuestionAnswer[]
}

type QuestionProgressRow = {
    question_id: string
    next_review_at: string | null
    wrong_attempts: number
}

/**
 * Porządkuje odpowiedzi według pozycji.
 */
function normalizeQuestion(
    question: QuestionWithAnswers
): QuestionWithAnswers {
    return {
        ...question,
        question_answers: [
            ...(question.question_answers ?? []),
        ].sort((firstAnswer, secondAnswer) => {
            return (
                firstAnswer.position -
                secondAnswer.position
            )
        }),
    }
}

/**
 * Pobiera wszystkie pytania dla danego kursu razem z odpowiedziami.
 */
export async function getQuestionsWithAnswers(
    courseId: string
): Promise<QuestionWithAnswers[]> {
    const { data, error } = await supabase
        .from('questions')
        .select(`
            id,
            course_id,
            question_text,
            explanation,
            image_url,
            position,
            question_answers (
                id,
                question_id,
                answer_text,
                position
            )
        `)
        .eq('course_id', courseId)
        .order('position', {
            ascending: true,
            nullsFirst: false,
        })
        .order('position', {
            referencedTable: 'question_answers',
            ascending: true,
        })

    if (error) {
        console.error(
            'Błąd pobierania pytań i odpowiedzi:',
            error
        )

        throw error
    }

    const questions =
        (data ?? []) as QuestionWithAnswers[]

    return questions.map(normalizeQuestion)
}

/**
 * Pobiera pytania wymagające powtórki dla zalogowanego użytkownika.
 *
 * Pobierane są pytania:
 * - ze statusem `learning` lub `review`,
 * - należące do wskazanego kursu,
 * - których termin powtórki już nadszedł.
 */
export async function getMistakeQuestionsWithAnswers(
    courseId: string
): Promise<QuestionWithAnswers[]> {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
        console.error(
            'Błąd pobierania zalogowanego użytkownika:',
            userError
        )

        throw userError
    }

    if (!user) {
        throw new Error(
            'Użytkownik musi być zalogowany, aby pobrać pytania do powtórki.'
        )
    }

    const currentDate = new Date().toISOString()

    const { data: progressData, error: progressError } =
        await supabase
            .from('user_question_progress')
            .select(`
                question_id,
                next_review_at,
                wrong_attempts
            `)
            .eq('user_id', user.id)
            .in('status', [
                'learning',
                'review',
            ])
            .or(
                `next_review_at.is.null,next_review_at.lte.${currentDate}`
            )
            .order('next_review_at', {
                ascending: true,
                nullsFirst: true,
            })
            .order('wrong_attempts', {
                ascending: false,
            })

    if (progressError) {
        console.error(
            'Błąd pobierania postępu pytań:',
            progressError
        )

        throw progressError
    }

    const progressRows =
        (progressData ?? []) as QuestionProgressRow[]

    if (progressRows.length === 0) {
        return []
    }

    const questionIds = progressRows.map(
        (progress) => progress.question_id
    )

    const { data: questionsData, error: questionsError } =
        await supabase
            .from('questions')
            .select(`
                id,
                course_id,
                question_text,
                explanation,
                image_url,
                position,
                question_answers (
                    id,
                    question_id,
                    answer_text,
                    position
                )
            `)
            .eq('course_id', courseId)
            .in('id', questionIds)
            .order('position', {
                referencedTable: 'question_answers',
                ascending: true,
            })

    if (questionsError) {
        console.error(
            'Błąd pobierania pytań do powtórki:',
            questionsError
        )

        throw questionsError
    }

    const questions =
        (questionsData ?? []) as QuestionWithAnswers[]

    const questionsById = new Map(
        questions.map((question) => [
            question.id,
            normalizeQuestion(question),
        ])
    )

    return questionIds
        .map((questionId) =>
            questionsById.get(questionId)
        )
        .filter(
            (
                question
            ): question is QuestionWithAnswers =>
                Boolean(question)
        )
}

/**
 * Pobiera pojedyncze pytanie razem z odpowiedziami.
 */
export async function getQuestionWithAnswers(
    questionId: string
): Promise<QuestionWithAnswers> {
    const { data, error } = await supabase
        .from('questions')
        .select(`
            id,
            course_id,
            question_text,
            explanation,
            image_url,
            position,
            question_answers (
                id,
                question_id,
                answer_text,
                position
            )
        `)
        .eq('id', questionId)
        .order('position', {
            referencedTable: 'question_answers',
            ascending: true,
        })
        .single()

    if (error) {
        console.error(
            'Błąd pobierania pytania i odpowiedzi:',
            error
        )

        throw error
    }

    return normalizeQuestion(
        data as QuestionWithAnswers
    )
}