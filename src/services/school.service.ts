import { supabase } from '@/lib/supabase'

type SchoolRelation = {
    name: string
}

type MembershipWithSchool = {
    school: SchoolRelation | null
}

export async function getUserSchoolName(
    userId: string
): Promise<string | null> {
    const { data, error } = await supabase
        .from('school_memberships')
        .select(`
            school:schools!school_memberships_school_id_fkey (
                name
            )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle()

    console.log('SCHOOL QUERY:', {
        userId,
        data,
        error,
    })

    if (error) {
        console.error(
            'Błąd podczas pobierania szkoły użytkownika:',
            error
        )

        throw error
    }

    const membership = data as MembershipWithSchool | null

    return membership?.school?.name ?? null
}