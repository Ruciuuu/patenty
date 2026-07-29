import { useFocusEffect, useRouter } from 'expo-router'
import {
    ArrowUpRight,
    BookOpen,
    Check,
    ChevronRight,
    ClipboardCheck,
    Play,
    RotateCcw
} from 'lucide-react-native'
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import {
    ActivityIndicator,
    Animated,
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native'
import Svg, {
    Circle,
    Defs,
    LinearGradient,
    Path,
    Stop,
} from 'react-native-svg'

import { BottomNav } from '@/components/app/bottom-nav'
import { useAuth } from '@/context/auth-context'
import { getThumbnail } from '@/lib/supabase-image'
import {
    getCourses,
    getCourseWithLessons,
    getFavoriteCourse,
    setFavoriteCourse,
    type Course,
    type CourseWithLessons
} from '@/services/courses.service'
import { getCompletedLessonIds } from '@/services/progress.service'

const COLORS = {
    background: '#F8FAFC',
    surface: '#FFFFFF',

    navy: '#293681',
    blue: '#4274D9',
    aqua: '#95CCDD',
    aquaLight: '#D0E7E6',

    ink: '#1D2540',
    muted: '#6D7488',
    mutedLight: '#98A0B3',

    border: '#E7EBF2',
    softBlue: '#EEF3FC',
    softAqua: '#EEF7F7',

    danger: '#B94A48',
}

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

    const [availableCourses, setAvailableCourses] =
        useState<Course[]>([])

    const [favoriteCourseId, setFavoriteCourseId] =
        useState<string | null>(null)

    const [courseThumbnailUrl, setCourseThumbnailUrl] = useState<string | null>(null)

    const [isSettingFavoriteCourse, setIsSettingFavoriteCourse] =
        useState(false)



    const entryOpacity = useRef(
        new Animated.Value(0),
    ).current

    const entryTranslateY = useRef(
        new Animated.Value(18),
    ).current

    const userName =
        user?.user_metadata?.first_name?.trim() ||
        user?.user_metadata?.full_name?.trim() ||
        user?.email?.split('@')[0] ||
        'Kapitanie'

    const firstName = userName.split(' ')[0]


    const loadCourseData = useCallback(async () => {
        try {
            setIsLoadingCourse(true)
            setCourseError(null)

            const courses = await getCourses()
            setAvailableCourses(courses)


            if (!user?.id) {
                setFavoriteCourseId(null)
                setCourse(null)
                setCompletedLessonIds([])
                return
            }



            const favoriteId = await getFavoriteCourse(user.id)
            setFavoriteCourseId(favoriteId)







            // Jeżeli użytkownik nie wybrał jeszcze kursu,
            // nie ładujemy domyślnie pierwszego kursu.
            if (!favoriteId) {
                setCourse(null)
                setCompletedLessonIds([])


            }



            const selectedCourse = courses.find(
                (course) => course.id === favoriteId,
            )

            if (!selectedCourse) {
                setCourse(null)
                setCompletedLessonIds([])
                setCourseError(
                    'Wybrany kurs nie jest już dostępny.',
                )
                return
            }

            const imageUrl = selectedCourse ? selectedCourse.image_url : null;
            setCourseThumbnailUrl(imageUrl)



            const courseData =
                await getCourseWithLessons(selectedCourse.id)

            setCourse(courseData)

            const lessonIds =
                courseData.course_lessons.map(
                    (lesson) => lesson.id,
                )

            const completedIds =
                await getCompletedLessonIds(
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

    useEffect(() => {
        Animated.parallel([
            Animated.timing(entryOpacity, {
                toValue: 1,
                duration: 420,
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

    const totalLessons =
        course?.course_lessons.length ?? 0

    const completedLessons = useMemo(() => {
        if (!course) {
            return 0
        }

        return course.course_lessons.filter(
            (lesson) =>
                completedLessonIds.includes(
                    lesson.id,
                ),
        ).length
    }, [course, completedLessonIds])

    const progressPercent =
        totalLessons === 0
            ? 0
            : Math.round(
                (completedLessons / totalLessons) *
                100,
            )

    const nextLesson =
        course?.course_lessons.find(
            (lesson) =>
                !completedLessonIds.includes(
                    lesson.id,
                ),
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
            pathname:
                '/(course)/lesson/[lessonId]',
            params: {
                lessonId: nextLesson.id,
            },
        })
    }

    async function chooseFavoriteCourse(courseId: string) {
        if (!user?.id || isSettingFavoriteCourse) {
            return
        }

        try {
            setIsSettingFavoriteCourse(true)
            setCourseError(null)

            await setFavoriteCourse(user.id, courseId)

            // Odświeżamy dane ekranu po zapisaniu wyboru.
            await loadCourseData()
        } catch (error) {
            console.error(
                'Nie udało się ustawić ulubionego kursu:',
                error,
            )

            setCourseError(
                'Nie udało się ustawić kursu. Spróbuj ponownie.',
            )
        } finally {
            setIsSettingFavoriteCourse(false)
        }
    }

    const primaryButtonLabel = nextLesson
        ? 'Kontynuuj lekcję'
        : isCourseCompleted
            ? 'Powtórz kurs'
            : 'Otwórz kurs'





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
                        paddingBottom: 144,
                    }}
                    showsVerticalScrollIndicator={
                        false
                    }
                >
                    <View className="px-5 pt-14">
                        <Header
                            firstName={firstName}
                        />

                        {isLoadingCourse ? (
                            <ContinueLearningCard
                                isLoading
                                thumbnailUrl={null}
                                error={courseError}
                                courseName="Kurs"
                                progressPercent={0}
                                completedLessons={0}
                                totalLessons={0}
                                isCompleted={false}
                                buttonLabel="Ładowanie"
                                disabled
                                onPress={() => { }}
                            />
                        ) : favoriteCourseId === null && courseThumbnailUrl === null ? (
                            <ChooseCourseCard
                                courses={availableCourses}
                                error={courseError}
                                isSaving={isSettingFavoriteCourse}
                                onSelectCourse={chooseFavoriteCourse}
                            />
                        ) : (
                            <ContinueLearningCard
                                isLoading={false}
                                thumbnailUrl={getThumbnail(courseThumbnailUrl)}
                                error={courseError}
                                nextLessonTitle={
                                    nextLesson?.title
                                }
                                courseName={course?.name ?? 'Kurs'}
                                progressPercent={
                                    progressPercent
                                }
                                completedLessons={
                                    completedLessons
                                }
                                totalLessons={
                                    totalLessons
                                }
                                isCompleted={
                                    isCourseCompleted
                                }
                                buttonLabel={
                                    primaryButtonLabel
                                }
                                disabled={!course}
                                onPress={openNextLesson}
                            />
                        )}

                        <SectionHeader
                            title="Ucz się po swojemu"
                            description="Wybierz lekcję albo sprawdź swoją wiedzę na egzaminie."
                        />

                        <View className="flex-row">
                            <View className="mr-2 flex-1">
                                <CourseModeCard
                                    progressPercent={
                                        progressPercent
                                    }
                                    completedLessons={
                                        completedLessons
                                    }
                                    totalLessons={
                                        totalLessons
                                    }
                                    isLoading={
                                        isLoadingCourse
                                    }
                                    onPress={
                                        nextLesson
                                            ? openNextLesson
                                            : openCourse
                                    }
                                />
                            </View>

                            <View className="ml-2 flex-1">
                                <ExamModeCard
                                    onPress={() =>
                                        router.push(
                                            '/exams',
                                        )
                                    }
                                />
                            </View>
                        </View>

                        <ProgressSummaryCard
                            progressPercent={
                                progressPercent
                            }
                            completedLessons={
                                completedLessons
                            }
                            totalLessons={
                                totalLessons
                            }
                            isCompleted={
                                isCourseCompleted
                            }
                            onPress={openCourse}
                        />

                        <DailyTipCard />
                    </View>
                </ScrollView>
            </Animated.View>

            <BottomNav />
        </View>
    )
}

type HeaderProps = {
    firstName: string
}

function Header({
    firstName,
}: HeaderProps) {
    return (
        <View className="mb-7">
            <Text className="text-[38px] font-semibold leading-[43px] tracking-[-1.4px] text-[#293681]">
                Cześć, {firstName}.
            </Text>

            <Text className="mt-3 max-w-[330px] text-[16px] font-light leading-6 text-[#687087]">
                Kilkanaście minut dziennie wystarczy,
                aby pewnie podejść do egzaminu.
            </Text>
        </View>
    )
}










type PrimaryButtonProps = {
    label: string
    disabled: boolean
    completed: boolean
    onPress: () => void
}

function PrimaryButton({
    label,
    disabled,
    completed,
    onPress,
}: PrimaryButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            className={`mt-5 flex-row items-center justify-between rounded-[18px] px-5 py-4 ${disabled
                ? 'bg-[#E9ECF4]'
                : 'bg-[#293681]'
                }`}
            style={({ pressed }) => ({
                opacity: disabled ? 0.7 : 1,
                transform: [
                    {
                        scale:
                            pressed && !disabled
                                ? 0.985
                                : 1,
                    },
                ],
            })}
        >
            <View className="flex-row items-center">
                {completed ? (
                    <RotateCcw
                        size={18}
                        color={
                            disabled
                                ? '#9298A9'
                                : '#FFFFFF'
                        }
                    />
                ) : (
                    <Play
                        size={18}
                        color={
                            disabled
                                ? '#9298A9'
                                : '#FFFFFF'
                        }
                        fill={
                            disabled
                                ? '#9298A9'
                                : '#FFFFFF'
                        }
                    />
                )}

                <Text
                    className={`ml-3 text-[15px] font-bold ${disabled
                        ? 'text-[#9298A9]'
                        : 'text-white'
                        }`}
                >
                    {label}
                </Text>
            </View>

            <ChevronRight
                size={20}
                color={
                    disabled
                        ? '#9298A9'
                        : '#FFFFFF'
                }
            />
        </Pressable>
    )
}

type SectionHeaderProps = {
    title: string
    description: string
}

function SectionHeader({
    title,
    description,
}: SectionHeaderProps) {
    return (
        <View className="mb-5">
            <Text className="text-[27px] font-semibold tracking-[-0.7px] text-[#293681]">
                {title}
            </Text>

            <Text className="mt-1.5 text-sm leading-5 text-[#747B8F]">
                {description}
            </Text>
        </View>
    )
}

type CourseModeCardProps = {
    progressPercent: number
    completedLessons: number
    totalLessons: number
    isLoading: boolean
    onPress: () => void
}

function CourseModeCard({
    progressPercent,
    completedLessons,
    totalLessons,
    isLoading,
    onPress,
}: CourseModeCardProps) {
    return (
        <Pressable
            onPress={onPress}
            disabled={isLoading}
            className="min-h-[246px] overflow-hidden rounded-[28px] border border-[#E4E9F2] bg-white p-5"
            style={({ pressed }) => ({
                opacity: isLoading ? 0.65 : 1,
                transform: [
                    {
                        scale:
                            pressed && !isLoading
                                ? 0.98
                                : 1,
                    },
                ],
            })}
        >
            <View className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-[#D0E7E6]/60" />

            <View className="z-10 flex-1 justify-between">
                <View className="flex-row items-start justify-between">
                    <View className="h-12 w-12 items-center justify-center rounded-[17px] bg-[#EDF3FC]">
                        <BookOpen
                            size={23}
                            color="#4274D9"
                            strokeWidth={2.1}
                        />
                    </View>

                    <ArrowUpRight
                        size={20}
                        color="#8991A6"
                    />
                </View>

                <View className="mt-7">
                    <Text className="text-[23px] font-semibold leading-7 tracking-[-0.5px] text-[#293681]">
                        Kurs
                    </Text>

                    <Text className="mt-2 text-[13px] leading-[19px] text-[#747B8F]">
                        Krótkie lekcje i najważniejsze
                        zagadnienia.
                    </Text>
                </View>

                <View className="mt-5">
                    <ProgressBar
                        value={progressPercent}
                        trackColor="#E9EDF5"
                        fillColor="#4274D9"
                    />

                    <Text className="mt-3 text-xs font-semibold text-[#687087]">
                        {completedLessons}/
                        {totalLessons} lekcji
                    </Text>
                </View>
            </View>
        </Pressable>
    )
}

function ExamModeCard({
    onPress,
}: {
    onPress: () => void
}) {
    return (
        <Pressable
            onPress={onPress}
            className="min-h-[246px] overflow-hidden rounded-[28px] border border-[#DCE5F4] bg-[#F3F6FC] p-5"
            style={({ pressed }) => ({
                transform: [
                    {
                        scale: pressed
                            ? 0.98
                            : 1,
                    },
                ],
            })}
        >
            <ExamCardDecoration />

            <View className="z-10 flex-1 justify-between">
                <View className="flex-row items-start justify-between">
                    <View className="h-12 w-12 items-center justify-center rounded-[17px] bg-white">
                        <ClipboardCheck
                            size={24}
                            color="#293681"
                            strokeWidth={2.1}
                        />
                    </View>


                </View>

                <View className="mt-7">
                    <Text className="text-[23px] font-semibold leading-7 tracking-[-0.5px] text-[#293681]">
                        Egzaminy
                    </Text>

                    <Text className="mt-2 text-[13px] leading-[19px] text-[#687087]">
                        Sprawdź gotowość na pełnym
                        zestawie pytań.
                    </Text>
                </View>

                <View className="mt-5 flex-row items-center justify-between">
                    <Text className="text-xs font-bold text-[#4274D9]">
                        Rozpocznij
                    </Text>

                    <View className="h-9 w-9 items-center justify-center rounded-full bg-[#293681]">
                        <ChevronRight
                            size={18}
                            color="#FFFFFF"
                        />
                    </View>
                </View>
            </View>
        </Pressable>
    )
}

type ProgressSummaryCardProps = {
    progressPercent: number
    completedLessons: number
    totalLessons: number
    isCompleted: boolean
    onPress: () => void
}

function ProgressSummaryCard({
    progressPercent,
    completedLessons,
    totalLessons,
    isCompleted,
    onPress,
}: ProgressSummaryCardProps) {
    return (
        <Pressable
            onPress={onPress}
            className="mt-4 overflow-hidden rounded-[30px] bg-[#293681] p-5"
            style={({ pressed }) => ({
                transform: [
                    {
                        scale: pressed
                            ? 0.988
                            : 1,
                    },
                ],
            })}
        >
            <DarkCardDecoration />

            <View className="z-10 flex-row items-center">
                <View className="mr-4">
                    <ProgressRing
                        value={progressPercent}
                        size={72}
                        dark
                    />
                </View>

                <View className="flex-1">
                    <Text className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#95CCDD]">
                        Twój postęp
                    </Text>

                    <Text className="mt-2 text-[19px] font-semibold leading-6 text-white">
                        {isCompleted
                            ? 'Kurs ukończony'
                            : totalLessons > 0
                                ? `${completedLessons} z ${totalLessons} lekcji za Tobą`
                                : 'Pierwsza lekcja czeka'}
                    </Text>

                    <Text className="mt-1 text-[13px] leading-[18px] text-white/65">
                        {isCompleted
                            ? 'Możesz wrócić do dowolnego tematu.'
                            : 'Regularność jest ważniejsza niż długie sesje.'}
                    </Text>
                </View>


            </View>
        </Pressable>
    )
}

function DailyTipCard() {
    return (
        <View className="mt-4 rounded-[26px] border border-[#E4E9F2] bg-white p-5">
            <View className="flex-row items-start">
                <View className="mr-4 h-11 w-11 items-center justify-center rounded-[15px] bg-[#EEF3FC]">
                    <Check
                        size={21}
                        color="#4274D9"
                        strokeWidth={2.4}
                    />
                </View>

                <View className="flex-1">
                    <Text className="text-[11px] font-bold uppercase tracking-[1.4px] text-[#9299AB]">
                        Plan na dziś
                    </Text>

                    <Text className="mt-1 text-[17px] font-semibold leading-6 text-[#293681]">
                        Jedna lekcja i dziesięć pytań
                    </Text>

                    <Text className="mt-1 text-[13px] leading-[19px] text-[#747B8F]">
                        Taki rytm pozwala budować wiedzę
                        bez przeciążenia.
                    </Text>
                </View>
            </View>
        </View>
    )
}

type ProgressBarProps = {
    value: number
    trackColor: string
    fillColor: string
    className?: string
}

function ProgressBar({
    value,
    trackColor,
    fillColor,
    className = '',
}: ProgressBarProps) {
    const normalizedValue = Math.min(
        100,
        Math.max(0, value),
    )

    return (
        <View
            className={`h-2 overflow-hidden rounded-full ${className}`}
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

type ProgressRingProps = {
    value: number
    size: number
    dark?: boolean
}



function BackgroundDecoration() {
    return (
        <View
            pointerEvents="none"
            className="absolute inset-0 overflow-hidden"
        >
            <View className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-[#D0E7E6]/45" />

            <View className="absolute -left-48 top-[530px] h-80 w-80 rounded-full bg-[#EEF3FC]" />
        </View>
    )
}

function ExamCardDecoration() {
    return (
        <View
            pointerEvents="none"
            className="absolute bottom-0 left-0 right-0 h-28 opacity-40"
        >
            <Svg
                width="100%"
                height="100%"
                viewBox="0 0 200 120"
                preserveAspectRatio="none"
            >
                <Path
                    d="M-20 104 C24 42 60 126 104 72 C137 31 170 86 220 31"
                    fill="none"
                    stroke="#95CCDD"
                    strokeWidth="2"
                />

                <Path
                    d="M-12 116 C35 58 67 136 112 86 C151 45 177 100 220 57"
                    fill="none"
                    stroke="#95CCDD"
                    strokeWidth="2"
                />

                <Path
                    d="M-25 88 C17 31 55 108 99 54 C140 8 171 68 220 16"
                    fill="none"
                    stroke="#95CCDD"
                    strokeWidth="2"
                />
            </Svg>
        </View>
    )
}

function DarkCardDecoration() {
    return (
        <View
            pointerEvents="none"
            className="absolute inset-0"
        >
            <Svg
                width="100%"
                height="100%"
                viewBox="0 0 400 160"
                preserveAspectRatio="none"
            >
                <Defs>
                    <LinearGradient
                        id="darkGlow"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                    >
                        <Stop
                            offset="0"
                            stopColor="#4274D9"
                            stopOpacity="0.45"
                        />

                        <Stop
                            offset="1"
                            stopColor="#293681"
                            stopOpacity="0"
                        />
                    </LinearGradient>
                </Defs>

                <Path
                    d="M190 -20 C260 34 298 22 430 110 L430 -20 Z"
                    fill="url(#darkGlow)"
                />
            </Svg>
        </View>
    )
}