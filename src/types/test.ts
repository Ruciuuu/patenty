
type QuizMode = 'quick' | 'learning'

export type ResultScreenProps = {
    mode: QuizMode
    correctAnswers: number
    incorrectAnswers: number
    questionsCount: number
    hasMistakes: boolean
    onBack: () => void
    onRestart: () => void
    onRepeatMistakes: () => void
}
