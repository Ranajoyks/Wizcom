import { Button, ButtonProps, Text } from "react-native-paper"
import MainStyle from "../Page/MainStyle"

export default function CustomButton(props: ButtonProps) {
    const { children, ...rest } = props
    return (
        <Button {...rest} style={MainStyle.ButtonStyle}>
            <Text
                style={{
                    color: 'white',
                    fontFamily: 'Poppins-Bold',
                }}>
                {children}
            </Text>
        </Button>
    )
}