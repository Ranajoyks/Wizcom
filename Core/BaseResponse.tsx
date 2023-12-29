interface IBaseResponse<T>{ 
    IsSessionExpired:boolean;   
    IsSuccess:boolean;
    Data?:T;
    Errors:ErrorMessage[];
    Message:string;
}
export enum ErrorType {
    Error,
    Warning,
    Info,
    Success
}
export interface IErrorMessage {
    FieldName? :string;
    Message :string;
    AdditionInfo? :string|null;
    ErrorType:ErrorType;
}
export class BaseResponseCore<T>{
    IsSessionExpired:boolean;
    IsSuccess:boolean;
    Data?:T;
    Errors:ErrorMessage[];
    Message:string;
    constructor(data:IBaseResponse<T>= { IsSessionExpired:false,IsSuccess:false,Data:{} as T, Errors:[], Message:""}){        
        this.IsSessionExpired=data.IsSessionExpired;
        this.IsSuccess=data.IsSuccess;
        this.Data=data.Data; 
        this.Errors=data.Errors||[];
        this.Message=data.Message;
    } 
}
export default class BaseResponse extends BaseResponseCore<object>{      
    constructor(data:IBaseResponse<object>= { IsSessionExpired:false,IsSuccess:false,Data:{}, Errors:[], Message:""}){
        super(data);        
    } 
}

export class ErrorMessage {
    Key:string;
    FieldName? :string;
    Message :string;
    AdditionInfo? :object|null;
    ErrorType:ErrorType;

    constructor(data:IErrorMessage= {AdditionInfo:null,FieldName:undefined, Message:"", ErrorType:ErrorType.Error}){
        this.Key= Math.random().toString(36).substr(2, 5);        
        this.FieldName=data.FieldName;
        this.Message=data.Message;
        this.AdditionInfo=data.AdditionInfo;
        this.ErrorType=data.ErrorType;
        //console.log(this.Key)
    }
}

