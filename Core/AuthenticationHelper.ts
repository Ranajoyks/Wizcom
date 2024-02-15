import { SignalRHubConnection } from "../DataAccess/SignalRHubConnection";
import { NavigationProps } from "./BaseProps";
import SessionHelper from "./SessionHelper";

export default class AuthenticationHelper {
    public static async OnLogOut(navigation: NavigationProps): Promise<void> {
        await SignalRHubConnection.Disconnect()
        await SessionHelper.SetChatId('')
        navigation.reset({
            index: 0,
            routes: [{ name: 'LoginPage' }],
        });
    }

}