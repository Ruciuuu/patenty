import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react-native'

import {
    getSlides,
    type LessonSlide,
} from '@/services/lesson.service'

export default function LessonScreen() {
    const router = useRouter()

    const { lessonId } = useLocalSearchParams<{
        lessonId: string
    }>()

    const [slides, setSlides] = useState<LessonSlide[]>([])
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    useEffect(() => {
        async function loadSlides() {
            if (!lessonId) {
                setErrorMessage('Brak identyfikatora lekcji.')
                setIsLoading(false)
                return
            }

            try {
                setErrorMessage(null)

                const data = await getSlides(lessonId)

                setSlides(data)
                setCurrentSlideIndex(0)
            } catch (error) {
                console.error('Nie udało się pobrać slajdów:', error)

                setErrorMessage('Nie udało się pobrać lekcji.')
            } finally {
                setIsLoading(false)
            }
        }

        loadSlides()
    }, [lessonId])

    function goToPreviousSlide() {
        setCurrentSlideIndex((currentIndex) =>
            Math.max(currentIndex - 1, 0)
        )
    }

    function goToNextSlide() {
        setCurrentSlideIndex((currentIndex) =>
            Math.min(currentIndex + 1, slides.length - 1)
        )
    }

    function finishLesson() {
        console.log('Zakończono lekcję:', lessonId)

        router.back()
    }

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F0F7FA]">
                <ActivityIndicator size="large" color="#3478D9" />

                <Text className="mt-4 text-base font-semibold text-[#5A7A95]">
                    Pobieranie lekcji...
                </Text>
            </View>
        )
    }

    if (errorMessage) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F0F7FA] px-6">
                <Text className="text-center text-lg font-bold text-[#1A3A52]">
                    {errorMessage}
                </Text>
            </View>
        )
    }

    if (slides.length === 0) {
        return (
            <View className="flex-1 bg-[#F0F7FA] px-6 pt-14">
                <Pressable
                    onPress={() => router.back()}
                    className="mb-8 h-12 w-12 items-center justify-center rounded-2xl bg-white"
                >
                    <ArrowLeft
                        size={24}
                        color="#1A3A52"
                        strokeWidth={2.4}
                    />
                </Pressable>

                <View className="rounded-[28px] bg-white p-6">
                    <Text className="text-lg font-bold text-[#1A3A52]">
                        Ta lekcja nie ma jeszcze slajdów.
                    </Text>
                </View>
            </View>
        )
    }

    const currentSlide = slides[currentSlideIndex]

    const isFirstSlide = currentSlideIndex === 0
    const isLastSlide = currentSlideIndex === slides.length - 1

    const progress = ((currentSlideIndex + 1) / slides.length) * 100

    return (
        <View className="flex-1 bg-[#F0F7FA]">
            {/* Header */}

            <View className="px-6 pt-14">
                <View className="flex-row items-center">
                    <Pressable
                        onPress={() => router.back()}
                        className="h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm"
                    >
                        <ArrowLeft
                            size={22}
                            color="#1A3A52"
                        />
                    </Pressable>

                    <View className="ml-4 flex-1">
                        <Text className="text-xs font-semibold uppercase tracking-widest text-[#78A4CB]">
                            Lekcja
                        </Text>

                        <Text className="mt-1 text-xl font-extrabold text-[#1A3A52]">
                            {currentSlide.title}
                        </Text>
                    </View>

                    <View className="rounded-full bg-[#D9EEF7] px-4 py-2">
                        <Text className="font-bold text-[#3478D9]">
                            {currentSlideIndex + 1}/{slides.length}
                        </Text>
                    </View>
                </View>

                <View className="mt-6 h-3 overflow-hidden rounded-full bg-[#D9EEF7]">
                    <View
                        className="h-full rounded-full bg-[#3478D9]"
                        style={{
                            width: `${progress}%`,
                        }}
                    />
                </View>
            </View>

            {/* CONTENT */}

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    padding: 24,
                    paddingBottom: 40,
                }}
                showsVerticalScrollIndicator={false}
            >
                <View className="rounded-[32px] bg-white p-6 shadow-sm">

                    {currentSlide.lesson_slide_images.length > 0 && (
                        <Image
                            source={{
                                uri:
                                    currentSlide.lesson_slide_images[0]
                                        .image_url,
                            }}
                            resizeMode="cover"
                            className="mb-7 h-64 w-full rounded-[24px]"
                        />
                    )}

                    {currentSlide.title && (
                        <Text className="text-3xl font-extrabold leading-tight text-[#1A3A52]">
                            {currentSlide.title}
                        </Text>
                    )}

                    <Text className="mt-6 text-lg leading-9 text-[#36566F]">
                        {currentSlide.content}
                    </Text>

                </View>
            </ScrollView>

            {/* Bottom */}

            <View className="border-t border-[#DDEAF0] bg-white px-6 pb-8 pt-5">
                <View className="flex-row gap-4">

                    <Pressable
                        disabled={isFirstSlide}
                        onPress={goToPreviousSlide}
                        className={`h-14 w-14 items-center justify-center rounded-2xl ${isFirstSlide
                            ? 'bg-[#EEF2F4]'
                            : 'bg-[#D9EEF7]'
                            }`}
                    >
                        <ChevronLeft
                            size={28}
                            color={
                                isFirstSlide
                                    ? '#AAB7C1'
                                    : '#3478D9'
                            }
                        />
                    </Pressable>

                    {isLastSlide ? (
                        <Pressable
                            onPress={finishLesson}
                            className="h-14 flex-1 items-center justify-center rounded-2xl bg-[#3478D9]"
                        >
                            <Text className="text-lg font-bold text-white">
                                Zakończ lekcję
                            </Text>
                        </Pressable>
                    ) : (
                        <Pressable
                            onPress={goToNextSlide}
                            className="h-14 flex-1 flex-row items-center justify-center rounded-2xl bg-[#3478D9]"
                        >
                            <Text className="mr-2 text-lg font-bold text-white">
                                Następny slajd
                            </Text>

                            <ChevronRight
                                size={22}
                                color="white"
                            />
                        </Pressable>
                    )}
                </View>
            </View>
        </View>
    )
}