import LottieView from "lottie-react-native";
import { View } from "react-native";
import { Text } from "react-native-paper";
import MainStyle from "../Page/MainStyle";


export const EmptyListMessage = (loading: boolean) => {

    const path1 = require("../Page/Data/noitem.json")
    return (
        <View style={{ alignContent: "center", alignSelf: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>

            <LottieView style={{
                alignSelf: "center",
                marginTop: 150,
                height: 250, width: 300
            }}
                source={path1} autoPlay
            />

        </View>

    );
};
