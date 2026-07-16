import React, { useCallback, useState } from 'react'
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native'
import {
    useFocusEffect,
    useLocalSearchParams,
    useRouter,
} from 'expo-router'
import {
    ArrowLeft,
    BookOpen,
    Check,
    ChevronRight,
    CircleCheck,
    Clock3,
    Play,
    Sailboat,
} from 'lucide-react-native'

import { useAuth } from '@/context/auth-context'
import {
    getCourseWithLessons,
    type CourseWithLessons,
} from '@/services/courses.service'
import { getCompletedLessonIds } from '@/services/progress.service'

export default function CourseDetailsScreen() {
    const router = useRouter()
    const { user } = useAuth()

    const { courseId } = useLocalSearchParams<{
        courseId: string
    }>()

    const [course, setCourse] =
        useState<CourseWithLessons | null>(null)

    const [completedLessonIds, setCompletedLessonIds] =
        useState<string[]>([])

    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] =
        useState<string | null>(null)

    const loadCourse = useCallback(async () => {
        if (!courseId) {
            setErrorMessage('Brak identyfikatora kursu.')
            setIsLoading(false)
            return
        }

        try {
            setErrorMessage(null)

            const courseData =
                await getCourseWithLessons(courseId)

            setCourse(courseData)

            if (!user?.id) {
                setCompletedLessonIds([])
                return
            }

            const lessonIds = courseData.course_lessons.map(
                (lesson) => lesson.id,
            )

            const completedIds = await getCompletedLessonIds(
                user.id,
                lessonIds,
            )

            setCompletedLessonIds(completedIds)
        } catch (error) {
            console.error('Nie udało się pobrać kursu:', error)
            setErrorMessage('Nie udało się pobrać kursu.')
        } finally {
            setIsLoading(false)
        }
    }, [courseId, user?.id])

    useFocusEffect(
        useCallback(() => {
            loadCourse()
        }, [loadCourse]),
    )

    function openLesson(lessonId: string) {
        router.push({
            pathname: '/(course)/lesson/[lessonId]',
            params: {
                lessonId,
            },
        })
    }

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F0F7FA]">
                <View className="h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm">
                    <ActivityIndicator
                        size="large"
                        color="#3478D9"
                    />
                </View>

                <Text className="mt-4 text-base font-semibold text-[#5A7A95]">
                    Pobieranie kursu...
                </Text>
            </View>
        )
    }

    if (errorMessage || !course) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F0F7FA] px-6">
                <View className="w-full rounded-[28px] bg-white p-6 shadow-sm">
                    <Text className="text-center text-lg font-bold text-[#1A3A52]">
                        {errorMessage ?? 'Nie znaleziono kursu.'}
                    </Text>

                    <Pressable
                        onPress={loadCourse}
                        className="mt-5 items-center rounded-2xl bg-[#3478D9] px-5 py-4"
                    >
                        <Text className="font-bold text-white">
                            Spróbuj ponownie
                        </Text>
                    </Pressable>
                </View>
            </View>
        )
    }

    const totalLessons = course.course_lessons.length
    const completedLessons = completedLessonIds.length

    const progressPercent =
        totalLessons === 0
            ? 0
            : Math.round(
                (completedLessons / totalLessons) * 100,
            )

    const nextLesson =
        course.course_lessons.find(
            (lesson) =>
                !completedLessonIds.includes(lesson.id),
        ) ?? course.course_lessons[0]

    return (
        <View className="flex-1 bg-[#F0F7FA]">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingTop: 56,
                    paddingBottom: 90,
                }}
            >
                {/* Header */}
                <View className="flex-row items-center">
                    <Pressable
                        onPress={() => router.back()}
                        className="h-12 w-12 items-center justify-center rounded-2xl border border-[#DDEAF0] bg-white shadow-sm"
                    >
                        <ArrowLeft
                            size={22}
                            color="#1A3A52"
                            strokeWidth={2.3}
                        />
                    </Pressable>

                    <View className="ml-4">
                        <Text className="text-xs font-semibold uppercase tracking-widest text-[#78A4CB]">
                            Kurs
                        </Text>

                        <Text className="mt-1 text-sm font-semibold text-[#5A7A95]">
                            Sternik motorowodny
                        </Text>
                    </View>
                </View>

                <Text className="mt-6 text-4xl font-extrabold leading-tight text-[#1A3A52]">
                    {course.name}
                </Text>

                <Text className="mt-3 text-base leading-7 text-[#5A7A95]">
                    {course.description ??
                        'Przygotuj się do egzaminu krok po kroku.'}
                </Text>

                {/* Progress card */}
                <View className="mt-8 overflow-hidden rounded-[32px] bg-[#3478D9] p-6 shadow-md">
                    <View className="absolute -right-10 -top-4 opacity-10">
                        <Sailboat
                            size={180}
                            color="white"
                            strokeWidth={1.4}
                        />
                    </View>

                    <View className="flex-row items-start justify-between">
                        <View>
                            <Text className="text-xs font-bold uppercase tracking-widest text-white/75">
                                Twój postęp
                            </Text>

                            <Text className="mt-2 text-4xl font-extrabold text-white">
                                {progressPercent}%
                            </Text>
                        </View>

                        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                            <BookOpen
                                size={27}
                                color="white"
                                strokeWidth={2.2}
                            />
                        </View>
                    </View>

                    <Text className="mt-3 text-sm font-medium text-white/80">
                        Ukończono {completedLessons} z {totalLessons} lekcji
                    </Text>

                    <View className="mt-5 h-3 overflow-hidden rounded-full bg-white/20">
                        <View
                            className="h-full rounded-full bg-white"
                            style={{
                                width: `${progressPercent}%`,
                            }}
                        />
                    </View>

                    {nextLesson ? (
                        <Pressable
                            onPress={() => openLesson(nextLesson.id)}
                            className="mt-6 flex-row items-center rounded-[22px] bg-white p-4"
                        >
                            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#D9EEF7]">
                                <Play
                                    size={20}
                                    color="#3478D9"
                                    fill="#3478D9"
                                />
                            </View>

                            <View className="ml-3 flex-1">
                                <Text className="text-base font-extrabold text-[#1A3A52]">
                                    {progressPercent === 100
                                        ? 'Powtórz kurs'
                                        : 'Kontynuuj naukę'}
                                </Text>

                                <Text
                                    className="mt-1 text-sm text-[#5A7A95]"
                                    numberOfLines={1}
                                >
                                    {nextLesson.title}
                                </Text>
                            </View>

                            <ChevronRight
                                size={22}
                                color="#3478D9"
                            />
                        </Pressable>
                    ) : null}
                </View>

                {/* Section title */}
                <View className="mb-5 mt-9 flex-row items-end justify-between">
                    <View>
                        <Text className="text-2xl font-extrabold text-[#1A3A52]">
                            Lekcje
                        </Text>

                        <Text className="mt-1 text-sm text-[#7B91A3]">
                            Ucz się w swoim tempie
                        </Text>
                    </View>

                    <View className="rounded-full bg-[#D9EEF7] px-3 py-1.5">
                        <Text className="text-xs font-bold text-[#3478D9]">
                            {completedLessons}/{totalLessons}
                        </Text>
                    </View>
                </View>

                {course.course_lessons.length === 0 ? (
                    <View className="rounded-[28px] border border-[#DDEAF0] bg-white p-6 shadow-sm">
                        <Text className="font-semibold text-[#5A7A95]">
                            Ten kurs nie ma jeszcze lekcji.
                        </Text>
                    </View>
                ) : (
                    <View className="gap-4">
                        {course.course_lessons.map((lesson) => {
                            const isCompleted =
                                completedLessonIds.includes(lesson.id)

                            return (
                                <Pressable
                                    key={lesson.id}
                                    onPress={() => openLesson(lesson.id)}
                                    className="overflow-hidden rounded-[28px] border border-[#DDEAF0] bg-white shadow-sm"
                                >
                                    <View className="flex-row items-center p-5">
                                        <View
                                            className={`h-14 w-14 items-center justify-center rounded-2xl ${isCompleted
                                                    ? 'bg-[#E8F5DF]'
                                                    : 'bg-[#D9EEF7]'
                                                }`}
                                        >
                                            {isCompleted ? (
                                                <CircleCheck
                                                    size={28}
                                                    color="#69A84F"
                                                    strokeWidth={2.4}
                                                />
                                            ) : (
                                                <BookOpen
                                                    size={26}
                                                    color="#3478D9"
                                                    strokeWidth={2.3}
                                                />
                                            )}
                                        </View>

                                        <View className="ml-4 flex-1">
                                            <Text className="text-xs font-bold uppercase tracking-wider text-[#78A4CB]">
                                                Lekcja {lesson.position}
                                            </Text>

                                            <Text className="mt-1 text-lg font-extrabold leading-tight text-[#1A3A52]">
                                                {lesson.title}
                                            </Text>

                                            <View className="mt-3 flex-row items-center">
                                                <Clock3
                                                    size={15}
                                                    color="#7B91A3"
                                                />

                                                <Text className="ml-2 text-sm text-[#7B91A3]">
                                                    10–15 minut
                                                </Text>
                                            </View>
                                        </View>

                                        <ChevronRight
                                            size={22}
                                            color="#9AA8B0"
                                        />
                                    </View>

                                    <View
                                        className={`flex-row items-center justify-between px-5 py-3 ${isCompleted
                                                ? 'bg-[#F4FAF0]'
                                                : 'bg-[#F7FBFD]'
                                            }`}
                                    >
                                        <View className="flex-row items-center">
                                            {isCompleted ? (
                                                <Check
                                                    size={17}
                                                    color="#69A84F"
                                                    strokeWidth={2.6}
                                                />
                                            ) : (
                                                <BookOpen
                                                    size={16}
                                                    color="#9AA8B0"
                                                />
                                            )}

                                            <Text
                                                className={`ml-2 text-sm font-semibold ${isCompleted
                                                        ? 'text-[#69A84F]'
                                                        : 'text-[#5A7A95]'
                                                    }`}
                                            >
                                                {isCompleted
                                                    ? 'Ukończona'
                                                    : 'Do rozpoczęcia'}
                                            </Text>
                                        </View>

                                        <Text className="text-sm font-bold text-[#3478D9]">
                                            {isCompleted ? 'Powtórz' : 'Otwórz'}
                                        </Text>
                                    </View>
                                </Pressable>
                            )
                        })}
                    </View>
                )}
            </ScrollView>
        </View>
    )
}