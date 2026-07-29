import { router } from 'expo-router'
import { ArrowRight } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import {
    Animated,
    Image,
    Pressable,
    Text,
    View,
} from 'react-native'

const slides = [
    {
        id: 0,

        title: 'Zdobądź patent w swoim tempie',
        description:
            'Krótkie lekcje, pytania egzaminacyjne i postęp w jednym miejscu.',
        image: require('@/assets/images/onboarding.jpg'),
    },
    {
        id: 1,

        title: 'Ucz się wtedy, kiedy masz kilka minut',
        description:
            'Materiał jest podzielony na małe części, więc łatwo wrócisz do nauki każdego dnia.',
        image: require('@/assets/images/onboarding-1.jpg'),
    },
    {
        id: 2,

        title: 'Sprawdź się przed prawdziwym egzaminem',
        description:
            'Rozwiązuj testy, wracaj do błędów i zobacz, kiedy jesteś gotowy.',
        image: require('@/assets/images/onboarding-2.jpg'),
    },
]

export default function OnboardingScreen() {
    const [activeSlide, setActiveSlide] = useState(0)

    const opacity = useRef(
        new Animated.Value(1),
    ).current

    const translateX = useRef(
        new Animated.Value(0),
    ).current

    const currentSlide =
        slides[activeSlide]

    const isLastSlide =
        activeSlide === slides.length - 1

    useEffect(() => {
        opacity.setValue(1)
        translateX.setValue(0)
    }, [
        activeSlide,
        opacity,
        translateX,
    ])

    function changeSlide(
        nextIndex: number,
    ) {
        if (
            nextIndex < 0 ||
            nextIndex >= slides.length ||
            nextIndex === activeSlide
        ) {
            return
        }

        const direction =
            nextIndex > activeSlide
                ? 1
                : -1

        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 120,
                useNativeDriver: true,
            }),
            Animated.timing(
                translateX,
                {
                    toValue:
                        -18 * direction,
                    duration: 120,
                    useNativeDriver: true,
                },
            ),
        ]).start(() => {
            setActiveSlide(nextIndex)

            translateX.setValue(
                18 * direction,
            )

            Animated.parallel([
                Animated.timing(
                    opacity,
                    {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver:
                            true,
                    },
                ),
                Animated.spring(
                    translateX,
                    {
                        toValue: 0,
                        useNativeDriver:
                            true,
                        damping: 18,
                        stiffness: 170,
                        mass: 0.8,
                    },
                ),
            ]).start()
        })
    }

    function handlePrimaryAction() {
        if (isLastSlide) {
            router.push(
                '/(auth)/register',
            )
            return
        }

        changeSlide(
            activeSlide + 1,
        )
    }

    return (
        <View className="flex-1 bg-white">
            <View className="flex-1">
                <Animated.View
                    className="flex-1"
                    style={{
                        opacity,
                        transform: [
                            {
                                translateX,
                            },
                        ],
                    }}
                >
                    <View className="relative h-[47%] overflow-hidden">
                        <Image
                            source={
                                currentSlide.image
                            }
                            className="h-full w-full"
                            resizeMode="cover"
                        />


                    </View>

                    <View className="flex-1 px-6 pt-8">


                        <Text className="mt-3 max-w-[340px] text-[36px] font-semibold leading-[42px] tracking-[-1.2px] text-[#293681]">
                            {
                                currentSlide.title
                            }
                        </Text>

                        <Text className="mt-4 max-w-[330px] text-[15px] leading-6 text-[#747B8F]">
                            {
                                currentSlide.description
                            }
                        </Text>

                        <View className="mt-7 flex-row items-center gap-2">
                            {slides.map(
                                (slide) => {
                                    const active =
                                        slide.id ===
                                        activeSlide

                                    return (
                                        <Pressable
                                            key={
                                                slide.id
                                            }
                                            onPress={() =>
                                                changeSlide(
                                                    slide.id,
                                                )
                                            }
                                            hitSlop={
                                                10
                                            }
                                        >
                                            <View
                                                className={`h-2 rounded-full ${active
                                                    ? 'w-7 bg-[#4274D9]'
                                                    : 'w-2 bg-[#D7DDEA]'
                                                    }`}
                                            />
                                        </Pressable>
                                    )
                                },
                            )}
                        </View>
                    </View>
                </Animated.View>

                <View className="px-6 pb-8">
                    <Pressable
                        onPress={
                            handlePrimaryAction
                        }
                        className="h-14 flex-row items-center justify-center rounded-[18px] bg-[#293681]"
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
                        <Text className="text-[15px] font-bold text-white">
                            {isLastSlide
                                ? 'Rozpocznij naukę'
                                : 'Dalej'}
                        </Text>

                        <ArrowRight
                            size={18}
                            color="#FFFFFF"
                            strokeWidth={
                                2.4
                            }
                            style={{
                                marginLeft: 8,
                            }}
                        />
                    </Pressable>

                    <Pressable
                        onPress={() =>
                            router.push(
                                '/(auth)/login',
                            )
                        }
                        className="mt-4 items-center py-2"
                    >
                        <Text className="text-[14px] font-semibold text-blue-900">
                            Mam już konto
                        </Text>
                    </Pressable>

                    <Text className="mt-2 text-center text-[11px] leading-4 text-[#A0A6B5]">
                        Kontynuując,
                        akceptujesz regulamin
                        i politykę prywatności.
                    </Text>
                </View>
            </View>
        </View>
    )
}