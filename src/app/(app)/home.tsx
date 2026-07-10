import React from 'react'
import { View, Text, Pressable, ScrollView, Image } from 'react-native'
import {
    Search,
    Home,
    BookOpen,
    TrendingUp,
    Star,
    User,
    Users,
    ChevronRight,
    Play,
    Sailboat,
    Anchor,
    LifeBuoy,
} from 'lucide-react-native'
import { useAuth } from '@/context/auth-context'
import { BottomNav } from '@/components/bottom-nav'

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
                    <View className="mb-7 flex-row items-start justify-between">
                        <View>
                            <Text className="mb-2 text-lg font-medium text-[#78A4CB]">
                                25 Aug
                            </Text>

                            <Text className="text-4xl font-extrabold leading-tight text-[#1A3A52]">
                                Cześć, {userName}
                            </Text>
                        </View>


                    </View>

                    {/* Search */}
                    <View className="mb-8 flex-row items-center rounded-3xl border border-[#DDEAF0] bg-white px-5 py-4 shadow-sm">
                        <Search size={26} color="#9AA8B0" strokeWidth={2.2} />
                        <Text className="ml-4 text-lg text-[#9AA8B0]">
                            Szukaj lekcji, tematów...
                        </Text>
                    </View>

                    {/* Hero */}
                    <View className="mb-8 h-64 flex-row overflow-hidden rounded-[28px] bg-[#D9EEF7]">
                        {/* Lewa część */}
                        <View className="flex-1 justify-center px-6">
                            <Text className="mb-7 text-2xl font-extrabold leading-tight text-[#1A3A52]">
                                Czego chcesz się dziś nauczyć?
                            </Text>

                            <Pressable className="self-start rounded-2xl bg-[#3478D9] px-3 py-2">
                                <Text className="text-lg font-bold text-white">
                                    Zacznij naukę
                                </Text>
                            </Pressable>
                        </View>

                        {/* Prawa część */}
                        <View className="w-[50%] justify-end">
                            <Image
                                source={require('@/assets/images/home-boat.jpg')}
                                className="h-full w-full"
                                resizeMode="cover"
                            />
                        </View>
                    </View>

                    {/* Section title */}
                    <View className="mb-4 flex-row items-center justify-between">
                        <Text className="text-2xl font-extrabold text-[#1A3A52]">
                            Dla Ciebie
                        </Text>

                        <Pressable className="flex-row items-center">
                            <Text className="text-lg font-medium text-[#3478D9]">
                                Zobacz wszystkie
                            </Text>
                            <ChevronRight size={22} color="#3478D9" />
                        </Pressable>
                    </View>

                    {/* Cards grid */}
                    <View className="mb-7 flex-row gap-4">
                        {/* Big card */}
                        <View className="flex-1 rounded-[28px] bg-[#3478D9] p-5 shadow-md">
                            <View className="mb-7 self-start rounded-xl bg-[#1A3A52]/15 px-3 py-1.5">
                                <Text className="text-sm font-semibold text-white">
                                    Lekcja
                                </Text>
                            </View>

                            <Text className="mb-5 text-3xl font-extrabold leading-tight text-white">
                                Podstawy żeglarstwa ⚓
                            </Text>

                            <Text className="mb-8 text-lg leading-relaxed text-white/90">
                                Poznaj podstawowe pojęcia i zasady żeglarstwa.
                            </Text>

                            <View className="mt-auto flex-row items-end justify-between">
                                <Text className="text-lg text-white">20 min</Text>

                                <Pressable className="h-14 w-14 items-center justify-center rounded-full bg-white">
                                    <Play size={26} color="#1A3A52" fill="#1A3A52" />
                                </Pressable>
                            </View>

                            <View className="absolute right-4 top-16 opacity-10">
                                <Sailboat size={120} color="white" strokeWidth={1.5} />
                            </View>
                        </View>

                        {/* Right column */}
                        <View className="flex-1 gap-4">
                            <View className="rounded-[24px] bg-white p-5 shadow-sm">
                                <View className="mb-4 flex-row justify-between">
                                    <Text className="flex-1 text-2xl font-extrabold leading-tight text-[#1A3A52]">
                                        Dołącz do swojej klasy
                                    </Text>
                                    <Users size={28} color="#3478D9" />
                                </View>

                                <View className="flex-row items-center">
                                    <Avatar label="A" />
                                    <Avatar label="M" className="-ml-2" />
                                    <Avatar label="K" className="-ml-2" />
                                    <View className="-ml-2 h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                                        <Text className="font-bold text-[#1A3A52]">+12</Text>
                                    </View>
                                </View>
                            </View>

                            <View className="rounded-[24px] bg-white p-5 shadow-sm">
                                <View className="mb-3 flex-row justify-between">
                                    <Text className="text-lg text-[#5A7A95]">Artykuł</Text>
                                    <LifeBuoy size={30} color="#3478D9" />
                                </View>

                                <Text className="text-2xl font-extrabold leading-tight text-[#1A3A52]">
                                    5 wskazówek na bezpieczne pływanie
                                </Text>

                                <View className="absolute bottom-0 left-0 right-0 h-9 rounded-b-[24px] bg-[#D9EEF7]/60" />
                            </View>
                        </View>
                    </View>

                    {/* Progress */}
                    <View className="mb-6 flex-row items-center rounded-[28px] bg-white p-5 shadow-sm">
                        <View className="mr-5 h-20 w-20 items-center justify-center rounded-full border-[8px] border-[#3478D9]">
                            <Text className="text-xl font-bold text-[#3478D9]">65%</Text>
                        </View>

                        <View className="flex-1">
                            <Text className="mb-4 text-xl font-bold text-[#1A3A52]">
                                Twój postęp w tym tygodniu
                            </Text>

                            <View className="mb-3 h-3 overflow-hidden rounded-full bg-[#E6EEF2]">
                                <View className="h-full w-[65%] rounded-full bg-[#3478D9]" />
                            </View>

                            <Text className="text-base text-[#7B91A3]">
                                4 z 6 lekcji ukończone
                            </Text>
                        </View>

                        <Sailboat size={44} color="#3478D9" strokeWidth={1.8} />
                    </View>
                </View>
            </ScrollView>

            <BottomNav />
        </View>
    )
}

function Avatar({
    label,
    className = '',
}: {
    label: string
    className?: string
}) {
    return (
        <View
            className={`h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-[#D9EEF7] ${className}`}
        >
            <Text className="font-bold text-[#1A3A52]">{label}</Text>
        </View>
    )
}

