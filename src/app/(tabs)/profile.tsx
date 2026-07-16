import { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native'
import {
    ChevronRight,
    LogOut,
    Mail,
    School,
    ShieldCheck,
    User,
} from 'lucide-react-native'

import { useAuth } from '@/context/auth-context'
import { BottomNav } from '@/components/app/bottom-nav'
import { signOut } from '@/lib/session'
import { getUserSchoolName } from '@/services/school.service'
import { useRouter } from 'expo-router'
import { ProfileWave } from '@/components/ui/waves'
import { AccountDataCard } from '@/components/profile/account-data-card'


export default function AccountScreen() {
    const { user } = useAuth()

    const [schoolName, setSchoolName] = useState<string | null>(null)
    const [isSchoolLoading, setIsSchoolLoading] = useState(true)
    const [isSigningOut, setIsSigningOut] = useState(false);

    const router = useRouter();


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

                const name = await getUserSchoolName(user.id)

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

    const userName = `${firstName} ${lastName}`.trim()
    const email = user?.email ?? 'Brak adresu e-mail'

    const displayedSchoolName = isSchoolLoading
        ? 'Pobieranie danych...'
        : schoolName ?? 'Nie przypisano szkoły'

    const initials =
        `${firstName.charAt(0)}${lastName.charAt(0)}`
            .trim()
            .toUpperCase() ||
        userName.charAt(0).toUpperCase()

    async function handleSignOut() {
        if (isSigningOut) {
            return;
        }

        try {
            setIsSigningOut(true);

            await signOut();

            router.replace('/login');
        } catch (error) {
            console.error('Sign out error:', error);

            Alert.alert(
                'Błąd wylogowania',
                'Nie udało się wylogować. Spróbuj ponownie.',
            );
        } finally {
            setIsSigningOut(false);
        }
    }

    return (
        <View className="flex-1 bg-[#DDEFF6]">


            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingBottom: 140,
                }}
                showsVerticalScrollIndicator={false}
            >
                <View className="px-5 pt-14">
                    {/* Nagłówek */}
                    <View className="mb-6 flex-row items-center justify-between">
                        <View>
                            <Text className="text-xs font-bold uppercase tracking-[2px] text-[#3478D9]">
                                Konto ucznia
                            </Text>

                            <Text className="mt-2 text-4xl font-extrabold leading-tight text-[#163A59]">
                                Twój Profil
                            </Text>
                        </View>


                    </View>

                    {/* Hero profilu */}
                    <View className="mb-6 min-h-[260px] overflow-hidden rounded-[34px] bg-[#163A59] p-6 shadow-lg">
                        <ProfileWave />



                        <View className="z-10 flex-1 justify-between">
                            <View className="flex-row items-start justify-between">
                                <View className="h-24 w-24 items-center justify-center rounded-[30px] border border-white/20 bg-white/15">
                                    <Text className="text-4xl font-extrabold text-white">
                                        {initials}
                                    </Text>
                                </View>

                                <View className="flex-row items-center rounded-full bg-[#BFE7CE] px-4 py-2">
                                    <ShieldCheck
                                        size={16}
                                        color="#356B46"
                                        strokeWidth={2.5}
                                    />

                                    <Text className="ml-2 text-xs font-bold text-[#356B46]">
                                        Konto aktywne
                                    </Text>
                                </View>
                            </View>

                            <View className="mt-7">
                                <Text className="text-xs font-bold uppercase tracking-widest text-white/60">
                                    Witaj na pokładzie
                                </Text>

                                <Text className="mt-2 text-3xl font-extrabold text-white">
                                    {userName}
                                </Text>

                                <View className="mt-3 flex-row items-center">
                                    <Mail
                                        size={17}
                                        color="#B4DCE8"
                                        strokeWidth={2.2}
                                    />

                                    <Text
                                        className="ml-2 flex-1 text-base text-white/75"
                                        numberOfLines={1}
                                    >
                                        {email}
                                    </Text>
                                </View>
                                <View className="ml-4 flex-1 mt-5">
                                    <Text className="text-xs font-bold uppercase tracking-widest text-white/65">
                                        Szkoła żeglarska
                                    </Text>

                                    <Text className="mt-1 text-xl font-extrabold leading-tight text-white">
                                        {displayedSchoolName}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Dane konta */}
                    <View className="mb-5 overflow-hidden rounded-[30px] p-5">
                        <View className="mb-4 flex-row items-center justify-between">
                            <View>
                                <Text className="text-xs font-bold uppercase tracking-widest text-[#3478D9]">
                                    Informacje
                                </Text>

                                <Text className="mt-1 text-2xl font-extrabold text-[#163A59]">
                                    Dane konta
                                </Text>
                            </View>


                        </View>

                        <View className="gap-3">
                            <AccountDataCard
                                icon={<User />}
                                title="Nazwa użytkownika"
                                value={userName}
                            />

                            <AccountDataCard
                                icon={<Mail />}
                                title="Adres e-mail"
                                value={email}
                            />

                            <AccountDataCard
                                icon={<School />}
                                title="Szkoła"
                                value={displayedSchoolName}
                                isLoading={isSchoolLoading}
                            />

                            <AccountDataCard
                                icon={<ShieldCheck />}
                                title="Status dostępu"
                                value="Aktywny"
                                accent="green"
                            />
                        </View>
                    </View>

                    {/* Ustawienia */}
                    {/*    <View className="mb-5 overflow-hidden rounded-[30px] bg-[#F9E8A2] p-5">
                        <SmallWave color="#F1D567" />

                        <View className="mb-4 flex-row items-center justify-between">
                            <View>
                                <Text className="text-xs font-bold uppercase tracking-widest text-[#8C731D]">
                                    Personalizacja
                                </Text>

                                <Text className="mt-1 text-2xl font-extrabold text-[#163A59]">
                                    Ustawienia
                                </Text>
                            </View>

                            <Settings
                                size={28}
                                color="#79641C"
                                strokeWidth={2}
                            />
                        </View>

                        <View className="overflow-hidden rounded-[24px] bg-white/50">
                            <SettingsRow
                                icon={<Bell />}
                                title="Powiadomienia"
                                subtitle="Przypomnienia o nauce"
                            />

                            <SettingsRow
                                icon={<Star />}
                                title="Ulubione pytania"
                                subtitle="Zapisane materiały"
                            />

                            <SettingsRow
                                icon={<Anchor />}
                                title="Moje patenty"
                                subtitle="Uprawnienia i certyfikaty"
                            />

                            <SettingsRow
                                icon={<Settings />}
                                title="Ustawienia aplikacji"
                                subtitle="Wygląd i preferencje"
                                last
                            />
                        </View>
                    </View>
 */}
                    {/* Wylogowanie */}
                    <Pressable
                        onPress={handleSignOut}
                        disabled={isSigningOut}
                        className={`mb-6 flex-row items-center justify-between overflow-hidden rounded-[28px] px-5 py-5 ${isSigningOut
                            ? 'bg-[#E5B9B9]'
                            : 'bg-[#F3CACA]'
                            }`}
                    >
                        <View className="flex-row items-center">
                            <View className="h-12 w-12 items-center justify-center rounded-[18px] bg-white/55">
                                {isSigningOut ? (
                                    <ActivityIndicator color="#C84848" />
                                ) : (
                                    <LogOut
                                        size={23}
                                        color="#C84848"
                                        strokeWidth={2.4}
                                    />
                                )}
                            </View>

                            <View className="ml-4">
                                <Text className="text-lg font-extrabold text-[#A83737]">
                                    {isSigningOut
                                        ? 'Wylogowywanie...'
                                        : 'Wyloguj się'}
                                </Text>

                                <Text className="mt-1 text-sm text-[#A85C5C]">
                                    Zakończ bieżącą sesję
                                </Text>
                            </View>
                        </View>

                        <ChevronRight
                            size={23}
                            color="#C84848"
                            strokeWidth={2.3}
                        />
                    </Pressable>
                </View>
            </ScrollView>

            <BottomNav />
        </View>
    )
}


