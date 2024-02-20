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

import MainStyle, {ColorCode, styles} from '../../MainStyle';
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

const AllGroupMemberPage = (props: any) => {
  const dispatch = useAppDispatch();
  const FilterGroupDetails = useAppSelector(
    i => i.GroupChatOptions.groupdetails,
  );
  const navigation = useNavigation<NavigationProps>();
  const [isPageRefreshing, setIsPageRefreshing] = useState(false);

  console.log(
    'Re render, all Member page ' +
      FilterGroupDetails.members.length +
      new Date(),
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
              style={{height: 30, width: 30, marginLeft: 5}}
            />
          </TouchableOpacity>
          <View style={{flex: 1}}>
            <Text style={styles.Grouptitle}>All Members</Text>
          </View>
        </View>
        <View>
          {FilterGroupDetails.group.groupName.length <= 30 ? (
            <Text style={styles.GroupNameStyle}>
              {FilterGroupDetails.group.groupName}
            </Text>
          ) : (
            <Text style={styles.GroupNameStyle}>
              {FilterGroupDetails.group.groupName?.slice(0, 30)}...
            </Text>
          )}
        </View>

        <SafeAreaView>
          <View style={{marginTop: 10}}>
            <FlatList
              data={FilterGroupDetails.members}
              keyExtractor={e => e.memberId + ''}
              refreshing={isPageRefreshing}
              renderItem={data => {
                var User = data.item;
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
                  />
                );
              }}
            />
          </View>
        </SafeAreaView>
      </View>
    </React.Fragment>
  );
};

export default AllGroupMemberPage;
