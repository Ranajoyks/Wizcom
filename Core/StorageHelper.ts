import AsyncStorage from "@react-native-async-storage/async-storage";
import KSUtility from "./KSUtility";

export default abstract class StorageHelper {
    protected static async setInternal<T>(module: string, value: T): Promise<void> {
        // console.log("module value", module + "--" + value)
        return await AsyncStorage.setItem(module, JSON.stringify(value ?? '')).catch(err => KSUtility.LogUnexpcted(err + ''))
    }

    protected static async getInternal<T>(module: string) {

        var item = await AsyncStorage.getItem(module)
        if (!item) {
            return undefined;
        }
        return JSON.parse(item) as T;
    }
}