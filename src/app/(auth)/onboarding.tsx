import { router } from "expo-router"
import { Text, View } from 'react-native'
import Svg, { Circle, Path, Polyline } from 'react-native-svg'
import { PrimaryButton } from "../../components/primary-button"

const BookOpenIcon = () => (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
)

const BrainIcon = () => (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
)

const RepeatIcon = () => (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path d="m17 2 4 4-4 4" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M3 11V9a4 4 0 0 1 4-4h14" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="m7 22-4-4 4-4" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
)

const TrendingUpIcon = () => (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        <Polyline points="16 7 22 7 22 13" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
)

export default function OnboardingScreen() {
    return (
        <View className="relative flex-1 overflow-hidden bg-[#F0F7FA]">
            <View className="absolute bottom-0 right-0 z-0 overflow-hidden">
                <Svg width={340} height={400} viewBox="0 0 340 400">
                    <Path d="M50 400 Q90 290 180 255 Q245 228 305 248 Q338 260 340 278 L340 400 Z" fill="#95BDD7" opacity={0.55} />
                    <Path d="M110 400 Q150 325 225 305 Q278 290 320 308 Q338 316 340 330 L340 400 Z" fill="#78A4CB" opacity={0.72} />
                    <Circle cx={168} cy={295} r={3} fill="#F9E8A2" opacity={0.45} />
                    <Circle cx={403} cy={370} r={4} fill="white" opacity={0.5} />
                    <Circle cx={200} cy={350} r={3} fill="white" opacity={0.4} />
                    <Circle cx={150} cy={370} r={3} fill="white" opacity={0.4} />
                    <Path
                        d="M160 390 Q190 400 205 375"
                        stroke="white"
                        strokeWidth={1}
                        strokeLinecap="round"
                        fill="none"
                    />
                </Svg>
            </View>

            <View className="relative z-10 flex-1 px-6 pb-10 pt-14">
                <View className="mb-12 flex-row items-center gap-2.5">
                    {/* NAZWA APLIKACJI + LOGO */}
                    {/* <HelmioLogo size={38} /> */}
                    {/*    <Text className="text-2xl font-bold tracking-tight text-[#1A3A52]">
                        Helmio
                    </Text> */}
                </View>

                <View className="mb-6 flex-1 justify-center">
                    <Text className="mb-3 text-xs  uppercase tracking-widest text-[#78A4CB]">
                        Platforma edukacyjna
                    </Text>

                    <Text className="mb-4 text-[38px] font-light leading-tight text-[#1A3A52]">
                        Nauka do patentów wodnych
                    </Text>

                    <Text className="max-w-xs text-base leading-relaxed text-[#5A7A95]">
                        Ucz się szybciej, rozwiązuj pytania egzaminacyjne i śledź swoje
                        postępy w jednym miejscu.
                    </Text>
                </View>


                {/*  */}
                <View className="gap-3">
                    <PrimaryButton
                        label="Zaczynamy"
                        onPress={() => router.push("/(auth)/register")}
                        variant="primary"
                    />
                    <PrimaryButton
                        className=""
                        label="Mam już konto"
                        onPress={() => router.push("/(auth)/login")}
                        variant="ghost"
                    />
                </View>
            </View>
        </View>
    )
}