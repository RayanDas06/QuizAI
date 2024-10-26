import { CameraView, CameraProps, useCameraPermissions } from "expo-camera";
import { useState, useEffect, useRef } from "react";
import { Alert, Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from 'react-native-elements';

export default function Upload() {
  // @ts-ignore: just being lazy with types here
  const cameraRef = useRef<CameraView>(undefined);
  const [facing, setFacing] = useState<CameraProps["facing"]>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photoList, setPhotoList] = useState<Blob[]>([]);
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

  async function takePhoto(){
    const photo = await cameraRef.current?.takePictureAsync();
    alert(`photo captured with dimensions: ${photo!.width} x ${photo!.height}`);
    const uri: any = photo?.uri;
    const resp = await fetch(uri);
    const blob = await resp.blob();
    setPhotoList([...photoList, blob]);
    Alert.alert(JSON.stringify(blob));
  }
  async function sendImages() {
    const url = "https://pr3pxwe35maanib7ukld3gxlru0omfeg.lambda-url.us-east-1.on.aws/topic";
    try {
      // Construct FormData to send the image as a multipart form
      const formData = new FormData();
      //Alert.alert(JSON.stringify(photoList));
      for(let i = 0;i<photoList.length;i++){
        formData.append("file[]", photoList[i]);
      }
      formData.append("test", "hi");
      const blob1 = new Blob(["Hello, this is some text content"], { type: "text/plain" });
      formData.append("test1", blob1);
      Alert.alert(JSON.stringify(formData.get("test")));
      Alert.alert(JSON.stringify(formData.get("file[]")));
      // Send the POST request with the image data
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        Alert.alert("Success", "Image uploaded successfully!");
      } else {
        Alert.alert("Error", "Failed to upload image.");
      }
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
      >
      </CameraView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={takePhoto}
          style={{
              borderWidth:1,
              borderColor:'rgba(0,0,0,0.2)',
              width:70,
              height:70,
              backgroundColor:'black',
              borderRadius:50,
            }}
        >
        </TouchableOpacity>
        <TouchableOpacity
          onPress={sendImages}
        >
          <Text>Upload</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10
  },
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: 'center',
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
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});