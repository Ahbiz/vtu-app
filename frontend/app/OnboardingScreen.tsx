import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// ── Slide 2: price pills ─────────────────────────────────────────────────────
const PRICE_PILLS = [
    { label: "500MB — ₦149", active: false },
    { label: "1GB — ₦297", active: true },
    { label: "2GB — ₦450", active: false },
];

// ── Slide 3: service pills ───────────────────────────────────────────────────
const SERVICE_PILLS = [
    { label: "Electricity", icon: "⚡", bg: "#FFF7ED", text: "#F97316", border: "#FED7AA" },
    { label: "Cable TV", icon: "📺", bg: "#EEF2FF", text: "#4338CA", border: "#C7D2FE" },
    { label: "Exam Pins", icon: "🎓", bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
];

// ── Slide 4: floating badges ─────────────────────────────────────────────────
const EARN_BADGES = [
    { label: "3% cashback", bg: "#F97316", rotate: "6deg", top: "20%", right: "8%" },
    { label: "Instant credit", bg: "#4F46E5", rotate: "-3deg", bottom: "35%", left: "4%" },
    { label: "No limits", bg: "#10B981", rotate: "0deg", top: "32%", left: "10%" },
];

const SLIDES = [
    {
        id: "1",
        image: require("@/assets/images/onboarding-wallet.png"),
        title: "Fund Your Wallet\nInstantly",
        subtitle: "Transfer from any Nigerian bank and get credited in seconds.",
        extra: "none" as const,
    },
    {
        id: "2",
        image: require("@/assets/images/onboarding-airtime.png"),
        title: "Buy Airtime & Data",
        subtitle: "Top up MTN, Airtel, Glo & 9Mobile at the best rates — anytime.",
        extra: "pills" as const,
    },
    {
        id: "3",
        image: require("@/assets/images/onboarding-bills.png"),
        title: "Pay Bills Effortlessly",
        subtitle: "Electricity, DSTV, GOtv — all in one place, confirmed instantly.",
        extra: "services" as const,
    },
    {
        id: "4",
        image: require("@/assets/images/onboarding-referral.png"),
        title: "Earn While You Share",
        subtitle: "Invite friends, earn ₦500 per referral + cashback on every transaction.",
        extra: "earn" as const,
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const isLast = activeIndex === SLIDES.length - 1;

    const handleNext = () => {
        if (!isLast) {
            const next = activeIndex + 1;
            flatListRef.current?.scrollToIndex({ index: next, animated: true });
            setActiveIndex(next);
        } else {
            router.push("/LoginScreen" as any);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            {/* Top bar — hidden on last slide (slide 4 has no top bar in design) */}
            {!isLast && (
                <View style={styles.topBar}>
                    <View style={styles.logoRow}>
                        <View style={styles.letterBox}>
                            <Text style={styles.letterInBox}>A</Text>
                        </View>
                        <Text style={styles.logoText}>hbizPay</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push("/LoginScreen" as any)}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={SLIDES}
                horizontal
                pagingEnabled
                scrollEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                style={styles.flatList}
                onViewableItemsChanged={({ viewableItems }) => {
                    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
                        setActiveIndex(viewableItems[0].index);
                    }
                }}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                renderItem={({ item }) => (
                    <View style={styles.slide}>
                        {/* Sparkle dots — orange accent (slides 1–3) */}
                        {item.extra !== "earn" && (
                            <>
                                <View style={[styles.sparkleDot, styles.sparkleTL]} />
                                <View style={[styles.sparkleDot, styles.sparkleTR]} />
                                <View style={[styles.sparkleDot, styles.sparkleBL]} />
                            </>
                        )}

                        {/* Hero image */}
                        <Image
                            source={item.image}
                            style={styles.heroImage}
                            resizeMode="contain"
                        />

                        {/* Ground shadow */}
                        <View style={styles.groundShadow} />

                        {/* ── Slide 2: price pills ── */}
                        {item.extra === "pills" && (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.pillsRow}
                                style={styles.pillsScroll}
                            >
                                {PRICE_PILLS.map((pill) => (
                                    <View
                                        key={pill.label}
                                        style={[
                                            styles.pill,
                                            pill.active ? styles.pillActive : styles.pillInactive,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.pillText,
                                                pill.active
                                                    ? styles.pillTextActive
                                                    : styles.pillTextInactive,
                                            ]}
                                        >
                                            {pill.label}
                                        </Text>
                                    </View>
                                ))}
                            </ScrollView>
                        )}

                        {/* ── Slide 3: floating receipt badge + service pills ── */}
                        {item.extra === "services" && (
                            <>
                                {/* Floating receipt badge */}
                                <View style={styles.receiptBadge}>
                                    <View style={styles.receiptIconWrap}>
                                        <Text style={styles.receiptIcon}>✓</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.receiptLabel}>EKEDC Token ✓</Text>
                                        <Text style={styles.receiptAmount}>₦2,000</Text>
                                    </View>
                                </View>

                                {/* Service pills */}
                                <View style={styles.servicePillsRow}>
                                    {SERVICE_PILLS.map((sp) => (
                                        <View
                                            key={sp.label}
                                            style={[
                                                styles.servicePill,
                                                {
                                                    backgroundColor: sp.bg,
                                                    borderColor: sp.border,
                                                },
                                            ]}
                                        >
                                            <Text style={styles.servicePillIcon}>{sp.icon}</Text>
                                            <Text
                                                style={[
                                                    styles.servicePillText,
                                                    { color: sp.text },
                                                ]}
                                            >
                                                {sp.label}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </>
                        )}

                        {/* ── Slide 4: floating earn badges ── */}
                        {item.extra === "earn" &&
                            EARN_BADGES.map((badge) => (
                                <View
                                    key={badge.label}
                                    style={[
                                        styles.earnBadge,
                                        {
                                            backgroundColor: badge.bg,
                                            top: badge.top as any,
                                            right: badge.right as any,
                                            bottom: badge.bottom as any,
                                            left: badge.left as any,
                                            transform: [{ rotate: badge.rotate }],
                                        },
                                    ]}
                                >
                                    <Text style={styles.earnBadgeText}>{badge.label}</Text>
                                </View>
                            ))}
                    </View>
                )}
            />

            {/* Bottom panel */}
            <View style={styles.bottomPanel}>
                {/* Drag handle */}
                <View style={styles.dragHandle} />

                {/* Text */}
                <View style={styles.textBlock}>
                    <Text style={styles.title}>{SLIDES[activeIndex].title}</Text>
                    <Text style={styles.subtitle}>{SLIDES[activeIndex].subtitle}</Text>
                </View>

                {/* Pagination dots */}
                <View style={styles.dotsRow}>
                    {SLIDES.map((_, i) => (
                        <View
                            key={i}
                            style={[styles.dot, i === activeIndex && styles.dotActive]}
                        />
                    ))}
                </View>

                {/* CTA — last slide gets two buttons */}
                {isLast ? (
                    <>
                        <TouchableOpacity
                            style={styles.nextBtn}
                            onPress={() => router.push("/RegisterScreen" as any)}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.nextBtnText}>Create Free Account</Text>
                            <Text style={styles.arrowIcon}>→</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.signInBtn}
                            onPress={() => router.push("/LoginScreen" as any)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.signInText}>
                                Already have an account?{" "}
                                <Text style={styles.signInTextBold}>Sign in</Text>
                            </Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        style={styles.nextBtn}
                        onPress={handleNext}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.nextBtnText}>Next</Text>
                        <Text style={styles.arrowIcon}>→</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#EEF2FF",
    },

    // ── Top bar ──────────────────────────────────────────────────────────────
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: "transparent",
        zIndex: 10,
    },
    logoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    letterBox: {
        width: 32,
        height: 32,
        backgroundColor: "#4F46E5",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    letterInBox: {
        fontSize: 16,
        fontWeight: "800",
        color: "#FFFFFF",
    },
    logoText: {
        fontSize: 22,
        fontWeight: "800",
        color: "#111827",
    },
    skipText: {
        fontSize: 15,
        fontWeight: "500",
        color: "#9CA3AF",
    },

    // ── Slides ───────────────────────────────────────────────────────────────
    flatList: {
        flex: 1,
    },
    slide: {
        width,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    heroImage: {
        width: width * 0.72,
        height: width * 0.72,
        backgroundColor: "transparent",
        elevation: 0,
    },
    groundShadow: {
        width: width * 0.45,
        height: 20,
        borderRadius: 100,
        backgroundColor: "#4F46E5",
        opacity: 0.07,
        marginTop: -8,
    },

    // Sparkle dots
    sparkleDot: {
        position: "absolute",
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#F97316",
        opacity: 0.7,
    },
    sparkleTL: { top: "18%", left: "14%" },
    sparkleTR: { top: "22%", right: "12%", width: 7, height: 7, borderRadius: 4 },
    sparkleBL: { bottom: "28%", left: "18%", width: 6, height: 6, borderRadius: 3 },

    // ── Slide 2: price pills ─────────────────────────────────────────────────
    pillsScroll: {
        marginTop: 20,
        flexGrow: 0,
    },
    pillsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 24,
        paddingBottom: 4,
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
    },
    pillActive: {
        backgroundColor: "#4F46E5",
        shadowColor: "#4F46E5",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
    },
    pillInactive: {
        backgroundColor: "#F1F5F9",
    },
    pillText: {
        fontSize: 13,
        fontWeight: "500",
        lineHeight: 18,
    },
    pillTextActive: {
        color: "#FFFFFF",
        fontWeight: "700",
    },
    pillTextInactive: {
        color: "#374151",
    },

    // ── Slide 3: receipt badge ───────────────────────────────────────────────
    receiptBadge: {
        position: "absolute",
        top: "22%",
        right: "4%",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    receiptIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#D1FAE5",
        justifyContent: "center",
        alignItems: "center",
    },
    receiptIcon: {
        fontSize: 14,
        color: "#10B981",
        fontWeight: "700",
    },
    receiptLabel: {
        fontSize: 12,
        fontWeight: "500",
        color: "#111827",
    },
    receiptAmount: {
        fontSize: 13,
        fontWeight: "700",
        color: "#10B981",
    },

    // Slide 3: service pills
    servicePillsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 10,
        marginTop: 20,
        paddingHorizontal: 24,
    },
    servicePill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
    },
    servicePillIcon: {
        fontSize: 14,
    },
    servicePillText: {
        fontSize: 13,
        fontWeight: "500",
    },

    // ── Slide 4: earn badges ─────────────────────────────────────────────────
    earnBadge: {
        position: "absolute",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },
    earnBadgeText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#FFFFFF",
    },

    // ── Bottom panel ─────────────────────────────────────────────────────────
    bottomPanel: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 32,
        shadowColor: "#4F46E5",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 24,
        elevation: 8,
    },
    dragHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#E2E8F0",
        alignSelf: "center",
        marginBottom: 24,
    },
    textBlock: {
        alignItems: "center",
        marginBottom: 28,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#111827",
        textAlign: "center",
        lineHeight: 32,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: "400",
        color: "#374151",
        textAlign: "center",
        lineHeight: 24,
        paddingHorizontal: 8,
    },

    // Pagination dots
    dotsRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        marginBottom: 28,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#E2E8F0",
    },
    dotActive: {
        width: 20,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#4F46E5",
    },

    // Primary CTA button
    nextBtn: {
        backgroundColor: "#4F46E5",
        height: 54,
        borderRadius: 14,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    nextBtnText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    arrowIcon: {
        fontSize: 18,
        color: "#FFFFFF",
        fontWeight: "600",
    },

    // Slide 4: secondary sign-in link
    signInBtn: {
        marginTop: 16,
        alignItems: "center",
        paddingVertical: 8,
    },
    signInText: {
        fontSize: 14,
        color: "#9CA3AF",
        textAlign: "center",
    },
    signInTextBold: {
        color: "#4F46E5",
        fontWeight: "600",
    },
});
