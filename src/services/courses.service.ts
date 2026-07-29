import { supabase } from '@/lib/supabase'



// Pobieranie kursów dostępnych w db 

export type Course = {
    id: string
    name: string
    description: string | null
    created_at: string
    updated_at: string
    image_url: string
}




export async function getCourses(): Promise<Course[]> {
    const { data, error } = await supabase
        .from('courses')
        .select('id, name, description, created_at, updated_at, image_url')
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



export async function getFavoriteCourse(userId: string) {


    const { data, error } = await supabase
        .from('profiles')
        .select("favorite_course")
        .eq("id", userId)
        .single()

    if (error) {
        console.error('Błąd:', error)
        throw error
    }

    return data.favorite_course


}


export async function setFavoriteCourse(
    userId: string,
    courseId: string
) {
    const { data, error } = await supabase
        .from('profiles')
        .update({
            favorite_course: courseId
        })
        .eq('id', userId)
        .select()
        .single()

    if (error) {
        console.error('Błąd:', error)
        throw error
    }

    return data
}