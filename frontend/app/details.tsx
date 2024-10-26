import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Details() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/details.tsx to edit this screen.</Text>
      <Link href={"/"}>Go to Index</Link>
    </View>
  );
}
