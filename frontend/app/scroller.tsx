import { useState, useEffect, useRef } from "react";
import { Alert, Button, StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { Icon } from 'react-native-elements';
import  axios from 'axios';
import { FlatList } from "react-native-gesture-handler";
import React from "react";

export default function Scroller() {
    const [videos, setVideos] = useState<any[]>([]);
    const [audios, setAudios] = useState<any[]>([]);
    const [currVid, setCurrVid] = useState<any>();
    const [currAudio, setCurrAudio] = useState<any>();
    const [index, setIndex] = useState<number>(0);

    const VIDEO_WIDTH = 80;
    const VIDEO_LENGTH = 100;
    const topRef = React.useRef();

    useEffect(() => {
        const fetchDataToRender = async () => {
            const vids = await fetchVideos();
            const auds = await fetchAudios();
            setVideos(vids);
            setAudios(auds);
        }
        
        fetchDataToRender();
    }, []);

    const fetchVideos = () => {
        return [];
    }

    const fetchAudios = () => {
        return [];
    }

    const scrollToActiveIndex = (index: number) => {
        setIndex(index);
        setCurrVid(videos[index]);
        setCurrAudio(audios[index]);
    }


    if(!videos){
        return <Text>Loading...</Text>
    }

    return(
        <View style={{flex: 1, backgroundColor: "#000"}}>
            <FlatList
                data={videos}
                keyExtractor={item => item.id.toString()}
                style={{position: 'absolute', bottom: VIDEO_LENGTH}}
                onMomentumScrollEnd={ev => {
                    scrollToActiveIndex(Math.floor(ev.nativeEvent.contentOffset.y / height));
                }}
                renderItem={({item}) => {
                    return <View>
                            <Image
                                source={{uri: item.imageSrc}}
                                style={[StyleSheet.absoluteFillObject]}
                            />
                        </View>
                }}
            />
        </View>
    )

}
