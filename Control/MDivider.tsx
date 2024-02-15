import { Divider } from "react-native-paper"

export const MDivider = (props: { marginPadingTopButom?: number }) => {
    var finalTopBottom = props.marginPadingTopButom ?? 5
    return (
        <Divider bold style={{ marginTop: finalTopBottom, marginBottom: finalTopBottom }} />
    )
}