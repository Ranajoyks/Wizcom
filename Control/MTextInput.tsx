
import { Avatar, Button, Card, HelperText, TextInput } from "react-native-paper";
import { ColorCode } from "../Page/MainStyle";
import { Props } from "react-native-paper/src/components/TextInput/TextInput";


export interface MTextInputProps {
    icon?: string, value: string
}

export default function MTextInput(props: MTextInputProps & Props) {
    return (
        <>
            <TextInput
                contentStyle={{ backgroundColor: ColorCode.DimGray }}
                error={props.value == ""}
                right={props.icon && <TextInput.Icon icon={props.icon} />}
                {...props}
            />
            <HelperText lineBreakMode="tail" type="error" visible={props.value == ""}>
                {props.label} is required
            </HelperText>
        </>
    )
}