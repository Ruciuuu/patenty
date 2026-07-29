import { useFocusEffect, useRouter } from 'expo-router'
import {
    BookOpen,
    ChevronRight,
    RefreshCw,
    Sparkles
} from 'lucide-react-native'
import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react'
import {
    ActivityIndicator,
    Animated,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from 'react-native'
import Svg, {
    Circle,
    Path,
} from 'react-native-svg'

import { BottomNav } from '@/components/app/bottom-nav'
import { useAuth } from '@/context/auth-context'
import { getThumbnail } from '@/lib/supabase-image'
import {
    getCourses,
    getCourseWithLessons,
    type Course,
} from '@/services/courses.service'
import { getCompletedLessonIds } from '@/services/progress.service'

type CourseProgress = Course & {
    completedLessons: number
    totalLessons: number
    progressPercent: number
}

const COLORS = {
    background: '#F8FAFC',
    surface: '#FFFFFF',

    navy: '#293681',
    blue: '#4274D9',
    aqua: '#95CCDD',
    aquaLight: '#D0E7E6',

    text: '#1E2540',
    muted: '#747B8F',
    border: '#E6EAF2',

    softBlue: '#EEF3FC',
    softAqua: '#EEF7F7',

    danger: '#A84A43',
}

const COURSE_IMAGE = require('@/assets/images/home-boat.jpg')

export default function CoursesScreen() {
    const router = useRouter()
    const { user } = useAuth()

    const [courses, setCourses] =
        useState<CourseProgress[]>([])

    const [isLoading, setIsLoading] =
        useState(true)

    const [isRefreshing, setIsRefreshing] =
        useState(false)

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null)

    const entryOpacity = useRef(
        new Animated.Value(0),
    ).current

    const entryTranslateY = useRef(
        new Animated.Value(16),
    ).current

    const loadCourses = useCallback(
        async (refreshing = false) => {
            try {
                if (refreshing) {
                    setIsRefreshing(true)
                } else {
                    setIsLoading(true)
                }

                setErrorMessage(null)

                const coursesData =
                    await getCourses()

                const coursesWithProgress =
                    await Promise.all(
                        coursesData.map(
                            async (course) => {
                                try {
                                    const courseDetails =
                                        await getCourseWithLessons(
                                            course.id,
                                        )

                                    const lessonIds =
                                        courseDetails.course_lessons.map(
                                            (lesson) =>
                                                lesson.id,
                                        )

                                    if (
                                        !user?.id ||
                                        lessonIds.length === 0
                                    ) {
                                        return {
                                            ...course,
                                            completedLessons: 0,
                                            totalLessons:
                                                lessonIds.length,
                                            progressPercent: 0,
                                        }
                                    }

                                    const completedLessonIds =
                                        await getCompletedLessonIds(
                                            user.id,
                                            lessonIds,
                                        )

                                    const completedLessons =
                                        lessonIds.filter(
                                            (lessonId) =>
                                                completedLessonIds.includes(
                                                    lessonId,
                                                ),
                                        ).length

                                    const progressPercent =
                                        Math.round(
                                            (completedLessons /
                                                lessonIds.length) *
                                            100,
                                        )

                                    return {
                                        ...course,
                                        completedLessons,
                                        totalLessons:
                                            lessonIds.length,
                                        progressPercent,
                                    }
                                } catch (error) {
                                    console.error(
                                        `Nie udało się pobrać postępu kursu ${course.id}:`,
                                        error,
                                    )

                                    return {
                                        ...course,
                                        completedLessons: 0,
                                        totalLessons: 0,
                                        progressPercent: 0,
                                    }
                                }
                            },
                        ),
                    )

                setCourses(coursesWithProgress)
            } catch (error) {
                console.error(
                    'Nie udało się pobrać kursów:',
                    error,
                )

                setCourses([])

                setErrorMessage(
                    'Nie udało się pobrać kursów. Spróbuj ponownie.',
                )
            } finally {
                setIsLoading(false)
                setIsRefreshing(false)
            }
        },
        [user?.id],
    )

    useFocusEffect(
        useCallback(() => {
            void loadCourses()
        }, [loadCourses]),
    )

    useEffect(() => {
        Animated.parallel([
            Animated.timing(entryOpacity, {
                toValue: 1,
                duration: 380,
                useNativeDriver: true,
            }),

            Animated.spring(entryTranslateY, {
                toValue: 0,
                damping: 18,
                stiffness: 150,
                mass: 0.8,
                useNativeDriver: true,
            }),
        ]).start()
    }, [entryOpacity, entryTranslateY])

    function handleRefresh() {
        void loadCourses(true)
    }

    function openCourse(courseId: string) {
        router.push({
            pathname: '/(course)/[courseId]',
            params: {
                courseId,
            },
        })
    }

    const completedCourses = courses.filter(
        (course) =>
            course.totalLessons > 0 &&
            course.completedLessons ===
            course.totalLessons,
    ).length

    const averageProgress =
        courses.length === 0
            ? 0
            : Math.round(
                courses.reduce(
                    (sum, course) =>
                        sum +
                        course.progressPercent,
                    0,
                ) / courses.length,
            )

    return (
        <View
            className="flex-1"
            style={{
                backgroundColor:
                    COLORS.background,
            }}
        >
            <BackgroundDecoration />

            <Animated.View
                className="flex-1"
                style={{
                    opacity: entryOpacity,
                    transform: [
                        {
                            translateY:
                                entryTranslateY,
                        },
                    ],
                }}
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingTop: 56,
                        paddingBottom: 145,
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={
                                isRefreshing
                            }
                            onRefresh={
                                handleRefresh
                            }
                            tintColor={
                                COLORS.blue
                            }
                            colors={[
                                COLORS.blue,
                            ]}
                            progressBackgroundColor="#FFFFFF"
                        />
                    }
                    showsVerticalScrollIndicator={
                        false
                    }
                >
                    <Header />

                    {isLoading ? (
                        <LoadingState />
                    ) : errorMessage ? (
                        <ErrorState
                            message={
                                errorMessage
                            }
                            onRetry={() =>
                                void loadCourses()
                            }
                        />
                    ) : courses.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <>
                            <CoursesSummary
                                coursesCount={
                                    courses.length
                                }
                                completedCourses={
                                    completedCourses
                                }
                                averageProgress={
                                    averageProgress
                                }
                            />

                            <View className="mb-5 mt-9">
                                <Text className="text-[11px] font-bold uppercase tracking-[1.6px] text-[#8D94A7]">
                                    Twoje ścieżki
                                </Text>

                                <Text className="mt-2 text-[27px] font-semibold tracking-[-0.7px] text-[#293681]">
                                    Dostępne kursy
                                </Text>

                                <Text className="mt-1 text-sm leading-5 text-[#747B8F]">
                                    Wybierz temat i
                                    kontynuuj naukę.
                                </Text>
                            </View>

                            {courses.map(
                                (course) => (
                                    <CourseCard
                                        key={
                                            course.id
                                        }
                                        course={
                                            course
                                        }
                                        onPress={() =>
                                            openCourse(
                                                course.id,
                                            )
                                        }
                                    />
                                ),
                            )}
                        </>
                    )}
                </ScrollView>
            </Animated.View>

            <BottomNav />
        </View>
    )
}

