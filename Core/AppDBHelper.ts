import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChatUser } from "../Entity/ChatUser";
import StorageHelper from "./StorageHelper";
import { Group } from "../Entity/Group";
import { NotificationUser } from "../Entity/NotificationUser";

type DbTables = "ChatUser" | "Group" | "NotificationUser"


export default class AppDBHelper extends StorageHelper {

    private static GetKey(TableName: DbTables, CurrentUserId?: string): string {
        return TableName + "_" + CurrentUserId
    }

    public static async SetChatUsers(ChatuUsers: ChatUser[], CurrentUserId: string): Promise<void> {
        return await super.setInternal(this.GetKey("ChatUser", CurrentUserId), ChatuUsers)
    }

    public static async GetChatUsers(CurrentUserId: string): Promise<ChatUser[] | undefined> {
        return await super.getInternal<ChatUser[]>(this.GetKey("ChatUser", CurrentUserId))
    }
    public static async SetGroups(Groups: Group[], GroupId: string): Promise<void> {
        return await super.setInternal(this.GetKey("Group", GroupId), Groups)
    }

    public static async GetGroups(GroupId: string): Promise<Group[] | undefined> {
        return await super.getInternal<Group[]>(this.GetKey("Group", GroupId))
    }
    public static async SetNotificationUsers(ChatuUsers: NotificationUser[], CurrentUserId: string): Promise<void> {
        return await super.setInternal(this.GetKey("NotificationUser", CurrentUserId), ChatuUsers)
    }

    public static async GetNotificationUsers(CurrentUserId: string): Promise<NotificationUser[] | undefined> {
        return await super.getInternal<NotificationUser[]>(this.GetKey("NotificationUser", CurrentUserId))
    }
}