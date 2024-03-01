import {useEffect, useState} from 'react';
import SignalRApi from '../../../DataAccess/SignalRApi';
import SessionHelper from '../../../Core/SessionHelper';
import {SignalRHubConnection} from '../../../DataAccess/SignalRHubConnection';
import {ShowPageLoader, ShowToastMessage} from '../../../Redux/Store';

import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from '../../../Root/AppStack';
import {View} from 'react-native-animatable';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ActivityIndicator, List, ProgressBar, Text} from 'react-native-paper';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {ColorCode} from '../../MainStyle';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {NavigationProps} from '../../../Core/BaseProps';
import User from '../../../Entity/User';
import {useAppDispatch, useAppSelector} from '../../../Redux/Hooks';
import React from 'react';
import DocumentPicker from 'react-native-document-picker';
import {UserProfileScreen} from '../../../Control/MHeader';
import RNFile from '../../../Core/RNFile';
import ERESApi from '../../../DataAccess/ERESApi';
import * as RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import FileViewer from 'react-native-file-viewer';
import LocalFileHelper from '../../../Core/LocalFileHelper';

import UIHelper from '../../../Core/UIHelper';
import {ChatUser} from '../../../Entity/ChatUser';
import AppDBHelper from '../../../Core/AppDBHelper';
import {Chat} from '../../../Entity/Chat';
import OneToOneChatOptions from '../../../Redux/Reducer/OneToOneChatOptions';
import ReduxDataHelper from '../../../Redux/ReduxDataHelper';

