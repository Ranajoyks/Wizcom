import { LoaclFileType } from "../Core/LocalFileHelper";

export interface GroupChat {
  bEmlStatus: number;
  bStatus: boolean;
  cMsgFlg: string;
  dtMsg: string;
  lAttchId: number;
  lCompId: number;
  lFromStatusId: number;
  lId: number;
  lRecCompId: number;
  lReceiverId: number;
  lSenderId: number;
  lSrId: number;
  lToStatusId: number;
  lTypId: number;
  sConnId: string;
  sMsg: string;
  userName: string;
  groupName: string;
  groupId: number;

  AllChatGroupChatList?: GroupChat[]

  IsKsProxy?: boolean;
  DayDisplayGroupName: string;
  AttahmentLocalPath?: string;
  AttachmentType?: LoaclFileType;
}
