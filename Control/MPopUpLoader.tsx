import { Text, Button } from "react-native"
import { Portal, Dialog, Divider } from "react-native-paper"
import { ColorCode } from "../Page/MainStyle"
import LottieView from "lottie-react-native"

export const MPopUpLoader = (props: { visible: boolean, mode: "car" | "Square" }) => {
    const pathCar = require("../Page/Data/loadingcar.json")
    const pathSqaure = require("../Page/Data/loadingsquare.json")

    var FinalPath = pathCar
    if (props.mode == "Square") {
        FinalPath = pathSqaure
    }

    return (
        <Portal>
            <Dialog dismissable={false}
                visible={props.visible}
                style={{
                    padding: 0,
                    margin: 0,
                    backgroundColor: "transparent",
                    shadowColor: "transparent",

                }}
            >

                <LottieView style={{
                    alignSelf: "center",
                    height: 200, width: 300
                }}
                    source={FinalPath} autoPlay
                ></LottieView>

            </Dialog>
        </Portal>
    )
}