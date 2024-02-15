import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {NavigationProps} from '../../../Core/BaseProps';
import RNFile from '../../../Core/RNFile';
import User from '../../../Entity/User';
import {useAppDispatch, useAppSelector} from '../../../Redux/Hooks';

import {RootStackParamList} from '../../../Root/AppStack';
import {StackScreenProps} from '@react-navigation/stack';
import SignalRApi from '../../../DataAccess/SignalRApi';
import SessionHelper from '../../../Core/SessionHelper';
import {ShowToastMessage} from '../../../Redux/Store';
import {Group} from '../../../Entity/Group';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Badge,
  Button,
  List,
  Text,
  TextInput,
} from 'react-native-paper';
import moment from 'moment';
import MainStyle, {ColorCode, styles} from '../../MainStyle';
import {UserProfileScreen} from '../../../Control/MHeader';
import ChatAvatar from '../ChatAvatar';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import AppDBHelper from '../../../Core/AppDBHelper';
import LocalFileHelper from '../../../Core/LocalFileHelper';
import UIHelper from '../../../Core/UIHelper';
import ERESApi from '../../../DataAccess/ERESApi';
import {SignalRHubConnection} from '../../../DataAccess/SignalRHubConnection';

import ChatUserOptions from '../../../Redux/Reducer/ChatUserOptions';
import {GroupChat} from '../../../Entity/GroupChat';

import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import * as RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import FileViewer from 'react-native-file-viewer';

