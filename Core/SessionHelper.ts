
import AsyncStorage from "@react-native-async-storage/async-storage";
import User from "../Entity/User";
import { Branch } from "../Entity/Branch";
import { ChatUser } from "../Entity/ChatUser";
import StorageHelper from "./StorageHelper";
import { GroupMember } from "../Entity/Group";
import { CreateGroupMember } from "../Entity/CreateGroupMember";



export type SessionKeys =
    "ChatId"
    | "URL" | "DeviceId"
    | "ReceiverID" | "FCMToken"
    | "lId" | "UserDetails" | "CompanyID"
    | "Branch" | "SessionId" | "ChatDB" |"XYZCreateGroupMember"


export default class SessionHelper extends StorageHelper {

    public static async SetChatId(ChatId: string) {
        await this.setInternal("ChatId", ChatId)
    }
    public static async GetChatId() {
        return await this.getInternal<string>("ChatId")
    }
    public static async SetURL(URL: string) {
        await this.setInternal("URL", URL)
    }
    public static async GetURL() {
        return await this.getInternal<string>("URL")
    }


    public static async SetBranch(Branch: Branch) {
        await this.setInternal("Branch", Branch)
    }
    public static async GetBranch() {
        return await this.getInternal<Branch>("Branch")
    }
    public static async SetDeviceId(DeviceId?: string) {
        await this.setInternal("DeviceId", DeviceId)
    }
    public static async GetDeviceId() {
        return await this.getInternal<string>("DeviceId")
    }
    public static async SetUserDetails(UserDetails: User) {
        await this.setInternal("UserDetails", UserDetails)
    }
    public static async GetUserDetails() {
        return await this.getInternal<User>("UserDetails")
    }

    public static async SetFCMToken(FCMToken: string) {
        await this.setInternal("FCMToken", FCMToken)
    }
    public static async GetFCMToken() {
        return await this.getInternal<string>("FCMToken")
    }
    public static async SetCompanyID(CompanyID: string) {
        await this.setInternal("CompanyID", CompanyID)
    }
    public static async GetCompanyID() {
        return await this.getInternal<string>("CompanyID")
    }

    public static async SetReceiverID(ReceiverID: string) {
        await this.setInternal("ReceiverID", ReceiverID)
    }
    public static async GetReceiverID() {
        return await this.getInternal<string>("ReceiverID")
    }
    public static async SetSessionId(SessionId: string) {
        await this.setInternal("SessionId", SessionId)
    }
    public static async GetSessionId() {
        return await this.getInternal<string>("SessionId")
    }
    public static SetGroupDetailUpdateSession(GroupDetailUpdate: any) {
        AsyncStorage.setItem('GroupDetailUpdate', JSON.stringify(GroupDetailUpdate))
    }
    public static async GetGroupDetailUpdateSession() {
        var item = await AsyncStorage.getItem('GroupDetailUpdate');
        if (!item) {
            return item as unknown as any;
        }
        return JSON.parse(item) as any;
    }
    public static async SetAddGroupMember(CreateGroupMember: CreateGroupMember[]) {
        await this.setInternal("XYZCreateGroupMember", CreateGroupMember=[])
    }
    public static async GetAddGroupMember() {
        return await this.getInternal<CreateGroupMember[]>("XYZCreateGroupMember")
    }


}
