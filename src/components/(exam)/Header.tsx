import { Text, View } from "react-native";

export function Header() {
    return (
        <View>
            <Text className="text-[12px] font-bold uppercase tracking-[1.7px] text-[#8B92A5]">
                Egzaminy próbne
            </Text>

            <Text className="mt-2 text-[38px] font-semibold leading-[43px] tracking-[-1.3px] text-[#293681]">
                Sprawdź swoją wiedzę
            </Text>

            <Text className="mt-3 max-w-[340px] text-[16px] leading-6 text-[#747B8F]">
                Wybierz kurs i rozpocznij pełną symulację
                egzaminu albo wróć do pytań, które wymagają
                powtórki.
            </Text>
        </View>
    )
}
