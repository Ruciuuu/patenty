import { Course } from "@/services/courses.service"


export type ContinueLearningCardProps = {
    isLoading: boolean
    error: string | null
    nextLessonTitle?: string
    thumbnailUrl: string
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

export type CourseModeCardProps = {
    progressPercent: number
    completedLessons: number
    totalLessons: number
    isLoading: boolean
    onPress: () => void
}




export type ProgressRingProps = {
    value: number
    size: number
    dark?: boolean
}


export type ProgressBarProps = {
    value: number
    trackColor: string
    fillColor: string
    className?: string
}

export type ProgressSummaryCardProps = {
    progressPercent: number
    completedLessons: number
    totalLessons: number
    isCompleted: boolean
    onPress: () => void
}



export type PrimaryButtonProps = {
    label: string
    disabled: boolean
    completed: boolean
    onPress: () => void
}

export type SectionHeaderProps = {
    title: string
    description: string
}

export type HeaderProps = {
    firstName: string
}




