import { supabase } from '@/lib/supabase'



// Pobieranie kursów dostępnych w db 

export type Course = {
    id: string
    name: string
    description: string | null
    created_at: string
    updated_at: string
}

export async function getCourses(): Promise<Course[]> {
    const { data, error } = await supabase
        .from('courses')
        .select('id, name, description, created_at, updated_at')
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Błąd pobierania kursów:', error)
        throw error
    }

    return data ?? []
}


// Pobieranie lekcji z danego kursu

export type CourseLesson = {
    id: string
    title: string
    position: number
}

export type CourseWithLessons = Course & {
    course_lessons: CourseLesson[]
}

export async function getCourseWithLessons(
    courseId: string
): Promise<CourseWithLessons> {
    const { data, error } = await supabase
        .from('courses')
        .select(`
            id,
            name,
            description,
            created_at,
            updated_at,
            course_lessons (
                id,
                title,
                position
            )
        `)
        .eq('id', courseId)
        .order('position', {
            referencedTable: 'course_lessons',
            ascending: true,
        })
        .single()

    if (error) {
        console.error('Błąd pobierania kursu z lekcjami:', error)
        throw error
    }

    return data
}