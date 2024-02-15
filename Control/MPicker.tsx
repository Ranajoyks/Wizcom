import { Picker, PickerProps } from "@react-native-picker/picker"
import UIHelper from "../Core/UIHelper";
import { StyleSheet } from "react-native";
import { ColorCode } from "../Page/MainStyle";

interface MPickerProps<T> extends PickerProps<T> {
    Data: T[],
    Value: NonNullable<keyof T>,
    Label: NonNullable<keyof T>,
    AddPlaceHolderItem?: string
}
const MPicker = <T,>(props: MPickerProps<T>) => {


    var dataList = props.Data.map((i: T, k) => {
        var label = i[props.Label] as string
        var value = i[props.Value] as string
        return <Picker.Item label={label} key={value} value={i} />;
    });
    if (props.AddPlaceHolderItem) {
        const placrHolderItem = <Picker.Item label={props.AddPlaceHolderItem} key={""} value={""} />
        dataList.unshift(placrHolderItem)
    }


    return (
        <Picker
            style={LocalStyle.Picker}
            {...props}
        >
            {dataList}
        </Picker>
    )
}

export default MPicker

const LocalStyle = StyleSheet.create({
    Picker: {
        alignSelf: "center", backgroundColor: ColorCode.DimGray, width: "90%", textAlign: "center",
    }
})