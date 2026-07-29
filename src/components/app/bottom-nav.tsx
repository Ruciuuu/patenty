import { Href, router, usePathname } from 'expo-router'
import {
    BookOpen,
    GraduationCap,
    Home,
    type LucideIcon,
    Sheet,
    User,
} from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

const NAV_ITEMS: NavItemConfig[] = [
    {
        label: 'Home',
        icon: Home,
        dest: '/home',
    },
    {
        label: 'Kursy',
        icon: BookOpen,
        dest: '/courses',
    },
    {
        label: 'Testy',
        icon: Sheet,
        dest: '/quiz',
    },
    {
        label: 'Niezbędnik',
        icon: GraduationCap,
        dest: '/help',
    },
    {
        label: 'Profil',
        icon: User,
        dest: '/profile',
    },
]

type NavItemConfig = {
    label: string
    icon: LucideIcon
    dest: string
}

type NavItemProps = NavItemConfig & {
    active: boolean
}

export function BottomNav() {
    const pathname = usePathname()

    function isRouteActive(dest: string) {
        if (dest === '/home') {
            return pathname === '/home'
        }

        return (
            pathname === dest ||
            pathname.startsWith(`${dest}/`)
        )
    }

    return (
        <View
            pointerEvents="box-none"
            className="absolute bottom-0 left-0 right-0 px-4 pb-5"
        >
            <View
                className="rounded-[30px] border border-[#E4E4DE] bg-white/95 px-2 py-2"
                style={{
                    shadowColor: '#20221F',
                    shadowOffset: {
                        width: 0,
                        height: 10,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 24,
                    elevation: 12,
                }}
            >
                <View className="flex-row items-center">
                    {NAV_ITEMS.map((item) => (
                        <NavItem
                            key={item.dest}
                            {...item}
                            active={isRouteActive(
                                item.dest,
                            )}
                        />
                    ))}
                </View>
            </View>
        </View>
    )
}

function NavItem({
    icon: Icon,
    label,
    active,
    dest,
}: NavItemProps) {
    function handlePress() {
        if (active) {
            return
        }

        router.push(dest as Href)
    }

    return (
        <Pressable
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{
                selected: active,
            }}
            onPress={handlePress}
            className="flex-1"
            hitSlop={6}
            style={({ pressed }) => ({
                transform: [
                    {
                        scale: pressed ? 0.94 : 1,
                    },
                ],
                opacity: pressed ? 0.8 : 1,
            })}
        >
            <View
                className="min-h-[58px] items-center justify-center rounded-[22px] px-1"
            >
                <View className="relative">
                    <Icon
                        size={22}
                        color={
                            active
                                ? '#293681'
                                : '#8A8C86'
                        }
                        strokeWidth={
                            active ? 2.4 : 2
                        }
                    />


                </View>

                <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    className={`mt-1 text-[10px] font-semibold ${active
                        ? 'text-[#34452E]'
                        : 'text-[#8A8C86]'
                        }`}
                >
                    {label}
                </Text>
            </View>
        </Pressable>
    )
}