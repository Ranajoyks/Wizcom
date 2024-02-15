import { List, Text } from "react-native-paper"
import { ColorCode, styles } from "../Page/MainStyle"
import { StyleProp, TextStyle } from "react-native"
import React from "react"

export const ListItem = (
    Props:
        {
            title: string,
            icon?: string,
            data?: string | React.JSX.Element,
            titleStyle?: StyleProp<TextStyle>,
            dataStyle?: StyleProp<TextStyle>,

        }
) => {

    var titleStyle = Props.titleStyle ?? {};

    var rightElement = <></>
    if (Props.data) {

        if (React.isValidElement(Props.data)) {
            rightElement = Props.data
        }
        else {
            rightElement = <Text style={Props.dataStyle}>{Props.data}</Text>
        }
    }





    if (Props.titleStyle) {
        Object.assign(titleStyle, { color: ColorCode.Brown })
    }

    return (
        <List.Item
            style={styles.ListItemContainerStyle}
            title={Props.title}
            titleStyle={titleStyle}
            left={() => Props.icon && <List.Icon color={ColorCode.Brown} icon={Props.icon} />}
            right={() => Props.data && rightElement}
        />
    )
}