function Header() {
    return (
        <View className="mb-8">

            <Text className="mt-2 text-[38px] font-semibold leading-[43px] tracking-[-1.4px] text-[#293681]">
                Twoje kursy
            </Text>

            <Text className="mt-3 max-w-[340px] text-[16px] leading-6 text-[#747B8F]">
                Poznawaj teorię krok po kroku
                i wracaj do materiałów w
                dowolnym momencie.
            </Text>
        </View>
    )
}

type CoursesSummaryProps = {
    coursesCount: number
    completedCourses: number
    averageProgress: number
}

function CoursesSummary({
    coursesCount,
    completedCourses,
    averageProgress,
}: CoursesSummaryProps) {
    return (
        <View className="overflow-hidden rounded-[30px] bg-[#293681] p-5">
            <SummaryDecoration />

            <View className="z-10 flex-row items-center">
                <ProgressRing
                    value={
                        averageProgress
                    }
                    size={76}
                />

                <View className="ml-5 flex-1">
                    <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#95CCDD]">
                        Łączny postęp
                    </Text>

                    <Text className="mt-2 text-[21px] font-semibold leading-7 text-white">
                        {completedCourses > 0
                            ? `${completedCourses} ${getCompletedCourseWord(
                                completedCourses,
                            )} ukończone`
                            : 'Każda lekcja przybliża Cię do celu'}
                    </Text>

                    <Text className="mt-1 text-[13px] leading-[19px] text-white/65">
                        {coursesCount}{' '}
                        {getCourseWord(
                            coursesCount,
                        )}{' '}
                        w Twojej bibliotece
                    </Text>
                </View>
            </View>
        </View>
    )
}

