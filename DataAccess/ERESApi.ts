import axios from 'axios';
import BaseApi from './BaseApi';
import {
  JAttachmentResponse,
  JAutoLoginResponse,
  JCheckSession,
  JConnectResponse,
  JInitializeResponse,
  JOpnCmpnyResponse,
  JValidateResponse,
  UploadAttachmentResposne,
} from '../Entity/JInitializeResponse';

export default class ERESApi extends BaseApi {
  public static GetCompanyDetailJConnect(model: {
    sCode: any;
    dtOffSet: number;
    cPlatForm: string;
  }): Promise<JConnectResponse> {
    return this.Post('ERES', `Sys/Sys.aspx/JConnect`, model);
  }

  public static async GetCompanyArrayJInitialize(): Promise<JInitializeResponse> {
    return await this.Post('ERES', `Sys/Sys.aspx/JInitialize`, {});
  }
  public static async JCheckSession(): Promise<JCheckSession> {
    return await this.Post('ERES', `Sys/Sys.aspx/JCheckSession`, {});
  }
  public static async JOpnCmpny(model: {
    lCompId: number;
    lOffSet: string;
  }): Promise<JOpnCmpnyResponse> {
    return await this.Post('ERES', `Sys/Sys.aspx/JOpnCmpny`, model);
  }
  public static async JValidate(model: {
    objUsr: { sName?: string; sCode?: string };
  }): Promise<JValidateResponse> {
    return await this.Post('ERES', `Sys/Sys.aspx/JValidate`, model);
  }
  public static async UploadAttachment(
    model: FormData,
  ): Promise<UploadAttachmentResposne> {
    return await this.PostFile('ERES', `Sys/Handler2.ashx`, model);
  }
  public static async DownloadAttachment(AttachmentId: number): Promise<JAttachmentResponse> {
    return await this.Post('ERES', 'SYS/Sys.aspx/JGetAttch', {
      lId: AttachmentId,
    });
  }
  public static async JAutoLogin(AutologinData: {
    sConn: string;
    dOffSet: number;
    cPlatForm: string;
    lUsrId: number;
    lCompId: number;
  }): Promise<any> {
    return await this.Post('ERES', `Sys/Sys.aspx/JAutoLogin`, AutologinData);
  }
  public static async JAcceptReject(ApproveRejectText: string): Promise<any> {
    return await this.Get('ERES', `${ApproveRejectText}`);
  }
}
