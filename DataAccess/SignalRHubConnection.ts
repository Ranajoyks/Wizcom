import * as signalR from '@microsoft/signalr';
import BaseApi from './BaseApi';
import SessionHelper from '../Core/SessionHelper';

import { ChatUser } from '../Entity/ChatUser';
import { Chat, cMsgFlagType } from '../Entity/Chat';
import UIHelper from '../Core/UIHelper';
import { GroupChat } from '../Entity/GroupChat';
import { Notification } from '../Entity/Notification';

export class SignalRHubConnection {




  public static connectionErrorMessage = 'SignalR connection is down';
  private static _connection: signalR.HubConnection;
  private static _chatId: string;

  private static async GetChatId() {
    if (SignalRHubConnection._chatId) {
      return SignalRHubConnection._chatId;
    }
    SignalRHubConnection._chatId = (await SessionHelper.GetChatId()) ?? '';
    return SignalRHubConnection._chatId;
  }

  private static async HandleConnectionState(_tempConnection: signalR.HubConnection): Promise<signalR.HubConnection> {
    return new Promise((resolve, reject) => {
      switch (_tempConnection.state) {
        case signalR.HubConnectionState.Disconnected:
          _tempConnection.start().then(res => {
            SignalRHubConnection._connection = _tempConnection;
            return resolve(_tempConnection);
          });
          break;
        case signalR.HubConnectionState.Disconnecting:
          _tempConnection.onclose = () => {
            _tempConnection.start().then(res => {
              _tempConnection.onclose = () => { } //setting it not to recursively call connection
              SignalRHubConnection._connection = _tempConnection;
              return resolve(_tempConnection);
            });
          };
          break;
        default:
          return resolve(SignalRHubConnection._connection);
          break;
      }
    });
  }

  private static async GetConnection(tempChatId?: string): Promise<signalR.HubConnection> {
    var _tempConnection: signalR.HubConnection;
    if (SignalRHubConnection._connection) {
      _tempConnection = SignalRHubConnection._connection;
    } else {
      var chatId = tempChatId
      if (tempChatId) {
        this._chatId = tempChatId
      }
      if (!chatId) {
        chatId = await SignalRHubConnection.GetChatId();
      }
      var connectionId = BaseApi.BaseUrlSignalR + `chatHub?UserId=${chatId}`
      console.log("HubConnectionUrl", connectionId)
      _tempConnection = new signalR.HubConnectionBuilder()
        .withUrl(connectionId)
        .withAutomaticReconnect()
        .build();

      //_tempConnection.keepAliveIntervalInMilliseconds = 5000
      _tempConnection.onclose((err) => {
        console.log("OnConnectionClose", err)
      })

      _tempConnection.on("error", (error) => {
        console.log("Onerror", error)
      })
    }

    var resolveStateConnection = await SignalRHubConnection.HandleConnectionState(_tempConnection)

    SignalRHubConnection._connection = resolveStateConnection;
    return resolveStateConnection

  }

  public static async GetUserList(): Promise<ChatUser[]> {
    var connection = await SignalRHubConnection.GetConnection();
    var chatId = await SignalRHubConnection.GetChatId();
    //console.log("GetAllUser chatId-->", chatId);

    var res = await connection.invoke<ChatUser[]>('GetAllUser', chatId, 0);
    var onlineUsers = res.filter(i => i.isUserLive)
    console.log("live users", onlineUsers);
    return res

  }


  public static async IsConnected(): Promise<boolean> {
    var connection = await SignalRHubConnection.GetConnection();
    var chatId = await SignalRHubConnection.GetChatId();
    var res = await connection.invoke<boolean>('IsUserConnected', chatId);
    console.log("IsConnected res", res)
    return res != undefined
  }
  public static async IsDisconnected(): Promise<boolean> {
    var connection = await SignalRHubConnection.GetConnection();
    var chatId = await SignalRHubConnection.GetChatId();
    return connection.invoke<boolean>('DisconnectUser', chatId);
  }
  public static async JoinChat(chatId?: string): Promise<never> {
    if (!chatId) {
      chatId = await SignalRHubConnection.GetChatId();
    }
    var connection = await SignalRHubConnection.GetConnection(chatId);
    //console.log("JoinChat chatId" + chatId);

    return await connection.invoke('JoinChat', chatId);
  }
  public static async OnReceiveMessege(callback: (newMessage: Chat) => void) {
    var connection = await SignalRHubConnection.GetConnection()
    connection.on("ReceiveMessage", (senderId: string, Receiverid: string, message: string, proxySrId: number) => {
      var newChat = SignalRHubConnection.GetProxyChatMessage(senderId, Receiverid, message, proxySrId, false)
      callback(newChat)
    })
  }