function CourseCard({
    course,
    onPress,
}: {
    course: CourseProgress
    onPress: () => void
}) {
    const isCompleted =
        course.totalLessons > 0 &&
        course.completedLessons ===
        course.totalLessons

    const hasStarted =
        course.completedLessons > 0

    const actionLabel = isCompleted
        ? 'Powtórz materiał'
        : hasStarted
            ? 'Kontynuuj naukę'
            : 'Rozpocznij kurs'

    const courseThumbnail = getThumbnail(course.image_url)

    return (
        <Pressable
            onPress={onPress}
            className="mb-5 overflow-hidden rounded-[30px] border border-[#E3E8F1] bg-white"
            style={({ pressed }) => ({
                transform: [
                    {
                        scale: pressed
                            ? 0.988
                            : 1,
                    },
                ],
                opacity: pressed
                    ? 0.97
                    : 1,
            })}
        >
            <View className="relative h-[180px] overflow-hidden">
                <Image
                    source={{
                        uri: courseThumbnail
                    }}
                    className="absolute h-full w-full"
                    resizeMode="cover"
                />

                <View className="absolute inset-0 bg-[#293681]/15" />

                <View className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-2">
                    <Text className="text-[11px] font-bold text-[#293681]">
                        {isCompleted
                            ? 'Ukończony'
                            : `${course.progressPercent}%`}
                    </Text>
                </View>


            </View>

            <View className="p-5">
                <Text className="text-[25px] font-semibold leading-[31px] tracking-[-0.6px] text-[#293681]">
                    {course.name}
                </Text>

                <Text
                    className="mt-2 text-[14px] leading-[21px] text-[#747B8F]"
                    numberOfLines={3}
                >
                    {course.description ??
                        'Lekcje i materiały przygotowujące do egzaminu.'}
                </Text>

                <View className="mt-5">
                    <View className="mb-2 flex-row items-center justify-between">
                        <Text className="text-xs font-semibold text-[#747B8F]">
                            Postęp
                        </Text>

                        <Text className="text-xs font-bold text-[#4274D9]">
                            {
                                course.progressPercent
                            }
                            %
                        </Text>
                    </View>

                    <ProgressBar
                        value={
                            course.progressPercent
                        }
                        trackColor="#E9EDF5"
                        fillColor="#4274D9"
                    />
                </View>

                <View className="mt-5 flex-row items-center justify-between">
                    <View className="flex-1 pr-4">
                        <Text className="text-xs font-semibold text-[#8B92A5]">
                            {course.totalLessons > 0
                                ? `${course.completedLessons} z ${course.totalLessons} lekcji`
                                : 'Materiały kursowe'}
                        </Text>

                        <Text className="mt-1 text-[16px] font-bold text-[#293681]">
                            {actionLabel}
                        </Text>
                    </View>

                    <View className="h-12 w-12 items-center justify-center rounded-full bg-[#293681]">
                        <ChevronRight
                            size={22}
                            color="#FFFFFF"
                        />
                    </View>
                </View>
            </View>
        </Pressable>
    )
}

function LoadingState() {
    return (
        <View className="mt-4 overflow-hidden rounded-[30px] border border-[#E4E9F2] bg-white p-7">
            <View className="items-center py-7">
                <View className="h-16 w-16 items-center justify-center rounded-[22px] bg-[#EEF3FC]">
                    <ActivityIndicator
                        size="small"
                        color="#4274D9"
                    />
                </View>

                <Text className="mt-5 text-[21px] font-semibold text-[#293681]">
                    Pobieranie kursów
                </Text>

                <Text className="mt-2 max-w-[270px] text-center text-sm leading-6 text-[#747B8F]">
                    Przygotowujemy materiały i
                    aktualny postęp nauki.
                </Text>
            </View>

            <View className="mt-2">
                <SkeletonLine width="78%" />

                <SkeletonLine
                    width="100%"
                    className="mt-3"
                />

                <SkeletonLine
                    width="62%"
                    className="mt-3"
                />
            </View>
        </View>
    )
}

function ErrorState({
    message,
    onRetry,
}: {
    message: string
    onRetry: () => void
}) {
    return (
        <View className="mt-4 items-center rounded-[30px] border border-[#E8E5E5] bg-white p-7">
            <View className="h-16 w-16 items-center justify-center rounded-[22px] bg-[#FCE8E7]">
                <RefreshCw
                    size={27}
                    color="#A84A43"
                />
            </View>

            <Text className="mt-5 text-center text-[21px] font-semibold text-[#293681]">
                Nie udało się załadować
                kursów
            </Text>

            <Text className="mt-2 text-center text-sm leading-6 text-[#747B8F]">
                {message}
            </Text>

            <Pressable
                onPress={onRetry}
                className="mt-6 flex-row items-center rounded-[18px] bg-[#293681] px-6 py-4"
                style={({ pressed }) => ({
                    transform: [
                        {
                            scale: pressed
                                ? 0.97
                                : 1,
                        },
                    ],
                })}
            >
                <RefreshCw
                    size={18}
                    color="#FFFFFF"
                />

                <Text className="ml-3 text-[15px] font-bold text-white">
                    Spróbuj ponownie
                </Text>
            </Pressable>
        </View>
    )
}

