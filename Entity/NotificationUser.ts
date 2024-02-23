import { Notification } from "./Notification";

export interface NotificationUser {
    cMsgFlag: string;
    isUserLive: boolean;
    lId: number;
    mCount: number;
    message: string;
    status: boolean;
    userCode: string;
    userFullName: string;
    userName: string;
    sMessgeList?: Notification[],
    AllNotificatonOneToOneList: Notification[],
}