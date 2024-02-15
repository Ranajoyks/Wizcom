import { ActivityIndicator, Card, Divider, Text } from "react-native-paper"
import { ColorCode, styles } from "../Page/MainStyle"
import { StatusBar, StyleSheet, View } from "react-native"
import { MDivider } from "./MDivider"

import { useState } from "react"

import ContentLoader, { Circle, Rect, Facebook, } from 'react-content-loader/native'
import LottieView from "lottie-react-native"

export const MCardCover = (props: { ImageUrl?: string }) => {
    var imageUrl = props.ImageUrl
    const pathImage = require("../Page/Data/imageloading.json")
    const pathNoImage = require("../Page/Data/NoCamera.json")

    const [complete, setcomplete] = useState(false);

    const onStart = () => {

        setcomplete(false)
    }


    const onLoadEnd = () => {

        setcomplete(true)
    }

    var tempContent = <></>



    // var indictor = <ContentLoader
    //     speed={1}

    //     backgroundColor={ColorCode.LightBlue}
    //     foregroundColor={ColorCode.DimGray}
    //     viewBox="0 0 250 100"
    // >
    //     {/* Only SVG shapes */}

    //     <Rect x="10" y="0" rx="5" ry="5" width="100" height="100" />
    //     <Rect x="120" y="10" rx="4" ry="4" width="120" height="20" />
    //     <Rect x="120" y="40" rx="3" ry="3" width="120" height="20" />
    //     <Rect x="120" y="70" rx="2" ry="2" width="120" height="20" />
    // </ContentLoader>


    var indictor = <LottieView
        resizeMode="cover"
        style={{
            height: 180, width: 320,
        }}
        source={pathImage} autoPlay
    ></LottieView>

    var Noimage = <View
        style={{
            display: "flex",
            "flexDirection": "column",
            alignContent: "center",
            alignItems: "center",
        }}>
        <Text style={{ fontWeight: "bold", fontSize: 18, color: ColorCode.Brown }}>No Image Found !!</Text>

        <LottieView
            resizeMode="contain"
            style={{
                height: 180, width: 320,
            }}
            source={pathNoImage} autoPlay
        ></LottieView>
    </View>

    if (!imageUrl) {
        tempContent = Noimage
    }
    else {

        var imageControl = <Card.Cover
            source={{ uri: imageUrl }}
        />

        if (complete) {
            tempContent = imageControl
        }
        else {
            tempContent = indictor
        }
    }

    return (
        <>
            <MDivider />
            <Card style={{ ...styles.CardStyle, height: 210 }}  >
                {tempContent}
                {
                    imageUrl && <Card.Cover
                        onLoadStart={onStart}
                        onLoad={onLoadEnd}
                        style={{ height: 0, width: 0 }}
                        source={{ uri: imageUrl }} />
                }
            </Card>
            <MDivider />
        </>
    )
}

// return (
//     <View style={{ height: 220, paddingBottom: 5 }}>
//         <MDivider />
//         {imageUrl &&
//             <>
//                 <Card >
//                     <Card.Cover
//                         onLoadStart={onStart}
//                         onLoadEnd={onLoadEnd}
//                         resizeMode="cover"
//                         style={styles.CardCover}
//                         source={{ uri: imageUrl }}
//                     />
//                 </Card>
//             </>
//         }
//         <MDivider />
//     </View>
// )
//}

