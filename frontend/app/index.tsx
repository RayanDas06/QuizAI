import { Link } from "expo-router";
import { Text, View, StyleSheet, Image } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.appName}>TeachTok</Text>
      <Text style={styles.subtitle}>TikTok but for Studying</Text>
      <Link href="/upload" style={styles.button}>
        Go to Camera
      </Link>
      <Link href="/671dc536df6dae0513f0fd14" style={styles.button}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  appName: {
    fontSize: 55,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#a39193",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 350,
    color: "#a39193",
  },
  button: {
    backgroundColor: "#a39193",
    color: " white",
    padding: 10,
    borderRadius: 10,
    textAlign: "center",
    width: 130,
  },
});
