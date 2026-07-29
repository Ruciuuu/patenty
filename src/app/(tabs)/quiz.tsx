import { useRouter } from 'expo-router'
import {
    Sparkles
} from 'lucide-react-native'
import {
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native'

import { BottomNav } from '@/components/app/bottom-nav'

export default function QuizScreen() {
    const router = useRouter()

    return (
        <View className="flex-1 bg-[#F8FAFC]">
            <BackgroundDecoration />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 56,
                    paddingBottom: 140,
                }}
                showsVerticalScrollIndicator={false}
            >
                <Header />

                <View className="mt-8 gap-5">
                    <ModeCard

                        title="Testy"
                        description="Ćwicz pytania tematyczne, utrwalaj materiał i przygotowuj się we własnym tempie."
                        image={require('@/assets/images/photo-tests.jpg')}
                        variant="light"
                        icon="test"
                        onPress={() =>
                            router.push('/(test)/tests')
                        }
                    />

                    <ModeCard

                        title="Egzaminy"
                        description="Sprawdź swoją wiedzę w pełnej symulacji egzaminu."
                        image={require('@/assets/images/photo-exams.jpg')}
                        variant="dark"
                        icon="exam"
                        onPress={() =>
                            router.push('/(exam)/exams')
                        }
                    />
                </View>

                <InfoCard />
            </ScrollView>

            <BottomNav />
        </View>
    )
}

function Header() {
    return (
        <View>


            <Text className="mt-2 text-[38px] font-semibold leading-[43px] tracking-[-1.3px] text-[#293681]">
                Czas na praktykę
            </Text>

            <Text className="mt-3 max-w-[340px] text-[16px] leading-6 text-[#747B8F]">
                Ćwicz pojedyncze pytania albo sprawdź się w
                warunkach zbliżonych do prawdziwego egzaminu.
            </Text>
        </View>
    )
}

type ModeCardProps = {

    title: string
    description: string

    image: number
    variant: 'light' | 'dark'
    icon: 'test' | 'exam'
    onPress: () => void
}

function ModeCard({

    title,
    description,

    image,
    variant,
    icon,
    onPress,
}: ModeCardProps) {
    const isDark = variant === 'dark'

    return (
        <Pressable
            onPress={onPress}
            className={`overflow-hidden rounded-[30px] ${isDark
                ? 'bg-[#293681]'
                : 'border border-[#E3E8F1] bg-white'
                }`}
            style={({ pressed }) => ({
                transform: [
                    {
                        scale: pressed ? 0.985 : 1,
                    },
                ],
                opacity: pressed ? 0.97 : 1,
            })}
        >
            <View className="relative h-[180px] overflow-hidden">
                <Image
                    source={image}
                    className="h-full w-full"
                    resizeMode="cover"
                />

                <View
                    className={`absolute inset-0 ${isDark
                        ? 'bg-[#293681]/5'
                        : 'bg-[#293681]/2'
                        }`}
                />




            </View>

            <View className="p-5">
                <Text
                    className={`text-[25px] font-semibold tracking-[-0.6px] ${isDark
                        ? 'text-white'
                        : 'text-[#293681]'
                        }`}
                >
                    {title}
                </Text>

                <Text
                    className={`mt-2 text-[14px] leading-[21px] ${isDark
                        ? 'text-white/65'
                        : 'text-[#747B8F]'
                        }`}
                >
                    {description}
                </Text>

            </View>
        </Pressable>
    )
}

function InfoCard() {
    return (
        <View className="mt-5 flex-row items-start rounded-[24px] border border-[#DCE8EC] bg-[#EEF7F7] p-5">
            <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-white">
                <Sparkles
                    size={19}
                    color="#4274D9"
                    strokeWidth={2.3}
                />
            </View>

            <View className="ml-3 flex-1">
                <Text className="text-[15px] font-bold text-[#293681]">
                    Nie wiesz, co wybrać?
                </Text>

                <Text className="mt-1 text-[13px] leading-5 text-[#687087]">
                    Zacznij od testów, a gdy poczujesz się pewniej,
                    przejdź do pełnej symulacji egzaminu.
                </Text>
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

            <View className="absolute -left-40 top-[560px] h-72 w-72 rounded-full bg-[#EEF3FC]" />
        </View>
    )
}