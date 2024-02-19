import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';

import {ColorCode, styles} from '../../MainStyle';
import {useNavigation} from '@react-navigation/native';
import {NavigationProps} from '../../../Core/BaseProps';
import {Avatar, List} from 'react-native-paper';
import {useAppDispatch, useAppSelector} from '../../../Redux/Hooks';

import {EmptyListMessage} from '../../../Control/EmptyListMessage';
import {MDivider} from '../../../Control/MDivider';
import {Group} from '../../../Entity/Group';
import SignalRApi from '../../../DataAccess/SignalRApi';
import ChatUserOptions from '../../../Redux/Reducer/NotificationOptions';
import {ShowToastMessage} from '../../../Redux/Store';
import {ChatUser} from '../../../Entity/ChatUser';
import GroupChatOptions from '../../../Redux/Reducer/GroupChatOptions';
import AppDBHelper from '../../../Core/AppDBHelper';
import SessionHelper from '../../../Core/SessionHelper';

const CreateGroup = () => {
  const dispatch = useAppDispatch();
  const filteredUserList = useAppSelector(
    i => i.OneToOneChatOptions.FilterUserList,
  );
  const pageData = useAppSelector(i => i.PageOptions);

  const [isPageRefreshing, setIsPageRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProps>();

  var FetchMessageInterval: NodeJS.Timeout;
  useEffect(() => {
    InitilizeOnce();
    return () => {
      clearInterval(FetchMessageInterval);
    };
  }, []);

  const GetAllGroups = async () => {
    SignalRApi.GetAllGroup().then(groupListRes => {
      console.log('GroupResponse: ', groupListRes);
      if (groupListRes.IsKSError) {
        ShowToastMessage(groupListRes.ErrorInfo || 'Some issue happening');
        return;
      }

      dispatch(
        GroupChatOptions.actions.UpdateAllGroupList(groupListRes.data || []),
      );
      dispatch(
        GroupChatOptions.actions.LoadGroupOneToOneChatList(
          groupListRes.data || [],
        ),
      );
    });
  };

  const InitilizeOnce = async () => {
    var chatId = await SessionHelper.GetChatId();
    const AllUserList = filteredUserList;
    console.log('CreateGroupPage User List  : ', JSON.stringify(AllUserList));

    AppDBHelper.GetGroups(chatId!).then(res => {
      dispatch(GroupChatOptions.actions.UpdateAllGroupList(res ?? []));
    });
    GetAllGroups();

    FetchMessageInterval = setInterval(() => {
      GetAllGroups();
    }, 1000 * 60);
  };
  console.log(
    'Re render, all CreateGroup page ' + filteredUserList.length + new Date(),
  );
  return (
    <React.Fragment>
      <View style={styles.container}>
        <View style={styles.GroupChatHeader}>
          <TouchableOpacity
            onPress={() => {
              navigation.popToTop();
            }}>
            <Image
              source={require('../../../assets/backimg.png')}
              style={{height: 30, width: 30, marginLeft: 10}}
            />
          </TouchableOpacity>
          <View style={{flex: 1}}>
            <Text style={styles.Grouptitle}>Create Group</Text>
          </View>
        </View>

        <SafeAreaView>
          <View style={{marginTop: 10}}>
            <FlatList
              data={filteredUserList}
              keyExtractor={e => e.lId + ''}
              refreshing={isPageRefreshing}
              renderItem={d => {
                return <ChatUserScreen data={d.item} />;
              }}
              ListEmptyComponent={EmptyListMessage}
            />
          </View>
        </SafeAreaView>
      </View>
    </React.Fragment>
  );
};

const ChatUserScreen = (props: {data: ChatUser}) => {
  const users = useAppSelector(i => i.OneToOneChatOptions.AllUserList);
  const User = users.find(i => i.lId == props.data.lId);
  const navigate = useNavigation<NavigationProps>();
  return (
    <List.Item
      style={{marginLeft: 5, paddingTop: 0, paddingBottom: 0}}
      title={User?.userFullName}
      titleStyle={{fontFamily: 'OpenSans-Regular', fontSize: 15, marginTop: 0}}
      left={props => (
        <View>
          <Avatar.Text
            style={{backgroundColor: ColorCode.DimGray, width: 45, height: 45}}
            labelStyle={{
              color: ColorCode.Black,
              fontSize: 22,
              fontFamily: 'OpenSans-Regular',
              marginTop: -8,
            }}
            label={User?.userFullName?.charAt(0).toUpperCase() ?? ''}
          />
        </View>
      )}
    />
  );
};

export default CreateGroup;
