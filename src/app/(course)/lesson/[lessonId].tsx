import {
    useLocalSearchParams,
    useRouter,
} from 'expo-router'
import {
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ImageOff,
    X,
} from 'lucide-react-native'
import {
    useEffect,
    useRef,
    useState,
} from 'react'
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    LayoutAnimation,
    Platform,
    Pressable,
    ScrollView,
    Text,
    UIManager,
    View,
} from 'react-native'

import { useAuth } from '@/context/auth-context'
import { getLessonSlideImageUrl } from '@/lib/supabase-image'
import {
    getSlides,
    type LessonSlide,
} from '@/services/lesson.service'
import { completeLesson } from '@/services/progress.service'

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
}

export default function LessonScreen() {
    const router = useRouter()
    const { user } = useAuth()

    const { lessonId } = useLocalSearchParams<{
        lessonId: string
    }>()

    const [slides, setSlides] = useState<LessonSlide[]>([])
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

    const [isDescriptionExpanded, setIsDescriptionExpanded] =
        useState(false)

    const [hasImageError, setHasImageError] = useState(false)

    const [isLoading, setIsLoading] = useState(true)
    const [isFinishing, setIsFinishing] = useState(false)

    const [errorMessage, setErrorMessage] = useState<string | null>(
        null,
    )

    const progressAnimation = useRef(
        new Animated.Value(0),
    ).current

    const contentOpacity = useRef(
        new Animated.Value(1),
    ).current

    const contentTranslateX = useRef(
        new Animated.Value(0),
    ).current

    useEffect(() => {
        async function loadSlides() {
            if (!lessonId) {
                setErrorMessage('Brak identyfikatora lekcji.')
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                setErrorMessage(null)

                const data = await getSlides(lessonId)

                setSlides(data)
                setCurrentSlideIndex(0)
                setIsDescriptionExpanded(false)
                setHasImageError(false)
            } catch (error) {
                console.error(
                    'Nie udało się pobrać slajdów:',
                    error,
                )

                setErrorMessage(
                    'Nie udało się pobrać lekcji.',
                )
            } finally {
                setIsLoading(false)
            }
        }

        loadSlides()
    }, [lessonId])

    useEffect(() => {
        if (slides.length === 0) {
            return
        }

        const progress =
            (currentSlideIndex + 1) / slides.length

        Animated.spring(progressAnimation, {
            toValue: progress,
            useNativeDriver: false,
            tension: 70,
            friction: 10,
        }).start()
    }, [
        currentSlideIndex,
        progressAnimation,
        slides.length,
    ])

    function animateSlideChange(
        nextSlideIndex: number,
        direction: 'next' | 'previous',
    ) {
        const exitDirection =
            direction === 'next' ? -18 : 18

        const enterDirection =
            direction === 'next' ? 18 : -18

        Animated.parallel([
            Animated.timing(contentOpacity, {
                toValue: 0,
                duration: 130,
                useNativeDriver: true,
            }),
            Animated.timing(contentTranslateX, {
                toValue: exitDirection,
                duration: 130,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setCurrentSlideIndex(nextSlideIndex)
            setIsDescriptionExpanded(false)
            setHasImageError(false)

            contentTranslateX.setValue(enterDirection)

            Animated.parallel([
                Animated.timing(contentOpacity, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.spring(contentTranslateX, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 90,
                    friction: 10,
                }),
            ]).start()
        })
    }

    function goToPreviousSlide() {
        if (currentSlideIndex === 0 || isFinishing) {
            return
        }

        animateSlideChange(
            currentSlideIndex - 1,
            'previous',
        )
    }

    function goToNextSlide() {
        if (
            currentSlideIndex >= slides.length - 1 ||
            isFinishing
        ) {
            return
        }

        animateSlideChange(
            currentSlideIndex + 1,
            'next',
        )
    }

    function toggleDescription() {
        LayoutAnimation.configureNext(
            LayoutAnimation.create(
                260,
                LayoutAnimation.Types.easeInEaseOut,
                LayoutAnimation.Properties.opacity,
            ),
        )

        setIsDescriptionExpanded(
            (currentValue) => !currentValue,
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
            Alert.alert(
                'Błąd',
                'Brak identyfikatora lekcji.',
            )
            return
        }

        try {
            setIsFinishing(true)

            await completeLesson(user.id, lessonId)

            router.back()
        } catch (error) {
            console.error(
                'Nie udało się ukończyć lekcji:',
                error,
            )

            Alert.alert(
                'Błąd',
                'Nie udało się zapisać ukończenia lekcji.',
            )
        } finally {
            setIsFinishing(false)
        }
    }

    if (isLoading) {
        return <LoadingState />
    }

    if (errorMessage) {
        return (
            <ErrorState
                message={errorMessage}
                onBack={() => router.back()}
            />
        )
    }

    if (slides.length === 0) {
        return (
            <EmptyState onBack={() => router.back()} />
        )
    }

    const currentSlide = slides[currentSlideIndex]

    const image_url =
        currentSlide.image_url?.trim() || null

    const imageUrl = image_url
        ? getLessonSlideImageUrl(lessonId, image_url)
        : null

    const hasImage =
        imageUrl !== null && !hasImageError

    const isFirstSlide =
        currentSlideIndex === 0

    const isLastSlide =
        currentSlideIndex === slides.length - 1

    const shouldShowDescription =
        !hasImage || isDescriptionExpanded

    const animatedProgressWidth =
        progressAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
        })

    return (
        <View className="flex-1 bg-[#F7F9FC]">
            <LessonHeader
                title={
                    currentSlide.title ??
                    `Część ${currentSlideIndex + 1}`
                }
                currentSlide={currentSlideIndex + 1}
                slidesCount={slides.length}
                progressWidth={animatedProgressWidth}
                onClose={() => router.back()}
                disabled={isFinishing}
            />

            <Animated.View
                className="flex-1"
                style={{
                    opacity: contentOpacity,
                    transform: [
                        {
                            translateX: contentTranslateX,
                        },
                    ],
                }}
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingTop: 18,
                        paddingBottom: 28,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="overflow-hidden rounded-[26px] border border-[#E2E8F0] bg-white">
                        <View className="px-5 pb-4 pt-5">
                            <Text className="text-[22px] font-extrabold leading-7 tracking-[-0.4px] text-[#293681]">
                                {currentSlide.title ??
                                    `Część ${currentSlideIndex + 1}`}
                            </Text>
                        </View>

                        {hasImage && imageUrl ? (
                            <View className="px-4">
                                <View className="overflow-hidden rounded-[20px] bg-[#F0F5FC]">
                                    <Image
                                        key={imageUrl}
                                        source={{
                                            uri: imageUrl,
                                        }}
                                        className="h-[350px] w-full"
                                        resizeMode="contain"
                                        accessibilityLabel={
                                            currentSlide.title ??
                                            'Ilustracja lekcji'
                                        }
                                        onError={(event) => {
                                            console.error(
                                                'Nie udało się wyświetlić zdjęcia:',
                                                imageUrl,
                                                event.nativeEvent.error,
                                            )

                                            setHasImageError(true)
                                        }}
                                    />
                                </View>
                            </View>
                        ) : null}

                        {hasImage ? (
                            <ReadMoreButton
                                isExpanded={
                                    isDescriptionExpanded
                                }
                                onPress={toggleDescription}
                            />
                        ) : null}

                        {shouldShowDescription ? (
                            <View
                                className={
                                    hasImage
                                        ? 'border-t border-[#E5EAF1] px-5 pb-7 pt-6'
                                        : 'px-5 pb-7 pt-2'
                                }
                            >
                                {hasImageError ? (
                                    <View className="mb-5 flex-row items-center rounded-2xl bg-[#F0F5FC] p-4">
                                        <ImageOff
                                            size={21}
                                            color="#4274D9"
                                        />

                                        <Text className="ml-3 flex-1 text-sm leading-5 text-[#687087]">
                                            Nie udało się
                                            wyświetlić ilustracji.
                                            Możesz nadal przeczytać
                                            materiał.
                                        </Text>
                                    </View>
                                ) : null}

                                <Text className="text-[16px] leading-[29px] text-[#505A72]">
                                    {currentSlide.content
                                        ?.replace(/\\n/g, '\n')
                                        .replace(/\\t/g, '\t')}
                                </Text>

                                {isLastSlide ? (
                                    <LessonCompletedNotice />
                                ) : null}
                            </View>
                        ) : null}
                    </View>

                    {hasImage &&
                        !isDescriptionExpanded &&
                        isLastSlide ? (
                        <View className="mt-4 rounded-[22px] border border-[#D0E7E6] bg-[#EDF7F6] px-5 py-4">
                            <Text className="text-center text-sm font-semibold leading-5 text-[#293681]">
                                Możesz przeczytać opis albo
                                zakończyć lekcję.
                            </Text>
                        </View>
                    ) : null}
                </ScrollView>
            </Animated.View>

            <LessonNavigation
                isFirstSlide={isFirstSlide}
                isLastSlide={isLastSlide}
                isFinishing={isFinishing}
                onPrevious={goToPreviousSlide}
                onNext={goToNextSlide}
                onFinish={finishLesson}
            />
        </View>
    )
}

