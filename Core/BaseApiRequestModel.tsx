// import SessionHelper from "./SessionHelper";

export default class BaseApiRequestModel{
    ApiToken:string="";
    EntityId:string="";

    public static async GetRequestModel():Promise<BaseApiRequestModel>{
        var model= new BaseApiRequestModel();
        // var session= await SessionHelper.GetSession();
        // if(session){
        //     model.ApiToken=session.ApiToken;
        // }

        return model;
    }
}