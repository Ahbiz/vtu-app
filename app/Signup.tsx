import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Signup() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.con}>
        <View style={styles.logoname}>
          <Text>AhbizPay</Text>
        </View>

        <View style={styles.btns}>
          <TouchableOpacity>
            <Text>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text> Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#404CCF",
    flex: 1,
  },
  con: {
    justifyContent: "center",
    alignItems: "center",
  },
  btns: {
    gap: 10,
  },
  logoname: {
    marginTop: 240,
    marginBottom: 141,
    paddingHorizontal:72
  },
});
