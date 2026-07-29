import { useFocusEffect, useRouter } from 'expo-router'
import {
    Check
} from 'lucide-react-native'
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import {
    Animated,
    ScrollView,
    Text,
    View
} from 'react-native'

import { BottomNav } from '@/components/app/bottom-nav'
import { ChooseCourseCard } from '@/components/home/choose-course-card'
import { ContinueLearningCard } from '@/components/home/continue-learning-card'
import { CourseModeCard } from '@/components/home/course-mode-card'
import { ExamModeCard } from '@/components/home/exam-mode-card'
import { ProgressSummaryCard } from '@/components/home/progress-summary-card'
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
import { HeaderProps, SectionHeaderProps } from '@/types/home'

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


    /* useStates */

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

    const [courseThumbnailUrl, setCourseThumbnailUrl] = useState<string>("")

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

            const imageUrl = selectedCourse ? selectedCourse.image_url : "";
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
                                thumbnailUrl={""}
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
                        ) : favoriteCourseId === null && courseThumbnailUrl === "" ? (
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






/* HEADERS */



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

/* CARDS */



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


