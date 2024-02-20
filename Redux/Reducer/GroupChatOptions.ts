import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Group} from '../../Entity/Group';
import {GroupChat} from '../../Entity/GroupChat';
import UIHelper from '../../Core/UIHelper';
import MHeaderOptions from './MHeaderOptions';
import {GroupDetails, Member} from '../../Entity/GroupDetails';

export interface GroupChatOptionsState {
  AllGroupList: Group[];
  FilterGroupList: Group[];
  groupdetails: GroupDetails;
}

const initialState: GroupChatOptionsState = {
  AllGroupList: [],
  FilterGroupList: [],
  groupdetails: {} as GroupDetails,
};

const GroupChatOptions = createSlice({
  name: 'GroupChatOptions',
  initialState,
  reducers: {
    UpdateAllGroupList: (state, action: PayloadAction<Group[]>) => {
      var currentUserList = state.AllGroupList;
      action.payload.forEach(newUser => {
        var oldUserIndex = currentUserList.findIndex(
          i => i.groupId == newUser.groupId,
        );
        if (oldUserIndex == -1) {
          currentUserList.push(newUser);
          return;
        }

        var oldUser = currentUserList[oldUserIndex];

        var AllChatOneToOneList = oldUser.AllGroupMsgList;

        newUser = Object.assign(oldUser, newUser);

        newUser.AllGroupMsgList = AllChatOneToOneList;
      });

      state.AllGroupList = currentUserList;

      //If no data
      if (!state.FilterGroupList.length) {
        state.FilterGroupList = state.AllGroupList;
      }

      //When no search string
      if (state.FilterGroupList.length == state.AllGroupList.length) {
        state.FilterGroupList = state.AllGroupList;
      }

      if (
        state.FilterGroupList.length &&
        state.FilterGroupList.length != state.AllGroupList.length
      ) {
        var allFilteredUser = state.FilterGroupList;
        allFilteredUser.forEach((item, itemIndex) => {
          allFilteredUser[itemIndex] = currentUserList.find(
            i => i.groupId == item.groupId,
          )!;
        });
        state.FilterGroupList = allFilteredUser;
      }
    },
    UpdateFilterGroupList: (state, action: PayloadAction<Group[]>) => {
      state.FilterGroupList = action.payload;
    },
    LoadGroupOneToOneChatList: (state, action: PayloadAction<Group[]>) => {
      //   console.log('ActionPLayLOad: ', action.payload);

      action.payload.forEach(payloadUser => {
        var GroupID = payloadUser.groupId;

        var GroupIndex = state.AllGroupList.findIndex(
          i => i.groupId == GroupID,
        )!;
        var Group = state.AllGroupList[GroupIndex];

        if (!Group) {
          console.error('User not found, this should nor happen', GroupID);
          return;
        }

        if (!Group.AllGroupMsgList) {
          Group.AllGroupMsgList = [];
        }

        //below one is required as sMessgeList is readonly here
        var nonReadonlyList = [...(payloadUser.sMessgeList ?? [])];
        var sortedIncomingMessageList = nonReadonlyList.sort((a, b) => {
          return b.lSrId - a.lSrId;
        });

        var newNoProxySortedMessageList: GroupChat[] =
          Group?.AllGroupMsgList.filter(i => !i.IsKsProxy);
        var todayGroupName = UIHelper.CreateGroupNameFromdate(new Date());

        sortedIncomingMessageList.forEach(newMwssage => {
          var newMessageIndex = newNoProxySortedMessageList.findIndex(
            i => i.lSrId == newMwssage.lSrId,
          );

          if (newMessageIndex == -1) {
            var dt = new Date(newMwssage.dtMsg);
            var newGroup = UIHelper.CreateGroupNameFromdate(dt);

            newMwssage.DayDisplayGroupName =
              newGroup == todayGroupName ? 'Today' : newGroup;
            newNoProxySortedMessageList.unshift(newMwssage);
          }
        });

        newNoProxySortedMessageList = newNoProxySortedMessageList.sort(
          (a, b) => {
            return b.lSrId - a.lSrId;
          },
        );

        var uniqueMessagaeList: GroupChat[] = [];
        newNoProxySortedMessageList.forEach(item => {
          var existItemIndex = uniqueMessagaeList.findIndex(
            i => i.lSrId == item.lSrId,
          );
          if (existItemIndex != -1) {
            return;
          }

          //Fixing group name
          var previosMessageWithSameGroupIndex = uniqueMessagaeList.findIndex(
            i => i.DayDisplayGroupName == item.DayDisplayGroupName,
          );
          if (previosMessageWithSameGroupIndex != -1) {
            var OldGroupNameMessage =
              uniqueMessagaeList[previosMessageWithSameGroupIndex];
            OldGroupNameMessage.DayDisplayGroupName = '';
            uniqueMessagaeList[previosMessageWithSameGroupIndex] =
              OldGroupNameMessage;
          }

          uniqueMessagaeList.push(item);
        });

        Group.sMessgeList = [];
        Group.AllGroupMsgList = uniqueMessagaeList;

        state.AllGroupList[GroupIndex] = Group;
      });

      if (!state.FilterGroupList.length) {
        state.FilterGroupList = state.AllGroupList;
      } else {
        state.FilterGroupList.forEach((element, index) => {
          state.FilterGroupList[index] = state.AllGroupList.find(
            i => i.groupId == element.groupId,
          )!;
        });
      }
    },
    AddNewGroupChat: (state, action: PayloadAction<GroupChat>) => {
      var currentGroupList = state.AllGroupList;

      var GroupIndex = currentGroupList.findIndex(
        i =>
          i.groupId == action.payload.lReceiverId ||
          i.groupId == action.payload.lSenderId,
      );
      var Group = currentGroupList[GroupIndex];

      if (!Group.AllGroupMsgList?.length) {
        Group.AllGroupMsgList = [];
      }

      Group.AllGroupMsgList.unshift(action.payload);
      state.AllGroupList[GroupIndex] = Group;
    },
    UpdateGroupChat: (state, action: PayloadAction<GroupChat>) => {
      var userIndex = state.AllGroupList.findIndex(
        i =>
          i.groupId == action.payload.lReceiverId ||
          i.groupId == action.payload.lSenderId,
      );
      var user = state.AllGroupList[userIndex];
      var chatIndex = user.AllGroupMsgList?.findIndex(
        i => i.lSrId == action.payload.lSrId,
      )!;

      state.AllGroupList[userIndex].AllGroupMsgList![chatIndex] =
        action.payload;
    },
    UpdateGroupDetails: (state, action: PayloadAction<GroupDetails>) => {
      state.groupdetails = action.payload;
    },
    AddGroupMember: (state, action: PayloadAction<Member[]>) => {
      action.payload.forEach(i => {
        state.groupdetails.members.push(i);
      });
    },
    DeleteGroupMember: (state, action: PayloadAction<Member[]>) => {
      action.payload.forEach(i => {
        state.groupdetails.members= state.groupdetails.members.filter(j => j.memberId != i.memberId);
      });
    },
    DeleteGroupUpdateList: (state, action: PayloadAction<Group[]>) => {
      state.AllGroupList = action.payload;
      state.FilterGroupList = action.payload;
    },
    CrateGroupUpdateLIst: (state, action: PayloadAction<Group>) => {
      state.AllGroupList.push(action.payload)
      state.FilterGroupList.push(action.payload)
    },
  },
  extraReducers: builder => {
    builder.addCase(
      MHeaderOptions.actions.UpdateSearchText,
      (state, action) => {
        var searchText = action.payload;
        if (!searchText) {
          state.FilterGroupList = state.AllGroupList;
          return;
        }

        state.FilterGroupList = state.AllGroupList.filter(i =>
          i.groupName.toLowerCase().includes(searchText.toLowerCase()),
        );
      },
    );
    builder.addCase(
      MHeaderOptions.actions.UpdateUserShowMode,
      (state, action) => {
        if (action.payload == 'All User') {
          state.FilterGroupList = state.AllGroupList;
          return;
        }

        state.FilterGroupList = state.AllGroupList.filter(i => i.groupId);
      },
    );
  },
});

export default GroupChatOptions;
