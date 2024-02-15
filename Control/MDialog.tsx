import { Text, Button } from "react-native"
import { Portal, Dialog, Divider } from "react-native-paper"
import { ColorCode } from "../Page/MainStyle"
import LottieView from "lottie-react-native"

export const MDialog = (props: { visible: boolean, Content: React.JSX.Element }) => {


    return (
        <Portal>
            <Dialog
                onDismiss={() => { }}
                visible={props.visible}
                style={{
                    padding: 0,
                    margin: 0,
                    backgroundColor: "transparent",
                    shadowColor: "transparent",

                }}
            >
                {props.Content}
            </Dialog>
        </Portal>
    )
}