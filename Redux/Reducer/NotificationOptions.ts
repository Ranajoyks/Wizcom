import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import UIHelper from '../../Core/UIHelper'
import { NotificationUser } from '../../Entity/NotificationUser'
import { Notification } from '../../Entity/Notification'
import { ChatUser } from '../../Entity/ChatUser'



export interface NotificationOptionsState {

    AllUserNotificationList: NotificationUser[],
    FilterUserNotificationList: NotificationUser[],
}

const initialState: NotificationOptionsState = {

    AllUserNotificationList: [],
    FilterUserNotificationList: [],
}




const NotificationOptions = createSlice({
    name: 'NotificationOptions',
    initialState,
    reducers: {

        UpdateAllNotificationUserList: (state, action: PayloadAction<NotificationUser[]>) => {

            action.payload.forEach(newUser => {
                var oldUserIndex = state.AllUserNotificationList.findIndex(i => i.lId == newUser.lId)
                if (oldUserIndex == -1) {
                    state.AllUserNotificationList.push(newUser)
                    return
                }

                var oldUser = state.AllUserNotificationList[oldUserIndex]

                var AllNotificatonOneToOneList = oldUser.AllNotificatonOneToOneList


                newUser = Object.assign(oldUser, newUser)

                newUser.AllNotificatonOneToOneList = AllNotificatonOneToOneList

                state.AllUserNotificationList[oldUserIndex] = newUser
            });

        },

        LoadUserOneToOneNotificationChatList: (state, action: PayloadAction<NotificationUser[]>) => {

            action.payload.forEach(payloadUser => {

                var secondUserId = payloadUser.lId

                var userIndex = state.AllUserNotificationList.findIndex(i => i.lId == secondUserId)!
                var user = state.AllUserNotificationList[userIndex]


                if (!user) {
                    console.error("User not found, this should nor happen", payloadUser)
                    return
                }

                if (!user.AllNotificatonOneToOneList) {
                    user.AllNotificatonOneToOneList = []
                }

                var payLoadMessageList = [...payloadUser.sMessgeList ?? []]

                var sortedIncomingMessageList = payLoadMessageList.sort((a, b) => {
                    return b.lSrId - a.lSrId
                })

                var newNoProxySortedMessageList: Notification[] = user?.AllNotificatonOneToOneList.filter(i => !i.IsKsProxy)
                var todayGroupName = UIHelper.CreateGroupNameFromdate(new Date())

                sortedIncomingMessageList.forEach(newMwssage => {
                    var newMessageIndex = newNoProxySortedMessageList.findIndex(i => i.lSrId == newMwssage.lSrId)

                    if (newMessageIndex == -1) {
                        var dt = new Date(newMwssage.dtMsg)
                        var newGroup = UIHelper.CreateGroupNameFromdate(dt)

                        newMwssage.GroupName = newGroup == todayGroupName ? "Today" : newGroup
                        newNoProxySortedMessageList.unshift(newMwssage)
                    }
                });

                newNoProxySortedMessageList = newNoProxySortedMessageList.sort((a, b) => {
                    return b.lSrId - a.lSrId
                })


                var uniqueMessagaeList: Notification[] = []
                newNoProxySortedMessageList.forEach((item) => {
                    var existItemIndex = uniqueMessagaeList.findIndex(i => i.lSrId == item.lSrId);
                    if (existItemIndex != -1) {
                        return
                    }

                    //Fixing group name
                    var previosMessageWithSameGroupIndex = uniqueMessagaeList.findIndex(i => i.GroupName == item.GroupName);
                    if (previosMessageWithSameGroupIndex != -1) {
                        var OldGroupNameMessage = uniqueMessagaeList[previosMessageWithSameGroupIndex]
                        OldGroupNameMessage.GroupName = ""
                        uniqueMessagaeList[previosMessageWithSameGroupIndex] = OldGroupNameMessage
                    }

                    uniqueMessagaeList.push(item)
                })


                user.sMessgeList = []
                user.AllNotificatonOneToOneList = uniqueMessagaeList

                state.AllUserNotificationList[userIndex] = user
            })

        },
        AddNewOneToOneNotificationChat: (state, action: PayloadAction<Notification>) => {
            var userIndex = state.AllUserNotificationList.findIndex(i => i.lId == action.payload.lReceiverId
                || i.lId == action.payload.lSenderId)
            var user = state.AllUserNotificationList[userIndex]

            if (!user.AllNotificatonOneToOneList?.length) {
                user.AllNotificatonOneToOneList = []
            }

            user.AllNotificatonOneToOneList.unshift(action.payload)
            state.AllUserNotificationList[userIndex] = user
        },
        UpdateOneToOneNotificationChat: (state, action: PayloadAction<Notification>) => {
            var userIndex = state.AllUserNotificationList.findIndex(i => i.lId == action.payload.lReceiverId
                || i.lId == action.payload.lSenderId)
            var user = state.AllUserNotificationList[userIndex]
            var chatIndex = user.AllNotificatonOneToOneList?.findIndex(i => i.lSrId == action.payload.lSrId)!

            state.AllUserNotificationList[userIndex].AllNotificatonOneToOneList![chatIndex] = action.payload
        },

    }
})

export default NotificationOptions;