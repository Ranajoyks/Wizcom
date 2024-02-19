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
import {ShowToastMessage} from '../../../Redux/Store';
import {ChatUser} from '../../../Entity/ChatUser';
import GroupChatOptions from '../../../Redux/Reducer/GroupChatOptions';
import AppDBHelper from '../../../Core/AppDBHelper';
import SessionHelper from '../../../Core/SessionHelper';
import {CreateGroupMember} from '../../../Entity/CreateGroupMember';
import OneToOneChatOptions from '../../../Redux/Reducer/OneToOneChatOptions';
import UIHelper from '../../../Core/UIHelper';

const AddGroupMember = (props: any) => {
  const dispatch = useAppDispatch();
  const filteredUserList = useAppSelector(
    i => i.OneToOneChatOptions.AllUserList,
  );

  const [selectedUserList, setSelectedUserList] = useState<ChatUser[]>([]);
  const [CreateGroupMembers, setCreateGroupMembers] = useState<
    CreateGroupMember[]
  >([]);
  const [CompanyID, setCompanyID] = useState<string>();
  const [groupName, setGroupName] = useState<string>('');
  const [isPageRefreshing, setIsPageRefreshing] = useState(false);
  const [GroupMember, setGroupMember] = useState<GroupMember[]>([]);
  const navigation = useNavigation<NavigationProps>();

  useEffect(() => {
    (async function () {
      Initilize();
      console.log('AdddGGroupId: ', props.route.params?.GroupID);
    })();
  }, []);
  const Initilize = async () => {
    var CompanyId = await SessionHelper.GetCompanyID();
    await setCompanyID(CompanyId);
    // console.log("FilterUserList: ",filteredUserList);
    NewGroupDetails();
  };
  const NewGroupDetails = async () => {
    var chatId = await SessionHelper.GetChatId();
    var userInfo = await SessionHelper.GetUserDetails();
    var GroupDetailsResponse = await SignalRApi.GetNewGroupDetails(
      chatId!,
      props.route.params?.GroupID,
    );
    // console.log(
    //   'NewgroupDetails',
    //   JSON.stringify(GroupDetailsResponse.data?.members),
    // );
    setGroupName(GroupDetailsResponse.data!.group.groupName);
    setGroupMember(GroupDetailsResponse.data!.members);
  };

  const AddGroupMembers = async () => {
    console.log('CompanyId: ', CompanyID);
    var ChatID = await SessionHelper.GetChatId();
    console.log('ChatID: ', ChatID);

    if (!groupName) {
      ShowToastMessage('Please provide a valid group name!!');
      return;
    }

    if (!CreateGroupMembers.length) {
      ShowToastMessage('Please choose atleast 1 user!!');
      return;
    }
    console.log('SelectedUserIDs: ', CreateGroupMembers);
    var GroupMemberAddCreateCredential = {
      userId: ChatID,
      groupId: props.route.params?.GroupID,
      members: CreateGroupMembers,
    };
    console.log('GroupCreateCredential: ', GroupMemberAddCreateCredential);
    // var CreateGroupResponse = await SignalRApi.CreateGroup(
    //   GroupCreateCredential,
    // );
    // console.log('CreateGroupResponse: ', CreateGroupResponse);

    // if (!CreateGroupResponse.data) {
    //   return;
    // }
    // ShowToastMessage(`${groupName}-created successfully`);
    // navigation.navigate('MainPage');

    // ShowToastMessage('Susovan do this :)!!');
  };

  console.log(
    'Re render, all AddMember page ' + filteredUserList.length + new Date(),
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
            <Text style={styles.Grouptitle}>Add Member</Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#0383FA',
              marginLeft: 5,
            }}>
            {groupName}
          </Text>
          {/* ) : (
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: '#0383FA',
                      marginLeft: 20,
                    }}>
                    {model.GroupName?.slice(0, 15)}...
                  </Text> */}
          {/* )} */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              //paddingRight: 5,
            }}>
            <TouchableOpacity onPress={AddGroupMembers}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  alignSelf: 'flex-end',
                  marginRight: 15,
                }}>
                Update
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <SafeAreaView>
          <View style={{marginTop: 10}}>
            <FlatList
              data={filteredUserList}
              keyExtractor={e => e.lId + ''}
              refreshing={isPageRefreshing}
              renderItem={data => {
                var User = data.item;
                var UserID = {
                  memberId: CompanyID + '_' + data.item.lId,
                };
                var isUserPresent =
                GroupMember.find(
                    i => i.memberId == User.lId.toString(),
                  ) != null;

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
                            setCreateGroupMembers(
                              CreateGroupMembers.filter(
                                i => i.memberId != UserID.memberId,
                              ),
                            );
                          } else {
                            setCreateGroupMembers([
                              ...CreateGroupMembers,
                              UserID,
                            ]);
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

export default AddGroupMember;
