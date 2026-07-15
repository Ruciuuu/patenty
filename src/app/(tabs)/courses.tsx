import React, { useCallback, useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from 'react-native'
import { BookOpen, ChevronRight } from 'lucide-react-native'

import {
    getCourses,
    type Course,
} from '@/services/courses.service'
import { BottomNav } from '@/components/app/bottom-nav'
import { useRouter } from 'expo-router'

export default function CoursesScreen() {
    const [courses, setCourses] = useState<Course[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const router = useRouter();

    const loadCourses = useCallback(async () => {
        try {
            setErrorMessage(null)

            const data = await getCourses()

            setCourses(data)

            console.log('Pobrane kursy:', data)
        } catch (error) {
            console.error('Nie udało się pobrać kursów:', error)

            setErrorMessage('Nie udało się pobrać kursów.')
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [])

    useEffect(() => {
        loadCourses()
    }, [loadCourses])

    function handleRefresh() {
        setIsRefreshing(true)
        loadCourses()
    }

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F0F7FA]">
                <ActivityIndicator size="large" color="#3478D9" />

                <Text className="mt-4 text-base font-semibold text-[#5A7A95]">
                    Pobieranie kursów...
                </Text>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-[#F0F7FA]">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingTop: 56,
                    paddingBottom: 130,
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                <Text className="text-sm font-semibold uppercase tracking-widest text-[#78A4CB]">
                    Kursy
                </Text>

                <Text className="mt-2 text-4xl font-extrabold text-[#1A3A52]">
                    Kurs sternika
                </Text>

                <Text className="mt-3 mb-8 text-base leading-7 text-[#5A7A95]">
                    Wszystkie materiały przygotowujące do egzaminu.
                </Text>

                {courses.map((course) => (
                    <Pressable
                        key={course.id}
                        className="mb-5 overflow-hidden rounded-[30px] border border-[#DDEAF0] bg-white p-6 shadow-sm"
                    >
                        <View className="mb-5 flex-row items-start justify-between">
                            <View className="h-16 w-16 items-center justify-center rounded-3xl bg-[#D9EEF7]">
                                <BookOpen
                                    size={32}
                                    color="#3478D9"
                                />
                            </View>

                            <View className="rounded-full bg-[#EAF5F9] px-4 py-2">
                                <Text className="text-xs font-bold text-[#3478D9]">
                                    Kurs
                                </Text>
                            </View>
                        </View>

                        <Text className="text-2xl font-extrabold text-[#1A3A52]">
                            {course.name}
                        </Text>

                        <Text className="mt-3 text-base leading-7 text-[#5A7A95]">
                            {course.description ??
                                'Rozpocznij naukę i przygotuj się do egzaminu.'}
                        </Text>

                        <View className="mt-6 h-3 overflow-hidden rounded-full bg-[#E6EEF2]">
                            <View className="h-full w-[35%] rounded-full bg-[#3478D9]" />
                        </View>

                        <Pressable
                            className="mt-6 flex-row items-center justify-between rounded-2xl bg-[#3478D9] px-5 py-4"
                            onPress={() => router.push({
                                pathname: '/(course)/[courseId]',
                                params: {
                                    courseId: course.id,
                                },
                            })}
                        >
                            <Text className="text-base font-bold text-white">
                                Rozpocznij kurs
                            </Text>

                            <ChevronRight
                                size={22}
                                color="white"
                            />
                        </Pressable>
                    </Pressable>
                ))}

            </ScrollView>
            <BottomNav />
        </View>
    )
}