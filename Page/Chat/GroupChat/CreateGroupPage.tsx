import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';

import {ColorCode, styles} from '../../MainStyle';
import {useNavigation} from '@react-navigation/native';
import {NavigationProps} from '../../../Core/BaseProps';
import {Avatar, Checkbox, List} from 'react-native-paper';
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
import {CreateGroupMember} from '../../../Entity/CreateGroupMember';
import OneToOneChatOptions from '../../../Redux/Reducer/OneToOneChatOptions';

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
        <View style={{padding: 10}}>
          <View
            style={{
              backgroundColor: '#F1F1F1',
              // paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 6,
              flexDirection: 'row',
            }}>
            <TextInput
              onChangeText={text => {}}
              style={
                (styles.input,
                {
                  width: Dimensions.get('window').width - 100,
                  fontFamily: 'OpenSans-Regular',
                })
              }
              placeholder="Enter group name"></TextInput>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                //paddingRight: 5,
              }}>
              <TouchableOpacity onPress={CreateGroup}>
                <Text style={{fontSize: 16, fontWeight: 'bold'}}>Create</Text>
              </TouchableOpacity>
            </View>
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
  const UserIndex = users.findIndex(i => i.lId == props.data.lId);
  const navigate = useNavigation<NavigationProps>();
  const [checked, setChecked] = React.useState(false);
  const [CreateGroupMember, setCreateGroupMember] = React.useState<
    CreateGroupMember[]
  >([]);
  const dispatch = useAppDispatch();
  const ChangeCheckboxValue = async (User: ChatUser, UserID: string) => {
    var CompanyId = await SessionHelper.GetCompanyID();

    console.log('UserID: ', UserID);
    var Members = {
      memberId: CompanyId + '_' + UserID,
    };
    var Checking = CreateGroupMember.find(
      i => i.memberId == CompanyId + '_' + UserID,
    );
    console.log('Checking: ', Checking);

    if (!Checking) {
      users[UserIndex].isSelected = true;
      dispatch(OneToOneChatOptions.actions.UpdateAllUserList(users));
      console.log('NotcheckingHICreateGroupMember',  users[UserIndex]);

      setCreateGroupMember([...CreateGroupMember, Members]);
    }
    if (Checking) {
      setCreateGroupMember(
        CreateGroupMember.filter(i => i.memberId != CompanyId + '_' + UserID),
      );
    }
    console.log('CreateGroupMember:', CreateGroupMember);
  };

  return (
    <List.Item
      style={{marginLeft: 5, paddingTop: 0, paddingBottom: 0, marginBottom: 10}}
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
      right={props => (
        <Checkbox
          status={checked ? 'checked' : 'unchecked'}
          color="green"
          onPress={() => {
            setChecked(!checked);
            ChangeCheckboxValue(User!, User!.lId.toString());
          }}
        />
      )}
    />
  );
};

export default CreateGroup;
