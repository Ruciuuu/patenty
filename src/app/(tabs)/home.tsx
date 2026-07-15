import React from 'react'
import {
    View,
    Text,
    Pressable,
    ScrollView,
    Image,
} from 'react-native'
import {
    Search,
    BookOpen,
    ClipboardCheck,
    ChevronRight,
    Play,
    Sailboat,
    Trophy,
    Clock3,
    Target,
} from 'lucide-react-native'

import { useAuth } from '@/context/auth-context'
import { BottomNav } from '@/components/app/bottom-nav'

export default function HomeScreen() {
    const { user } = useAuth()

    const userName =
        user?.user_metadata?.first_name ??
        user?.email?.split('@')[0] ??
        'Kapitanie'

    return (
        <View className="flex-1 bg-[#F0F7FA]">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 130 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="px-6 pt-14">
                    {/* Header */}
                    <View className="mb-7">
                        <Text className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#78A4CB]">
                            Witaj z powrotem
                        </Text>

                        <Text className="text-4xl font-extrabold leading-tight text-[#1A3A52]">
                            Cześć, {userName}
                        </Text>

                        <Text className="mt-3 max-w-sm text-base leading-relaxed text-[#5A7A95]">
                            Kontynuuj przygotowania do patentu sternika motorowodnego.
                        </Text>
                    </View>

                    {/* Search */}
                    <Pressable className="mb-8 flex-row items-center rounded-3xl border border-[#DDEAF0] bg-white px-5 py-4 shadow-sm">
                        <Search
                            size={24}
                            color="#9AA8B0"
                            strokeWidth={2.2}
                        />

                        <Text className="ml-4 text-base text-[#9AA8B0]">
                            Szukaj lekcji lub pytań...
                        </Text>
                    </Pressable>

                    {/* Hero */}
                    <View className="mb-8 h-64 flex-row overflow-hidden rounded-[28px] bg-[#D9EEF7]">
                        <View className="z-10 w-[58%] justify-center px-6">
                            <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-[#3478D9]">
                                Sternik motorowodny
                            </Text>

                            <Text className="mb-6 text-2xl font-extrabold leading-tight text-[#1A3A52]">
                                Przygotuj się do egzaminu krok po kroku
                            </Text>

                            <Pressable className="self-start flex-row items-center rounded-2xl bg-[#3478D9] px-4 py-3">
                                <Play
                                    size={18}
                                    color="white"
                                    fill="white"
                                />

                                <Text className="ml-2 text-base font-bold text-white">
                                    Kontynuuj naukę
                                </Text>
                            </Pressable>
                        </View>

                        <View className="absolute bottom-0 right-0 h-full w-[52%]">
                            <Image
                                source={require('@/assets/images/home-boat.jpg')}
                                className="h-full w-full"
                                resizeMode="cover"
                            />

                            <View className="absolute inset-0 bg-[#D9EEF7]/10" />
                        </View>
                    </View>

                    {/* Main options */}
                    <Text className="mb-4 text-2xl font-extrabold text-[#1A3A52]">
                        Wybierz tryb nauki
                    </Text>

                    <View className="mb-8 gap-4">
                        <MainFeatureCard
                            title="Kurs sternika motorowodnego"
                            subtitle="Lekcje, materiały i powtórki przygotowane zgodnie z zakresem egzaminu."
                            badge="12 modułów"
                            progress={42}
                            icon={
                                <BookOpen
                                    size={30}
                                    color="#3478D9"
                                    strokeWidth={2.2}
                                />
                            }
                            buttonLabel="Otwórz kurs"
                            onPress={() => {
                                // router.push('/course')
                            }}
                        />

                        <MainFeatureCard
                            title="Egzaminy sternika motorowodnego"
                            subtitle="Rozwiązuj próbne egzaminy i sprawdzaj swoją gotowość."
                            badge="Egzamin próbny"
                            progress={68}
                            accent="cream"
                            icon={
                                <ClipboardCheck
                                    size={30}
                                    color="#1A3A52"
                                    strokeWidth={2.2}
                                />
                            }
                            buttonLabel="Rozpocznij egzamin"
                            onPress={() => {
                                // router.push('/exams')
                            }}
                        />
                    </View>

                    {/* Quick stats */}
                    <View className="mb-8 flex-row gap-3">
                        <StatCard
                            icon={
                                <Clock3
                                    size={22}
                                    color="#3478D9"
                                />
                            }
                            label="Czas nauki"
                            value="4h 20m"
                        />

                        <StatCard
                            icon={
                                <Target
                                    size={22}
                                    color="#3478D9"
                                />
                            }
                            label="Poprawne"
                            value="82%"
                        />

                        <StatCard
                            icon={
                                <Trophy
                                    size={22}
                                    color="#3478D9"
                                />
                            }
                            label="Seria"
                            value="6 dni"
                        />
                    </View>

                    {/* Resume section */}
                    <View className="mb-6 rounded-[28px] border border-[#DDEAF0] bg-white p-5 shadow-sm">
                        <View className="mb-4 flex-row items-start justify-between">
                            <View className="flex-1 pr-4">
                                <Text className="text-xs font-bold uppercase tracking-widest text-[#78A4CB]">
                                    Ostatnia aktywność
                                </Text>

                                <Text className="mt-2 text-xl font-extrabold leading-tight text-[#1A3A52]">
                                    Znaki żeglugowe i oznakowanie szlaku
                                </Text>

                                <Text className="mt-2 text-sm leading-relaxed text-[#5A7A95]">
                                    Moduł 3 z kursu sternika motorowodnego.
                                </Text>
                            </View>

                            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#D9EEF7]">
                                <Sailboat
                                    size={25}
                                    color="#3478D9"
                                />
                            </View>
                        </View>

                        <View className="mb-4 h-3 overflow-hidden rounded-full bg-[#E6EEF2]">
                            <View className="h-full w-[42%] rounded-full bg-[#3478D9]" />
                        </View>

                        <Pressable className="flex-row items-center justify-between rounded-2xl bg-[#F0F7FA] px-4 py-3">
                            <Text className="font-bold text-[#3478D9]">
                                Wznów lekcję
                            </Text>

                            <ChevronRight
                                size={20}
                                color="#3478D9"
                            />
                        </Pressable>
                    </View>
                </View>
            </ScrollView>

            <BottomNav />
        </View>
    )
}

function MainFeatureCard({
    title,
    subtitle,
    badge,
    progress,
    icon,
    buttonLabel,
    onPress,
    accent = 'blue',
}: {
    title: string
    subtitle: string
    badge: string
    progress: number
    icon: React.ReactNode
    buttonLabel: string
    onPress?: () => void
    accent?: 'blue' | 'cream'
}) {
    const isBlue = accent === 'blue'

    return (
        <View
            className={`overflow-hidden rounded-[28px] border p-5 shadow-sm ${isBlue
                ? 'border-[#C9E4EF] bg-white'
                : 'border-[#F2E3A5] bg-[#FFF9E3]'
                }`}
        >
            <View className="mb-5 flex-row items-start justify-between">
                <View
                    className={`h-14 w-14 items-center justify-center rounded-2xl ${isBlue ? 'bg-[#D9EEF7]' : 'bg-[#F9E8A2]'
                        }`}
                >
                    {icon}
                </View>

                <View
                    className={`rounded-full px-3 py-1.5 ${isBlue ? 'bg-[#EAF5F9]' : 'bg-white/70'
                        }`}
                >
                    <Text
                        className={`text-xs font-bold ${isBlue ? 'text-[#3478D9]' : 'text-[#8B721F]'
                            }`}
                    >
                        {badge}
                    </Text>
                </View>
            </View>

            <Text className="text-2xl font-extrabold leading-tight text-[#1A3A52]">
                {title}
            </Text>

            <Text className="mt-3 text-base leading-relaxed text-[#5A7A95]">
                {subtitle}
            </Text>

            <View className="mt-5">
                <View className="mb-2 flex-row items-center justify-between">
                    <Text className="text-sm font-medium text-[#7B91A3]">
                        Postęp
                    </Text>

                    <Text className="text-sm font-bold text-[#3478D9]">
                        {progress}%
                    </Text>
                </View>

                <View className="h-3 overflow-hidden rounded-full bg-[#E6EEF2]">
                    <View
                        style={{ width: `${progress}%` }}
                        className="h-full rounded-full bg-[#3478D9]"
                    />
                </View>
            </View>

            <Pressable
                onPress={onPress}
                className={`mt-5 flex-row items-center justify-between rounded-2xl px-4 py-3 ${isBlue ? 'bg-[#3478D9]' : 'bg-[#1A3A52]'
                    }`}
            >
                <Text className="font-bold text-white">
                    {buttonLabel}
                </Text>

                <ChevronRight
                    size={20}
                    color="white"
                />
            </Pressable>
        </View>
    )
}

function StatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode
    label: string
    value: string
}) {
    return (
        <View className="flex-1 rounded-[22px] border border-[#DDEAF0] bg-white p-4 shadow-sm">
            <View className="mb-3 h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF5F9]">
                {icon}
            </View>

            <Text className="text-lg font-extrabold text-[#1A3A52]">
                {value}
            </Text>

            <Text className="mt-1 text-xs font-medium text-[#7B91A3]">
                {label}
            </Text>
        </View>
    )
}