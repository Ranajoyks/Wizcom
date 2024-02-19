import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import UIHelper from '../../Core/UIHelper'
import { NotificationUser } from '../../Entity/NotificationUser'
import { Notification } from '../../Entity/Notification'
import { ChatUser } from '../../Entity/ChatUser'
import MHeaderOptions from './MHeaderOptions'



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

            var currentUserList = state.AllUserNotificationList
            action.payload.forEach(newUser => {
                var oldUserIndex = currentUserList.findIndex(i => i.lId == newUser.lId)
                if (oldUserIndex == -1) {
                    currentUserList.push(newUser)
                    return
                }

                var oldUser = currentUserList[oldUserIndex]

                var AllChatOneToOneList = oldUser.AllNotificatonOneToOneList

                newUser = Object.assign(oldUser, newUser)

                newUser.AllNotificatonOneToOneList = AllChatOneToOneList
            });

            state.AllUserNotificationList = currentUserList

            //If no data 
            if (!state.FilterUserNotificationList.length) {
                state.FilterUserNotificationList = state.AllUserNotificationList
            }

            //When no search string 
            if (state.FilterUserNotificationList.length == state.AllUserNotificationList.length) {
                state.FilterUserNotificationList = state.AllUserNotificationList
            }

            if (state.FilterUserNotificationList.length && state.FilterUserNotificationList.length != state.AllUserNotificationList.length) {
                var allFilteredUser = state.FilterUserNotificationList
                allFilteredUser.forEach((item, itemIndex) => {
                    allFilteredUser[itemIndex] = currentUserList.find(i => i.lId == item.lId)!
                })
                state.FilterUserNotificationList = allFilteredUser
            }

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

    },
    extraReducers: ((builder) => {
        builder.addCase(MHeaderOptions.actions.UpdateSearchText, (state, action) => {
            var searchText = action.payload
            if (!searchText) {
                state.FilterUserNotificationList = state.AllUserNotificationList
                return
            }

            state.FilterUserNotificationList = state.AllUserNotificationList.filter(i => i.userName.toLowerCase().includes(searchText.toLowerCase()))
        });
        builder.addCase(MHeaderOptions.actions.UpdateUserShowMode, (state, action) => {

            if (action.payload == "All User") {
                state.FilterUserNotificationList = state.AllUserNotificationList
                return
            }

            state.FilterUserNotificationList = state.AllUserNotificationList.filter(i => i.status)
        });
    })
})

export default NotificationOptions;