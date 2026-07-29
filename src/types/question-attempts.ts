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

export type SubmitQuestionAttemptRpcRow = {
    attempt_id: string
    answer_is_correct: boolean
    question_status: SubmittedQuestionResult['status']
    current_correct_streak: number
    review_at: string | null
}