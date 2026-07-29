import { Course } from "@/services/courses.service"


export type ContinueLearningCardProps = {
    isLoading: boolean
    error: string | null
    nextLessonTitle?: string
    thumbnailUrl: string | null
    progressPercent: number
    completedLessons: number
    totalLessons: number
    isCompleted: boolean
    buttonLabel: string
    disabled: boolean
    courseName: string
    onPress: () => void
}


export type ChooseCourseCardProps = {
    courses: Course[]
    error: string | null
    isSaving: boolean
    onSelectCourse: (courseId: string) => void
}


export type ProgressRingProps = {
    value: number
    size: number
    dark?: boolean
}