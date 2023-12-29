
import AsyncStorage from '@react-native-community/async-storage'




export default class SessionHelper {

    public static SetSession(Customer: string) {
        AsyncStorage.setItem('User', JSON.stringify(Customer))
    }
    public static async GetSession() {
        var item = await AsyncStorage.getItem('User');
        if (!item) {
            return item as unknown as string;
        }
        return JSON.parse(item) as string;
    } 

    // public static SetCitySession(City: any) {
    //     AsyncStorage.setItem('City', JSON.stringify(City))
    // }
    // public static async GetCitySession() {
    //     var item = await AsyncStorage.getItem('City');
    //     if (!item) {
    //         return item as unknown as any;
    //     }
    //     return JSON.parse(item) as any;
    // }


     
}
