import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'

import { ChatUser } from '../../Entity/ChatUser'
import UIHelper from '../../Core/UIHelper'
import { Chat } from '../../Entity/Chat'
import { RootState } from '../Store'
import AppDBHelper from '../../Core/AppDBHelper'
import AuthenticationOptions from './AuthenticationOptions'

export interface OneToOneChatOptionsState {
    AllUserList: ChatUser[]
}

const initialState: OneToOneChatOptionsState = {
    AllUserList: []
}

const OneToOneChatOptions = createSlice({
    name: 'OneToOneChatOptions',
    initialState,
    reducers: {
        UpdateAllUserListAndMessage: (state, action: PayloadAction<ChatUser[]>) => {

            action.payload.forEach(payloadUser => {

                var oldUserIndex = state.AllUserList.findIndex(i => i.lId == payloadUser.lId)
                if (oldUserIndex == -1) {
                    payloadUser.AllChatOneToOneList = []
                    state.AllUserList.push(payloadUser)
                    return
                }

                var oldUser = state.AllUserList[oldUserIndex]
                var AllChatOneToOneList = oldUser.AllChatOneToOneList

                var newUser = Object.assign(oldUser, payloadUser)

                newUser.AllChatOneToOneList = AllChatOneToOneList

                //below one is required as sMessgeList is readonly here
                var nonReadonlyList = [...payloadUser.sMessgeList ?? []]
                var sortedIncomingMessageList = nonReadonlyList.sort((a, b) => {
                    return b.lSrId - a.lSrId
                })



                var newNoProxySortedMessageList: Chat[] = newUser.AllChatOneToOneList.filter(i => !i.IsKsProxy)
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


                var uniqueMessagaeList: Chat[] = []
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


                newUser.sMessgeList = []
                newUser.AllChatOneToOneList = uniqueMessagaeList

                state.AllUserList[oldUserIndex] = newUser
            })
        },
        AddNewOneToOneChat: (state, action: PayloadAction<Chat>) => {
            var currentUserList = state.AllUserList

            var userIndex = currentUserList.findIndex(i => i.lId == action.payload.lReceiverId
                || i.lId == action.payload.lSenderId)
            var user = currentUserList[userIndex]

            if (!user.AllChatOneToOneList?.length) {
                user.AllChatOneToOneList = []
            }

            user.AllChatOneToOneList.unshift(action.payload)
            state.AllUserList[userIndex] = user
        },
        UpdateOneToOneChat: (state, action: PayloadAction<Chat>) => {
            var userIndex = state.AllUserList.findIndex(i => i.lId == action.payload.lReceiverId
                || i.lId == action.payload.lSenderId)
            var user = state.AllUserList[userIndex]
            var chatIndex = user.AllChatOneToOneList?.findIndex(i => i.lSrId == action.payload.lSrId)!

            state.AllUserList[userIndex].AllChatOneToOneList![chatIndex] = action.payload
        }
    },
    extraReducers: (builder) => {
        builder.addCase(AuthenticationOptions.actions.LogOut, state => {
            state.AllUserList = [];
        });
    }
})

export const GetSavableUserList = createSelector([
    (state: RootState) => state.OneToOneChatOptions.AllUserList],
    (AllUserList) => {
        return [...AllUserList]
    }
)

export const GetFilteredUserList = createSelector([
    (state: RootState) => state.OneToOneChatOptions.AllUserList,
    (state: RootState) => state.MHeaderOptions],
    (AllUserList, mheader) => {

        var tempFilteredUserList = AllUserList;

        //If curretly Showing
        if (mheader.UserShowMode == "Online User") {
            tempFilteredUserList = tempFilteredUserList.filter(i => i.isUserLive)
        }
        if (!mheader.CurrentSearchText) {
            return tempFilteredUserList
        }

        var tempFilteredUserList = tempFilteredUserList.filter(i => i.userName.toLowerCase().includes(mheader.CurrentSearchText.toLowerCase()))

        return tempFilteredUserList

    }
)

export default OneToOneChatOptions;