const GroupChatDetailsPage2 = (
  props: StackScreenProps<RootStackParamList, 'GroupChatDetailsPage2'>,
) => {
  const OnBackRefresRequest = props.route.params.OnBackRefresRequest;
  const navigation = useNavigation<NavigationProps>();
  const dispatch = useAppDispatch();

  const [groupDetail, setGroupDetail] = useState<Group>();
  const [SenderChatId, setSenderChatId] = useState<string>();
  const [ReceiverChatId, setReceiverChatId] = useState<string>();
  const [currentIndex, setCurrentIndex] = useState(0);

  const [newSendMessage, setNewSendMessage] = useState('');
  const [UserInfo, setUserInfo] = useState<User>();
  const [CompnanyId, setCompnanyId] = useState<string>();
  const [BrnachId, setBranchId] = useState<number>();
  const [ShowSilentLoader, setShowSilentLoader] = useState<boolean>(false);

  const [ShowDownloading, setShowDownloading] = useState<number[]>([]);
  const [singleFileDownloadId, setSingleFileDownloadId] = useState<number>(0);
  const chatUserOptions = useAppSelector(i => i.ChatUserOptions);

  const [SelectedFile, setSelectedFile] = useState<RNFile>();

  useEffect(() => {
    Initilize();
  }, []);

  const Initilize = async () => {
    var chatId = await SessionHelper.GetChatId();
    var CompanyId = await SessionHelper.GetCompanyID();
    var Branch = await SessionHelper.GetBranch();

    var userInfo = await SessionHelper.GetUserDetails();

    //console.log('ReceiverChatId', receiverChatId);

    setBranchId(Branch?.lId);
    setSenderChatId(chatId);

    setCompnanyId(CompanyId);
    setUserInfo(userInfo);

    var GroupDetailsResponse = await SignalRApi.GetGroupDetails(
      chatId!,
      props.route.params.Group.groupId,
    );
    console.log('groupDetails', JSON.stringify(GroupDetailsResponse, null, 2));

    if (!GroupDetailsResponse.data) {
      ShowToastMessage('Group not found');
      return;
    }
    dispatch(
      ChatUserOptions.actions.UpdateAllGroupList([
        GroupDetailsResponse.data.group,
      ]),
    );
    setGroupDetail(GroupDetailsResponse.data.group);
    console.log(
      'GroupDetailsResponse.data.groupId',
      GroupDetailsResponse.data.group.groupId,
    );

    LoadOldMessages(
      chatId,
      GroupDetailsResponse.data.group.groupId,
      Branch?.lId,
      0,
      false,
    );
  };

  const LoadOldMessages = async (
    FromSenderId?: string,
    FromGroupId?: number,
    FromBranchId?: number,
    FromIndexNo?: number,
    ShowSilentLoader?: boolean,
  ) => {
    setShowSilentLoader(ShowSilentLoader == true && true);

    console.log('FromGroupId', FromGroupId);

    var tempSenderChatId = FromSenderId ?? SenderChatId;
    var tempGroupId = FromGroupId ?? groupDetail?.groupId;
    var tempBranchId = FromBranchId ?? BrnachId;
    var tempIndexNo = currentIndex;

    //0 is a valid no so use only undefined check
    if (FromIndexNo != undefined) {
      tempIndexNo = FromIndexNo;
    }

    console.log('tempGroupId', tempGroupId);
    SignalRApi.GetAllGroupMsg(
      tempSenderChatId!,
      tempBranchId!,
      tempGroupId!,
      tempIndexNo!,
    ).then(res => {
        console.log(' group chat res', res);
      if (res.data) {
        setCurrentIndex(tempIndexNo);
        dispatch(
          ChatUserOptions.actions.LoadGroupOneToOneChatList({
            messageList: res.data,
            GroupId: tempGroupId!,
          }),
        );

        AppDBHelper.SetGroups(chatUserOptions.AllGroupList, tempSenderChatId!);
      }
      setShowSilentLoader(false);
    });
  };
  const DownloadFile = async (
    item: GroupChat,
  ): Promise<GroupChat | undefined> => {
    var newChatItem = {} as GroupChat;

    return new Promise(async (resolve, reject) => {
      if (item.AttahmentLocalPath) {
        console.log('item.AttahmentLocalPath', item.AttahmentLocalPath);

        FileViewer.open(item.AttahmentLocalPath);
        resolve(undefined);
      }
      HandleMultiDownloadingLoader(item.lAttchId, true);
      var res = await ERESApi.DownloadAttachment(item.lAttchId);

      const {config, fs} = RNFetchBlob;
      var cacheDir = fs.dirs.DownloadDir;
      var binaryData = res.data.d.data.mAttch;
      var fullLocalFileName = `${cacheDir}/${item.sMsg}`;

      newChatItem.AttahmentLocalPath = fullLocalFileName;
      newChatItem.AttachmentType =
        LocalFileHelper.GetFileType(fullLocalFileName);
      // const filePath = RNFS.ExternalStorageDirectoryPath + FileName;

      RNFS.writeFile(fullLocalFileName, binaryData, 'base64')
        .then(() => {
          HandleMultiDownloadingLoader(item.lAttchId, false);
          FileViewer.open(fullLocalFileName!);
          console.log('File written successfully!', newChatItem);
          resolve(newChatItem);
        })
        .catch((err: any) => {
          resolve(undefined);
        });
    });
  };
  const AttachFileToChat = async () => {
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
      allowMultiSelection: false,
    });

    if (!result.length) {
      return;
    }

    var selectedFile = result[0] as unknown as RNFile;
    setSelectedFile(selectedFile);
    setNewSendMessage(selectedFile.name ?? '');
  };
  const HandleSendMessage = async () => {
    var tempMessage = newSendMessage;
    var tempGroupName = groupDetail?.groupName + '_' + groupDetail?.groupId;

    var chat = SignalRHubConnection.GetProxyGroupChatMessage(
      SenderChatId!,
      UserInfo?.userFullName!,
      tempGroupName,
      0,
      tempMessage,
      lastMessage?.lSrId ?? 0,
    );
    chat.lCompId = BrnachId!;
    chat.sConnId = 'connectionId';

    setNewSendMessage('');
    dispatch(ChatUserOptions.actions.AddNewGroupChat(chat));

    console.log('SendMsg: ', chat);

    if (SelectedFile) {
      var FileUploadData = new FormData();
      FileUploadData.append(tempMessage, SelectedFile);

      var uploadResponse = await ERESApi.UploadAttachment(FileUploadData);
      if (uploadResponse.IsKSError || !uploadResponse.data) {
        ShowToastMessage(
          uploadResponse.ErrorInfo ?? 'Something wrong happened',
        );
        return;
      }
      console.log('FileUpload1stREsponse: ', uploadResponse.data);
      var FileUploadRaw = {
        CompanyId: BrnachId,
        FromUserId: SenderChatId,
        AttachmentId: uploadResponse.data.lAttchId,
        ConnectionId: 'connectionId',
        FileName: uploadResponse.data.sFileName,
        Message: '',
      };
      console.log('FileUploadRaw: ', FileUploadRaw);

      var FileUploadResponse = await SignalRApi.FileUpload(FileUploadRaw);

      chat.lAttchId = uploadResponse.data.lAttchId;
      console.log('FileUploadResponse: ', FileUploadResponse);
      setSelectedFile(undefined);
    }
    var SendMSgOption = {
      companyId: BrnachId!.toString(),
      fromUserId: SenderChatId!.toString(),
      userName: UserInfo!.userName,
      message: newSendMessage,
      groupName: groupDetail?.groupName + '_' + groupDetail?.groupId,
    };

    SignalRApi.SendGroupMsg(SendMSgOption).then(res => {
      console.log('SendMsgResponse:', res);

      if (!res) {
        ShowToastMessage('Message is not sent');
        return;
      }

      LoadOldMessages(SenderChatId, groupDetail?.groupId, BrnachId, 0, false);
    });
    //   (chat?: GroupChat) => {
    //     if (!chat) {
    //       ShowToastMessage('Message is not sent');
    //       return;
    //     }

    //     LoadOldMessages(SenderChatId, groupDetail?.groupId, BrnachId, 0, false);
    //   },
    // );
  };

  const HandleMultiDownloadingLoader = (
    AttachmentId: number,
    IsDownloading: boolean,
  ) => {
    var itemIndex = ShowDownloading.findIndex(i => i == AttachmentId);
    setSingleFileDownloadId(IsDownloading ? AttachmentId : 0);
    if (IsDownloading && !itemIndex) {
      ShowDownloading.push(AttachmentId);
      setShowDownloading([...ShowDownloading]);
    }

    if (!IsDownloading && itemIndex) {
      setShowDownloading([...ShowDownloading.filter(i => i != AttachmentId)]);
    }
  };

  var MessageList = chatUserOptions.AllGroupList.find(
    i => i.groupId == groupDetail?.groupId,
  )?.AllGroupMsgList;
  

  // useEffect(() => {
  //   console.log("Current data lenth changed", MessageList.length)
  // }, [MessageList?.length])

  var lastMessage = MessageList?.length ? MessageList[0] : undefined;
  return (
    <>
      <View style={styles.container}>
        <View style={styles.GroupChatHeader}>
          <TouchableOpacity
            onPress={() => {
              OnBackRefresRequest && OnBackRefresRequest();
              navigation.popToTop();
            }}>
            <Image
              source={require('../../../assets/backimg.png')}
              style={{height: 30, width: 30, marginLeft: 10}}
            />
          </TouchableOpacity>
          <View style={{flex: 1}}>
            <Text style={styles.Grouptitle}>Group Chat</Text>
          </View>
          <UserProfileScreen userName={UserInfo?.userName ?? ''} />
        </View>
        <View style={styles.groupcontainer}>
          <View>
            <View>
              <Text style={styles.headerText}>{groupDetail?.groupName}</Text>
            </View>
            <View style={styles.memberCount}>
              <Text style={styles.memberCountText}>
                {groupDetail?.members?.length} Members
              </Text>
            </View>
          </View>

          <View style={styles.avatarContainer}>
            <TouchableOpacity>
              {groupDetail?.members &&
                groupDetail?.members.map((member, index) => {
                  if (index > 2) return;
                  return (
                    <View key={member.memberId} style={styles.topLayer}>
                      <Badge style={styles.GroupChatBadge}>
                        {member.fullName}
                      </Badge>
                    </View>
                  );
                })}
              {groupDetail?.members && groupDetail?.members?.length > 3 && (
                <View style={styles.topLayer}>
                  <Badge style={styles.GroupChatBadge}>
                    {groupDetail?.members?.length - 3}
                  </Badge>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          automaticallyAdjustKeyboardInsets
          data={MessageList}
          renderItem={({item}) => {
            var isSenderIsSecondUser = item.lSenderId != UserInfo?.lId;

            return (
              <View key={item.lSrId + item.DayDisplayGroupName}>
                {item.DayDisplayGroupName && (
                  <View>
                    <Text
                      style={{
                        marginEnd: 10,
                        alignSelf: 'center',
                        alignItems: 'center',
                      }}>
                      {item.DayDisplayGroupName}
                    </Text>
                  </View>
                )}

                <View
                  style={{
                    flexDirection: isSenderIsSecondUser ? 'row' : 'row-reverse',
                    marginTop: 10,
                    marginLeft: 10,
                    marginRight: 10,
                  }}>
                  <ChatAvatar size={40} label={item.userName} />
                  <List.Item
                    style={{
                      borderRadius: 10,
                      backgroundColor: isSenderIsSecondUser
                        ? ColorCode.DimGray
                        : ColorCode.LightOrange,
                      marginLeft: 10,
                      maxWidth: '80%',
                    }}
                    title={item.sMsg}
                    titleNumberOfLines={0}
                    titleStyle={{
                      color: isSenderIsSecondUser
                        ? ColorCode.Black
                        : ColorCode.DrakOrange,
                      fontSize: 15,
                    }}
                    right={() => {
                      if (!item.lAttchId) return <></>;
                      if (singleFileDownloadId == item.lAttchId)
                        return (
                          <ActivityIndicator size={30}></ActivityIndicator>
                        );
                      return (
                        <MCIcon
                          size={30}
                          style={{marginLeft: 5}}
                          name="download-circle-outline"
                          onPress={async () => {
                            var dataReceived = await DownloadFile(item);
                            console.log('dataReceived', dataReceived);
                            if (!dataReceived) {
                              return;
                            }

                            dataReceived = Object.assign(
                              {...item},
                              dataReceived,
                            );
                            console.log('dataReceived', dataReceived);

                            ShowToastMessage('Downloaded');
                            dispatch(
                              ChatUserOptions.actions.UpdateGroupChat(
                                dataReceived,
                              ),
                            );
                          }}
                        />
                      );
                    }}
                  />
                </View>
                {/* {data.item.AttachmentType == 'Image' && (
                          <View  >
                            <Image
                              source={{ uri: "file:///" + data.item.AttahmentLocalPath! }}
                              style={{
                                height: 90,
                                width: 200,
                                marginEnd: 10,
                                alignSelf: 'flex-end',
                                alignItems: 'flex-end',
                              }}></Image>
                          </View>
                        )} */}
                <View
                  style={{
                    flexDirection: isSenderIsSecondUser ? 'row' : 'row-reverse',
                    marginLeft: isSenderIsSecondUser ? '20%' : 10,
                    marginRight: 10,
                  }}>
                  <Text style={{fontSize: 12}}>
                    {UIHelper.GetTimeStamp(item.dtMsg)}
                  </Text>
                </View>
              </View>
            );
          }}
        />
        <View style={{padding: 10}}>
          <View
            style={{
              backgroundColor: '#e9e9e9',
              paddingHorizontal: 10,
              borderRadius: 6,
              flexDirection: 'row',
            }}>
            <TextInput
              style={
                (localStyle.input,
                {width: Dimensions.get('window').width - 100})
              }
              value={newSendMessage}
              onChangeText={e => {
                setNewSendMessage(e);
              }}
              placeholder="Write your message here"></TextInput>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingRight: 10,
              }}>
              <TouchableOpacity onPress={AttachFileToChat}>
                <Image
                  source={require('../../../assets/attachment.png')}
                  style={{height: 25, width: 13, marginHorizontal: 10}}
                />
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!newSendMessage}
                onPress={() => {
                  HandleSendMessage();
                }}>
                <Image
                  source={require('../../../assets/send.png')}
                  style={{height: 25, width: 25}}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </>
  );
};
export default GroupChatDetailsPage2;

const localStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Soft blue background
  },
  header: {
    backgroundColor: '#FFFFFF', // Lighter blue header
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // borderBottomWidth: 1,
    // borderColor: '#d9eeff', // Lighter blue accent
    zIndex: 999,
  },
  icon: {
    color: '#fff', // White icons
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins-bold',
    // color: '#2196f3', // Darker blue title
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Poppins-bold',
    // color: '#2196f3', // Darker blue title
  },
  online: {color: '#0383FA'},
  offline: {color: '#E4B27E'},
  today: {color: '#A6A6A6', textAlign: 'center', fontSize: 16, padding: 20},
  unread: {color: '#0383FA', textAlign: 'center', fontSize: 16, padding: 20},
  body: {
    flex: 1,
    flexDirection: 'column',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    alignSelf: 'center',
  },
  scrollView: {},
  text2: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 30,
    letterSpacing: 1.2,
  },
  messagefrom: {
    flexDirection: 'column',
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexWrap: 'wrap',
  },
  messagefrommessage: {flexDirection: 'row'},
  messagefromicon: {
    backgroundColor: '#E9E9E9',
    width: 40,
    height: 40,
    borderRadius: 20,
    padding: 5,
    alignItems: 'center',
    flexDirection: 'row',
  },
  messagefromtext: {paddingLeft: 10, paddingRight: 30, paddingVertical: 0},
  messagefromtextcontent: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#E9E9E9',
    borderRadius: 5,
    fontSize: 15,
    color: '#000',
    lineHeight: 25,
    fontFamily: 'OpenSans-VariableFont_wdth,wght',
    // flexWrap: 'wrap'
  },
  messagefromtextcontenttext: {
    fontSize: 15,
    color: '#000',
    lineHeight: 25,
    fontFamily: 'OpenSans-VariableFont_wdth,wght',
    // flexWrap: 'wrap'
  },
  messagefromtime: {
    // flexDirections: 'row-reverse',
    paddingRight: 30,
    paddingBottom: 6,
    // paddingTop:0,
    // marginTop:0
  },
  messagefromtimetext: {
    // flexShrink: 1,
    textAlign: 'right',
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    // marginVertical:0
  },
  messageto: {
    flexDirection: 'column',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messagetomessage: {flexDirection: 'row-reverse'},
  messagetotext: {paddingLeft: 10, paddingRight: 0, zIndex: 1},
  messagetotextcontent: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fef0e1',
    borderRadius: 5,
    fontSize: 15,
    color: '#C66E12',
    // lineHeight: 30,
    fontFamily: 'OpenSans-VariableFont_wdth,wght',
    // zIndex: 1,
    flexDirection: 'row',
  },
  messagetotime: {
    flexDirection: 'row-reverse',
    paddingRight: 0,
    // paddingVertical: 5,
  },
  messagetotimetext: {flexShrink: 1, textAlign: 'right'},
  input: {
    alignSelf: 'center',
    backgroundColor: '#F1F1F1',
    borderColor: '#F1F1F1',
    paddingHorizontal: 5,
  },
  buttontest: {
    alignSelf: 'center',
    marginTop: '90%',
    height: 50,
    textAlign: 'center',
    justifyContent: 'center',
    backgroundColor: '#0383FA',
    color: 'white',
    borderRadius: 7,

    // padding: 10,
    width: '95%',
  },

  groupcontainer: {
    //  padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    flexDirection: 'row',

    height: 60,
    marginLeft: '5%',
    borderBottomWidth: 1,
    borderColor: '#d9eeff',
    // justifyContent:'space-between'
    // Adjust layout properties as needed (e.g., flexDirection, alignItems)
  },

  groupheader: {
    // marginBottom: 15,
  },

  headerText: {
    fontSize: 17,
    fontWeight: '700',
    color: 'black',
    // fontWeight: '200',
    fontFamily: 'Poppins-Regular',
    // fontSize: 12,
    width: 'auto',
  },

  memberCount: {
    marginBottom: 10,
  },

  memberCountText: {
    fontSize: 14,
    color: '#888',
  },

  avatarContainer: {
    flexDirection: 'row',
    //marginRight:100
    width: 40,
    marginLeft: '30%', // Adjust layout properties as needed
  },

  topLayer: {
    position: 'absolute',
    top: 10,
    left: 5,
    flexDirection: 'row',
    // zIndex: 3,
  },

  // middleLayer: {
  //   position: 'absolute',
  //  // zIndex: 2,
  // },

  bottomLayer: {
    position: 'absolute',
    top: 10,
    left: 25,
    flexDirection: 'row',
    //   zIndex: 1,
  },
  bottomLayer2: {
    position: 'absolute',
    top: 10,
    left: 45,
    flexDirection: 'row',
    //   zIndex: 1,
  },
  bottomLayer3: {
    position: 'absolute',
    top: 10,
    left: 65,
    flexDirection: 'row',
    //   zIndex: 1,
  },

  topAvatar: {
    width: 45,
    height: 45,
    borderRadius: 30,
    right: 40,
    // top: 10, // Adjust vertical positioning
    // left: 20, // Adjust horizontal positioning
  },

  middleAvatar: {
    width: 45, // Adjust size for overlap
    height: 45,
    borderRadius: 30,
    left: 20,
    right: 40,
    // marginHorizontal: 5, // Adjust spacing
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 20,
    right: 60,
    //  left: 40,
  },
  avatar2: {
    width: 45,
    height: 45,
    borderRadius: 30,
    // left: 20,
    right: 80,
  },
  avatar3: {
    width: 45,
    height: 45,
    borderRadius: 30,
    // left: 20,
    right: 100,
  },
  rejectbuttontest: {
    alignSelf: 'center',
    // marginTop: '90%',
    height: 34,
    // textAlign: 'center',
    // justifyContent: 'center',
    backgroundColor: 'red',
    color: 'white',
    borderRadius: 5,

    paddingHorizontal: 10,
    paddingVertical: 0,

    // width: '95%',
  },
  divider: {
    height: 1,
    backgroundColor: 'gray',
    marginHorizontal: 20,
    marginTop: 12,
    opacity: 0.5,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    // Set a height for the container
    height: 'auto',
    width: 200,
    zIndex: 1,
  },
  dropdown: {
    backgroundColor: '#f1f1f1',
    color: 'black',
    borderRadius: 10,
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
  },
});
