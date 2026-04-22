import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
const { width } = Dimensions.get("window");

export default function Onboarding() {
  const router = useRouter()
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoSection}>
        <View style={styles.logoRow}>
          <View style={styles.letterBox}>
            <Text style={styles.letterInBox}>A</Text>
          </View>
          <Text style={styles.logoText}>hbizPay</Text>
        </View>
        <Text style={styles.tagline}>Top up smarter. Pay bills faster.</Text>
      </View>

      <View style={styles.btns}>
        <TouchableOpacity style={styles.logbtncon}>
          <Text style={styles.logbtn}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.regbtncon}>
          <Text style={styles.regbtn} onPress={() => router.push("/RegisterPage")}>Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#6366FF",
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 50,
  },
  logoSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  letterBox: {
    width: 52,
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
    transform: [{ rotate: "-5deg" }],
  },
  letterInBox: {
    fontSize: 32,
    fontWeight: "800",
    color: "#6366FF",
  },
  logoText: {
    fontSize: 40,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.85)",
    letterSpacing: 0.3,
  },
  btns: {
    gap: 16,
    alignItems: "center",
  },
  logbtncon: {
    borderRadius: 15,
    padding: 16,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    width: width * 0.85,
  },
  logbtn: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  regbtncon: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 16,
    width: width * 0.85,
  },
  regbtn: {
    color: "#6366FF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});