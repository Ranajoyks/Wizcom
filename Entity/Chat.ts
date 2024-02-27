import { LoaclFileType } from '../Core/LocalFileHelper';

export type cMsgFlagType = 'U' | 'G' | 'F' | 'N';

export interface Chat {
  lId: number;
  lCompId: number;
  sMsg: string;
  lSenderId: number;
  lReceiverId: number;
  sConnId: string;
  dtMsg: string;
  lRecCompId: number;
  cMsgFlg: cMsgFlagType;
  bStatus: boolean;
  lTypId: number;
  lAttchId: number;
  lSrId: number;
  lFromStatusId: number;
  lToStatusId: number;
  bEmlStatus: number;

  IsKsProxy?: boolean;
  GroupName: string;
  AttahmentLocalPath?: string;
  AttachmentType?: LoaclFileType;
}
