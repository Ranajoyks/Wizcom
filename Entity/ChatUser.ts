import { Chat } from "./Chat";
import { GroupChat } from "./GroupChat";

export interface ChatUser {
    cMsgFlag: string;
    isUserLive: boolean;
    lId: number;
    mCount: number;
    message: string;
    status: boolean;
    userCode: string;
    userFullName: string;
    userName: string;
    sMessgeList?: Chat[],

    AllChatOneToOneList?: Chat[],
}