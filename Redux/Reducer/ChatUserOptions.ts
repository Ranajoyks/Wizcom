import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Chat } from '../../Entity/Chat'
import { ChatUser } from '../../Entity/ChatUser'
import { Group } from '../../Entity/Group'
import UIHelper from '../../Core/UIHelper'
import { GroupChat } from '../../Entity/GroupChat'



export interface ChatUserOptionsState {
    IsPageLoading: boolean,
    AllUserList: ChatUser[],
    AllGroupList: Group[],
    FilterUserList: ChatUser[],
    FilterGroupList: Group[],
    SearchText?: string,
    OnSearch?: (SearchText: string) => void,

}

const initialState: ChatUserOptionsState = {
    IsPageLoading: false,
    AllUserList: [],
    FilterUserList: [],
    AllGroupList: [],
    FilterGroupList: []
}


const CreateGroupNameFromdate = (date: Date) => {
    return UIHelper.OnetoTwoDigitString(date.getDate()) +
        "-" + UIHelper.OnetoTwoDigitString(date.getMonth() + 1) +
        "-" + date.getFullYear()
}

const ChatUserOptions = createSlice({
    name: 'ChatUserOptions',
    initialState,
    reducers: {
        UpdateAllUserList: (state, action: PayloadAction<ChatUser[]>) => {
            action.payload.forEach(newUser => {
                var oldUserIndex = state.AllUserList.findIndex(i => i.lId == newUser.lId)
                if (oldUserIndex == -1) {
                    state.AllUserList.push(newUser)
                    return
                }

                var oldUser = state.AllUserList[oldUserIndex]

                var AllChatOneToOneList = oldUser.AllChatOneToOneList


                newUser = Object.assign(oldUser, newUser)

                newUser.AllChatOneToOneList = AllChatOneToOneList

                state.AllUserList[oldUserIndex] = newUser
            });
        },
        UpdateFilterUserList: (state, action: PayloadAction<ChatUser[]>) => {
            if (action.payload.length) {
                state.FilterUserList = action.payload
            }
        },
        LoadUserOneToOneChatList: (state, action: PayloadAction<{
            messageList: Chat[], SecondUserId: number
        }>) => {
            var userIndex = state.AllUserList.findIndex(i => i.lId == action.payload.SecondUserId)!
            var user = state.AllUserList[userIndex]

            if (!user) {
                console.error("User not found, this should nor happen", action.payload.SecondUserId)
                return
            }

            if (!user.AllChatOneToOneList) {
                user.AllChatOneToOneList = []
            }

            var payLoadMessageList = [...action.payload.messageList] ?? []

            var sortedIncomingMessageList = payLoadMessageList.sort((a, b) => {
                return b.lSrId - a.lSrId
            })

            var newNoProxySortedMessageList: Chat[] = user?.AllChatOneToOneList.filter(i => !i.IsKsProxy)
            var todayGroupName = CreateGroupNameFromdate(new Date())

            sortedIncomingMessageList.forEach(newMwssage => {
                var newMessageIndex = newNoProxySortedMessageList.findIndex(i => i.lSrId == newMwssage.lSrId)

                if (newMessageIndex == -1) {
                    var dt = new Date(newMwssage.dtMsg)
                    var newGroup = CreateGroupNameFromdate(dt)

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


        },
        AddNewOneToOneChat: (state, action: PayloadAction<Chat>) => {
            var userIndex = state.AllUserList.findIndex(i => i.lId == action.payload.lReceiverId
                || i.lId == action.payload.lSenderId)
            var user = state.AllUserList[userIndex]

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

        UpdateAllGroupList: (state, action: PayloadAction<Group[]>) => {
            action.payload.forEach(newGroup => {
                var oldGroupIndex = state.AllGroupList.findIndex(i => i.groupId == newGroup.groupId)
                if (oldGroupIndex == -1) {
                    state.AllGroupList.push(newGroup)
                    return
                }

                var oldGroup = state.AllGroupList[oldGroupIndex]

                var AllChatOneToOneList = oldGroup.AllGroupMsgList


                newGroup = Object.assign(oldGroup, newGroup)

                newGroup.AllGroupMsgList = AllChatOneToOneList

                state.AllGroupList[oldGroupIndex] = newGroup
            });
        },
        UpdateFilterGroupList: (state, action: PayloadAction<Group[]>) => {
            state.FilterGroupList = action.payload
        },
        LoadGroupOneToOneChatList: (state, action: PayloadAction<{
            messageList: GroupChat[], GroupId: number
        }>) => {
            var GroupIndex = state.AllGroupList.findIndex(i => i.groupId == action.payload.GroupId)!
            var Group = state.AllGroupList[GroupIndex]

            if (!Group) {
                console.error("Group not found, this should nor happen", action.payload.GroupId)
                return
            }

            if (!Group.AllGroupMsgList) {
                Group.AllGroupMsgList = []
            }

            var payLoadMessageList = [...action.payload.messageList] ?? []

            var sortedIncomingMessageList = payLoadMessageList.sort((a, b) => {
                return b.lSrId - a.lSrId
            })

            var newNoProxySortedMessageList: GroupChat[] = Group?.AllGroupMsgList.filter(i => !i.IsKsProxy)
            var todayGroupName = CreateGroupNameFromdate(new Date())

            sortedIncomingMessageList.forEach(newMwssage => {
                var newMessageIndex = newNoProxySortedMessageList.findIndex(i => i.lSrId == newMwssage.lSrId)

                if (newMessageIndex == -1) {
                    var dt = new Date(newMwssage.dtMsg)
                    var newGroup = CreateGroupNameFromdate(dt)

                    newMwssage.DayDisplayGroupName = newGroup == todayGroupName ? "Today" : newGroup
                    newNoProxySortedMessageList.unshift(newMwssage)
                }
            });

            newNoProxySortedMessageList = newNoProxySortedMessageList.sort((a, b) => {
                return b.lSrId - a.lSrId
            })


            var uniqueMessagaeList: GroupChat[] = []
            newNoProxySortedMessageList.forEach((item) => {
                var existItemIndex = uniqueMessagaeList.findIndex(i => i.lSrId == item.lSrId);
                if (existItemIndex != -1) {
                    return
                }

                //Fixing group name
                var previosMessageWithSameGroupIndex = uniqueMessagaeList.findIndex(i => i.DayDisplayGroupName == item.DayDisplayGroupName);
                if (previosMessageWithSameGroupIndex != -1) {
                    var OldGroupNameMessage = uniqueMessagaeList[previosMessageWithSameGroupIndex]
                    OldGroupNameMessage.DayDisplayGroupName = ""
                    uniqueMessagaeList[previosMessageWithSameGroupIndex] = OldGroupNameMessage
                }

                uniqueMessagaeList.unshift(item)
            })


            Group.sMessgeList = []
            Group.AllGroupMsgList = uniqueMessagaeList

            state.AllGroupList[GroupIndex] = Group


        },
        AddNewGroupChat: (state, action: PayloadAction<GroupChat>) => {

            var GroupIndex = state.AllGroupList.findIndex(i => i.groupId == action.payload.groupId)
            var Group = state.AllGroupList[GroupIndex]

            if (!Group.AllGroupMsgList?.length) {
                Group.AllGroupMsgList = []
            }

            Group.AllGroupMsgList.push(action.payload)
            state.AllGroupList[GroupIndex] = Group
        },
        UpdateGroupChat: (state, action: PayloadAction<GroupChat>) => {

            var GroupIndex = state.AllGroupList.findIndex(i => i.groupId == action.payload.groupId)
            var Group = state.AllGroupList[GroupIndex]
            var chatIndex = Group.AllGroupMsgList?.findIndex(i => i.lSrId == action.payload.lSrId)!

            state.AllGroupList[GroupIndex].AllGroupMsgList![chatIndex] = action.payload
        },

    }
})

export default ChatUserOptions;