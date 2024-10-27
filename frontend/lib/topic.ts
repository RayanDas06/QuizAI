import AsyncStorage from "@react-native-async-storage/async-storage";
export async function saveTopic(topic: string) {
  await AsyncStorage.setItem("topic", topic);
}
export async function getTopic() {
  return await AsyncStorage.getItem("topic");
}
