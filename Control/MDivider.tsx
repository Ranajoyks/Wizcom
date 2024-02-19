import { Divider } from "react-native-paper"

export const MDivider = (props: { marginPadingTopButom?: number }) => {
    var finalTopBottom = props.marginPadingTopButom ?? 5
    var bottomPadding = 5
    return (
        <Divider bold style={{ marginTop: finalTopBottom, marginBottom: bottomPadding }} />
    )
}