import { NavItemProps } from '@/types/nav'
import { router, usePathname } from 'expo-router'
import { BookOpen, Home, Sheet, User } from 'lucide-react-native'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

export function BottomNav() {
    const path = usePathname()

    return (
        <View className="absolute bottom-5 left-5 right-5 rounded-[28px] bg-white px-5 py-4 shadow-md">
            <View className="flex-row items-center justify-between">
                <NavItem
                    active={path === "/home"}
                    label="Home"
                    icon={<Home />}
                    dest="/home"
                />

                <NavItem
                    active={path === "/courses"}
                    label="Kursy"
                    icon={<BookOpen />}
                    dest="/courses"
                />

                <NavItem
                    active={path === "/exams"}
                    label="Egzaminy"
                    icon={<Sheet />}
                    dest="/exams"
                />

                {/*  <NavItem
                    active={path === "/progress"}
                    label="Postęp"
                    icon={<TrendingUp />}
                    dest="/progress"
                />
 */}
                <NavItem
                    active={path === "/profile"}
                    label="Profil"
                    icon={<User />}
                    dest="/profile"
                />
            </View>
        </View>
    )
}


function NavItem({
    icon,
    label,
    active = false,
    dest,
}: NavItemProps) {
    return (
        <Pressable className="items-center gap-1" onPress={() => router.push(dest)}>
            {React.cloneElement(icon, {
                size: 25,
                color: active ? '#3478D9' : '#9AA8B0',
                strokeWidth: 2.6,
            })}

            <Text
                className={`text-xs font-semibold ${active ? 'text-[#3478D9]' : 'text-[#9AA8B0]'
                    }`}
            >
                {label}
            </Text>
        </Pressable>
    )
}