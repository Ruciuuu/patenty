import { useCallback, useState } from 'react'
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import Svg, { Path } from 'react-native-svg'
import {
    BookOpen,
    CheckCircle2,
    ChevronRight,
    ClipboardCheck,
    Play,
    Sparkles,
    Trophy,
} from 'lucide-react-native'

import { BottomNav } from '@/components/app/bottom-nav'
import { useAuth } from '@/context/auth-context'
import {
    getCourses,
    getCourseWithLessons,
    type CourseWithLessons,
} from '@/services/courses.service'
import { getCompletedLessonIds } from '@/services/progress.service'

export default function HomeScreen() {
    const router = useRouter()
    const { user } = useAuth()

    const [course, setCourse] =
        useState<CourseWithLessons | null>(null)

    const [completedLessonIds, setCompletedLessonIds] =
        useState<string[]>([])

    const [isLoadingCourse, setIsLoadingCourse] =
        useState(true)

    const [courseError, setCourseError] =
        useState<string | null>(null)

    const userName =
        user?.user_metadata?.first_name?.trim() ||
        user?.user_metadata?.full_name?.trim() ||
        user?.email?.split('@')[0] ||
        'Kapitanie'

    const loadCourseData = useCallback(async () => {
        try {
            setIsLoadingCourse(true)
            setCourseError(null)

            const courses = await getCourses()
            const firstCourse = courses[0]

            if (!firstCourse) {
                setCourse(null)
                setCompletedLessonIds([])
                return
            }

            const courseData =
                await getCourseWithLessons(firstCourse.id)

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
            console.error(
                'Nie udało się pobrać danych kursu na ekranie głównym:',
                error,
            )

            setCourse(null)
            setCompletedLessonIds([])
            setCourseError(
                'Nie udało się pobrać danych kursu.',
            )
        } finally {
            setIsLoadingCourse(false)
        }
    }, [user?.id])

    useFocusEffect(
        useCallback(() => {
            void loadCourseData()
        }, [loadCourseData]),
    )

    const totalLessons =
        course?.course_lessons.length ?? 0

    const completedLessons = course
        ? course.course_lessons.filter((lesson) =>
            completedLessonIds.includes(lesson.id),
        ).length
        : 0

    const progressPercent =
        totalLessons === 0
            ? 0
            : Math.round(
                (completedLessons / totalLessons) * 100,
            )

    const nextLesson = course?.course_lessons.find(
        (lesson) =>
            !completedLessonIds.includes(lesson.id),
    )

    const isCourseCompleted =
        totalLessons > 0 &&
        completedLessons === totalLessons

    function openCourse() {
        if (!course) {
            return
        }

        router.push({
            pathname: '/(course)/[courseId]',
            params: {
                courseId: course.id,
            },
        })
    }

    function openNextLesson() {
        if (!nextLesson) {
            openCourse()
            return
        }

        router.push({
            pathname: '/(course)/lesson/[lessonId]',
            params: {
                lessonId: nextLesson.id,
            },
        })
    }

    return (
        <View className="flex-1 bg-[#DDEFF6]">
            <OceanBackground />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingBottom: 140,
                }}
                showsVerticalScrollIndicator={false}
            >
                <View className="px-5 pt-14">
                    {/* Powitanie */}
                    <View className="mb-7 flex-row items-start justify-between">
                        <View className="flex-1 pr-4">
                            <Text className="text-xs font-bold uppercase tracking-[2px] text-[#3478D9]">
                                Witaj na pokładzie
                            </Text>

                            <Text className="mt-2 text-4xl font-extrabold leading-tight text-[#163A59]">
                                Cześć, {userName}
                            </Text>

                            <Text className="mt-3 max-w-sm text-base leading-6 text-[#55748B]">
                                Kontynuuj naukę lub sprawdź swoją
                                wiedzę na egzaminie próbnym.
                            </Text>
                        </View>


                    </View>

                    {/* Hero */}
                    <View className="mb-7 h-[330px] overflow-hidden rounded-[34px] bg-[#163A59] shadow-lg">
                        <Image
                            source={require('@/assets/images/home-boat.jpg')}
                            className="absolute h-full w-full"
                            resizeMode="cover"
                        />

                        <View className="absolute inset-0 bg-[#102F49]/60" />
                        <HeroWave />

                        <View className="z-10 flex-1 justify-between p-6">
                            <View className="flex-row items-center justify-between">
                                <View className="rounded-full bg-white/15 px-4 py-2">
                                    <Text className="text-xs font-bold uppercase tracking-widest text-white">
                                        Sternik motorowodny
                                    </Text>
                                </View>


                            </View>

                            <View>
                                {isLoadingCourse ? (
                                    <View className="items-start">
                                        <ActivityIndicator
                                            size="small"
                                            color="#FFFFFF"
                                        />

                                        <Text className="mt-3 text-sm font-semibold text-white/80">
                                            Pobieranie kolejnej lekcji...
                                        </Text>
                                    </View>
                                ) : courseError ? (
                                    <Text className="max-w-[280px] text-2xl font-extrabold leading-tight text-white">
                                        {courseError}
                                    </Text>
                                ) : nextLesson ? (
                                    <>
                                        <Text className="text-sm font-semibold text-white/70">
                                            Kontynuuj naukę
                                        </Text>

                                        <Text
                                            className="mt-2 max-w-[300px] text-3xl font-extrabold leading-tight text-white"
                                            numberOfLines={3}
                                        >
                                            {nextLesson.title}
                                        </Text>
                                    </>
                                ) : isCourseCompleted ? (
                                    <>
                                        <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#B9E49B]">
                                            <Trophy
                                                size={25}
                                                color="#315D28"
                                            />
                                        </View>

                                        <Text className="text-3xl font-extrabold text-white">
                                            Kurs ukończony
                                        </Text>
                                    </>
                                ) : (
                                    <Text className="max-w-[280px] text-3xl font-extrabold leading-tight text-white">
                                        Rozpocznij przygotowania do egzaminu
                                    </Text>
                                )}

                                <View className="mt-5 flex-row items-center">
                                    <View className="mr-4 h-12 w-12 items-center justify-center rounded-full border-4 border-white/40 bg-white/10">
                                        <Text className="text-xs font-extrabold text-white">
                                            {progressPercent}%
                                        </Text>
                                    </View>

                                    <View className="flex-1">
                                        <View className="h-2.5 overflow-hidden rounded-full bg-white/20">
                                            <View
                                                className="h-full rounded-full bg-[#F9E8A2]"
                                                style={{
                                                    width: `${progressPercent}%`,
                                                }}
                                            />
                                        </View>

                                        <Text className="mt-2 text-xs font-medium text-white/70">
                                            {completedLessons} z {totalLessons}{' '}
                                            lekcji ukończonych
                                        </Text>
                                    </View>
                                </View>

                                <Pressable
                                    onPress={openNextLesson}
                                    disabled={isLoadingCourse || !course}
                                    className={`mt-6 flex-row items-center justify-center rounded-[20px] px-5 py-4 ${isLoadingCourse || !course
                                        ? 'bg-white/20'
                                        : 'bg-white'
                                        }`}
                                >
                                    <Play
                                        size={19}
                                        color={
                                            isLoadingCourse || !course
                                                ? '#FFFFFF'
                                                : '#3478D9'
                                        }
                                        fill={
                                            isLoadingCourse || !course
                                                ? '#FFFFFF'
                                                : '#3478D9'
                                        }
                                    />

                                    <Text
                                        className={`ml-3 text-base font-extrabold ${isLoadingCourse || !course
                                            ? 'text-white'
                                            : 'text-[#3478D9]'
                                            }`}
                                    >
                                        {nextLesson
                                            ? 'Kontynuuj lekcję'
                                            : isCourseCompleted
                                                ? 'Powtórz kurs'
                                                : 'Otwórz kurs'}
                                    </Text>

                                    <ChevronRight
                                        size={21}
                                        color={
                                            isLoadingCourse || !course
                                                ? '#FFFFFF'
                                                : '#3478D9'
                                        }
                                    />
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    {/* Nagłówek sekcji */}
                    <View className="mb-4 flex-row items-end justify-between">
                        <View>
                            <Text className="text-2xl font-extrabold text-[#163A59]">
                                Wybierz tryb
                            </Text>

                            <Text className="mt-1 text-sm text-[#647F92]">
                                Nauka lub sprawdzenie wiedzy
                            </Text>
                        </View>


                    </View>

                    {/* Karta kursu */}
                    <Pressable
                        onPress={
                            nextLesson ? openNextLesson : openCourse
                        }
                        disabled={isLoadingCourse}
                        className="mb-4 min-h-[245px] overflow-hidden rounded-[32px] bg-[#3478D9] p-6 shadow-md"
                    >
                        <CardWave color="#74A8E2" />


                        <View className="z-10 flex-1 justify-between">
                            <View className="flex-row items-start justify-between">
                                <View className="h-14 w-14 items-center justify-center rounded-[20px] bg-white/15">
                                    <BookOpen
                                        size={28}
                                        color="#FFFFFF"
                                        strokeWidth={2.2}
                                    />
                                </View>

                                <View className="rounded-full bg-white/15 px-4 py-2">
                                    <Text className="text-xs font-bold text-white">
                                        {progressPercent}% ukończone
                                    </Text>
                                </View>
                            </View>

                            <View className="mt-7">
                                <Text className="text-2xl font-extrabold leading-tight text-white">
                                    {course?.name ??
                                        'Kurs sternika motorowodnego'}
                                </Text>

                                <Text
                                    className="mt-3 max-w-[290px] text-base leading-6 text-white/80"
                                    numberOfLines={3}
                                >
                                    {course?.description ??
                                        'Lekcje i materiały przygotowujące do egzaminu.'}
                                </Text>
                            </View>

                            <View className="mt-6 flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <CheckCircle2
                                        size={18}
                                        color="#DDF4CA"
                                    />

                                    <Text className="ml-2 text-sm font-semibold text-white/90">
                                        {completedLessons}/{totalLessons}{' '}
                                        lekcji
                                    </Text>
                                </View>

                                <View className="h-11 w-11 items-center justify-center rounded-full bg-white">
                                    <ChevronRight
                                        size={23}
                                        color="#3478D9"
                                    />
                                </View>
                            </View>
                        </View>
                    </Pressable>

                    {/* Karta egzaminów */}
                    <Pressable
                        onPress={() => router.push('/exams')}
                        className="mb-5 min-h-[225px] overflow-hidden rounded-[32px] bg-[#F9E8A2] p-6 shadow-sm"
                    >
                        <CardWave color="#F2D66D" />



                        <View className="z-10 flex-1 justify-between">
                            <View className="flex-row items-start justify-between">
                                <View className="h-14 w-14 items-center justify-center rounded-[20px] bg-white/50">
                                    <ClipboardCheck
                                        size={29}
                                        color="#163A59"
                                        strokeWidth={2.2}
                                    />
                                </View>

                                <View className="flex-row items-center rounded-full bg-white/50 px-4 py-2">
                                    <Sparkles
                                        size={14}
                                        color="#7E661E"
                                    />

                                    <Text className="ml-2 text-xs font-bold text-[#7E661E]">
                                        Egzamin próbny
                                    </Text>
                                </View>
                            </View>

                            <View className="mt-7">
                                <Text className="text-2xl font-extrabold leading-tight text-[#163A59]">
                                    Egzaminy sternika motorowodnego
                                </Text>

                                <Text className="mt-3 max-w-[290px] text-base leading-6 text-[#5F654D]">
                                    Rozwiązuj pełne zestawy pytań i
                                    sprawdzaj swoją gotowość.
                                </Text>
                            </View>

                            <View className="mt-6 flex-row items-center justify-between">
                                <Text className="text-sm font-bold text-[#163A59]">
                                    Rozpocznij egzamin
                                </Text>

                                <View className="h-11 w-11 items-center justify-center rounded-full bg-[#163A59]">
                                    <ChevronRight
                                        size={23}
                                        color="#FFFFFF"
                                    />
                                </View>
                            </View>
                        </View>
                    </Pressable>

                    {/* Pasek stanu */}
                    <View className="mb-6 overflow-hidden rounded-[28px] bg-[#B9DFEB] p-5">


                        <View className="z-10 flex-row items-center">

                            <View className="ml-4 flex-rw">

                                <Text className="text-xs font-bold uppercase tracking-widest text-[#3478D9]">
                                    Twój postęp
                                </Text>

                                <Text className="mt-1 text-lg font-extrabold text-[#163A59]">
                                    {totalLessons > 0
                                        ? `${completedLessons} z ${totalLessons} lekcji ukończonych`
                                        : 'Rozpocznij swoją pierwszą lekcję'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <BottomNav />
        </View>
    )
}

