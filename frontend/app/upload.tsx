import { CameraView, CameraProps, useCameraPermissions } from "expo-camera";
import { useState, useEffect, useRef } from "react";
import { Alert, Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from 'react-native-elements';
import  axios from 'axios';
import 'react-native-get-random-values';
import BSON from 'bson';

export default function Upload() {
  // @ts-ignore: just being lazy with types here
  const cameraRef = useRef<CameraView>(undefined);
  const [facing, setFacing] = useState<CameraProps["facing"]>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photoList, setPhotoList] = useState<any[]>([]);
  const [blobList, setBlobList ] = useState<Blob[]>([]);

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
    const photo = await cameraRef.current?.takePictureAsync({ base64: true});
    alert(`photo captured with dimensions: ${photo!.width} x ${photo!.height}`);
    const uri: any = photo?.uri;
    //const resp = await fetch(uri);
    const temp = photo?.base64;
    setPhotoList([...photoList, temp]);
    const temp2 = await fetch(uri);
    const blob = await temp2.blob();
    setBlobList([...blobList, blob]);
  } 

  async function makeBlobFile(blob: Blob, fileName: string){
    return new File([blob], fileName, {
      type: blob.type,
      lastModified: new Date().getTime()
    })
  }

  async function sendImages() {
    const url = "https://pr3pxwe35maanib7ukld3gxlru0omfeg.lambda-url.us-east-1.on.aws/topic";
    try {
      const resp: any = await axios.post(url+"/"+"create");
      const postId = resp.data.id;
      // Construct FormData to send the image as a multipart form
      for(let i = 0;i<photoList.length;i++){
        const body = blobList[i];
        const tempURL = url+'/'+postId+'/img';
        const response = await fetch(tempURL, {
          method: "POST",
          body: body
        });
        if(response.status != 200){
          Alert.alert("Error", "Failed to upload image "+(i+1));
        }
      }
      await axios.post(url+"/"+postId+"/commit");
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "An error occurred while uploading the image.");
    }
  }

  // async function sendImagesWithMultipart(){
  //   const formData = new FormData();  
  //   XMLHttpRequest.send("HI", "Hey");
  // }

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