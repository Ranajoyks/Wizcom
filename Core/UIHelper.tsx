import { ActionSheet } from "native-base";
import { ConfirmBoxResult, ConstantMessage } from "./Index";

export default class UIHelper {
    public static async ShowConfirmBox(Title: string): Promise<ConfirmBoxResult> {
        return this.ShowConfirmBoxDetail(Title, ConstantMessage.DefaultConfirmBoxYesButtonText, ConstantMessage.DefaultConfirmBoxNoButtonText)
      }
      public static async ShowConfirmBoxDetail(Title: string, OkButtonText: string, CancelButtonText: string): Promise<ConfirmBoxResult> {
    
        return new Promise((resolve, reject) => {
          var BUTTONS = [
            {text: OkButtonText, icon: 'checkmark', iconColor: 'green'},
            {text: CancelButtonText, icon: 'close', iconColor: 'red'},
          ];
      
          ActionSheet.show(
            {
              options: BUTTONS,
              cancelButtonIndex: 1,
              destructiveButtonIndex: 1,
              title: Title,
            },
            (buttonIndex) => {
              
            var result = ConfirmBoxResult.Cancel;
            if (BUTTONS[buttonIndex].text === OkButtonText) {
              result = ConfirmBoxResult.OK
            }
            resolve(result)
            },
          ); 
        })
    
      }
    
}