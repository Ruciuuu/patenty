import { supabase } from "./supabase";



export function getQuestionImageUrl(courseId: string, currentQuestion: string) {

    const imageUrl = supabase.storage
        .from("question-images")
        .getPublicUrl(`${courseId}/${currentQuestion}`)
        .data.publicUrl;



    return imageUrl;
}



export function getLessonSlideImageUrl(lessonId: string, slideId: string) {

    const imageUrl = supabase.storage
        .from('lesson-slides-images')
        .getPublicUrl(`${lessonId}/${slideId}`)
        .data.publicUrl;

    return imageUrl;
}


export function getThumbnail(courseImageUrl: string) {

    const imageUrl = supabase.storage
        .from("thumbnail")
        .getPublicUrl(`${courseImageUrl}`)
        .data.publicUrl

    return imageUrl;

}