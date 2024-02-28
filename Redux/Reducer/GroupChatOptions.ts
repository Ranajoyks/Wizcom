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
      var currentGroupList = state.AllGroupList;
      action.payload.forEach(newUser => {
        var oldUserIndex = currentGroupList.findIndex(
          i => i.groupId == newUser.groupId,
        );
        if (oldUserIndex == -1) {
          currentGroupList.push(newUser);
          return;
        }

        var oldUser = currentGroupList[oldUserIndex];

        var AllChatOneToOneList = oldUser.AllGroupMsgList;

        newUser = Object.assign(oldUser, newUser);

        newUser.AllGroupMsgList = AllChatOneToOneList;
      });

      state.AllGroupList = currentGroupList;
      // console.log('currentGroupList: ', JSON.stringify(currentGroupList));

      //If no data
      if (!state.FilterGroupList.length) {
        state.FilterGroupList = state.AllGroupList;
        //console.log('If no data: ');
      }

      //When no search string
      if (state.FilterGroupList.length == state.AllGroupList.length) {
        state.FilterGroupList = state.AllGroupList;
        //console.log('/When no search string');
      }

      if (
        state.FilterGroupList.length &&
        state.FilterGroupList.length != state.AllGroupList.length
      ) {
        var allFilteredUser = state.AllGroupList;
        allFilteredUser.forEach((item, itemIndex) => {
          allFilteredUser[itemIndex] = currentGroupList.find(
            i => i.groupId == item.groupId,
          )!;
        });
        state.FilterGroupList = allFilteredUser;

        // console.log('allFilteredUser: ', allFilteredUser);
      }
    },
    LoadGroupOneToOneChatList: (state, action: PayloadAction<Group[]>) => {
      // console.log(
      //   'LoadGroupOneToOneChatListAction: ',
      //   JSON.stringify(action.payload[0].sMessgeList),
      // );

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
          // state.AllGroupList[GroupIndex].AllGroupMsgList=newNoProxySortedMessageList;
        var todayGroupName = UIHelper.CreateGroupNameFromdate(new Date());
        // console.log("newNoProxySortedMessageList: ",newNoProxySortedMessageList);
        

        sortedIncomingMessageList.forEach(newMwssage => {
          var newMessageIndex = newNoProxySortedMessageList.findIndex(
            i => i.lSrId == newMwssage.lSrId,
          );

          if (newMessageIndex == -1) {
            var dt = new Date(newMwssage.dtMsg);
            var newGroup = UIHelper.CreateGroupNameFromdate(dt);

            newMwssage.DayDisplayGroupName =
              newGroup == todayGroupName ? 'Today' : newGroup;
            newNoProxySortedMessageList.push(newMwssage);
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

        state.AllGroupList[GroupIndex].lastMessage=Group.AllGroupMsgList[0].sMsg
        
        // console.log(
        //   ' state.AllGroupList[GroupIndex]: ',
        //   JSON.stringify(state.AllGroupList[GroupIndex]),
        // );
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
        i => i.groupId == action.payload.groupId,
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
        i => i.groupId == action.payload.groupId,
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
        state.groupdetails.members = state.groupdetails.members.filter(
          j => j.memberId != i.memberId,
        );
      });
    },
    DeleteGroupUpdateList: (state, action: PayloadAction<Group[]>) => {
      state.AllGroupList = action.payload;
      state.FilterGroupList = action.payload;
    },
    CrateGroupUpdateLIst: (state, action: PayloadAction<Group>) => {
      state.AllGroupList.push(action.payload);
      state.FilterGroupList.push(action.payload);
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
