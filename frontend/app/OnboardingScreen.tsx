import { COLORS } from "@/constants/app-data";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const SLIDES = [
    {
        id: "1",
        icon: "wallet-outline" as const,
        iconColor: "#6366FF",
        iconBg: "#EEEDFF",
        title: "Fund Your Wallet Instantly",
        subtitle: "Transfer from any bank to your dedicated virtual account and get credited in seconds.",
    },
    {
        id: "2",
        icon: "phone-portrait-outline" as const,
        iconColor: "#10B981",
        iconBg: "#E6FFF4",
        title: "Buy Airtime & Data",
        subtitle: "Top up MTN, Airtel, Glo, and 9Mobile at the best rates — anytime, anywhere.",
    },
    {
        id: "3",
        icon: "flash-outline" as const,
        iconColor: "#F59E0B",
        iconBg: "#FFF4E6",
        title: "Pay Bills Effortlessly",
        subtitle: "Electricity, cable TV, and more — all in one place with instant confirmation.",
    },
    {
        id: "4",
        icon: "shield-checkmark-outline" as const,
        iconColor: "#6366FF",
        iconBg: "#EEEDFF",
        title: "Secure & Reliable",
        subtitle: "Your transactions are protected with PIN verification and bank-grade security.",
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleNext = () => {
        if (activeIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
            setActiveIndex(activeIndex + 1);
        } else {
            router.replace("/LoginScreen" as any);
        }
    };

    const handleSkip = () => {
        router.replace("/LoginScreen" as any);
    };

    const isLast = activeIndex === SLIDES.length - 1;

    return (
        <SafeAreaView style={styles.container}>
            {/* Skip button */}
            <View style={styles.topBar}>
                <View style={styles.logoRow}>
                    <View style={styles.letterBox}>
                        <Text style={styles.letterInBox}>A</Text>
                    </View>
                    <Text style={styles.logoText}>hbizPay</Text>
                </View>
                {!isLast && (
                    <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={SLIDES}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                onMomentumScrollEnd={(e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                    setActiveIndex(idx);
                }}
                renderItem={({ item }) => (
                    <View style={styles.slide}>
                        <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
                            <Ionicons name={item.icon} size={64} color={item.iconColor} />
                        </View>
                        <Text style={styles.slideTitle}>{item.title}</Text>
                        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
                    </View>
                )}
            />

            {/* Dots */}
            <View style={styles.dotsRow}>
                {SLIDES.map((_, i) => (
                    <View
                        key={i}
                        style={[styles.dot, i === activeIndex && styles.dotActive]}
                    />
                ))}
            </View>

            {/* Bottom buttons */}
            <View style={styles.bottomSection}>
                {isLast ? (
                    <>
                        <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={() => router.push("/RegisterScreen")}
                        >
                            <Text style={styles.primaryBtnText}>Create Account</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.secondaryBtn}
                            onPress={() => router.push("/LoginScreen")}
                        >
                            <Text style={styles.secondaryBtnText}>I already have an account</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
                        <Text style={styles.primaryBtnText}>Next</Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFFFFF" },
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 16,
    },
    logoRow: { flexDirection: "row", alignItems: "center" },
    letterBox: {
        width: 36,
        height: 36,
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 6,
        transform: [{ rotate: "-5deg" }],
    },
    letterInBox: { fontSize: 20, fontWeight: "800", color: "#FFF" },
    logoText: { fontSize: 24, fontWeight: "800", color: COLORS.primary, letterSpacing: 0.5 },
    skipBtn: { paddingHorizontal: 16, paddingVertical: 8 },
    skipText: { fontSize: 14, fontWeight: "600", color: COLORS.textMuted },
    slide: {
        width,
        paddingHorizontal: 32,
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    },
    iconCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 40,
    },
    slideTitle: {
        fontSize: 26,
        fontWeight: "700",
        color: "#111",
        textAlign: "center",
        marginBottom: 16,
        lineHeight: 34,
    },
    slideSubtitle: {
        fontSize: 16,
        color: COLORS.textMuted,
        textAlign: "center",
        lineHeight: 26,
    },
    dotsRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        paddingVertical: 24,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#E0E0E0",
    },
    dotActive: {
        width: 24,
        backgroundColor: COLORS.primary,
    },
    bottomSection: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        gap: 12,
    },
    primaryBtn: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    primaryBtnText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
    secondaryBtn: {
        height: 52,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    secondaryBtnText: { fontSize: 15, fontWeight: "600", color: COLORS.primary },
});
