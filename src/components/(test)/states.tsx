import { ArrowLeft, Brain, RotateCcw } from "lucide-react-native"
import { ActivityIndicator, Pressable, Text, View } from "react-native"

export function ErrorState({
    message,
    onBack,
    onRetry,
}: {
    message: string
    onBack: () => void
    onRetry: () => void
}) {
    return (
        <View className="flex-1 bg-[#F8FAFC] px-6 pt-14">
            <Pressable
                onPress={onBack}
                className="h-11 w-11 items-center justify-center rounded-[16px] border border-[#E3E8F1] bg-white"
            >
                <ArrowLeft
                    size={20}
                    color="#293681"
                />
            </Pressable>

            <View className="mt-8 rounded-[28px] border border-[#E3E8F1] bg-white p-6">
                <View className="h-14 w-14 items-center justify-center rounded-[18px] bg-[#EEF3FC]">
                    <Brain
                        size={26}
                        color="#4274D9"
                    />
                </View>

                <Text className="mt-5 text-[23px] font-semibold text-[#293681]">
                    Test niedostępny
                </Text>

                <Text className="mt-2 text-sm leading-6 text-[#747B8F]">
                    {message}
                </Text>

                <Pressable
                    onPress={onRetry}
                    className="mt-6 flex-row items-center justify-center rounded-[18px] bg-[#293681] px-5 py-4"
                >
                    <RotateCcw
                        size={18}
                        color="#FFFFFF"
                    />

                    <Text className="ml-2 font-bold text-white">
                        Spróbuj ponownie
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}






export function LoadingState() {
    return (
        <View className="flex-1 items-center justify-center bg-[#F8FAFC] px-6">
            <View className="h-16 w-16 items-center justify-center rounded-[22px] border border-[#E3E8F1] bg-white">
                <ActivityIndicator
                    size="large"
                    color="#4274D9"
                />
            </View>

            <Text className="mt-5 text-[18px] font-semibold text-[#293681]">
                Przygotowujemy test
            </Text>

            <Text className="mt-2 text-center text-sm leading-6 text-[#747B8F]">
                Losujemy pytania z bazy
                egzaminacyjnej.
            </Text>
        </View>
    )
}
