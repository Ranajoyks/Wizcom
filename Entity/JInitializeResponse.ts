import { Branch } from "./Branch"
import User from "./User"

export interface KSResponse<T> {
    data?: T,
    IsKSError: boolean,
    ErrorInfo?: string
}

export interface JResponse<T> extends KSResponse<{ d: ApiDataResponseBase<T> }> {
}

export interface JResponseCore<T> extends KSResponse<{ d: ApiDataResponseCore<T> }> {
}

export interface JInitializeResponse extends JResponse<Company[]> {

}

export interface JConnectResponse extends JResponse<never> {

}
export interface JValidateResponse extends JResponse<Branch[]> {

}

export interface JAttachmentResponse extends JResponseCore<{ mAttch: any }> {

}

export interface JOpnCmpnyResponse extends KSResponse<{
    d: ApiDataResponseBase<string> & {
        obj: {
            lUsrId: number
            lCompId: number
            sConnCode: string
            sSessionId: string,
        }
    }
}> {
}

export interface JCheckSession extends KSResponse<{
    d: ApiDataResponseBase<string> & {
        obj: string
    }
}> {

}

export interface ApiDataResponseCore<T> {
    __type: string
    bStatus: boolean
    cError: string
    data: T
}

export interface ApiDataResponseBase<T> {
    __type: string
    bStatus: boolean
    cError: string
    data: Data<T>
}

export interface Data<T> {
    ado: T
}

export interface Company {
    CODE: string
    NAME: string
}

export interface JoinChatResponse {
    _h: number;
    _i: number;
    _j?: any;
    _k?: any;
}

export interface UploadAttachmentResposne extends
    KSResponse<{ lAttchId: number; sFileName: string }> {

}
export interface JAutoLoginResponse {
    ErrorInfo: string
    IsKSError: boolean
    data: JAutoLoginResponseData
}

export interface JAutoLoginResponseData {
    d: D
}


export interface D {
    __type: string
    bStatus: boolean
    cError: string
    data: any
    obj: any
}