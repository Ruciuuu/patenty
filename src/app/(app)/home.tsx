import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
    return (
        <View className="flex-1 justify-between bg-white px-6 py-12">
            <View />

            <View>
                <Text className="text-4xl font-bold text-gray-900">
                    Patentuj pomysły szybciej
                </Text>

                <Text className="mt-4 text-base text-gray-500">
                    Zapisuj, analizuj i organizuj swoje pomysły patentowe w jednym miejscu.
                </Text>
            </View>

            <View className="gap-3">
                <TouchableOpacity
                    onPress={() => router.push("/register")}
                    className="rounded-xl bg-blue-600 py-4"
                >
                    <Text className="text-center font-semibold text-white">
                        Załóż konto
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push("/login")}
                    className="rounded-xl border border-gray-300 py-4"
                >
                    <Text className="text-center font-semibold text-gray-900">
                        Zaloguj się
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}