type LessonHeaderProps = {
    title: string
    currentSlide: number
    slidesCount: number
    progressWidth: Animated.AnimatedInterpolation<
        string | number
    >
    disabled: boolean
    onClose: () => void
}

function LessonHeader({
    title,
    currentSlide,
    slidesCount,
    progressWidth,
    disabled,
    onClose,
}: LessonHeaderProps) {
    return (
        <View className="bg-[#293681] px-5 pb-5 pt-14">
            <View className="flex-row items-start">
                <View className="mr-4 flex-1">
                    <Text className="text-xs font-semibold text-white/55">
                        Materiał lekcji
                    </Text>

                    <Text
                        className="mt-1 text-base font-bold leading-6 text-white"
                        numberOfLines={2}
                    >
                        {title}
                    </Text>
                </View>

                <Pressable
                    onPress={onClose}
                    disabled={disabled}
                    accessibilityRole="button"
                    accessibilityLabel="Zamknij lekcję"
                    hitSlop={12}
                    className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
                >
                    <X
                        size={21}
                        color="#FFFFFF"
                        strokeWidth={2.5}
                    />
                </Pressable>
            </View>

            <View className="mt-5 flex-row items-center">
                <View className="mr-3 flex-1">
                    <View className="h-1.5 overflow-hidden rounded-full bg-white/15">
                        <Animated.View
                            className="h-full rounded-full bg-[#95CCDD]"
                            style={{
                                width: progressWidth,
                            }}
                        />
                    </View>
                </View>

                <Text className="min-w-[42px] text-right text-xs font-bold text-white/65">
                    {currentSlide}/{slidesCount}
                </Text>
            </View>
        </View>
    )
}

