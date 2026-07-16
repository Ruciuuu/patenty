import { supabase } from '@/lib/supabase'

export async function completeLesson(
    userId: string,
    lessonId: string
): Promise<void> {
    const { error } = await supabase
        .from('user_lesson_progress')
        .upsert(
            {
                user_id: userId,
                lesson_id: lessonId,
                completed: true,
                completed_at: new Date().toISOString(),
            },
            {
                onConflict: 'user_id,lesson_id',
            }
        )

    if (error) {
        console.error('Błąd zapisywania postępu lekcji:', error)
        throw error
    }
}

export async function getCompletedLessonIds(
    userId: string,
    lessonIds: string[]
): Promise<string[]> {
    if (lessonIds.length === 0) {
        return []
    }

    const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .eq('completed', true)
        .in('lesson_id', lessonIds)

    if (error) {
        console.error('Błąd pobierania postępu lekcji:', error)
        throw error
    }

    return data?.map((item) => item.lesson_id) ?? []
}