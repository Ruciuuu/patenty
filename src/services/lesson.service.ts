import { supabase } from '@/lib/supabase'

export type SlideImage = {
    id: string
    image_url: string
    position: number
}

export type LessonSlide = {
    id: string
    lesson_id: string
    title: string | null
    content: string
    position: number
    lesson_slide_images: SlideImage[]
}

export async function getSlides(
    lessonId: string
): Promise<LessonSlide[]> {
    const { data, error } = await supabase
        .from('lesson_slides')
        .select(`
            id,
            lesson_id,
            title,
            content,
            position,
            lesson_slide_images (
                id,
                image_url,
                position
            )
        `)
        .eq('lesson_id', lessonId)
        .order('position', { ascending: true })

    if (error) {
        console.error('Błąd pobierania slajdów:', error)
        throw error
    }

    const slides = data ?? []

    return slides.map((slide) => ({
        ...slide,
        lesson_slide_images: [
            ...(slide.lesson_slide_images ?? []),
        ].sort((a, b) => a.position - b.position),
    }))
}