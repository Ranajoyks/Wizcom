import { View } from "react-native"
import { ListItem } from "./ListItem"

export const MCardTitle = (props: { Title: string, icon?: string }) => {
    return (
        <View>
            <ListItem titleStyle={{ fontWeight: "bold" }}
                title={props.Title} icon={props.icon} />
        </View>

    )
}