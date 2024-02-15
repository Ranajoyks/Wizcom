import { Image, StyleSheet } from "react-native"
import { Card } from "react-native-paper"
import { ColorCode, styles } from "../Page/MainStyle"


const NoPreviewImage = require('./../../Assets/nopreview.png')
export default NoPreviewImage

export const Noimage = () => {
    return (
        <Card.Cover resizeMode="stretch" source={NoPreviewImage} />
    )
}

