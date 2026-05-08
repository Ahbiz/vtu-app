/**
 * Centralized app data — placeholder values that can be replaced
 * when real backend data is available.
 */

// ─── Brand ───
export const APP_BRAND = {
    name: "AhbizPay",
    letterMark: "A",
    tagline: "Top up smarter. Pay bills faster.",
};

// ─── Colors ───
export const COLORS = {
    primary: "#6366FF",
    primaryDark: "#4444FF",
    primaryLight: "#EEEDFF",
    primaryGhost: "#F0EFFF",
    dark: "#1A1A2E",
    text: "#111111",
    textSecondary: "#444444",
    textMuted: "#888888",
    textPlaceholder: "#AAAAAA",
    border: "#E0E0E0",
    background: "#F8F8FF",
    surface: "#FFFFFF",
    surfaceSecondary: "#F5F5F5",
    danger: "#EF4444",
    success: "#10B981",
    warning: "#F59E0B",
    cardDarkStart: "#1A1A3E",
    cardDarkEnd: "#2D2D6B",
};

// ─── User (placeholder — only used as fallback before API loads) ───
export const PLACEHOLDER_USER = {
    fullName: "User",
    firstName: "there",
    email: "",
    phone: "",
    accountName: "",
};

// ─── Virtual Accounts — real data comes from GET /auth/me ───
export const VIRTUAL_ACCOUNTS: never[] = [];

// ─── Services ───
export const SERVICE_ITEMS = [
    { id: "1", label: "Airtime", icon: "call-outline" as const, color: "#6366FF" },
    { id: "2", label: "Data", icon: "wifi-outline" as const, color: "#10B981" },
    { id: "3", label: "Electricity", icon: "flash-outline" as const, color: "#F59E0B" },
    { id: "4", label: "Cable TV", icon: "tv-outline" as const, color: "#EF4444" },
    { id: "5", label: "Recharge2Cash", icon: "swap-horizontal-outline" as const, color: "#8B5CF6" },
    { id: "6", label: "Exam", icon: "school-outline" as const, color: "#06B6D4" },
    { id: "7", label: "Recharge Card", icon: "card-outline" as const, color: "#EC4899" },
    { id: "8", label: "Data Card", icon: "cellular-outline" as const, color: "#14B8A6" },
    { id: "9", label: "Refer & Earn", icon: "gift-outline" as const, color: "#F97316" },
];

// ─── Promo / Banner Cards (horizontal scroll) ───
export const PROMO_BANNERS = [
    {
        id: "1",
        title: "Refer a friend & earn!",
        subtitle: "Share your code and get ₦500 per referral",
        icon: "gift-outline" as const,
        bgColor: "#EEEDFF",
        iconColor: "#6366FF",
    },
    {
        id: "2",
        title: "Cheap Data Bundles",
        subtitle: "Get 1GB for as low as ₦250. Limited offer!",
        icon: "wifi-outline" as const,
        bgColor: "#E6FFF4",
        iconColor: "#10B981",
    },
    {
        id: "3",
        title: "Instant Airtime Top-up",
        subtitle: "Top up any network in seconds, 24/7",
        icon: "call-outline" as const,
        bgColor: "#FFF4E6",
        iconColor: "#F59E0B",
    },
    {
        id: "4",
        title: "Pay Bills & Save",
        subtitle: "Electricity, cable TV and more at discounted rates",
        icon: "flash-outline" as const,
        bgColor: "#FFE6E6",
        iconColor: "#EF4444",
    },
];

// ─── Wallet Balance (placeholder) ───
export const PLACEHOLDER_BALANCE = {
    currency: "NGN",
    amount: "0.00",
};