function OceanBackground() {
    return (
        <View className="absolute inset-0 overflow-hidden">
            <View className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#B9E0EC]/60" />

            <View className="absolute left-[-90] top-[340px] h-72 w-72 rounded-full bg-[#CEEAF2]/70" />

            <View className="absolute bottom-0 left-0 right-0 h-64">
                <Svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 400 250"
                    preserveAspectRatio="none"
                >
                    <Path
                        d="M0 85 C70 25 135 145 215 80 C285 25 330 105 400 55 L400 250 L0 250 Z"
                        fill="#B9DFEB"
                        opacity={0.48}
                    />

                    <Path
                        d="M0 140 C85 75 145 185 235 120 C305 70 350 135 400 105 L400 250 L0 250 Z"
                        fill="#78A4CB"
                        opacity={0.25}
                    />
                </Svg>
            </View>
        </View>
    )
}

function HeroWave() {
    return (
        <View className="absolute bottom-0 left-0 right-0 h-32">
            <Svg
                width="100%"
                height="100%"
                viewBox="0 0 400 130"
                preserveAspectRatio="none"
            >
                <Path
                    d="M0 72 C70 20 130 112 215 65 C292 22 340 92 400 50 L400 130 L0 130 Z"
                    fill="#3478D9"
                    opacity={0.25}
                />

                <Path
                    d="M0 98 C80 55 145 132 235 92 C310 58 350 105 400 82 L400 130 L0 130 Z"
                    fill="#163A59"
                    opacity={0.48}
                />
            </Svg>
        </View>
    )
}

function CardWave({
    color,
}: {
    color: string
}) {
    return (
        <View className="absolute bottom-0 left-0 right-0 h-24">
            <Svg
                width="100%"
                height="100%"
                viewBox="0 0 400 100"
                preserveAspectRatio="none"
            >
                <Path
                    d="M0 48 C75 4 130 85 220 44 C300 8 345 67 400 40 L400 100 L0 100 Z"
                    fill={color}
                    opacity={0.38}
                />


            </Svg>
        </View>
    )
}