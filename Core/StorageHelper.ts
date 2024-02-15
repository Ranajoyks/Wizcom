import AsyncStorage from "@react-native-async-storage/async-storage";

export default abstract class StorageHelper {
    protected static async setInternal<T>(module: string, value: T): Promise<void> {
        await AsyncStorage.setItem(module, JSON.stringify(value || ''))
    }

    protected static async getInternal<T>(module: string) {

        var item = await AsyncStorage.getItem(module)
        if (!item) {
            return undefined;
        }
        return JSON.parse(item) as T;
    }
}