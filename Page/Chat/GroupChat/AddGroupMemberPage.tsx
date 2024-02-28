import React, { useEffect, useState } from 'react';
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

import { ColorCode, styles } from '../../MainStyle';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../../../Core/BaseProps';
import { Avatar, Checkbox, List } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../../Redux/Hooks';

import { EmptyListMessage } from '../../../Control/EmptyListMessage';
import { MDivider } from '../../../Control/MDivider';
import { Group, GroupMember } from '../../../Entity/Group';
import SignalRApi from '../../../DataAccess/SignalRApi';
import ChatUserOptions from '../../../Redux/Reducer/NotificationOptions';
import { ShowPageLoader, ShowToastMessage } from '../../../Redux/Store';
import { ChatUser } from '../../../Entity/ChatUser';
import GroupChatOptions from '../../../Redux/Reducer/GroupChatOptions';
import AppDBHelper from '../../../Core/AppDBHelper';
import SessionHelper from '../../../Core/SessionHelper';
import { CreateGroupMember } from '../../../Entity/CreateGroupMember';
import OneToOneChatOptions, { GetFilteredUserList } from '../../../Redux/Reducer/OneToOneChatOptions';
import UIHelper from '../../../Core/UIHelper';
import { Member } from '../../../Entity/GroupDetails';
import { MSerachBar } from '../../../Control/MHeader';
import MHeaderOptions from '../../../Redux/Reducer/MHeaderOptions';

const AddGroupMember = (props: any) => {
  const dispatch = useAppDispatch();
  const filteredOneToOneUserListData = useAppSelector(GetFilteredUserList);
  const FilterGroupDetails = useAppSelector(
    i => i.GroupChatOptions.groupdetails,
  );

  const [selectedUserList, setSelectedUserList] = useState<ChatUser[]>([]);
  const [CompanyID, setCompanyID] = useState<string>();
  const [groupName, setGroupName] = useState<string>('');
  const [isPageRefreshing, setIsPageRefreshing] = useState(false);
  const [ShowSearch, setShowSearch] = React.useState(false);
  const navigation = useNavigation<NavigationProps>();

  const AddGroupMembers = async () => {
    if (!selectedUserList.length) {
      ShowToastMessage('Please choose atleast 1 user!!');
      return;
    }

    ShowPageLoader(true);
    var AddGroupMemberResponse = await SignalRApi.AddGroupMember(
      FilterGroupDetails.group.groupId,
      selectedUserList,
    );
    ShowPageLoader(false);
    if (!AddGroupMemberResponse.data) {
      ShowToastMessage(AddGroupMemberResponse.ErrorInfo || 'Someting wrong');
      return;
    }
    ShowToastMessage(
      `${FilterGroupDetails.group.groupName}'s-new member add successfully`,
    );
    var AddMember: Member[] = [];
    selectedUserList.forEach(i => {
      var AddMemberDetails = {
        memberId: i.lId.toString(),
        fullName: i.userFullName,
        isOwner: false,
      };
      AddMember.push(AddMemberDetails)
    });
    dispatch(GroupChatOptions.actions.AddGroupMember(AddMember))
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  console.log(
    'Re render, all AddMember page ' + filteredOneToOneUserListData.length + new Date(),
  );
  return (
    <React.Fragment>
      <View style={styles.container}>
        <View style={styles.GroupChatHeader}>
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              }
            }}>
            <Image
              source={require('../../../assets/backimg.png')}
              style={{ height: 30, width: 30, marginLeft: 5 }}
            />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.Grouptitle}>Add Member</Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
          {FilterGroupDetails.group.groupName.length <= 15 ? (
            <Text style={styles.GroupNameStyle}>
              {FilterGroupDetails.group.groupName}
            </Text>
          ) : (
            <Text style={styles.GroupNameStyle}>
              {FilterGroupDetails.group.groupName?.slice(0, 15)}...
            </Text>
          )}
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
        <MSerachBar
          onIconPress={() => {
            dispatch(MHeaderOptions.actions.UpdateSearchText(''));
            setShowSearch(!ShowSearch);
          }}
          OnSearchDataChange={e => {
            dispatch(MHeaderOptions.actions.UpdateSearchText(e));
          }}
        />
        <SafeAreaView>
          <View style={{ marginTop: 10 }}>
            <FlatList
              data={filteredOneToOneUserListData}
              keyExtractor={e => e.lId + ''}
              refreshing={isPageRefreshing}
              renderItem={data => {
                var User = data.item;
                var isUserPresent =
                  selectedUserList.find(i => i.lId == User.lId) != null ||
                  FilterGroupDetails.members.find(
                    i => i.memberId == User.lId + '',
                  ) != null;

                return (
                  <List.Item
                    style={{
                      marginLeft: 15,
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

export default AddGroupMember;
