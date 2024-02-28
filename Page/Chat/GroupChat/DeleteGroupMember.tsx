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
import OneToOneChatOptions from '../../../Redux/Reducer/OneToOneChatOptions';
import UIHelper from '../../../Core/UIHelper';
import { Member } from '../../../Entity/GroupDetails';

const DeleteGroupMemberPage = (props: any) => {
  const dispatch = useAppDispatch();
  const filteredUserList = useAppSelector(
    i => i.OneToOneChatOptions.AllUserList,
  );
  const FilterGroupDetails = useAppSelector(
    i => i.GroupChatOptions.groupdetails,
  );




  const [selectedUserList, setSelectedUserList] = useState<GroupMember[]>([]);
  const [CompanyID, setCompanyID] = useState<string>();
  const [groupName, setGroupName] = useState<string>('');
  const [isPageRefreshing, setIsPageRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProps>();

  const DeleteGroupMember = async () => {
    if (!selectedUserList.length) {
      ShowToastMessage('Please choose atleast 1 user!!');
      return;
    }
    console.log('selectedUserList: ', selectedUserList);

    ShowPageLoader(true);
    var DeleteGroupResponse = await SignalRApi.DeleteGroupMember(
      FilterGroupDetails.group.groupId,
      selectedUserList,
    );
    ShowPageLoader(false);
    if (!DeleteGroupResponse.data) {
      ShowToastMessage(DeleteGroupResponse.ErrorInfo || 'Someting wrong');
      return;
    }
    ShowToastMessage(
      `${FilterGroupDetails.group.groupName}'s-new member removed`,
    );
    var AddMember: Member[] = [];
    selectedUserList.forEach(i => {
      var AddMemberDetails = {
        memberId: i.memberId.toString(),
        fullName: i.fullName,
        isOwner: false,
      };
      AddMember.push(AddMemberDetails)
    });
    dispatch(GroupChatOptions.actions.DeleteGroupMember(AddMember))
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
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
            <Text style={styles.Grouptitle}>Remove Member</Text>
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
            <TouchableOpacity onPress={DeleteGroupMember}>
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
          <View style={{ marginTop: 10 }}>
            <FlatList
              data={FilterGroupDetails.members}
              keyExtractor={e => e.memberId + ''}
              refreshing={isPageRefreshing}
              renderItem={data => {
                var User = data.item;
                var isUserPresent =
                  selectedUserList.find(i => i.memberId == User.memberId) !=
                  null;

                return (
                  <List.Item
                    style={{
                      marginLeft: 15,
                      paddingTop: 0,
                      paddingBottom: 0,
                      marginBottom: 10,
                    }}
                    title={User.fullName}
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
                          label={User?.fullName?.charAt(0).toUpperCase() ?? ''}
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
                              selectedUserList.filter(
                                i => i.memberId != User.memberId,
                              ),
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

export default DeleteGroupMemberPage;
