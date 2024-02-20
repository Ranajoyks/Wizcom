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
import {Group, GroupMember} from '../../../Entity/Group';
import SignalRApi from '../../../DataAccess/SignalRApi';
import ChatUserOptions from '../../../Redux/Reducer/NotificationOptions';
import {ShowPageLoader, ShowToastMessage} from '../../../Redux/Store';
import {ChatUser} from '../../../Entity/ChatUser';
import GroupChatOptions from '../../../Redux/Reducer/GroupChatOptions';
import AppDBHelper from '../../../Core/AppDBHelper';
import SessionHelper from '../../../Core/SessionHelper';
import {CreateGroupMember} from '../../../Entity/CreateGroupMember';
import OneToOneChatOptions from '../../../Redux/Reducer/OneToOneChatOptions';
import UIHelper from '../../../Core/UIHelper';
import {GroupChat} from '../../../Entity/GroupChat';

const CreateGroupPage = (props: any) => {
  const dispatch = useAppDispatch();
  const filteredUserData = useAppSelector(
    i => i.OneToOneChatOptions.AllUserList,
  );
  const pageData = useAppSelector(i => i.PageOptions);

  const [selectedUserList, setSelectedUserList] = useState<ChatUser[]>([]);
  const [groupName, setGroupName] = useState<string>('');
  const navigation = useNavigation<NavigationProps>();

  const HandleCreateGroup = async () => {
    if (!groupName) {
      ShowToastMessage('Please provide a valid group name!!');
      return;
    }

    if (!selectedUserList.length) {
      ShowToastMessage('Please choose atleast 1 user!!');
      return;
    }

    ShowPageLoader(true);
    var CreateGroupResponse = await SignalRApi.CreateGroup(
      groupName,
      selectedUserList,
    );
    ShowPageLoader(false);

    if (!CreateGroupResponse.data) {
      ShowToastMessage(CreateGroupResponse.ErrorInfo || 'Someting wrong');
      return;
    }
    ShowToastMessage(`${groupName}-created successfully`);

    var userDetails = await SessionHelper.GetUserDetails();

    var groupProxy: Group = {
      groupId: UIHelper.GetProxySrId(),
      groupName: groupName,
      members: selectedUserList.map<GroupMember>(i => {
        var newMember: GroupMember = {
          fullName: i.userFullName,
          isOwner: i.lId == userDetails?.lId,
          memberId: i.lId + '',
        };
        return newMember;
      }),
      lastMessage: '',
      sMessgeList: [],
    };
    // console.log('GRoupProxy: ', groupProxy);

    // dispatch(GroupChatOptions.actions.UpdateAllGroupList([groupProxy]));
    navigation.pop();
  };

  console.log(
    'Re render, all CreateGroup page ' + filteredUserData.length + new Date(),
  );
  return (
    <React.Fragment>
      <View style={styles.container}>
        <View style={styles.GroupChatHeader}>
          <TouchableOpacity
            onPress={() => {
              navigation.pop();
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
              onChangeText={text => {
                setGroupName(text);
              }}
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
              <TouchableOpacity onPress={HandleCreateGroup}>
                <Text style={{fontSize: 16, fontWeight: 'bold'}}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <SafeAreaView>
          <View style={{marginTop: 10}}>
            <FlatList
              data={filteredUserData}
              keyExtractor={e => e.lId + ''}
              refreshing={pageData.IsPageLoading}
              renderItem={data => {
                var User = data.item;

                var isUserPresent =
                  selectedUserList.find(i => i.lId == User.lId) != null;

                return (
                  <List.Item
                    style={{
                      marginLeft: 5,
                      paddingTop: 0,
                      paddingBottom: 0,
                      marginBottom: 10,
                    }}
                    title={User.userFullName}
                    titleStyle={{
                      fontFamily: 'OpenSans-Regular',
                      fontSize: 15,
                      marginTop: 0,
                    }}
                    left={props => (
                      <View>
                        <Avatar.Text
                          style={{
                            backgroundColor: ColorCode.DimGray,
                            width: 45,
                            height: 45,
                          }}
                          labelStyle={{
                            color: ColorCode.Black,
                            fontSize: 22,
                            fontFamily: 'OpenSans-Regular',
                            marginTop: -8,
                          }}
                          label={
                            User?.userFullName?.charAt(0).toUpperCase() ?? ''
                          }
                        />
                      </View>
                    )}
                    right={props => (
                      <Checkbox
                        status={isUserPresent ? 'checked' : 'unchecked'}
                        color="green"
                        onPress={e => {
                          console.log(e);
                          if (isUserPresent) {
                            setSelectedUserList(
                              selectedUserList.filter(i => i.lId != User.lId),
                            );
                          }
                          if (!isUserPresent) {
                            setSelectedUserList([...selectedUserList, User]);
                          }
                        }}
                      />
                    )}
                  />
                );
              }}
              ListEmptyComponent={EmptyListMessage}
            />
          </View>
        </SafeAreaView>
      </View>
    </React.Fragment>
  );
};

export default CreateGroupPage;
