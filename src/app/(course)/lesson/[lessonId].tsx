import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
    ArrowLeft,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ImageOff,
} from 'lucide-react-native'

import { useAuth } from '@/context/auth-context'
import {
    getSlides,
    type LessonSlide,
} from '@/services/lesson.service'
import { completeLesson } from '@/services/progress.service'

export default function LessonScreen() {
    const router = useRouter()
    const { user } = useAuth()

    const { lessonId } = useLocalSearchParams<{
        lessonId: string
    }>()

    const [slides, setSlides] = useState<LessonSlide[]>([])
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isFinishing, setIsFinishing] = useState(false)
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
            Math.max(currentIndex - 1, 0),
        )
    }

    function goToNextSlide() {
        setCurrentSlideIndex((currentIndex) =>
            Math.min(currentIndex + 1, slides.length - 1),
        )
    }

    async function finishLesson() {
        if (!user?.id) {
            Alert.alert(
                'Błąd',
                'Musisz być zalogowany, aby zapisać postęp.',
            )
            return
        }

        if (!lessonId) {
            Alert.alert('Błąd', 'Brak identyfikatora lekcji.')
            return
        }

        try {
            setIsFinishing(true)

            await completeLesson(user.id, lessonId)

            router.back()
        } catch (error) {
            console.error('Nie udało się ukończyć lekcji:', error)

            Alert.alert(
                'Błąd',
                'Nie udało się zapisać ukończenia lekcji.',
            )
        } finally {
            setIsFinishing(false)
        }
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
                    Pobieranie lekcji...
                </Text>
            </View>
        )
    }

    if (errorMessage) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F0F7FA] px-6">
                <View className="w-full rounded-[28px] border border-[#DDEAF0] bg-white p-6 shadow-sm">
                    <Text className="text-center text-lg font-bold text-[#1A3A52]">
                        {errorMessage}
                    </Text>

                    <Pressable
                        onPress={() => router.back()}
                        className="mt-5 items-center rounded-2xl bg-[#3478D9] px-5 py-4"
                    >
                        <Text className="font-bold text-white">
                            Wróć
                        </Text>
                    </Pressable>
                </View>
            </View>
        )
    }

    if (slides.length === 0) {
        return (
            <View className="flex-1 bg-[#F0F7FA] px-6 pt-14">
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

                <View className="mt-8 items-center rounded-[28px] border border-[#DDEAF0] bg-white p-8 shadow-sm">
                    <View className="h-16 w-16 items-center justify-center rounded-3xl bg-[#D9EEF7]">
                        <ImageOff
                            size={30}
                            color="#3478D9"
                        />
                    </View>

                    <Text className="mt-5 text-center text-xl font-extrabold text-[#1A3A52]">
                        Brak materiałów
                    </Text>

                    <Text className="mt-2 text-center text-base leading-6 text-[#5A7A95]">
                        Ta lekcja nie ma jeszcze slajdów.
                    </Text>
                </View>
            </View>
        )
    }

    const currentSlide = slides[currentSlideIndex]
    const images = currentSlide.lesson_slide_images ?? []

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
                        disabled={isFinishing}
                        className="h-12 w-12 items-center justify-center rounded-2xl border border-[#DDEAF0] bg-white shadow-sm"
                    >
                        <ArrowLeft
                            size={22}
                            color="#1A3A52"
                            strokeWidth={2.3}
                        />
                    </Pressable>

                    <View className="ml-4 flex-1">
                        <Text className="text-xs font-semibold uppercase tracking-widest text-[#78A4CB]">
                            Lekcja
                        </Text>

                        <Text
                            className="mt-1 text-lg font-extrabold text-[#1A3A52]"
                            numberOfLines={1}
                        >
                            {currentSlide.title ?? 'Materiał lekcji'}
                        </Text>
                    </View>

                    <View className="rounded-full bg-[#D9EEF7] px-3.5 py-2">
                        <Text className="text-sm font-bold text-[#3478D9]">
                            {currentSlideIndex + 1}/{slides.length}
                        </Text>
                    </View>
                </View>

                <View className="mt-5 h-2.5 overflow-hidden rounded-full bg-[#D9EEF7]">
                    <View
                        className="h-full rounded-full bg-[#3478D9]"
                        style={{
                            width: `${progress}%`,
                        }}
                    />
                </View>
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingTop: 24,
                    paddingBottom: 36,
                }}
                showsVerticalScrollIndicator={false}
            >
                <View className="overflow-hidden rounded-[32px] border border-[#DDEAF0] bg-white shadow-sm">
                    {images.length > 0 ? (
                        <View>
                            {images.map((image, index) => (
                                <Image
                                    key={image.id}
                                    source={{ uri: image.image_url }}
                                    className={`w-full ${index === 0 ? 'h-64' : 'mt-3 h-56'
                                        }`}
                                    resizeMode="cover"
                                />
                            ))}
                        </View>
                    ) : (
                        <View className="h-36 items-center justify-center bg-[#D9EEF7]/50">
                            <ImageOff
                                size={34}
                                color="#78A4CB"
                            />

                            <Text className="mt-2 text-sm font-semibold text-[#5A7A95]">
                                Slajd bez ilustracji
                            </Text>
                        </View>
                    )}

                    <View className="p-6">
                        <Text className="text-xs font-bold uppercase tracking-widest text-[#78A4CB]">
                            Część {currentSlideIndex + 1}
                        </Text>

                        {currentSlide.title ? (
                            <Text className="mt-3 text-3xl font-extrabold leading-tight text-[#1A3A52]">
                                {currentSlide.title}
                            </Text>
                        ) : null}

                        <Text className="mt-5 text-[17px] leading-8 text-[#36566F]">
                            {currentSlide.content}
                        </Text>

                        {isLastSlide ? (
                            <View className="mt-7 flex-row items-start rounded-2xl bg-[#F0F8EA] p-4">
                                <CheckCircle2
                                    size={22}
                                    color="#69A84F"
                                    strokeWidth={2.4}
                                />

                                <View className="ml-3 flex-1">
                                    <Text className="font-bold text-[#416E30]">
                                        Ostatni slajd
                                    </Text>

                                    <Text className="mt-1 text-sm leading-5 text-[#66845A]">
                                        Gratulacje! Udało Ci się ukończyć tę lekcję.
                                    </Text>
                                </View>
                            </View>
                        ) : null}
                    </View>
                </View>
            </ScrollView>

            {/* Navigation */}
            <View className="border-t border-[#DDEAF0] bg-white px-6 pb-8 pt-4">
                <View className="flex-row gap-3">
                    <Pressable
                        disabled={isFirstSlide || isFinishing}
                        onPress={goToPreviousSlide}
                        className={`h-14 w-14 items-center justify-center rounded-2xl ${isFirstSlide || isFinishing
                            ? 'bg-[#EEF2F4]'
                            : 'bg-[#D9EEF7]'
                            }`}
                    >
                        <ChevronLeft
                            size={27}
                            color={
                                isFirstSlide || isFinishing
                                    ? '#B5C0C7'
                                    : '#3478D9'
                            }
                            strokeWidth={2.5}
                        />
                    </Pressable>

                    {isLastSlide ? (
                        <Pressable
                            onPress={finishLesson}
                            disabled={isFinishing}
                            className={`h-14 flex-1 flex-row items-center justify-center rounded-2xl ${isFinishing
                                ? 'bg-[#9BBCE8]'
                                : 'bg-[#3478D9]'
                                }`}
                        >
                            {isFinishing ? (
                                <>
                                    <ActivityIndicator color="#FFFFFF" />

                                    <Text className="ml-3 text-base font-bold text-white">
                                        Zapisywanie...
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2
                                        size={22}
                                        color="#FFFFFF"
                                        strokeWidth={2.4}
                                    />

                                    <Text className="ml-2 text-base font-extrabold text-white">
                                        Zakończ lekcję
                                    </Text>
                                </>
                            )}
                        </Pressable>
                    ) : (
                        <Pressable
                            onPress={goToNextSlide}
                            disabled={isFinishing}
                            className="h-14 flex-1 flex-row items-center justify-center rounded-2xl bg-[#3478D9]"
                        >
                            <Text className="mr-2 text-base font-extrabold text-white">
                                Dalej
                            </Text>

                            <ChevronRight
                                size={22}
                                color="#FFFFFF"
                                strokeWidth={2.5}
                            />
                        </Pressable>
                    )}
                </View>
            </View>
        </View>
    )
}