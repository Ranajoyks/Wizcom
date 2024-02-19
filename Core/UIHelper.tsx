
import { Picker } from "@react-native-picker/picker";
import { ConfirmBoxResult, ConstantMessage } from "./Index";
import SessionHelper from "./SessionHelper";

export default class UIHelper {

  public static async TimeAgo(timeAgo: any) {
    var self: any = {};

    // Public Methods
    self.locales = {
      prefix: '',
      sufix: 'ago',

      seconds: 'less than a minute',
      minute: 'about a minute',
      minutes: '%d minutes',
      hour: 'about an hour',
      hours: 'about %d hours',
      day: 'a day',
      days: '%d days',
      month: 'about a month',
      months: '%d months',
      year: 'about a year',
      years: '%d years'
    };

    self.inWords = () => {
      var seconds = Math.floor((new Date() as any - parseInt(timeAgo)) / 1000),
        separator = self.locales.separator || ' ',
        words = self.locales.prefix + separator,
        interval = 0,
        intervals: any = {
          year: seconds / 31536000,
          month: seconds / 2592000,
          day: seconds / 86400,
          hour: seconds / 3600,
          minute: seconds / 60
        };

      var distance = self.locales.seconds;

      for (var key in intervals) {
        interval = Math.floor(intervals[key]);

        if (interval > 1) {
          distance = self.locales[key + 's'];
          break;
        } else if (interval === 1) {
          distance = self.locales[key];
          break;
        }
      }

      distance = distance.replace(/%d/i, interval);
      words += distance + separator + self.locales.sufix;

      return words.trim();
    };

    return self;
  };

  public static async LogTime(Module: string, Mode: "Start" | "End") {
    console.log(`TimeTest: ${Module} ${Mode} at-> ${new Date()}`)
  }

  public static async GetChatId(UserId: number) {
    var CompanyId = await SessionHelper.GetCompanyID()
    return `U000${CompanyId}_${UserId}`;
  }
  public static GetProxySrId(lastNumber?: number) {
    return Math.floor(Math.random() * 10000000) + 100000 + (lastNumber ?? 0)
  }
  public static ISTToUTCDate(istDate: Date) {
    return new Date(istDate.getTime() - (5.5 * 60 * 60 * 1000))
  }
  public static UTCtoISTDate(utcDate: string | Date) {
    let d = new Date(utcDate)
    return new Date(d.getTime() + (5.5 * 60 * 60 * 1000))
  }
  public static GetTimeStamp(utcDate: string | Date) {
    let itime = this.UTCtoISTDate(utcDate)
    return `${UIHelper.OnetoTwoDigitString(itime.getHours())}:${UIHelper.OnetoTwoDigitString(itime.getMinutes())}`
  }
  public static OnetoTwoDigitString(number: number) {
    return ("0" + number).slice(-2)
  }
  public static CreateGroupNameFromdate(date: Date) {

    return UIHelper.OnetoTwoDigitString(date.getDate()) +
      "-" + UIHelper.OnetoTwoDigitString(date.getMonth() + 1) +
      "-" + date.getFullYear()
  }


}