const OneToOneChatPage2 = (
  props: StackScreenProps<RootStackParamList, 'OneToOneChatPage2'>,
) => {
  const users = useAppSelector(i => i.OneToOneChatOptions.AllUserList);  
  const user = users.find(i => i.lId == props.route.params.SecondUser)!;
  console.log('User: ', props.route.params.SecondUser);

  const SecondUser = user;

  const navigation = useNavigation<NavigationProps>();
  const dispatch = useAppDispatch();

  const [SenderChatId, setSenderChatId] = useState<string>();
  const [ReceiverChatId, setReceiverChatId] = useState<string>();
  const [currentIndex, setCurrentIndex] = useState(0);

  const [newSendMessage, setNewSendMessage] = useState('');
  const [UserInfo, setUserInfo] = useState<User>();

  const [BrnachId, setBranchId] = useState<number>();

  const [ShowDownloading, setShowDownloading] = useState<number[]>([]);
  const [singleFileDownloadId, setSingleFileDownloadId] = useState<number>(0);
  const chatUserOptions = useAppSelector(i => i.OneToOneChatOptions);

  const [SelectedFile, setSelectedFile] = useState<RNFile>();
  const [isPageRefreshing, setIsPageRefreshing] = useState(false);
  var ReadMessageCalledOnce = false;
  useEffect(() => {
    (async function () {
      Initilize();
    })();
  }, []);

  const Initilize = async () => {
    var chatId = await SessionHelper.GetChatId();
    var Branch = await SessionHelper.GetBranch();
    var receiverChatId = await UIHelper.GetChatId(SecondUser.lId);
    var userInfo = await SessionHelper.GetUserDetails();

    setBranchId(Branch?.lId);
    setSenderChatId(chatId);
    setReceiverChatId(receiverChatId);

    setUserInfo(userInfo);
    //UIHelper.LogTime("MarkTalkingTrue", "Start")

    await SignalRApi.MarkTalkingTrue({
      FromUserId: chatId!,
      ToUserId: receiverChatId,
      IsTaking: true,
    });

    await SignalRHubConnection.JoinChat();

    LoadOldMessages(chatId, receiverChatId, Branch?.lId, 0, true);
    SignalRApi.ReadMsg(SecondUser.lId);
    // var IsConnected = await SignalRHubConnection.IsSecoendUserConnected(
    //   SecondUser.lId,
    // );
    // console.log('SecondUserIsConnected: ', IsConnected);

    ShowPageLoader(false);
  };
  const LoadOldMessages = async (
    FromSenderId?: string,
    FromReceiverId?: string,
    FromBranchId?: number,
    FromIndexNo?: number,
    ShowSilentLoader?: boolean,
  ) => {
    console.log('FromIndexNo: ', FromIndexNo);
    FromIndexNo != 0 && setIsPageRefreshing(ShowSilentLoader == true && true);

    var tempSenderChatId = FromSenderId ?? SenderChatId;
    var tempReceiverId = FromReceiverId ?? ReceiverChatId;
    var tempBranchId = FromBranchId ?? BrnachId;
    var tempIndexNo = currentIndex;

    //0 is a valid no so use only undefined check
    if (FromIndexNo != undefined) {
      tempIndexNo = FromIndexNo;
    }

    SignalRApi.GetAllMessage(
      tempBranchId + '',
      tempSenderChatId!,
      tempReceiverId!,
      tempIndexNo,
    ).then(res => {
      if (res.data) {
        setCurrentIndex(tempIndexNo);

        //console.log('sMessgeList', res.data);

        SecondUser.sMessgeList = res.data;

        var proxyChatUser: ChatUser = {
          lId: SecondUser.lId,
          sMessgeList: res.data,
        } as unknown as ChatUser;

        dispatch(
          OneToOneChatOptions.actions.UpdateAllUserListAndMessage([
            proxyChatUser,
          ]),
        );
      }
      setIsPageRefreshing(false);
    });
  };
  const DownloadFile = async (item: Chat): Promise<Chat | undefined> => {
    var newChatItem = {} as Chat;

    return new Promise(async resolve => {
      if (item.AttahmentLocalPath) {
        console.log('item.AttahmentLocalPath', item.AttahmentLocalPath);

        FileViewer.open(item.AttahmentLocalPath);
        resolve(undefined);
        return;
      }
      HandleMultiDownloadingLoader(item.lAttchId, true);

      var res = await ERESApi.DownloadAttachment(item.lAttchId);

      if (!res.data?.d?.data?.mAttch) {
        HandleMultiDownloadingLoader(item.lAttchId, false);
        ShowToastMessage('Unable to download attachment');
        return;
      }

      const {fs} = RNFetchBlob;
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
        .catch(() => {
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
    var chat = SignalRHubConnection.GetProxyChatMessage(
      SenderChatId!,
      ReceiverChatId!,
      tempMessage,
      UIHelper.GetProxySrId(lastMessage?.lSrId),
      true,
    );
    setNewSendMessage('');
    dispatch(OneToOneChatOptions.actions.AddNewOneToOneChat(chat));

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
        ToUserId: ReceiverChatId,
        AttachmentId: uploadResponse.data.lAttchId,
        ConnectionId: 'connectionId',
        FileName: uploadResponse.data.sFileName,
        Message: '',
        PageName: 'OneToOneChatPage2',
      };
      console.log('FileUploadRaw: ', FileUploadRaw);

      var FileUploadResponse = await SignalRApi.FileUpload(FileUploadRaw);
      console.log('FileUploadResponse: ', FileUploadResponse);
      setSelectedFile(undefined);
      LoadOldMessages(SenderChatId, ReceiverChatId, BrnachId, 0, false);
    } else {
      SignalRHubConnection.SendMessage(
        BrnachId!,
        SenderChatId!,
        ReceiverChatId!,
        newSendMessage,
        'U',
        1,
      ).then((chat?: Chat) => {
        if (!chat) {
          ShowToastMessage('Message is not sent');
          return;
        }
        LoadOldMessages(SenderChatId, ReceiverChatId, BrnachId, 0, false);
      });
    }
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
  const Approve = async (msg: string) => {
    console.log('SplitMsg', msg);
    var AcceptRejectResponse = await ERESApi.JAcceptReject(msg);
    console.log('AcceptRejectResponse: ', AcceptRejectResponse);

    Alert.alert(AcceptRejectResponse.data);
  };

  var MessageList = chatUserOptions.AllUserList.find(
    i => i.lId == SecondUser.lId,
  )?.AllChatOneToOneList;

  // useEffect(() => {
  //   console.log("Current data lenth changed", MessageList.length)
  // }, [MessageList?.length])

  var lastMessage = MessageList?.length ? MessageList[0] : undefined;

  console.log(
    're-render one to one chat page of ' + SecondUser?.userName,
    MessageList?.length,
  );

  return (
    <SafeAreaView
      style={{flexDirection: 'column', flex: 1, flexWrap: 'nowrap'}}>
      <View style={localStyle.header}>
        <TouchableOpacity
          onPress={() => {
            ReduxDataHelper.UpdateOneToOneUserStatus(dispatch);
            if (navigation.canGoBack()) {
              navigation.goBack();
            }
          }}>
          <Image
            source={require('../../../assets/backimg.png')}
            style={{height: 20, width: 20, marginLeft: 10}}
          />
        </TouchableOpacity>
        <View style={{width: '55%'}}>
          <Text style={localStyle.title}>{SecondUser?.userFullName}</Text>
          <Text
            style={{
              ...localStyle.subtitle1,
              color: SecondUser?.isUserLive ? '#0383FA' : '#E4B27E',
            }}>
            {SecondUser?.isUserLive ? 'Online' : 'Offline'}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            width: '35%',
            justifyContent: 'center',
          }}>
          <TouchableOpacity
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [
                  {name: 'MapPage', params: {ReceiverId: ReceiverChatId}},
                ],
              });
            }}>
            <Image
              source={require('../../../assets/location.png')}
              style={{height: 30, width: 23.5, marginRight: 10, marginTop: 3}}
            />
          </TouchableOpacity>
          <UserProfileScreen
            userName={UserInfo?.userName ?? ''}
            Admin={false}
            GroupId={0}
          />
        </View>
      </View>
      <View style={{height: '89%', backgroundColor: '#FFFFFF'}}>
        <ProgressBar visible={isPageRefreshing} indeterminate />
        <FlatList
          automaticallyAdjustKeyboardInsets
          data={MessageList}
          keyExtractor={i => i.lSrId + ''}
          onEndReachedThreshold={0.8}
          inverted
          onEndReached={async () => {
            var nextIndex = currentIndex + 1;
            await LoadOldMessages(
              undefined,
              undefined,
              undefined,
              nextIndex,
              true,
            );
          }}
          renderItem={data => {
            var tempChat = data.item;
            var isSenderIsSecondUser = tempChat.lSenderId == SecondUser.lId;
            var userName = isSenderIsSecondUser ? SecondUser.userName : '';
            var MsgSplit = tempChat.sMsg.split('||');

            if (!tempChat.bStatus) {
              tempChat.bStatus = true;
              dispatch(
                OneToOneChatOptions.actions.UpdateOneToOneChat(tempChat),
              );
              SignalRApi.ReadMsg(SecondUser.lId);
            }
            return (
              <View key={tempChat.lSrId + tempChat.GroupName}>
                {tempChat.GroupName && (
                  <View>
                    <Text
                      style={{
                        marginEnd: 10,
                        alignSelf: 'center',
                        alignItems: 'center',
                      }}>
                      {tempChat.GroupName}
                    </Text>
                  </View>
                )}

                <View
                  style={{
                    flexDirection: isSenderIsSecondUser ? 'row' : 'row-reverse',
                    marginTop: MsgSplit.length == 2 ? 0 : 10,
                    marginLeft: 10,
                    marginRight: 10,
                    marginBottom: MsgSplit.length == 2 ? 0 : null,
                  }}>
                  {tempChat.lSenderId == SecondUser.lId ? (
                    <View style={localStyle.messagefromicon}>
                      <Text
                        style={{
                          color: '#000',
                          flex: 1,
                          fontSize: 15,
                          textAlign: 'center',
                        }}>
                        {userName.toLocaleUpperCase().charAt(0)}
                      </Text>
                    </View>
                  ) : null}
                  <List.Item
                    style={
                      MsgSplit.length == 2
                        ? {
                            paddingRight: 0,
                            paddingVertical: 0,
                            marginVertical: 8,
                          }
                        : {
                            paddingVertical: 6,
                            borderRadius: 6,
                            backgroundColor: isSenderIsSecondUser
                              ? ColorCode.DimGray
                              : ColorCode.LightOrange,
                            marginLeft: 10,
                            maxWidth: '80%',
                            marginVertical: 8,
                          }
                    }
                    title={
                      MsgSplit.length == 2 ? (
                        <View
                          style={{
                            flexDirection: 'row',
                            gap: 5,
                          }}>
                          <TouchableOpacity
                            onPress={() => Approve(MsgSplit[0])}>
                            <Text style={localStyle.buttontest}>
                              <Text style={localStyle.ApproveRejectText}>
                                Approve
                              </Text>
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => Approve(MsgSplit[1])}>
                            <Text style={localStyle.rejectbuttontest}>
                              <Text style={localStyle.ApproveRejectText}>
                                Reject
                              </Text>
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        tempChat.sMsg
                      )
                    }
                    titleNumberOfLines={0}
                    titleStyle={{
                      color: isSenderIsSecondUser
                        ? ColorCode.Black
                        : ColorCode.DrakOrange,
                      fontSize: 15,
                      fontFamily: 'OpenSans-Regular',
                    }}
                    right={() => {
                      if (!tempChat.lAttchId) return <></>;
                      if (singleFileDownloadId == tempChat.lAttchId)
                        return (
                          <ActivityIndicator size={30}></ActivityIndicator>
                        );
                      return (
                        <MCIcon
                          size={30}
                          style={{marginLeft: 5}}
                          name="download-circle-outline"
                          onPress={async () => {
                            var dataReceived = await DownloadFile(tempChat);
                            console.log('dataReceived', dataReceived);
                            if (!dataReceived) {
                              return;
                            }

                            dataReceived = Object.assign(
                              {...tempChat},
                              dataReceived,
                            );
                            console.log('dataReceived', dataReceived);

                            ShowToastMessage('Downloaded');
                            dispatch(
                              OneToOneChatOptions.actions.UpdateOneToOneChat(
                                dataReceived,
                              ),
                            );
                          }}
                        />
                      );
                    }}
                  />
                </View>
                {/* {tempChat.AttachmentType == 'Image' && (
                  <View  >
                    <Image
                      source={{ uri: "file:///" + tempChat.AttahmentLocalPath! }}
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
                    marginLeft: isSenderIsSecondUser ? '16%' : 11,
                    marginRight: 10,
                    marginTop: MsgSplit.length == 2 ? -5 : null,
                  }}>
                  <Text style={{fontSize: 12, color: '#a6a6a6'}}>
                    {UIHelper.GetTimeStamp(tempChat.dtMsg)}
                  </Text>
                </View>
              </View>
            );
          }}></FlatList>
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
              onChangeText={setNewSendMessage}
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
    </SafeAreaView>
  );
};
export default OneToOneChatPage2;

const localStyle = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF', // Lighter blue header
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: 'black',
  },
  subtitle1: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
  },
  container: {
    flexGrow: 1,
  },

  fab: {
    position: 'absolute',
    right: 25,
    bottom: 25,
  },
  fabAttchemnt: {
    right: 60,
    bottom: 30,
    position: 'absolute',
    zIndex: 100,
  },
  input: {
    alignSelf: 'center',
    backgroundColor: '#F1F1F1',
    borderColor: '#F1F1F1',
    fontFamily: 'OpenSans-Regular',
    width: '100%',
  },
  ApproveRejectText: {
    color: 'white',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  buttontest: {
    alignSelf: 'center',
    backgroundColor: '#0383FA',
    color: 'white',
    borderRadius: 5,
    height: 35,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  rejectbuttontest: {
    alignSelf: 'center',
    backgroundColor: 'red',
    color: 'white',
    borderRadius: 5,
    height: 35,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  messagefromicon: {
    backgroundColor: '#E9E9E9',
    width: 30,
    height: 30,
    borderRadius: 50,
    padding: 5,
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 15,
  },
});