type ReadMoreButtonProps = {
    isExpanded: boolean
    onPress: () => void
}

function ReadMoreButton({
    isExpanded,
    onPress,
}: ReadMoreButtonProps) {
    return (
        <View className="px-5 py-3">
            <Pressable
                onPress={onPress}
                accessibilityRole="button"
                accessibilityState={{
                    expanded: isExpanded,
                }}
                className="flex-row items-center justify-center rounded-2xl py-3"
            >
                <Text className="mr-1.5 text-sm font-bold text-[#4274D9]">
                    {isExpanded
                        ? 'Czytaj mniej'
                        : 'Czytaj więcej'}
                </Text>

                {isExpanded ? (
                    <ChevronUp
                        size={18}
                        color="#4274D9"
                        strokeWidth={2.6}
                    />
                ) : (
                    <ChevronDown
                        size={18}
                        color="#4274D9"
                        strokeWidth={2.6}
                    />
                )}
            </Pressable>
        </View>
    )
}

function LessonCompletedNotice() {
    return (
        <View className="mt-7 flex-row items-start rounded-[20px] border border-[#D0E7E6] bg-[#EDF7F6] p-4">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-[#4274D9]">
                <Check
                    size={20}
                    color="#FFFFFF"
                    strokeWidth={3}
                />
            </View>

            <View className="ml-3 flex-1">
                <Text className="font-extrabold text-[#293681]">
                    Materiał ukończony
                </Text>

                <Text className="mt-1 text-sm leading-5 text-[#65758B]">
                    To ostatnia część tej lekcji. Możesz teraz
                    zapisać swój postęp.
                </Text>
            </View>
        </View>
    )
}

type LessonNavigationProps = {
    isFirstSlide: boolean
    isLastSlide: boolean
    isFinishing: boolean
    onPrevious: () => void
    onNext: () => void
    onFinish: () => void
}

function LessonNavigation({
    isFirstSlide,
    isLastSlide,
    isFinishing,
    onPrevious,
    onNext,
    onFinish,
}: LessonNavigationProps) {
    return (
        <View className="border-t border-[#E2E8F0] bg-white px-4 pb-8 pt-3">
            <View className="flex-row gap-3">
                <Pressable
                    onPress={onPrevious}
                    disabled={
                        isFirstSlide || isFinishing
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Poprzedni slajd"
                    className={`h-14 flex-1 flex-row items-center justify-center rounded-2xl border ${isFirstSlide || isFinishing
                        ? 'border-[#ECEFF4] bg-[#F4F6F9]'
                        : 'border-[#D7DFEA] bg-white'
                        }`}
                >
                    <ChevronLeft
                        size={21}
                        color={
                            isFirstSlide || isFinishing
                                ? '#B7BBC7'
                                : '#293681'
                        }
                        strokeWidth={2.5}
                    />

                    <Text
                        className={`ml-1 text-base font-bold ${isFirstSlide || isFinishing
                            ? 'text-[#B7BBC7]'
                            : 'text-[#293681]'
                            }`}
                    >
                        Wstecz
                    </Text>
                </Pressable>

                {isLastSlide ? (
                    <Pressable
                        onPress={onFinish}
                        disabled={isFinishing}
                        accessibilityRole="button"
                        accessibilityLabel="Zakończ lekcję"
                        className={`h-14 flex-[1.45] flex-row items-center justify-center rounded-2xl ${isFinishing
                            ? 'bg-[#9BAED8]'
                            : 'bg-[#4274D9]'
                            }`}
                    >
                        {isFinishing ? (
                            <>
                                <ActivityIndicator
                                    size="small"
                                    color="#FFFFFF"
                                />

                                <Text className="ml-2 text-base font-bold text-white">
                                    Zapisywanie...
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text className="mr-2 text-base font-extrabold text-white">
                                    Zakończ
                                </Text>

                                <Check
                                    size={21}
                                    color="#FFFFFF"
                                    strokeWidth={2.8}
                                />
                            </>
                        )}
                    </Pressable>
                ) : (
                    <Pressable
                        onPress={onNext}
                        disabled={isFinishing}
                        accessibilityRole="button"
                        accessibilityLabel="Następny slajd"
                        className="h-14 flex-[1.45] flex-row items-center justify-center rounded-2xl bg-[#4274D9]"
                    >
                        <Text className="mr-2 text-base font-extrabold text-white">
                            Dalej
                        </Text>

                        <ChevronRight
                            size={22}
                            color="#FFFFFF"
                            strokeWidth={2.6}
                        />
                    </Pressable>
                )}
            </View>
        </View>
    )
}

function LoadingState() {
    return (
        <View className="flex-1 items-center justify-center bg-[#F7F9FC]">
            <View className="h-16 w-16 items-center justify-center rounded-[22px] border border-[#E2E8F0] bg-white">
                <ActivityIndicator
                    size="large"
                    color="#4274D9"
                />
            </View>

            <Text className="mt-4 text-base font-semibold text-[#707A91]">
                Pobieranie lekcji...
            </Text>
        </View>
    )
}

type ErrorStateProps = {
    message: string
    onBack: () => void
}

function ErrorState({
    message,
    onBack,
}: ErrorStateProps) {
    return (
        <View className="flex-1 items-center justify-center bg-[#F7F9FC] px-6">
            <View className="w-full rounded-[26px] border border-[#E2E8F0] bg-white p-6">
                <Text className="text-center text-lg font-extrabold text-[#293681]">
                    {message}
                </Text>

                <Pressable
                    onPress={onBack}
                    className="mt-5 items-center rounded-2xl bg-[#293681] px-5 py-4"
                >
                    <Text className="font-bold text-white">
                        Wróć
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}

type EmptyStateProps = {
    onBack: () => void
}

function EmptyState({
    onBack,
}: EmptyStateProps) {
    return (
        <View className="flex-1 bg-[#F7F9FC] px-6 pt-14">
            <Pressable
                onPress={onBack}
                accessibilityRole="button"
                accessibilityLabel="Wróć"
                className="h-11 w-11 items-center justify-center rounded-full border border-[#E2E8F0] bg-white"
            >
                <X
                    size={21}
                    color="#293681"
                    strokeWidth={2.5}
                />
            </Pressable>

            <View className="mt-8 items-center rounded-[26px] border border-[#E2E8F0] bg-white p-8">
                <View className="h-16 w-16 items-center justify-center rounded-[22px] bg-[#EEF3FC]">
                    <ImageOff
                        size={30}
                        color="#4274D9"
                    />
                </View>

                <Text className="mt-5 text-center text-xl font-extrabold text-[#293681]">
                    Brak materiałów
                </Text>

                <Text className="mt-2 text-center text-base leading-6 text-[#707A91]">
                    Ta lekcja nie ma jeszcze przygotowanych
                    slajdów.
                </Text>
            </View>
        </View>
    )
}