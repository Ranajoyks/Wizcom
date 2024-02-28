import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';

import UIHelper from '../../Core/UIHelper';
import {NotificationUser} from '../../Entity/NotificationUser';
import {Notification} from '../../Entity/Notification';
import MHeaderOptions from './MHeaderOptions';
import {RootState} from '../Store';

export interface NotificationOptionsState {
  AllUserNotificationList: NotificationUser[];
}

const initialState: NotificationOptionsState = {
  AllUserNotificationList: [],
};

const NotificationOptions = createSlice({
  name: 'NotificationOptions',
  initialState,
  reducers: {
    UpdateAllUserNotificationListAndMessage: (
      state,
      action: PayloadAction<NotificationUser[]>,
    ) => {
      // console.log("UpdateAllUserNotificationListAndMessage: ",JSON.stringify(action.payload));

      action.payload.forEach(payloadUser => {
        var oldUserIndex = state.AllUserNotificationList.findIndex(
          i => i.lId == payloadUser.lId,
        );
        if (oldUserIndex == -1) {
          payloadUser.AllNotificatonOneToOneList = [];
          state.AllUserNotificationList.push(payloadUser);
          return;
        }

        var oldUser = state.AllUserNotificationList[oldUserIndex];
        var AllNotificatonOneToOneList = oldUser.AllNotificatonOneToOneList;

        var newUser = Object.assign(oldUser, payloadUser);

        newUser.AllNotificatonOneToOneList = AllNotificatonOneToOneList;

        //below one is required as sMessgeList is readonly here
        var nonReadonlyList = [...(payloadUser.sMessgeList ?? [])];
        var sortedIncomingMessageList = nonReadonlyList.sort((a, b) => {
          return b.lSrId - a.lSrId;
        });

        var newNoProxySortedMessageList: Notification[] =
          newUser.AllNotificatonOneToOneList.filter(i => !i.IsKsProxy);
        var todayGroupName = UIHelper.CreateGroupNameFromdate(new Date());

        sortedIncomingMessageList.forEach(newMwssage => {
          var newMessageIndex = newNoProxySortedMessageList.findIndex(
            i => i.lSrId == newMwssage.lSrId,
          );

          if (newMessageIndex == -1) {
            var dt = new Date(newMwssage.dtMsg);
            var newGroup = UIHelper.CreateGroupNameFromdate(dt);

            newMwssage.GroupName =
              newGroup == todayGroupName ? 'Today' : newGroup;
            newNoProxySortedMessageList.unshift(newMwssage);
          }
        });

        newNoProxySortedMessageList = newNoProxySortedMessageList.sort(
          (a, b) => {
            return b.lSrId - a.lSrId;
          },
        );

        var uniqueMessagaeList: Notification[] = [];
        newNoProxySortedMessageList.forEach(item => {
          var existItemIndex = uniqueMessagaeList.findIndex(
            i => i.lSrId == item.lSrId,
          );
          if (existItemIndex != -1) {
            return;
          }

          //Fixing group name
          var previosMessageWithSameGroupIndex = uniqueMessagaeList.findIndex(
            i => i.GroupName == item.GroupName,
          );
          if (previosMessageWithSameGroupIndex != -1) {
            var OldGroupNameMessage =
              uniqueMessagaeList[previosMessageWithSameGroupIndex];
            OldGroupNameMessage.GroupName = '';
            uniqueMessagaeList[previosMessageWithSameGroupIndex] =
              OldGroupNameMessage;
          }

          uniqueMessagaeList.push(item);
        });

        newUser.sMessgeList = [];
        newUser.AllNotificatonOneToOneList = uniqueMessagaeList;

        state.AllUserNotificationList[oldUserIndex] = newUser;
      });
    },
    LoadUserOneToOneNotificationChatList: (
      state,
      action: PayloadAction<NotificationUser[]>,
    ) => {
      action.payload.forEach(payloadUser => {
        var secondUserId = payloadUser.lId;

        var userIndex = state.AllUserNotificationList.findIndex(
          i => i.lId == secondUserId,
        )!;
        var user = state.AllUserNotificationList[userIndex];

        if (!user) {
          console.error('User not found, this should nor happen', payloadUser);
          return;
        }

        if (!user.AllNotificatonOneToOneList) {
          user.AllNotificatonOneToOneList = [];
        }

        var payLoadMessageList = [...(payloadUser.sMessgeList ?? [])];

        var sortedIncomingMessageList = payLoadMessageList.sort((a, b) => {
          return b.lSrId - a.lSrId;
        });

        var newNoProxySortedMessageList: Notification[] =
          user?.AllNotificatonOneToOneList.filter(i => !i.IsKsProxy);
        var todayGroupName = UIHelper.CreateGroupNameFromdate(new Date());

        sortedIncomingMessageList.forEach(newMwssage => {
          var newMessageIndex = newNoProxySortedMessageList.findIndex(
            i => i.lSrId == newMwssage.lSrId,
          );

          if (newMessageIndex == -1) {
            var dt = new Date(newMwssage.dtMsg);
            var newGroup = UIHelper.CreateGroupNameFromdate(dt);

            newMwssage.GroupName =
              newGroup == todayGroupName ? 'Today' : newGroup;
            newNoProxySortedMessageList.unshift(newMwssage);
          }
        });

        newNoProxySortedMessageList = newNoProxySortedMessageList.sort(
          (a, b) => {
            return b.lSrId - a.lSrId;
          },
        );

        var uniqueMessagaeList: Notification[] = [];
        newNoProxySortedMessageList.forEach(item => {
          var existItemIndex = uniqueMessagaeList.findIndex(
            i => i.lSrId == item.lSrId,
          );
          if (existItemIndex != -1) {
            return;
          }

          //Fixing group name
          var previosMessageWithSameGroupIndex = uniqueMessagaeList.findIndex(
            i => i.GroupName == item.GroupName,
          );
          if (previosMessageWithSameGroupIndex != -1) {
            var OldGroupNameMessage =
              uniqueMessagaeList[previosMessageWithSameGroupIndex];
            OldGroupNameMessage.GroupName = '';
            uniqueMessagaeList[previosMessageWithSameGroupIndex] =
              OldGroupNameMessage;
          }

          uniqueMessagaeList.push(item);
        });

        user.sMessgeList = [];
        user.AllNotificatonOneToOneList = uniqueMessagaeList;

        state.AllUserNotificationList[userIndex] = user;
      });
    },
    AddNewOneToOneNotificationChat: (
      state,
      action: PayloadAction<Notification>,
    ) => {
      var currentUserList = state.AllUserNotificationList;

      var userIndex = currentUserList.findIndex(
        i =>
          i.lId == action.payload.lReceiverId ||
          i.lId == action.payload.lSenderId,
      );
      var user = currentUserList[userIndex];

      if (!user.AllNotificatonOneToOneList?.length) {
        user.AllNotificatonOneToOneList = [];
      }

      user.AllNotificatonOneToOneList.unshift(action.payload);
      state.AllUserNotificationList[userIndex] = user;
    },
    UpdateOneToOneNotificationChat: (
      state,
      action: PayloadAction<Notification>,
    ) => {
      var userIndex = state.AllUserNotificationList.findIndex(
        i =>
          i.lId == action.payload.lReceiverId ||
          i.lId == action.payload.lSenderId,
      );
      var user = state.AllUserNotificationList[userIndex];
      var chatIndex = user.AllNotificatonOneToOneList?.findIndex(
        i => i.lSrId == action.payload.lSrId,
      )!;

      state.AllUserNotificationList[userIndex].AllNotificatonOneToOneList![
        chatIndex
      ] = action.payload;
    },
  },
  // extraReducers: ((builder) => {
  //     builder.addCase(MHeaderOptions.actions.UpdateSearchText, (state, action) => {
  //         var searchText = action.payload
  //         if (!searchText) {
  //             state.FilterUserNotificationList = state.AllUserNotificationList
  //             return
  //         }

  //         state.FilterUserNotificationList = state.AllUserNotificationList.filter(i => i.userName.toLowerCase().includes(searchText.toLowerCase()))
  //     });
  //     builder.addCase(MHeaderOptions.actions.UpdateUserShowMode, (state, action) => {

  //         if (action.payload == "All User") {
  //             state.FilterUserNotificationList = state.AllUserNotificationList
  //             return
  //         }

  //         state.FilterUserNotificationList = state.AllUserNotificationList.filter(i => i.status)
  //     });
  // })
});
export const GetSavableUserNotificationList = createSelector(
  [(state: RootState) => state.NotificationOptions.AllUserNotificationList],
  AllUserNotificationList => {
    return [...AllUserNotificationList];
  },
);
export const GetFilteredNotificationList = createSelector(
  [
    (state: RootState) => state.NotificationOptions.AllUserNotificationList,
    (state: RootState) => state.MHeaderOptions,
  ],
  (AllUserNotificationList, mheader) => {
    var tempFilteredNotificationList = AllUserNotificationList;

    //If curretly Showing
    if (mheader.UserShowMode == 'Online User') {
      tempFilteredNotificationList = tempFilteredNotificationList.filter(
        i => i.isUserLive,
      );
    }
    if (!mheader.CurrentSearchText) {
      return tempFilteredNotificationList;
    }

    var tempFilteredNotificationList = tempFilteredNotificationList.filter(i =>
      i.userName
        .toLowerCase()
        .includes(mheader.CurrentSearchText.toLowerCase()),
    );

    return tempFilteredNotificationList;
  },
);

export default NotificationOptions;
