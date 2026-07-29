import { useRouter } from 'expo-router'
import {
    ChevronRight,
    LogOut,
    Mail,
    School,
    ShieldCheck,
    User,
} from 'lucide-react-native'
import { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native'

import { BottomNav } from '@/components/app/bottom-nav'
import { AccountDataCard } from '@/components/profile/account-data-card'
import { useAuth } from '@/context/auth-context'
import { signOut } from '@/lib/session'
import { getUserSchoolName } from '@/services/school.service'

export default function AccountScreen() {
    const { user } = useAuth()
    const router = useRouter()

    const [schoolName, setSchoolName] =
        useState<string | null>(null)

    const [isSchoolLoading, setIsSchoolLoading] =
        useState(true)

    const [isSigningOut, setIsSigningOut] =
        useState(false)

    useEffect(() => {
        let isMounted = true

        async function fetchSchoolName() {
            if (!user?.id) {
                if (isMounted) {
                    setSchoolName(null)
                    setIsSchoolLoading(false)
                }

                return
            }

            try {
                setIsSchoolLoading(true)

                const name =
                    await getUserSchoolName(user.id)

                if (isMounted) {
                    setSchoolName(name)
                }
            } catch (error) {
                console.error(
                    'Błąd podczas pobierania szkoły użytkownika:',
                    error,
                )

                if (isMounted) {
                    setSchoolName(null)
                }
            } finally {
                if (isMounted) {
                    setIsSchoolLoading(false)
                }
            }
        }

        void fetchSchoolName()

        return () => {
            isMounted = false
        }
    }, [user?.id])

    const firstName =
        user?.user_metadata?.first_name?.trim() ??
        user?.email?.split('@')[0] ??
        'Kapitan'

    const lastName =
        user?.user_metadata?.last_name?.trim() ?? ''

    const userName =
        `${firstName} ${lastName}`.trim()

    const email =
        user?.email ?? 'Brak adresu e-mail'

    const displayedSchoolName =
        isSchoolLoading
            ? 'Pobieranie danych...'
            : schoolName ??
            'Nie przypisano szkoły'

    const initials =
        `${firstName.charAt(0)}${lastName.charAt(0)}`
            .trim()
            .toUpperCase() ||
        userName.charAt(0).toUpperCase()

    async function handleSignOut() {
        if (isSigningOut) {
            return
        }

        try {
            setIsSigningOut(true)

            await signOut()

            router.replace('/login')
        } catch (error) {
            console.error(
                'Sign out error:',
                error,
            )

            Alert.alert(
                'Błąd wylogowania',
                'Nie udało się wylogować. Spróbuj ponownie.',
            )
        } finally {
            setIsSigningOut(false)
        }
    }

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

                <ProfileCard
                    initials={initials}
                    userName={userName}
                    email={email}
                    schoolName={
                        displayedSchoolName
                    }
                    isSchoolLoading={
                        isSchoolLoading
                    }
                />

                <AccountSection
                    userName={userName}
                    email={email}
                    schoolName={
                        displayedSchoolName
                    }
                    isSchoolLoading={
                        isSchoolLoading
                    }
                />

                <SignOutCard
                    isSigningOut={
                        isSigningOut
                    }
                    onPress={
                        handleSignOut
                    }
                />
            </ScrollView>

            <BottomNav />
        </View>
    )
}

function Header() {
    return (
        <View className="mb-7">


            <Text className="mt-2 text-[38px] font-semibold leading-[43px] tracking-[-1.3px] text-[#293681]">
                Twoje konto
            </Text>

            <Text className="mt-3 max-w-[340px] text-[16px] leading-6 text-[#747B8F]">
                Dane profilu, szkoła oraz informacje
                dotyczące Twojego dostępu.
            </Text>
        </View>
    )
}

type ProfileCardProps = {
    initials: string
    userName: string
    email: string
    schoolName: string
    isSchoolLoading: boolean
}

