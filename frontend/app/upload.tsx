import { CameraView, CameraProps, useCameraPermissions } from "expo-camera";
import { useState, useRef } from "react";
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import axios from "axios";
import "react-native-get-random-values";
import { router } from "expo-router";
import { saveTopic } from "@/lib/topic";

export default function Upload() {
  // @ts-ignore: just being lazy with types here
  const cameraRef = useRef<CameraView>(undefined);
  const [facing, setFacing] = useState<CameraProps["facing"]>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photoList, setPhotoList] = useState<any[]>([]);
  const [blobList, setBlobList] = useState<Blob[]>([]);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  async function takePhoto() {
    const photo = await cameraRef.current?.takePictureAsync({ base64: true });
    const uri: any = photo?.uri;
    //const resp = await fetch(uri);
    const temp = photo?.base64;
    setPhotoList([...photoList, temp]);
    const temp2 = await fetch(uri);
    const blob = await temp2.blob();
    setBlobList([...blobList, blob]);
  }

  async function sendImages() {
    const url =
      "https://7zhrtkwetqzpehsfyomzfiwspy0kkdfb.lambda-url.us-east-1.on.aws/topic";
    try {
      const resp: any = await axios.post(url + "/" + "create");
      const postId = resp.data.id;
      // Construct FormData to send the image as a multipart form
      for (let i = 0; i < photoList.length; i++) {
        const body = blobList[i];
        const tempURL = url + "/" + postId + "/img";
        const response = await fetch(tempURL, {
          method: "POST",
          body: body,
        });
        if (response.status != 200) {
          Alert.alert("Error", "Failed to upload image " + (i + 1));
        }
      }
      await axios.post(url + "/" + postId + "/commit");
      setBlobList([]);
      setPhotoList([]);
      await saveTopic(postId);
      router.push(postId);
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "An error occurred while uploading the image.");
    }
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
      ></CameraView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={takePhoto}
          style={{
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.2)",
            width: 70,
            height: 70,
            backgroundColor: "#a39193",
            borderRadius: 50,
            marginRight: 50,
          }}
        />

        <TouchableOpacity
          onPress={sendImages}
          style={{
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.2)",
            backgroundColor: "#a39193",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 8,
            marginLeft: 50,
          }}
        >
          <Text> upload </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: "rgba(0,0,0,0)",
  },
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
  },
});
