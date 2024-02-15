import { Avatar } from "react-native-paper"
import { ColorCode } from "../MainStyle"
import { Props } from "react-native-paper/lib/typescript/components/Avatar/AvatarText"
import { TouchableOpacity } from "react-native-gesture-handler"

const ChatAvatar = (props: Props & { onPress?: () => void }) => {
    if (!props.label) {
        return <></>
    }
    return (
        <TouchableOpacity onPress={props.onPress}>
            <Avatar.Text
                {...props}
                style={{ backgroundColor: ColorCode.LightGray }}
                labelStyle={{ color: ColorCode.White,fontFamily: 'OpenSans_Condensed-Bold', }}
                label={props.label.charAt(0).toUpperCase()}
            />
        </TouchableOpacity>
    )
}
export default ChatAvatar