function EmptyState() {
    return (
        <View className="mt-4 overflow-hidden rounded-[30px] border border-[#E4E9F2] bg-white p-8">
            <EmptyDecoration />

            <View className="z-10 items-center">
                <View className="h-16 w-16 items-center justify-center rounded-[22px] bg-[#EEF3FC]">
                    <BookOpen
                        size={29}
                        color="#4274D9"
                    />
                </View>

                <View className="mt-5 flex-row items-center rounded-full bg-[#EEF7F7] px-3 py-2">
                    <Sparkles
                        size={14}
                        color="#4274D9"
                    />

                    <Text className="ml-2 text-xs font-bold text-[#4274D9]">
                        Biblioteka
                    </Text>
                </View>

                <Text className="mt-5 text-center text-[25px] font-semibold tracking-[-0.5px] text-[#293681]">
                    Brak dostępnych kursów
                </Text>

                <Text className="mt-3 max-w-[285px] text-center text-[15px] leading-6 text-[#747B8F]">
                    Nowe materiały pojawią się
                    tutaj, gdy tylko zostaną
                    udostępnione.
                </Text>
            </View>
        </View>
    )
}

function ProgressBar({
    value,
    trackColor,
    fillColor,
}: {
    value: number
    trackColor: string
    fillColor: string
}) {
    const normalizedValue = Math.min(
        100,
        Math.max(0, value),
    )

    return (
        <View
            className="h-2 overflow-hidden rounded-full"
            style={{
                backgroundColor: trackColor,
            }}
        >
            <View
                className="h-full rounded-full"
                style={{
                    width: `${normalizedValue}%`,
                    backgroundColor: fillColor,
                }}
            />
        </View>
    )
}

function ProgressRing({
    value,
    size,
}: {
    value: number
    size: number
}) {
    const strokeWidth = 5

    const radius =
        (size - strokeWidth) / 2

    const circumference =
        2 * Math.PI * radius

    const normalizedValue = Math.min(
        100,
        Math.max(0, value),
    )

    const strokeDashoffset =
        circumference -
        (normalizedValue / 100) *
        circumference

    return (
        <View
            className="items-center justify-center rounded-full bg-white/10"
            style={{
                width: size,
                height: size,
            }}
        >
            <Svg
                width={size}
                height={size}
                style={{
                    position: 'absolute',
                    transform: [
                        {
                            rotate: '-90deg',
                        },
                    ],
                }}
            >
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth={
                        strokeWidth
                    }
                    fill="transparent"
                />

                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#95CCDD"
                    strokeWidth={
                        strokeWidth
                    }
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={
                        strokeDashoffset
                    }
                    fill="transparent"
                />
            </Svg>

            <Text className="text-xs font-bold text-white">
                {normalizedValue}%
            </Text>
        </View>
    )
}

function SkeletonLine({
    width,
    className = '',
}: {
    width: `${number}%`
    className?: string
}) {
    return (
        <View
            className={`h-3 rounded-full bg-[#E9EDF4] ${className}`}
            style={{
                width,
            }}
        />
    )
}

function BackgroundDecoration() {
    return (
        <View
            pointerEvents="none"
            className="absolute inset-0 overflow-hidden"
        >
            <View className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#D0E7E6]/45" />

            <View className="absolute -left-36 top-[510px] h-72 w-72 rounded-full bg-[#EEF3FC]" />
        </View>
    )
}

function SummaryDecoration() {
    return (
        <View
            pointerEvents="none"
            className="absolute inset-0 overflow-hidden"
        >
            <View className="absolute -right-14 -top-20 h-48 w-48 rounded-full bg-[#4274D9]/35" />

            <View className="absolute -bottom-16 right-16 h-32 w-32 rounded-full bg-[#95CCDD]/10" />
        </View>
    )
}

function EmptyDecoration() {
    return (
        <View
            pointerEvents="none"
            className="absolute bottom-0 left-0 right-0 h-36"
        >
            <Svg
                width="100%"
                height="100%"
                viewBox="0 0 400 140"
                preserveAspectRatio="none"
            >
                <Path
                    d="M-20 118 C60 36 119 148 202 76 C276 13 337 104 430 35"
                    fill="none"
                    stroke="#95CCDD"
                    strokeWidth="2"
                    opacity={0.35}
                />

                <Path
                    d="M-20 136 C71 61 131 158 218 94 C299 35 354 119 430 69"
                    fill="none"
                    stroke="#D0E7E6"
                    strokeWidth="2"
                    opacity={0.5}
                />
            </Svg>
        </View>
    )
}

function getCourseWord(count: number) {
    if (count === 1) {
        return 'kurs'
    }

    if (
        count % 10 >= 2 &&
        count % 10 <= 4 &&
        (count % 100 < 12 ||
            count % 100 > 14)
    ) {
        return 'kursy'
    }

    return 'kursów'
}

function getCompletedCourseWord(
    count: number,
) {
    if (count === 1) {
        return 'kurs'
    }

    return 'kursy'
}