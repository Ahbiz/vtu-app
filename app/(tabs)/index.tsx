import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useFonts, Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import { useState, useRef, useCallback } from "react";

const { width } = Dimensions.get("window");

const ONBOARDING_PAGES = [
  {
    id: "1",
    image: require("@/assets/images/onboarding1.png"),
    title: "Data at your fingertips",
  },
  {
    id: "2",
    image: require("@/assets/images/onboarding2.png"),
    title: "Top up in seconds",
  },
  {
    id: "3",
    image: require("@/assets/images/onboarding3.png"),
    title: "Pay bills with ease",
  },
];


function PaginationDots({ currentPage }: { currentPage: number }) {
  return (
    <View style={styles.dotsContainer}>
      {ONBOARDING_PAGES.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentPage ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

export default function Home() {
  const [fontsLoaded] = useFonts({ Poppins_600SemiBold });
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  if (!fontsLoaded) return null;

  const isLastPage = currentPage === ONBOARDING_PAGES.length - 1;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentPage(viewableItems[0].index ?? 0);
      }
    },
    [],
  );

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

  const handleNext = () => {
    if (isLastPage) {
      router.push("/Onboarding");
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentPage + 1,
        animated: true,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_PAGES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View style={styles.page}>
            <View style={styles.imageWrapper}>
              <Image
                contentFit="contain"
                source={item.image}
                style={[
                  styles.illusImg,
                  item.id === "1" && { transform: [{ scale: 1.25 }], marginLeft: 30 },
                ]}
              />
            </View>
            <Text style={styles.headline}>{item.title}</Text>
          </View>
        )}
      />

      <PaginationDots currentPage={currentPage} />

      <View style={styles.buttonZone}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {isLastPage ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#4444FF",
    flex: 1,
  },
  page: {
    width: width,
    alignItems: "center",
  },

  illusImg: {
    width: width * 0.85,
    height: width * 0.85,
    maxWidth: 350,
    maxHeight: 350,
    marginTop: 140,
    marginBottom: 15,
  },
  imageWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  headline: {
    textAlign: "center",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 26,
    fontWeight: "600",
    color: "#1A1A2E",
    letterSpacing: 0.4,
    lineHeight: 36,
    paddingHorizontal: 32,
  },

  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 8,
  },
  dot: {
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    width: 18,
    backgroundColor: "#ffffff",
  },
  dotInactive: {
    width: 10,
    backgroundColor: "rgba(255,255,255,0.35)",
  },

  buttonZone: {
    paddingHorizontal: 32,
    marginTop: 40,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#1A1A2E",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    fontWeight: "600",
  },
});
