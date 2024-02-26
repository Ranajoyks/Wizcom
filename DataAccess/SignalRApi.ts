import SessionHelper from '../Core/SessionHelper';
import UIHelper from '../Core/UIHelper';
import { Chat } from '../Entity/Chat';
import { ChatUser } from '../Entity/ChatUser';
import { Member } from '../Entity/CreateGroup';
import { CreateGroupMember } from '../Entity/CreateGroupMember';
import { Group, GroupMember } from '../Entity/Group';
import { GroupChat } from '../Entity/GroupChat';
import { GroupDetails } from '../Entity/GroupDetails';
import { KSResponse } from '../Entity/JInitializeResponse';
import { Notification } from '../Entity/Notification';
import { NotificationUser } from '../Entity/NotificationUser';
import User from '../Entity/User';
import BaseApi from './BaseApi';

export default class SignalRApi extends BaseApi {

  public static async GetERESServiceUrl(): Promise<string> {
    return (await BaseApi.getFinalUrl('ERES', '', false)).replace(
      '/api',
      '',
    );
  }

  public static async UserSetDetail(): Promise<KSResponse<boolean>> {
    var tempUrl = await this.GetERESServiceUrl()

    var companyID = await SessionHelper.GetCompanyID();
    var ChatId = await SessionHelper.GetChatId();

    const Data = JSON.stringify({
      userId: ChatId,
      url: tempUrl,
      session: await SessionHelper.GetSessionId(),
      code: companyID,
    });

    console.log('user/set', Data);

    return this.Post('SignalR', 'user/set', Data);
  }
  public static UserSetDevice(userData: string): Promise<KSResponse<boolean>> {
    return this.Post('SignalR', 'user/device', userData);
  }
  public static async ConectUser(chatid: string): Promise<KSResponse<User[]>> {
    return await this.Get('SignalR', 'user?userId=' + chatid);
  }
  public static async MarkTalkingTrue(data: {
    FromUserId: string;
    ToUserId: string;
    IsTaking: boolean;
  }): Promise<KSResponse<User[]>> {
    var talkData = JSON.stringify(data);
    return await this.Post('SignalR', 'user/taking', talkData);
  }
  public static async MarkTalkingFalse(data: {
    FromUserId: string;
    ToUserId: string;
    IsTaking: boolean;
  }): Promise<KSResponse<User[]>> {
    data.ToUserId = '0';
    var talkData = JSON.stringify(data);
    return await this.Post('SignalR', 'user/taking', talkData);
  }
  public static async GetUsersWithMessage(
    SenderID: string,
    CompanyId: number,
  ): Promise<KSResponse<ChatUser[]>> {
    //`User/readmessage?companyId=${BranchID}&senderId=${SenderID}&receiverId=${ReceiverID}&lastLSrid=${lSrid}`,
    return await this.Get(
      'SignalR',
      `User/GetUsersWithMessage?userId=${SenderID}&companyId=${CompanyId}`,
    );
  }
  public static async GetAllMessage(
    BranchID: string,
    SenderID: string,
    ReceiverID: string,
    PageNumber: number,
  ): Promise<KSResponse<Notification[]>> {
    //`User/readmessage?companyId=${BranchID}&senderId=${SenderID}&receiverId=${ReceiverID}&lastLSrid=${lSrid}`,
    return await this.Get(
      'SignalR',
      `User/readmessage?companyId=${BranchID}&senderId=${SenderID}&receiverId=${ReceiverID}&pageNo=${PageNumber}`,
    );
  }
  public static async SetLocation(LocationData: {
    UserId?: string;
    Lat?: string;
    Long?: string;
  }): Promise<KSResponse<boolean>> {
    return await this.Post('SignalR', 'user/location', LocationData);
  }
  public static async FileUpload(FileUploadData: {
    CompanyId?: number;
    FromUserId?: string;
    ToUserId?: string;
    ConnectionId?: string;
    AttachmentId?: number;
    FileName?: string;
    Message?: string;
  }): Promise<KSResponse<boolean>> {
    return await this.Post('SignalR', 'user/sendfile', FileUploadData);
  }
  public static async GetAllGroup(): Promise<KSResponse<Group[]>> {
    var chatId = await SessionHelper.GetChatId();
    return await this.Get('SignalR', 'user/getgroup?userId=' + chatId);
  }
  public static async GetAllGroupMsg(
    chatid: string,
    BrnachId: number,
    GroupId: number,
    PageNumber: number,
  ): Promise<KSResponse<GroupChat[]>> {
    return await this.Get(
      'SignalR',
      `User/readgroupmessage?companyId=${BrnachId}&userId=${chatid}&groupId=${GroupId}&page=${PageNumber}`,
    );
  }
  public static async GetGroupDetails(
    chatid: string,
    GroupId: number,
  ): Promise<KSResponse<{ group: Group }>> {
    return await this.Get(
      'SignalR',
      `user/groupdetail?userId=${chatid}&groupId=${GroupId}`,
    );
  }
  public static async SendGroupMsg(SendMSgOption: {
    companyId: string;
    fromUserId: string;
    userName: string;
    message: string;
    groupName: string;
  }): Promise<KSResponse<boolean>> {
    return await this.Post('SignalR', `user/sendgroupmessage`, SendMSgOption);
  }
  public static async ReadMsg(ReadMsgOption: {
    companyid?: string;
    senderId?: string;
    receiverId?: string;
  }): Promise<KSResponse<boolean>> {
    return await this.Put('SignalR', `user`, ReadMsgOption);
  }
  public static async GetNewGroupDetails(
    chatid: string,
    GroupId: number,
  ): Promise<KSResponse<GroupDetails>> {
    return await this.Get(
      'SignalR',
      `user/groupdetail?userId=${chatid}&groupId=${GroupId}`,
    );
  }
  public static async GetAllUserNotification(
    SenderID: string,
    CompanyId: number,
  ): Promise<KSResponse<NotificationUser[]>> {
    //`User/readmessage?companyId=${BranchID}&senderId=${SenderID}&receiverId=${ReceiverID}&lastLSrid=${lSrid}`,
    return await this.Get(
      'SignalR',
      `user/getnotification?companyId=${CompanyId}&userId=${SenderID}`,
    );
  }
  public static async CreateGroup(
    GroupName: string,
    selectedUserList: ChatUser[],
  ): Promise<KSResponse<Group>> {
    var companyID = await SessionHelper.GetCompanyID();
    var ChatId = await SessionHelper.GetChatId();

    var data: CreateGroupMember[] = selectedUserList.map(i => {
      var cgm: CreateGroupMember = {
        memberId: UIHelper.GetChatIdSync(i.lId, companyID!),
      };
      return cgm;
    });

    // var data: CreateGroupMember[] = []
    // selectedUserList.forEach(async i => {
    //   var cgm: CreateGroupMember = {
    //     memberId: await UIHelper.GetChatId(i.lId)
    //   };
    //   data.push(cgm)
    // })

    var reqModel = {
      companyId: companyID,
      creatorId: ChatId,
      groupName: GroupName,
      members: data,
    };

    console.log('CreateGroup', reqModel);

    return await this.Post('SignalR', `user/creategroup`, reqModel);
  }
  public static async AddGroupMember(
    GroupID: number,
    selectedUserList: ChatUser[],
  ): Promise<KSResponse<boolean>> {
    var companyID = await SessionHelper.GetCompanyID();
    var ChatId = await SessionHelper.GetChatId();

    var data: CreateGroupMember[] = selectedUserList.map(i => {
      var cgm: CreateGroupMember = {
        memberId: UIHelper.GetChatIdSync(i.lId, companyID!),
      };
      return cgm;
    });
    var reqModel = {
      userId: ChatId,
      groupId: GroupID,
      members: data,
    };
    console.log('AddMember', reqModel);
    return await this.Post('SignalR', `user/addmember`, reqModel);
  }
  public static async DeleteGroupMember(
    GroupID: number,
    selectedUserList: GroupMember[],
  ): Promise<KSResponse<boolean>> {
    var companyID = await SessionHelper.GetCompanyID();
    var ChatId = await SessionHelper.GetChatId();

    var data: CreateGroupMember[] = selectedUserList.map(i => {
      var cgm: CreateGroupMember = {
        memberId: UIHelper.GetChatIdSync(parseInt(i.memberId), companyID!),
      };
      return cgm;
    });
    var reqModel = {
      userId: ChatId,
      groupId: GroupID,
      members: data,
    };
    console.log('DeleteMember', reqModel);
    return await this.Post('SignalR', `user/deletemember`, reqModel);
  }
  public static async DeleteGroup(
    GroupID: number,
  ): Promise<KSResponse<boolean>> {
    var companyID = await SessionHelper.GetCompanyID();
    var ChatId = await SessionHelper.GetChatId();

    return await this.Get(
      'SignalR',
      `user/deletegroup?userId=${ChatId}&groupId=${GroupID}`,
    );
  }
}
