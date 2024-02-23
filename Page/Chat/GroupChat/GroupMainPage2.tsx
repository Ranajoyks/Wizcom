import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList } from 'react-native';

import { ColorCode } from '../../MainStyle';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../../../Core/BaseProps';
import { Avatar, List } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../../Redux/Hooks';

import { EmptyListMessage } from '../../../Control/EmptyListMessage';
import { MDivider } from '../../../Control/MDivider';
import { Group } from '../../../Entity/Group';
import SignalRApi from '../../../DataAccess/SignalRApi';
import ChatUserOptions from '../../../Redux/Reducer/NotificationOptions';
import { ShowToastMessage } from '../../../Redux/Store';
import { ChatUser } from '../../../Entity/ChatUser';
import GroupChatOptions from '../../../Redux/Reducer/GroupChatOptions';
import AppDBHelper from '../../../Core/AppDBHelper';
import SessionHelper from '../../../Core/SessionHelper';

const GroupMainPage2 = () => {
  const dispatch = useAppDispatch();
  const filteredGroupList = useAppSelector(
    i => i.GroupChatOptions.FilterGroupList,
  );
  const pageData = useAppSelector(i => i.PageOptions);

  const [isPageRefreshing, setIsPageRefreshing] = useState(false);

  var FetchMessageInterval: NodeJS.Timeout;
  useEffect(() => {
    InitilizeOnce();
    return () => {
      clearInterval(FetchMessageInterval);
    };
  }, []);
  const InitilizeOnce = async () => {
    var chatId = await SessionHelper.GetChatId();

    AppDBHelper.GetGroups(chatId!).then(res => {
      dispatch(GroupChatOptions.actions.UpdateAllGroupList(res ?? []));
      // console.log('GetGroupResponse: ', res);
    });
    GetAllGroups();

    FetchMessageInterval = setInterval(() => {
      GetAllGroups();
    }, 1000 * 60);
  };
  const GetAllGroups = async () => {
    SignalRApi.GetAllGroup().then(groupListRes => {
      console.log('GroupResponse: ', groupListRes.data?.length);
      if (groupListRes.IsKSError) {
        ShowToastMessage(groupListRes.ErrorInfo || 'Some issue happening');
        return;
      }

      dispatch(
        GroupChatOptions.actions.UpdateAllGroupList(groupListRes.data || []),
      );
      // dispatch(
      //   GroupChatOptions.actions.LoadGroupOneToOneChatList(
      //     groupListRes.data || [],
      //   ),
      // );
    });
  };

  console.log(
    'Re render, all GroupChat page ' + filteredGroupList.length + new Date(),
  );
  return (
    <React.Fragment>
      <SafeAreaView>
        <View style={{ marginTop: 10 }}>
          <FlatList
            data={filteredGroupList}
            keyExtractor={e => e.groupId + ''}
            refreshing={isPageRefreshing}
            onRefresh={GetAllGroups}
            renderItem={d => {
              return (
                <ChatGroupScreen
                  data={d.item}
                  OnUserListRefresRequest={GetAllGroups}
                />
              );
            }}
            ListEmptyComponent={EmptyListMessage}
          />
        </View>
      </SafeAreaView>
    </React.Fragment>
  );
};

const ChatGroupScreen = (props: {
  data: Group;
  OnUserListRefresRequest: () => void;
}) => {
  const groups = useAppSelector(i => i.GroupChatOptions.AllGroupList);
  const group = groups.find(i => i.groupId == props.data.groupId);

  var lastMessage = group?.AllGroupMsgList?.length
    ? group.AllGroupMsgList[group.AllGroupMsgList.length - 1]
    : undefined;
  var txtLastMessage = lastMessage?.sMsg ?? group?.lastMessage;
  const navigate = useNavigation<NavigationProps>();
  return (
    <List.Item
      onPress={() => {
        navigate.navigate('GroupChatDetailsPage2', { Group: group! });
      }}
      style={{ marginLeft: 5, paddingTop: 0, paddingBottom: 0 }}
      title={group?.groupName}
      titleStyle={{ fontFamily: 'OpenSans-SemiBold', fontSize: 15, marginTop: 0 }}
      description={() => {
        return (
          <View>
            <Text
              numberOfLines={1}
              style={{
                color: txtLastMessage ? '#0383FA' : '#A6A6A6',
                fontFamily: 'OpenSans-Regular',
                letterSpacing: 0.2,
                fontSize: 12,
                marginTop: 5,
                marginBottom: 9,
              }}>
              {txtLastMessage || 'No message'}
            </Text>
            <View>
              <MDivider></MDivider>
            </View>
          </View>
        );
      }}
      left={props => (
        <View>
          <Avatar.Text
            style={{ backgroundColor: ColorCode.DimGray, width: 45, height: 45 }}
            labelStyle={{
              color: ColorCode.Black,
              fontSize: 22,
              fontFamily: 'OpenSans-Regular',
              marginTop: -8,
            }}
            label={group?.groupName?.charAt(0).toUpperCase() ?? ''}
          />
        </View>
      )}
    />
  );
};

export default GroupMainPage2;
