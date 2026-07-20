import { supabase } from "./supabase";



export function getQuestionImageUrl(courseId: string, currentQuestion: string) {

    const imageUrl = supabase.storage
        .from("question-images")
        .getPublicUrl(`${courseId}/${currentQuestion}`)
        .data.publicUrl;



    return imageUrl;
}


