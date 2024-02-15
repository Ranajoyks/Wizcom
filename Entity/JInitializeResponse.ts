import { Branch } from "./Branch"
import User from "./User"

export interface KSResponse<T> {
    data?: T,
    IsKSError: boolean,
    ErrorInfo?: string
}

export interface JResponse<T> extends KSResponse<{ d: ApiDataResponseBase<T> }> {
}


export interface JInitializeResponse extends JResponse<Company[]> {

}

export interface JConnectResponse extends JResponse<never> {

}
export interface JValidateResponse extends JResponse<Branch[]> {

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