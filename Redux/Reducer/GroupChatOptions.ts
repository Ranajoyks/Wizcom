import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Group } from '../../Entity/Group'
import { GroupChat } from '../../Entity/GroupChat'
import UIHelper from '../../Core/UIHelper'
import MHeaderOptions from './MHeaderOptions'


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
            if (!state.FilterGroupList.length) {
                state.FilterGroupList = state.AllGroupList
            }

            //When no search string 
            if (state.FilterGroupList.length == state.AllGroupList.length) {
                state.FilterGroupList = state.AllGroupList
            }

            if (state.FilterGroupList.length && state.FilterGroupList.length != state.AllGroupList.length) {
                var allFilteredUser = state.FilterGroupList
                allFilteredUser.forEach((item, itemIndex) => {
                    allFilteredUser[itemIndex] = currentGroupList.find(i => i.groupId == item.groupId)!
                })
                state.FilterGroupList = allFilteredUser
            }
        },
        UpdateFilterGroupList: (state, action: PayloadAction<Group[]>) => {
            state.FilterGroupList = action.payload
        },
        LoadGroupOneToOneChatList: (state, action: PayloadAction<Group[]>) => {

            action.payload.forEach(payloadUser => {


                var GroupID = payloadUser.groupId

                var userIndex = state.AllGroupList.findIndex(i => i.groupId == GroupID)!
                var user = state.AllGroupList[userIndex]

                if (!user) {
                    console.error("User not found, this should nor happen", GroupID)
                    return
                }


                if (!user.AllGroupMsgList) {
                    user.AllGroupMsgList = []
                }

                //below one is required as sMessgeList is readonly here
                var nonReadonlyList = [...payloadUser.sMessgeList ?? []]
                var sortedIncomingMessageList = nonReadonlyList.sort((a, b) => {
                    return b.lSrId - a.lSrId
                })



                var newNoProxySortedMessageList: GroupChat[] = user?.AllGroupMsgList.filter(i => !i.IsKsProxy)
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


                user.sMessgeList = []
                user.AllGroupMsgList = uniqueMessagaeList

                state.AllGroupList[userIndex] = user
            })


            if (!state.FilterGroupList.length) {
                state.FilterGroupList = state.AllGroupList
            }
            else {
                state.FilterGroupList.forEach((element, index) => {
                    state.FilterGroupList[index] = state.AllGroupList.find(i => i.groupId == element.groupId)!
                });
            }

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
    },
    extraReducers: ((builder) => {
        builder.addCase(MHeaderOptions.actions.UpdateSearchText, (state, action) => {
            var searchText = action.payload
            if (!searchText) {
                state.FilterGroupList = state.AllGroupList
                return
            }

            state.FilterGroupList = state.AllGroupList.filter(i => i.groupName.toLowerCase().includes(searchText.toLowerCase()))
        });
        builder.addCase(MHeaderOptions.actions.UpdateUserShowMode, (state, action) => {

            if (action.payload == "All User") {
                state.FilterGroupList = state.AllGroupList
                return
            }

            state.FilterGroupList = state.AllGroupList.filter(i => i.groupId)
        });
    })
})

export default GroupChatOptions;