import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { ChatUser } from '../../Entity/ChatUser'
import UIHelper from '../../Core/UIHelper'
import { Chat } from '../../Entity/Chat'
import MHeaderOptions from './MHeaderOptions'



export interface OneToOneChatOptionsState {
    AllUserList: ChatUser[],
    FilterUserList: ChatUser[],
}

const initialState: OneToOneChatOptionsState = {
    AllUserList: [],
    FilterUserList: [],
}


const OneToOneChatOptions = createSlice({
    name: 'OneToOneChatOptions',
    initialState,
    reducers: {
        UpdateAllUserList: (state, action: PayloadAction<ChatUser[]>) => {

            var currentUserList = state.AllUserList
            action.payload.forEach(newUser => {
                var oldUserIndex = currentUserList.findIndex(i => i.lId == newUser.lId)
                if (oldUserIndex == -1) {
                    currentUserList.push(newUser)
                    return
                }

                var oldUser = currentUserList[oldUserIndex]

                var AllChatOneToOneList = oldUser.AllChatOneToOneList


                newUser = Object.assign(oldUser, newUser)

                newUser.AllChatOneToOneList = AllChatOneToOneList
            });

            state.AllUserList = currentUserList

            //If no data 
            if (!state.FilterUserList.length) {
                state.FilterUserList = state.AllUserList
            }

            //When no search string 
            if (state.FilterUserList.length == state.AllUserList.length) {
                state.FilterUserList = state.AllUserList
            }

            if (state.FilterUserList.length && state.FilterUserList.length != state.AllUserList.length) {
                var allFilteredUser = state.FilterUserList
                allFilteredUser.forEach((item, itemIndex) => {
                    allFilteredUser[itemIndex] = currentUserList.find(i => i.lId == item.lId)!
                })
                state.FilterUserList = allFilteredUser
            }
        },
        LoadUserOneToOneChatList: (state, action: PayloadAction<ChatUser[]>) => {
            console.log("payloadUser.sMessgeList", action.payload)
            action.payload.forEach(payloadUser => {


                var secondUserId = payloadUser.lId

                var userIndex = state.AllUserList.findIndex(i => i.lId == secondUserId)!
                var user = state.AllUserList[userIndex]

                if (!user) {
                    console.error("User not found, this should nor happen", secondUserId)
                    return
                }


                if (!user.AllChatOneToOneList) {
                    user.AllChatOneToOneList = []
                }

                //below one is required as sMessgeList is readonly here
                var nonReadonlyList = [...payloadUser.sMessgeList ?? []]
                var sortedIncomingMessageList = nonReadonlyList.sort((a, b) => {
                    return b.lSrId - a.lSrId
                })

                console.log("sortedIncomingMessageList", sortedIncomingMessageList.length)

                var newNoProxySortedMessageList: Chat[] = user?.AllChatOneToOneList.filter(i => !i.IsKsProxy)
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


                user.sMessgeList = []
                user.AllChatOneToOneList = uniqueMessagaeList

                state.AllUserList[userIndex] = user
            })


            if (!state.FilterUserList.length) {
                state.FilterUserList = state.AllUserList
            }
            else {
                state.FilterUserList.forEach((element, index) => {
                    state.FilterUserList[index] = state.AllUserList.find(i => i.lId == element.lId)!
                });
            }

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
        },
    },
    extraReducers: ((builder) => {
        builder.addCase(MHeaderOptions.actions.UpdateSearchText, (state, action) => {
            var searchText = action.payload
            if (!searchText) {
                state.FilterUserList = state.AllUserList
                return
            }

            state.FilterUserList = state.AllUserList.filter(i => i.userName.toLowerCase().includes(searchText.toLowerCase()))
        });
        builder.addCase(MHeaderOptions.actions.UpdateUserShowMode, (state, action) => {

            if (action.payload == "All User") {
                state.FilterUserList = state.AllUserList
                return
            }

            state.FilterUserList = state.AllUserList.filter(i => i.status)
        });
    })
})

export default OneToOneChatOptions;