function ProfileCard({
    initials,
    userName,
    email,
    schoolName,
    isSchoolLoading,
}: ProfileCardProps) {
    return (
        <View className="mb-8 overflow-hidden rounded-[30px] bg-[#293681] p-6">
            <ProfileDecoration />

            <View className="z-10">
                <View className="flex-row items-center">
                    <View className="h-20 w-20 items-center justify-center rounded-[26px] border border-white/15 bg-white/10">
                        <Text className="text-[30px] font-bold text-white">
                            {initials}
                        </Text>
                    </View>

                    <View className="ml-4 flex-1">
                        <Text className="text-[11px] font-bold uppercase tracking-[1.4px] text-[#95CCDD]">
                            Witaj na pokładzie
                        </Text>

                        <Text
                            className="mt-1 text-[24px] font-semibold leading-7 text-white"
                            numberOfLines={2}
                        >
                            {userName}
                        </Text>
                    </View>
                </View>

                <View className="mt-6 border-t border-white/10 pt-5">
                    <View className="flex-row items-center">
                        <View className="h-9 w-9 items-center justify-center rounded-[13px] bg-white/10">
                            <Mail
                                size={17}
                                color="#95CCDD"
                                strokeWidth={2.2}
                            />
                        </View>

                        <Text
                            className="ml-3 flex-1 text-sm text-white/75"
                            numberOfLines={1}
                        >
                            {email}
                        </Text>
                    </View>

                    <View className="mt-4 flex-row items-center">
                        <View className="h-9 w-9 items-center justify-center rounded-[13px] bg-white/10">
                            {isSchoolLoading ? (
                                <ActivityIndicator
                                    size="small"
                                    color="#95CCDD"
                                />
                            ) : (
                                <School
                                    size={18}
                                    color="#95CCDD"
                                    strokeWidth={2.2}
                                />
                            )}
                        </View>

                        <View className="ml-3 flex-1">
                            <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-white/45">
                                Szkoła
                            </Text>

                            <Text
                                className="mt-0.5 text-sm font-semibold text-white"
                                numberOfLines={1}
                            >
                                {schoolName}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}

type AccountSectionProps = {
    userName: string
    email: string
    schoolName: string
    isSchoolLoading: boolean
}

function AccountSection({
    userName,
    email,
    schoolName,
    isSchoolLoading,
}: AccountSectionProps) {
    return (
        <View>
            <View className="mb-5">
                <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#8B92A5]">
                    Informacje
                </Text>

                <Text className="mt-2 text-[27px] font-semibold tracking-[-0.7px] text-[#293681]">
                    Dane konta
                </Text>

                <Text className="mt-1 text-sm leading-5 text-[#747B8F]">
                    Podstawowe informacje o Twoim profilu.
                </Text>
            </View>

            <View className="gap-3">
                <AccountDataCard
                    icon={
                        <User
                            color="#4274D9"
                            size={21}
                        />
                    }
                    title="Nazwa użytkownika"
                    value={userName}
                />

                <AccountDataCard
                    icon={
                        <Mail
                            color="#4274D9"
                            size={21}
                        />
                    }
                    title="Adres e-mail"
                    value={email}
                />

                <AccountDataCard
                    icon={
                        <School
                            color="#4274D9"
                            size={21}
                        />
                    }
                    title="Szkoła"
                    value={schoolName}
                    isLoading={isSchoolLoading}
                />

                <AccountDataCard
                    icon={
                        <ShieldCheck
                            color="#4274D9"
                            size={21}
                        />
                    }
                    title="Status dostępu"
                    value="Aktywny"
                />
            </View>
        </View>
    )
}

type SignOutCardProps = {
    isSigningOut: boolean
    onPress: () => void
}

function SignOutCard({
    isSigningOut,
    onPress,
}: SignOutCardProps) {
    return (
        <Pressable
            onPress={onPress}
            disabled={isSigningOut}
            className="mt-7 flex-row items-center justify-between rounded-[26px] border border-[#F0DADA] bg-white p-5"
            style={({ pressed }) => ({
                opacity: isSigningOut
                    ? 0.65
                    : pressed
                        ? 0.85
                        : 1,
                transform: [
                    {
                        scale:
                            pressed &&
                                !isSigningOut
                                ? 0.988
                                : 1,
                    },
                ],
            })}
        >
            <View className="flex-1 flex-row items-center">
                <View className="h-12 w-12 items-center justify-center rounded-[17px] bg-[#FFF1F1]">
                    {isSigningOut ? (
                        <ActivityIndicator
                            size="small"
                            color="#C24F4F"
                        />
                    ) : (
                        <LogOut
                            size={22}
                            color="#C24F4F"
                            strokeWidth={2.3}
                        />
                    )}
                </View>

                <View className="ml-4 flex-1">
                    <Text className="text-[16px] font-bold text-[#A63F3F]">
                        {isSigningOut
                            ? 'Wylogowywanie...'
                            : 'Wyloguj się'}
                    </Text>

                    <Text className="mt-1 text-[13px] text-[#9C6D6D]">
                        Zakończ bieżącą sesję
                    </Text>
                </View>
            </View>

            <ChevronRight
                size={21}
                color="#C24F4F"
                strokeWidth={2.3}
            />
        </Pressable>
    )
}

function BackgroundDecoration() {
    return (
        <View
            pointerEvents="none"
            className="absolute inset-0 overflow-hidden"
        >
            <View className="absolute -right-36 -top-32 h-80 w-80 rounded-full bg-[#D0E7E6]/45" />

            <View className="absolute -left-40 top-[500px] h-72 w-72 rounded-full bg-[#EEF3FC]" />
        </View>
    )
}

function ProfileDecoration() {
    return (
        <View
            pointerEvents="none"
            className="absolute inset-0 overflow-hidden"
        >
            <View className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#4274D9]/35" />

            <View className="absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-[#95CCDD]/10" />
        </View>
    )
}