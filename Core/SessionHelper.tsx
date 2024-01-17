
import AsyncStorage from '@react-native-community/async-storage'




export default class SessionHelper {

    public static SetSession(Customer: any) {
        AsyncStorage.setItem('User', JSON.stringify(Customer))
    }
    public static async GetSession() {
        var item = await AsyncStorage.getItem('User');
        if (!item) {
            return item as unknown as any;
        }
        return JSON.parse(item) as any;
    } 

    public static SetURLSession(URL: any) {
        AsyncStorage.setItem('URL', JSON.stringify(URL))
    }
    public static async GetURLSession() {
        var item = await AsyncStorage.getItem('URL');
        if (!item) {
            return item as unknown as any;
        }
        return JSON.parse(item) as any;
    }
    public static SetUserNameSession(UserName: any) {
        AsyncStorage.setItem('UserName', JSON.stringify(UserName))
    }
    public static async GetUserNameSession() {
        var item = await AsyncStorage.getItem('UserName');
        if (!item) {
            return item as unknown as any;
        }
        return JSON.parse(item) as any;
    }
    public static SetSenderIdSession(SenderId: any) {
        AsyncStorage.setItem('SenderId', JSON.stringify(SenderId))
    }
    public static async GetSenderIdSession() {
        var item = await AsyncStorage.getItem('SenderId');
        if (!item) {
            return item as unknown as any;
        }
        return JSON.parse(item) as any;
    }
    public static SetBranchIdSession(BranchId: any) {
        AsyncStorage.setItem('BranchId', JSON.stringify(BranchId))
    }
    public static async GetBranchIdSession() {
        var item = await AsyncStorage.getItem('BranchId');
        if (!item) {
            return item as unknown as any;
        }
        return JSON.parse(item) as any;
    }
    public static SetDeviceIdSession(DeviceId: any) {
        AsyncStorage.setItem('DeviceId', JSON.stringify(DeviceId))
    }
    public static async GetDeviceIdSession() {
        var item = await AsyncStorage.getItem('DeviceId');
        if (!item) {
            return item as unknown as any;
        }
        return JSON.parse(item) as any;
    }
    public static SetUserDetailsSession(UserDetails: any) {
        AsyncStorage.setItem('UserDetails', JSON.stringify(UserDetails))
    }
    public static async GetUserDetailsSession() {
        var item = await AsyncStorage.getItem('UserDetails');
        if (!item) {
            return item as unknown as any;
        }
        return JSON.parse(item) as any;
    }
    public static SetUserIDSession(UserID: any) {
        AsyncStorage.setItem('UserID', JSON.stringify(UserID))
    }
    public static async GetUserIDSession() {
        var item = await AsyncStorage.getItem('UserID');
        if (!item) {
            return item as unknown as any;
        }
        return JSON.parse(item) as any;
    }
    public static SetFCMTokenSession(FCMToken: any) {
        AsyncStorage.setItem('FCMToken', JSON.stringify(FCMToken))
    }
    public static async GetFCMTokenSession() {
        var item = await AsyncStorage.getItem('FCMToken');
        if (!item) {
            return item as unknown as any;
        }
        return JSON.parse(item) as any;
    }
    public static SetCompanyIDSession(CompanyID: any) {
        AsyncStorage.setItem('CompanyID', JSON.stringify(CompanyID))
    }
    public static async GetCompanyIDSession() {
        var item = await AsyncStorage.getItem('CompanyID');
        if (!item) {
            return item as unknown as any;
        }
        return JSON.parse(item) as any;
    }
    public static SetBranchNameSession(BranchName: any) {
        AsyncStorage.setItem('BranchName', JSON.stringify(BranchName))
    }
    public static async GetBranchNameSession() {
        var item = await AsyncStorage.getItem('BranchName');
        if (!item) {
            return item as unknown as any;
        }
        return JSON.parse(item) as any;
    }


     
}
