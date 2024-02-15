import { Dimensions, SafeAreaView, View } from "react-native"
import { Text } from "react-native-paper"
import ContentLoader, { Circle, Rect, Facebook, Instagram, } from 'react-content-loader/native'
import { ColorCode } from "../Page/MainStyle"
import Svg, { Defs, LinearGradient, Stop, } from "react-native-svg"
import React from "react"



var Screen = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
}




const Test2 = () => {
    return (
        <Svg width={Screen.width} height={Screen.height} viewBox={"0 0 " + " " + Screen.width + " " + Screen.height}>
            <LinearGradient id="circleStrokeColor" x1="0" y1="0" x2={Screen.width} y2="0">
                <Stop offset="0" stopColor={"red"} stopOpacity={"0.5"} />
                <Stop offset="1" stopColor={"green"} stopOpacity={"0.2"} />
            </LinearGradient>
            <Rect x="0" y="0" width={Screen.width} height={Screen.height} fill="url(#circleStrokeColor)" />
        </Svg>
    )
}

const RaibowScreen = () => {
    return (
        <Svg width={Screen.width} height={Screen.height} viewBox={"0 0 " + " " + Screen.width + " " + Screen.height}>
            <LinearGradient id="Gradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={Screen.width} y2="0">
                <Stop offset="0" stopColor="red" stopOpacity="0.5" />
                <Stop offset="0.5" stopColor="green" stopOpacity="0.2" />
                <Stop offset="1" stopColor="blue" stopOpacity="0.5" />
            </LinearGradient>
            <Rect x="0" y="0" width={Screen.width} height={Screen.height} fill="url(#Gradient)" />
        </Svg>
    )
}

export const PageLoadingSkeleton = () => {

    return (
        <SafeAreaView>
            <View style={{ borderStyle: "solid", borderColor: ColorCode.LightBlue, borderWidth: 5, padding: 5 }}>
                <ContentLoader
                    height={Screen.height}
                    width={Screen.width}
                    backgroundColor={ColorCode.LightBlue}
                    foregroundColor={ColorCode.Yellow}

                >
                    <HumanCard yAxis={0} noOfLines={2} />
                    <HumanCard yAxis={100} noOfLines={3} />
                    <HumanCard yAxis={200} noOfLines={4} />
                    <HumanCard yAxis={300} noOfLines={5} />
                    <HumanCard yAxis={400} noOfLines={6} />
                    <HumanCard yAxis={500} noOfLines={7} />
                    <HumanCard yAxis={600} noOfLines={8} />
                    <HumanCard yAxis={700} noOfLines={9} />

                </ContentLoader>
            </View>
        </SafeAreaView >
    )
}

export const HumanCard = (props: { yAxis: number, marginRightLeft?: number, noOfLines?: number }) => {
    var PhotoBoxWidth = 100

    var marginRightLeft = props.marginRightLeft ?? 10
    var noOfLines = props.noOfLines ?? 4
    var lineheight: number = (PhotoBoxWidth / noOfLines) - marginRightLeft
    var linrWidth = Screen.width - PhotoBoxWidth - (marginRightLeft * 3)

    var LineElements = []
    for (let i = 0; i < noOfLines; i++) {

        LineElements.push(
            <Rect key={i}
                x={PhotoBoxWidth + (marginRightLeft * 2)}
                y={props.yAxis + (i * lineheight) + (marginRightLeft * (i + 1))}
                rx={i + 1}
                ry={i + 1}
                width={linrWidth - 20}
                height={lineheight} />
        )
    }

    var cXCy = (PhotoBoxWidth / 2)

    return (
        <>

            <Rect x={marginRightLeft} y={props.yAxis + marginRightLeft} width={PhotoBoxWidth} height={PhotoBoxWidth - marginRightLeft} />
            <Circle cx={(marginRightLeft) + cXCy} cy={props.yAxis + cXCy + (marginRightLeft / 2)} r={(PhotoBoxWidth / 2) - (marginRightLeft * 2)} />
            {LineElements}
        </>
    )
}