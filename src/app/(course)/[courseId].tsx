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
    Play,
} from 'lucide-react-native'
import { useCallback, useState } from 'react'
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native'

import { useAuth } from '@/context/auth-context'
import {
    getCourseWithLessons,
    type CourseWithLessons,
} from '@/services/courses.service'
import { getCompletedLessonIds } from '@/services/progress.service'

const COLORS = {
    background: '#F8FAFC',
    surface: '#FFFFFF',

    navy: '#293681',
    blue: '#4274D9',
    aqua: '#95CCDD',
    aquaLight: '#D0E7E6',

    text: '#1E2540',
    muted: '#747B8F',
    mutedLight: '#9097A9',
    border: '#E4E9F2',

    softBlue: '#EEF3FC',
    softAqua: '#EEF7F7',
}

const COURSE_IMAGE =
    require('@/assets/images/home-boat.jpg')

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

    const [isLoading, setIsLoading] =
        useState(true)

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null)

    const loadCourse = useCallback(async () => {
        if (!courseId) {
            setErrorMessage(
                'Brak identyfikatora kursu.',
            )
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            setErrorMessage(null)

            const courseData =
                await getCourseWithLessons(
                    courseId,
                )

            setCourse(courseData)

            if (!user?.id) {
                setCompletedLessonIds([])
                return
            }

            const lessonIds =
                courseData.course_lessons.map(
                    (lesson) => lesson.id,
                )

            const completedIds =
                await getCompletedLessonIds(
                    user.id,
                    lessonIds,
                )

            setCompletedLessonIds(
                completedIds,
            )
        } catch (error) {
            console.error(
                'Nie udało się pobrać kursu:',
                error,
            )

            setErrorMessage(
                'Nie udało się pobrać kursu.',
            )
        } finally {
            setIsLoading(false)
        }
    }, [courseId, user?.id])

    useFocusEffect(
        useCallback(() => {
            void loadCourse()
        }, [loadCourse]),
    )

    function openLesson(
        lessonId: string,
    ) {
        router.push({
            pathname:
                '/(course)/lesson/[lessonId]',
            params: {
                lessonId,
            },
        })
    }

    if (isLoading) {
        return (
            <LoadingState />
        )
    }

    if (errorMessage || !course) {
        return (
            <ErrorState
                message={
                    errorMessage ??
                    'Nie znaleziono kursu.'
                }
                onRetry={() =>
                    void loadCourse()
                }
                onBack={() =>
                    router.back()
                }
            />
        )
    }

    const totalLessons =
        course.course_lessons.length

    const completedLessons =
        course.course_lessons.filter(
            (lesson) =>
                completedLessonIds.includes(
                    lesson.id,
                ),
        ).length

    const progressPercent =
        totalLessons === 0
            ? 0
            : Math.round(
                (completedLessons /
                    totalLessons) *
                100,
            )

    const nextLesson =
        course.course_lessons.find(
            (lesson) =>
                !completedLessonIds.includes(
                    lesson.id,
                ),
        ) ?? course.course_lessons[0]

    const isCourseCompleted =
        totalLessons > 0 &&
        completedLessons === totalLessons

    return (
        <View
            className="flex-1"
            style={{
                backgroundColor:
                    COLORS.background,
            }}
        >
            <BackgroundDecoration />

            <ScrollView
                showsVerticalScrollIndicator={
                    false
                }
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 56,
                    paddingBottom: 100,
                }}
            >
                <Header
                    onBack={() =>
                        router.back()
                    }
                />

                <CourseHero
                    name={course.name}
                    description={
                        course.description
                    }
                />

                <ProgressCard
                    progressPercent={
                        progressPercent
                    }
                    completedLessons={
                        completedLessons
                    }
                    totalLessons={
                        totalLessons
                    }
                    nextLessonTitle={
                        nextLesson?.title
                    }
                    isCompleted={
                        isCourseCompleted
                    }
                    onPress={
                        nextLesson
                            ? () =>
                                openLesson(
                                    nextLesson.id,
                                )
                            : undefined
                    }
                />

                <LessonsHeader
                    completedLessons={
                        completedLessons
                    }
                    totalLessons={
                        totalLessons
                    }
                />

                {course.course_lessons
                    .length === 0 ? (
                    <EmptyLessonsState />
                ) : (
                    <View className="gap-4">
                        {course.course_lessons.map(
                            (lesson) => {
                                const isCompleted =
                                    completedLessonIds.includes(
                                        lesson.id,
                                    )

                                return (
                                    <LessonCard
                                        key={
                                            lesson.id
                                        }
                                        title={
                                            lesson.title
                                        }
                                        position={
                                            lesson.position
                                        }
                                        isCompleted={
                                            isCompleted
                                        }
                                        onPress={() =>
                                            openLesson(
                                                lesson.id,
                                            )
                                        }
                                    />
                                )
                            },
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

function Header({
    onBack,
}: {
    onBack: () => void
}) {
    return (
        <View className="mb-6 flex-row items-center">
            <Pressable
                onPress={onBack}
                className="h-12 w-12 items-center justify-center rounded-[18px] border border-[#E4E9F2] bg-white"
                style={({ pressed }) => ({
                    transform: [
                        {
                            scale: pressed
                                ? 0.96
                                : 1,
                        },
                    ],
                })}
            >
                <ArrowLeft
                    size={21}
                    color="#293681"
                    strokeWidth={2.4}
                />
            </Pressable>

            <View className="ml-4">
                <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#8B92A5]">
                    Kurs
                </Text>

                <Text className="mt-1 text-sm font-semibold text-[#293681]">
                    Sternik motorowodny
                </Text>
            </View>
        </View>
    )
}

function CourseHero({
    name,
    description,
}: {
    name: string
    description: string | null
}) {
    return (
        <View className="mb-6 overflow-hidden rounded-[30px] border border-[#E4E9F2] bg-white">
            <View className="relative h-[190px] overflow-hidden">
                <Image
                    source={COURSE_IMAGE}
                    className="absolute h-full w-full"
                    resizeMode="cover"
                />

                <View className="absolute inset-0 bg-[#293681]/15" />


            </View>

            <View className="p-6">
                <Text className="text-[30px] font-semibold leading-[36px] tracking-[-0.8px] text-[#293681]">
                    {name}
                </Text>

                <Text className="mt-3 text-[15px] leading-6 text-[#747B8F]">
                    {description ??
                        'Przygotuj się do egzaminu krok po kroku.'}
                </Text>
            </View>
        </View>
    )
}

type ProgressCardProps = {
    progressPercent: number
    completedLessons: number
    totalLessons: number
    nextLessonTitle?: string
    isCompleted: boolean
    onPress?: () => void
}

function ProgressCard({
    progressPercent,
    completedLessons,
    totalLessons,
    nextLessonTitle,
    isCompleted,
    onPress,
}: ProgressCardProps) {
    return (
        <View className="overflow-hidden rounded-[30px] bg-[#293681] p-6">
            <ProgressDecoration />

            <View className="z-10">
                <View className="flex-row items-start justify-between">
                    <View>
                        <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#95CCDD]">
                            Twój postęp
                        </Text>

                        <Text className="mt-2 text-[38px] font-semibold tracking-[-1px] text-white">
                            {progressPercent}%
                        </Text>
                    </View>


                </View>

                <Text className="mt-2 text-sm leading-5 text-white/65">
                    {completedLessons} z{' '}
                    {totalLessons} lekcji
                    ukończonych
                </Text>

                <View className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/15">
                    <View
                        className="h-full rounded-full bg-[#95CCDD]"
                        style={{
                            width: `${progressPercent}%`,
                        }}
                    />
                </View>

                {onPress ? (
                    <Pressable
                        onPress={onPress}
                        className="mt-6 flex-row items-center rounded-[20px] bg-white p-4"
                        style={({
                            pressed,
                        }) => ({
                            transform: [
                                {
                                    scale: pressed
                                        ? 0.985
                                        : 1,
                                },
                            ],
                        })}
                    >
                        <View className="h-11 w-11 items-center justify-center rounded-[15px] bg-[#EEF3FC]">
                            <Play
                                size={19}
                                color="#4274D9"
                                fill="#4274D9"
                            />
                        </View>

                        <View className="ml-3 flex-1">
                            <Text className="text-[15px] font-bold text-[#293681]">
                                {isCompleted
                                    ? 'Powtórz kurs'
                                    : 'Kontynuuj naukę'}
                            </Text>

                            {nextLessonTitle ? (
                                <Text
                                    className="mt-1 text-[13px] text-[#747B8F]"
                                    numberOfLines={
                                        1
                                    }
                                >
                                    {
                                        nextLessonTitle
                                    }
                                </Text>
                            ) : null}
                        </View>

                        <ChevronRight
                            size={21}
                            color="#4274D9"
                        />
                    </Pressable>
                ) : null}
            </View>
        </View>
    )
}

function LessonsHeader({
    completedLessons,
    totalLessons,
}: {
    completedLessons: number
    totalLessons: number
}) {
    return (
        <View className="mb-5 mt-9 flex-row items-end justify-between">
            <View className="flex-1 pr-4">
                <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#8B92A5]">
                    Program kursu
                </Text>

                <Text className="mt-2 text-[27px] font-semibold tracking-[-0.7px] text-[#293681]">
                    Lekcje
                </Text>

                <Text className="mt-1 text-sm leading-5 text-[#747B8F]">
                    Ucz się w swoim tempie.
                </Text>
            </View>

            <View className="rounded-full bg-[#EEF3FC] px-3.5 py-2">
                <Text className="text-xs font-bold text-[#4274D9]">
                    {completedLessons}/
                    {totalLessons}
                </Text>
            </View>
        </View>
    )
}

type LessonCardProps = {
    title: string
    position: number
    isCompleted: boolean
    onPress: () => void
}

function LessonCard({
    title,
    position,
    isCompleted,
    onPress,
}: LessonCardProps) {
    return (
        <Pressable
            onPress={onPress}
            className="overflow-hidden rounded-[26px] border border-[#E4E9F2] bg-white"
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
            <View className="flex-row items-center p-5">
                <View
                    className={`h-14 w-14 items-center justify-center rounded-[18px] ${isCompleted
                        ? 'bg-[#D0E7E6]'
                        : 'bg-[#EEF3FC]'
                        }`}
                >
                    {isCompleted ? (
                        <CircleCheck
                            size={27}
                            color="#293681"
                            strokeWidth={2.4}
                        />
                    ) : (
                        <BookOpen
                            size={25}
                            color="#4274D9"
                            strokeWidth={2.2}
                        />
                    )}
                </View>

                <View className="ml-4 flex-1">
                    <Text className="text-[11px] font-bold uppercase tracking-[1.3px] text-[#8B92A5]">
                        Lekcja {position}
                    </Text>

                    <Text className="mt-1 text-[18px] font-semibold leading-6 text-[#293681]">
                        {title}
                    </Text>
                </View>

                <ChevronRight
                    size={21}
                    color="#9CA3B5"
                />
            </View>

            <View
                className={`flex-row items-center justify-between border-t border-[#EDF0F5] px-5 py-3.5 ${isCompleted
                    ? 'bg-[#F2F8F8]'
                    : 'bg-[#FAFBFD]'
                    }`}
            >
                <View className="flex-row items-center">
                    {isCompleted ? (
                        <Check
                            size={16}
                            color="#4274D9"
                            strokeWidth={2.6}
                        />
                    ) : (
                        <BookOpen
                            size={15}
                            color="#9CA3B5"
                        />
                    )}

                    <Text
                        className={`ml-2 text-[13px] font-semibold ${isCompleted
                            ? 'text-[#4274D9]'
                            : 'text-[#747B8F]'
                            }`}
                    >
                        {isCompleted
                            ? 'Ukończona'
                            : 'Do rozpoczęcia'}
                    </Text>
                </View>

                <Text className="text-[13px] font-bold text-[#4274D9]">
                    {isCompleted
                        ? 'Powtórz'
                        : 'Otwórz'}
                </Text>
            </View>
        </Pressable>
    )
}

function EmptyLessonsState() {
    return (
        <View className="rounded-[28px] border border-[#E4E9F2] bg-white p-7">
            <View className="h-14 w-14 items-center justify-center rounded-[18px] bg-[#EEF3FC]">
                <BookOpen
                    size={25}
                    color="#4274D9"
                />
            </View>

            <Text className="mt-5 text-[20px] font-semibold text-[#293681]">
                Brak lekcji
            </Text>

            <Text className="mt-2 text-sm leading-6 text-[#747B8F]">
                Ten kurs nie ma jeszcze
                przygotowanych materiałów.
            </Text>
        </View>
    )
}

function LoadingState() {
    return (
        <View className="flex-1 items-center justify-center bg-[#F8FAFC]">
            <View className="h-16 w-16 items-center justify-center rounded-[22px] border border-[#E4E9F2] bg-white">
                <ActivityIndicator
                    size="large"
                    color="#4274D9"
                />
            </View>

            <Text className="mt-4 text-base font-semibold text-[#747B8F]">
                Pobieranie kursu...
            </Text>
        </View>
    )
}

function ErrorState({
    message,
    onRetry,
    onBack,
}: {
    message: string
    onRetry: () => void
    onBack: () => void
}) {
    return (
        <View className="flex-1 bg-[#F8FAFC] px-6 pt-14">
            <Pressable
                onPress={onBack}
                className="h-12 w-12 items-center justify-center rounded-[18px] border border-[#E4E9F2] bg-white"
            >
                <ArrowLeft
                    size={21}
                    color="#293681"
                />
            </Pressable>

            <View className="mt-8 rounded-[30px] border border-[#E4E9F2] bg-white p-7">
                <Text className="text-[21px] font-semibold text-[#293681]">
                    Nie udało się załadować
                    kursu
                </Text>

                <Text className="mt-2 text-sm leading-6 text-[#747B8F]">
                    {message}
                </Text>

                <Pressable
                    onPress={onRetry}
                    className="mt-6 items-center rounded-[18px] bg-[#293681] px-5 py-4"
                >
                    <Text className="font-bold text-white">
                        Spróbuj ponownie
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}

function BackgroundDecoration() {
    return (
        <View
            pointerEvents="none"
            className="absolute inset-0 overflow-hidden"
        >
            <View className="absolute -right-36 -top-32 h-80 w-80 rounded-full bg-[#D0E7E6]/45" />

            <View className="absolute -left-40 top-[620px] h-72 w-72 rounded-full bg-[#EEF3FC]" />
        </View>
    )
}

function ProgressDecoration() {
    return (
        <View
            pointerEvents="none"
            className="absolute inset-0 overflow-hidden"
        >
            <View className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#4274D9]/30" />

            <View className="absolute -bottom-20 left-16 h-40 w-40 rounded-full bg-[#95CCDD]/10" />
        </View>
    )
}