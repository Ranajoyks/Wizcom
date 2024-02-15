import { View } from "react-native"
import { ListItem } from "./ListItem"
import { ColorCode, styles } from "../Page/MainStyle"
import { Card } from "react-native-paper"

export const PageTitle = (props: { Title: string, icon?: string }) => {
    return (
        <Card mode="outlined" style={{ margin: 5, borderRadius: 5 }}>
            <View style={{
                display: "flex", backgroundColor: ColorCode.LightBlue,
                flexDirection: "row",
                justifyContent: "center",
            }}>
                <ListItem
                    titleStyle={{ fontSize: 20, fontWeight: "bold" }}
                    title={props.Title}
                    icon={props.icon ?? "car"} />
            </View>
        </Card>
    )
}