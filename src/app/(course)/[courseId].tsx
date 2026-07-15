import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
    BookOpen,
    ChevronRight,
    Play,
    CircleCheck,
    Clock3,
    Sailboat,
} from 'lucide-react-native'

import {
    getCourseWithLessons,
    type CourseWithLessons,
} from '@/services/courses.service'

export default function CourseDetailsScreen() {
    const router = useRouter()
    const { courseId } = useLocalSearchParams<{ courseId: string }>()

    const [course, setCourse] =
        useState<CourseWithLessons | null>(null)

    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] =
        useState<string | null>(null)

    useEffect(() => {
        async function loadCourse() {
            if (!courseId) {
                setErrorMessage('Brak identyfikatora kursu.')
                setIsLoading(false)
                return
            }

            try {
                const data = await getCourseWithLessons(courseId)
                setCourse(data)
                console.log(data)
            } catch (e) {
                console.error(e)
                setErrorMessage('Nie udało się pobrać kursu.')
            } finally {
                setIsLoading(false)
            }
        }

        loadCourse()
    }, [courseId])



    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F0F7FA]">
                <ActivityIndicator
                    size="large"
                    color="#3478D9"
                />
            </View>
        )
    }

    if (errorMessage || !course) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F0F7FA] px-6">
                <Text className="text-center text-lg font-bold text-[#1A3A52]">
                    {errorMessage ?? 'Nie znaleziono kursu'}
                </Text>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-[#F0F7FA]">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingTop: 56,
                    paddingBottom: 80,
                }}
            >
                {/* HEADER */}

                <Text className="text-sm font-semibold uppercase tracking-widest text-[#78A4CB]">
                    Kurs
                </Text>

                <Text className="mt-2 text-4xl font-extrabold text-[#1A3A52]">
                    {course.name}
                </Text>

                <Text className="mt-4 text-base leading-7 text-[#5A7A95]">
                    {course.description ??
                        'Przygotuj się do egzaminu krok po kroku.'}
                </Text>

                {/* HERO */}

                <View className="mt-8 overflow-hidden rounded-[30px] bg-[#3478D9] p-6">
                    <View className="absolute -right-5 top-6 opacity-10">
                        <Sailboat
                            size={160}
                            color="white"
                        />
                    </View>

                    <Text className="text-xs font-bold uppercase tracking-widest text-white/80">
                        Twój postęp
                    </Text>

                    <Text className="mt-2 text-3xl font-extrabold text-white">
                        35%
                    </Text>

                    <View className="mt-6 h-3 overflow-hidden rounded-full bg-white/20">
                        <View className="h-full w-[35%] rounded-full bg-white" />
                    </View>

                    <Pressable className="mt-8 flex-row items-center justify-between rounded-2xl bg-white px-5 py-4">
                        <Text className="text-lg font-bold text-[#3478D9]">
                            Kontynuuj naukę
                        </Text>

                        <Play
                            size={22}
                            color="#3478D9"
                            fill="#3478D9"
                        />
                    </Pressable>
                </View>

                {/* LEKCJE */}

                <Text className="mt-10 mb-5 text-2xl font-extrabold text-[#1A3A52]">
                    Moduły kursu
                </Text>

                <View className="gap-5">
                    {course.course_lessons.map((lesson) => (
                        <Pressable
                            key={lesson.id}
                            onPress={() =>
                                router.push({
                                    pathname: '/(course)/lesson/[lessonId]',
                                    params: {
                                        lessonId: lesson.id,
                                    },
                                })
                            }
                            className="rounded-[30px] border border-[#DDEAF0] bg-white p-5 shadow-sm"
                        >
                            <View className="flex-row items-start justify-between">
                                <View className="flex-row flex-1">
                                    <View className="h-16 w-16 items-center justify-center rounded-3xl bg-[#D9EEF7]">
                                        <BookOpen
                                            size={30}
                                            color="#3478D9"
                                        />
                                    </View>

                                    <View className="ml-4 flex-1">
                                        <Text className="text-sm font-semibold uppercase tracking-wide text-[#78A4CB]">
                                            Lekcja {lesson.position}
                                        </Text>

                                        <Text className="mt-1 text-xl font-extrabold leading-tight text-[#1A3A52]">
                                            {lesson.title}
                                        </Text>

                                        <View className="mt-4 flex-row items-center">
                                            <Clock3
                                                size={16}
                                                color="#7B91A3"
                                            />

                                            <Text className="ml-2 text-sm text-[#7B91A3]">
                                                10–15 minut
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <ChevronRight
                                    size={24}
                                    color="#9AA8B0"
                                />
                            </View>

                            <View className="mt-5 flex-row items-center justify-between rounded-2xl bg-[#F0F7FA] px-4 py-3">
                                <View className="flex-row items-center">
                                    <CircleCheck
                                        size={18}
                                        color="#8FC36D"
                                    />

                                    <Text className="ml-2 font-medium text-[#5A7A95]">
                                        Gotowa do rozpoczęcia
                                    </Text>
                                </View>

                                <Text className="font-bold text-[#3478D9]">
                                    Rozpocznij
                                </Text>
                            </View>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </View>
    )
}