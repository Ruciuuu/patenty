import { QuestionWithAnswers } from '@/services/questions.service'

const EXAM_QUESTION_COUNT = 75

export function getSingleParam(
    value?: string | string[]
): string | undefined {
    return Array.isArray(value)
        ? value[0]
        : value
}

export function shuffleItems<T>(items: T[]): T[] {
    const shuffledItems = [...items]

    for (
        let index = shuffledItems.length - 1;
        index > 0;
        index--
    ) {
        const randomIndex = Math.floor(
            Math.random() * (index + 1)
        )

        const currentItem =
            shuffledItems[index]

        shuffledItems[index] =
            shuffledItems[randomIndex]

        shuffledItems[randomIndex] =
            currentItem
    }

    return shuffledItems
}

export function shuffleExamQuestions(
    questions: QuestionWithAnswers[]
): QuestionWithAnswers[] {
    const selectedQuestions = shuffleItems(questions)
        .slice(0, EXAM_QUESTION_COUNT)

    return selectedQuestions.map((question) => ({
        ...question,

        question_answers: shuffleItems(
            question.question_answers
        ),
    }))
}