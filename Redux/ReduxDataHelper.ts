import SessionHelper from "../Core/SessionHelper";
import SignalRApi from "../DataAccess/SignalRApi";
import { SignalRHubConnection } from "../DataAccess/SignalRHubConnection";
import OneToOneChatOptions from "./Reducer/OneToOneChatOptions";
import { AppDispatch } from "./Store";

export default class ReduxDataHelper {
    public static async UpdateOneToOneChatMessages(dispatch: AppDispatch) {
        var branch = await SessionHelper.GetBranch()
        var tempSenderChatId = await SessionHelper.GetChatId()

        SignalRApi.GetUsersWithMessage(tempSenderChatId!, branch?.lId!).then((cuResponse) => {

            if (!cuResponse.data) {
                console.error("No data inside GetUsersWithMessage ")
                return
            }
            // console.log("UserList: ", JSON.stringify(cuResponse.data.slice(0, 3)));

            dispatch(OneToOneChatOptions.actions.UpdateAllUserListAndMessage(cuResponse.data))
        })
    }

    public static async UpdateOneToOneUserStatus(dispatch: AppDispatch) {
        SignalRHubConnection.GetUserList().then((res) => {
            dispatch(OneToOneChatOptions.actions.UpdateAllUserListAndMessage(res))
        })
    }
}