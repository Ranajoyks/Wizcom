export default class KSUtility {


    public static IsNullOrEmpty(data: string): boolean {
        return (data === undefined || data === null || data === "");
    }

    public static GetValueIfNotNull(data: any, replaceValue: any): any {
        if (data === undefined || data === null || data === "") {
            return replaceValue
        }

        return data
    }
    public static IsEmpty<T>(data?: T[]): boolean {
        return (data === undefined || data === null || data.length == 0);
    }

    public static LogUnexpcted(message?: string) {
        console.error(message ?? "data is empty, this should not happen");
    }
}