  public static GetProxyChatMessage(senderId: string, Receiverid: string, message: string, proxySrId: number
    , MarkAsRead: boolean): Chat {
    var newChat: Chat = {} as Chat;
    var utcDate = UIHelper.ISTToUTCDate(new Date()).toISOString()

    newChat.dtMsg = utcDate
    newChat.lSenderId = parseInt(senderId.split('_')[1])
    newChat.lReceiverId = parseInt(Receiverid.split('_')[1])
    newChat.sMsg = message
    newChat.lSrId = proxySrId ?? UIHelper.GetProxySrId();
    newChat.bStatus = MarkAsRead
    newChat.IsKsProxy = true
    return newChat
  }
  public static GetProxyNotificationChatMessage(senderId: string, Receiverid: string, message: string, proxySrId: number,
    MarkAsRead: boolean): Notification {
    var newChat: Notification = {} as Notification;
    var utcDate = UIHelper.ISTToUTCDate(new Date()).toISOString()

    newChat.dtMsg = utcDate
    newChat.lSenderId = parseInt(senderId.split('_')[1])
    newChat.lReceiverId = parseInt(Receiverid.split('_')[1])
    newChat.sMsg = message
    newChat.lSrId = proxySrId ?? UIHelper.GetProxySrId();
    newChat.bStatus = MarkAsRead
    newChat.IsKsProxy = true
    return newChat
  }
  public static GetProxyGroupChatMessage(
    senderId: string,
    userName: string,
    groupName: string,
    AttachmentID: number,
    message: string,
    proxySrId: number,
    MarkAsRead: boolean): GroupChat {
    var newChat: GroupChat = {} as GroupChat;
    var utcDate = UIHelper.ISTToUTCDate(new Date()).toISOString()


    newChat.dtMsg = utcDate
    newChat.lSenderId = parseInt(senderId.split('_')[1])
    newChat.userName = userName
    newChat.groupName = groupName.split('_')[0]
    newChat.groupId = parseInt(groupName.split('_')[1])
    newChat.lAttchId = AttachmentID
    newChat.sMsg = message
    newChat.lSrId = proxySrId ?? UIHelper.GetProxySrId();
    newChat.bStatus = true
    newChat.IsKsProxy = true
    return newChat
  }

  public static async SendMessage(
    BrnachId: number,
    SenderId: string,
    receiverId: string,
    Message: string,
    cMsgFlag: cMsgFlagType,
    itype: number
  ): Promise<Chat | undefined> {

    console.log(BrnachId, SenderId, receiverId, Message, cMsgFlag, itype)

    var connection = await SignalRHubConnection.GetConnection();

    return new Promise((resolve, reject) => {
      connection.invoke
        (
          'SendMessage',
          BrnachId,
          SenderId,
          receiverId,
          Message,
          cMsgFlag,
          1
        ).
        then(res => {
          console.log("SendMessageResponse", res)
          var chat = SignalRHubConnection.GetProxyChatMessage(SenderId, receiverId, Message, res?.data, false)
          resolve(chat)
        }
        )
        .catch((err) => { console.log(err); resolve(undefined) })
    })
  }
  public static async SendGroupMessage(
    chat: GroupChat, ChatId: string
  ): Promise<GroupChat | undefined> {

    //console.log(BrnachId, SenderId, receiverId, Message)

    var data1 = {
      companyId: chat.lCompId!,
      fromUserId: ChatId,
      groupName: chat?.groupName!,
      AttachmentId: chat.lAttchId,
      message: chat.sMsg,
      userName: chat.userName
    }
    var connection = await SignalRHubConnection.GetConnection();

    return new Promise((resolve, reject) => {
      connection.invoke
        (
          'sendgroupmessage',
          data1
        ).
        then(res => {
          resolve(chat)
        }
        )
        .catch((err) => { console.log(err); resolve(undefined) })
    })
  }
  public static async Disconnect() {
    var connection = await SignalRHubConnection.GetConnection();
    var chatId = await SignalRHubConnection.GetChatId();
    var log = connection.invoke('DisconnectUser', chatId);
    console.log("Disconnect User", log)
    return log != null
  }

  // public static async ReceiveAttachment(): Promise<ReceiveAttachment> {
  //     var connection = await SignalRHubConnection.GetConnection()
  //     return connection.on<ReceiveAttachment>("ReceiveAttachment")
  // }

  public static async OnReceiveGroupMessage(callback: (newMessage: GroupChat) => void) {
    var connection = await SignalRHubConnection.GetConnection()
    connection.on("ReceiveGroupMessage", (senderId: string,
      userName: string,
      groupName: string,
      AttachmentID: number,
      message: string, proxySrId: number) => {
      var newChat = SignalRHubConnection.GetProxyGroupChatMessage(senderId, userName, groupName, AttachmentID, message, proxySrId, false)
      callback(newChat)
    })
  }


  public static async JoinGroupChat(GroupName: string, GroupID: number): Promise<boolean> {
    var connection = await SignalRHubConnection.GetConnection()

    return connection.invoke<boolean>("JoinChat", `${GroupName}_${GroupID}`)
  }
  // public static async ReceiveGroupMessage(): Promise<ReceiveGroupMessage> {
  //     var connection = await SignalRHubConnection.GetConnection()
  //     return connection.on<ReceiveGroupMessage>("ReceiveGroupMessage")
  // }
}
