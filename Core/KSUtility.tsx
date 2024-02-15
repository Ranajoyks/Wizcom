export default class KSUtility{
    

    public static IsNullOrEmpty(data:string):boolean{
        return (data===undefined || data===null || data==="");
    }

    public static GetValueIfNotNull(data:any,replaceValue):any{
        if (data===undefined || data===null || data===""){
            return replaceValue
        }

        return data
    }
}