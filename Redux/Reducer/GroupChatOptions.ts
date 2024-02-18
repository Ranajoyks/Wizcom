import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Group } from '../../Entity/Group'
import { GroupChat } from '../../Entity/GroupChat'
import UIHelper from '../../Core/UIHelper'


export interface GroupChatOptionsState {
    AllGroupList: Group[],
    FilterGroupList: Group[],
}

const initialState: GroupChatOptionsState = {


    AllGroupList: [],
    FilterGroupList: [],

}




const GroupChatOptions = createSlice({
    name: 'GroupChatOptions',
    initialState,
    reducers: {


        UpdateAllGroupList: (state, action: PayloadAction<Group[]>) => {
            var currentGroupList = state.AllGroupList

            action.payload.forEach(newGroup => {
                var oldGroupIndex = currentGroupList.findIndex(i => i.groupId == newGroup.groupId)
                if (oldGroupIndex == -1) {
                    currentGroupList.push(newGroup)
                    return
                }

                var oldGroup = currentGroupList[oldGroupIndex]

                var AllChatOneToOneList = oldGroup.AllGroupMsgList


                newGroup = Object.assign(oldGroup, newGroup)

                newGroup.AllGroupMsgList = AllChatOneToOneList

                currentGroupList[oldGroupIndex] = newGroup
            });

            state.AllGroupList = currentGroupList
        },
        UpdateFilterGroupList: (state, action: PayloadAction<Group[]>) => {
            state.FilterGroupList = action.payload
        },
        LoadGroupOneToOneChatList: (state, action: PayloadAction<{
            messageList: GroupChat[], GroupId: number
        }>) => {

            var currentGroupList = state.AllGroupList

            var GroupIndex = currentGroupList.findIndex(i => i.groupId == action.payload.GroupId)!
            var Group = currentGroupList[GroupIndex]

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
            var todayGroupName = UIHelper.CreateGroupNameFromdate(new Date())

            sortedIncomingMessageList.forEach(newMwssage => {
                var newMessageIndex = newNoProxySortedMessageList.findIndex(i => i.lSrId == newMwssage.lSrId)

                if (newMessageIndex == -1) {
                    var dt = new Date(newMwssage.dtMsg)
                    var newGroup = UIHelper.CreateGroupNameFromdate(dt)

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

                uniqueMessagaeList.push(item)
            })


            Group.sMessgeList = []
            Group.AllGroupMsgList = uniqueMessagaeList

            state.AllGroupList[GroupIndex] = Group


        },
        AddNewGroupChat: (state, action: PayloadAction<GroupChat>) => {

            var currentGroupList = state.AllGroupList

            var GroupIndex = currentGroupList.findIndex(i => i.groupId == action.payload.groupId)
            var Group = currentGroupList[GroupIndex]

            if (!Group.AllGroupMsgList?.length) {
                Group.AllGroupMsgList = []
            }

            Group.AllGroupMsgList.unshift(action.payload)
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

export default GroupChatOptions;