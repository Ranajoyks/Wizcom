import { Toast } from "native-base";

export type ToastType="danger" | "success" | "warning"

export default class ToastHelper {


public static ShowToastMesage(Message: string, type: ToastType, duration: number) {
    Toast.show({
      text: Message, 
      position: "bottom",
      type: type,
      style:{
        margin:40,
        marginBottom:100,
        borderRadius:15,        
        opacity:.9,
        backgroundColor:"#000"
      },
      textStyle:{
        textAlign:"center",
        fontSize:15,
      },
      duration: duration || 0
    })
  }
}