import React from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import {
    User,
    Mail,
    School,
    ShieldCheck,
    Bell,
    Settings,
    LogOut,
    ChevronRight,
    Sailboat,
    Anchor,
    BookOpen,
    Trophy,
    Star,
    Home,
    TrendingUp,
} from 'lucide-react-native'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'
import { BottomNav } from '@/components/bottom-nav'
import { signOut } from '@/lib/session'
import { Alert } from 'react-native'

export default function AccountScreen() {
    const { user } = useAuth()

    const userName =
        user?.user_metadata?.first_name ??
        user?.email?.split('@')[0] ??
        'Kapitan'

    const email = user?.email ?? 'Brak adresu e-mail'

    async function handleLogout() {
        const logout = await signOut()
        if (logout) {
            Alert.alert("Zostałeś wylogowany")
        }
    }

    return (
        <View className="flex-1 bg-[#F0F7FA]">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 130 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="px-6 pt-14">
                    <View className="mb-7 flex-row items-center justify-between">
                        <View>

                            <Text className="text-4xl font-extrabold leading-tight text-[#1A3A52]">
                                Twój profil
                            </Text>
                        </View>


                    </View>

                    <View className="mb-8 overflow-hidden rounded-[28px] bg-[#D9EEF7] p-6 shadow-sm">
                        <View className="flex-row items-center gap-4">
                            <View className="h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
                                <Text className="text-3xl font-extrabold text-[#3478D9]">
                                    {userName.charAt(0).toUpperCase()}
                                </Text>
                            </View>

                            <View className="flex-1">

                                <Text className="mt-1 text-base text-[#5A7A95]">
                                    {email}
                                </Text>
                            </View>
                        </View>


                    </View>

                    {/* <View className="mb-7 flex-row gap-4">
                        <ProfileStatCard
                            label="Lekcje"
                            value="24"
                            icon={<BookOpen />}
                        />
                        <ProfileStatCard
                            label="Postęp"
                            value="65%"
                            icon={<TrendingUp />}
                        />
                        <ProfileStatCard
                            label="Odznaki"
                            value="6"
                            icon={<Trophy />}
                        />
                    </View> */}

                    <View className="mb-7 rounded-[28px] bg-white p-5 shadow-sm">
                        <Text className="mb-4 text-xl font-extrabold text-[#1A3A52]">
                            Dane konta
                        </Text>

                        <AccountRow
                            icon={<User />}
                            title="Nazwa użytkownika"
                            value={userName}
                        />

                        <AccountRow
                            icon={<Mail />}
                            title="Adres e-mail"
                            value={email}
                        />

                        <AccountRow
                            icon={<School />}
                            title="Szkoła żeglarska"
                            value="Nie przypisano"
                        />

                        <AccountRow
                            icon={<ShieldCheck />}
                            title="Status konta"
                            value="Aktywne do ..."
                            last
                        />
                    </View>

                    <View className="mb-7 rounded-[28px] bg-white p-5 shadow-sm">
                        <Text className="mb-4 text-xl font-extrabold text-[#1A3A52]">
                            Ustawienia
                        </Text>

                        <SettingsRow icon={<Bell />} title="Powiadomienia" />
                        <SettingsRow icon={<Star />} title="Ulubione pytania" />
                        <SettingsRow icon={<Anchor />} title="Moje patenty" />
                        <SettingsRow icon={<Settings />} title="Ustawienia aplikacji" last />
                    </View>

                    <Pressable
                        onPress={handleLogout}
                        className="mb-6 flex-row items-center justify-center gap-2 rounded-[24px] bg-white px-5 py-5 shadow-sm"
                    >
                        <LogOut size={22} color="#EF4444" strokeWidth={2.4} />
                        <Pressable onPress={() => handleLogout()}>
                            <Text className="text-lg font-bold text-[#EF4444]">
                                Wyloguj się
                            </Text>
                        </Pressable>
                    </Pressable>
                </View>
            </ScrollView>

            <BottomNav />
        </View>
    )
}

function ProfileStatCard({
    label,
    value,
    icon,
}: {
    label: string
    value: string
    icon: React.ReactElement
}) {
    return (
        <View className="flex-1 rounded-[24px] bg-white p-4 shadow-sm">
            <View className="mb-3 h-10 w-10 items-center justify-center rounded-2xl bg-[#D9EEF7]">
                {React.cloneElement(icon, {
                    size: 21,
                    color: '#3478D9',
                    strokeWidth: 2.4,
                })}
            </View>

            <Text className="text-2xl font-extrabold text-[#1A3A52]">
                {value}
            </Text>
            <Text className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#9AA8B0]">
                {label}
            </Text>
        </View>
    )
}

function AccountRow({
    icon,
    title,
    value,
    last = false,
}: {
    icon: React.ReactElement
    title: string
    value: string
    last?: boolean
}) {
    return (
        <View
            className={`flex-row items-center gap-4 py-4 ${last ? '' : 'border-b border-[#E6EEF2]'
                }`}
        >
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#D9EEF7]">
                {React.cloneElement(icon, {
                    size: 22,
                    color: '#3478D9',
                    strokeWidth: 2.4,
                })}
            </View>

            <View className="flex-1">
                <Text className="text-sm font-semibold text-[#7B91A3]">
                    {title}
                </Text>
                <Text className="mt-0.5 text-base font-bold text-[#1A3A52]">
                    {value}
                </Text>
            </View>
        </View>
    )
}

function SettingsRow({
    icon,
    title,
    last = false,
}: {
    icon: React.ReactElement
    title: string
    last?: boolean
}) {
    return (
        <Pressable
            className={`flex-row items-center gap-4 py-4 ${last ? '' : 'border-b border-[#E6EEF2]'
                }`}
        >
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#D9EEF7]">
                {React.cloneElement(icon, {
                    size: 22,
                    color: '#3478D9',
                    strokeWidth: 2.4,
                })}
            </View>

            <Text className="flex-1 text-base font-bold text-[#1A3A52]">
                {title}
            </Text>

            <ChevronRight size={22} color="#9AA8B0" strokeWidth={2.4} />
        </Pressable>
    )
}
/* 
function BottomNav() {
    return (
        <View className="absolute bottom-5 left-5 right-5 rounded-[28px] bg-white px-5 py-4 shadow-md">
            <View className="flex-row items-center justify-between">
                <NavItem label="Home" icon={<Home />} />
                <NavItem label="Kursy" icon={<BookOpen />} />
                <NavItem label="Postępy" icon={<TrendingUp />} />
                <NavItem label="Ulubione" icon={<Star />} />
                <NavItem active label="Profil" icon={<User />} />
            </View>
        </View>
    )
}
 */
/* function NavItem({
    icon,
    label,
    active = false,
}: {
    icon: React.ReactElement
    label: string
    active?: boolean
}) {
    return (
        <Pressable className="items-center gap-1">
            {React.cloneElement(icon, {
                size: 25,
                color: active ? '#3478D9' : '#9AA8B0',
                strokeWidth: 2.6,
                fill: active && label === 'Profil' ? '#3478D9' : 'none',
            })}

            <Text
                className={`text-xs font-semibold ${active ? 'text-[#3478D9]' : 'text-[#9AA8B0]'
                    }`}
            >
                {label}
            </Text>
        </Pressable>
    )
} */