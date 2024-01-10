import {format, parseISO} from 'date-fns';
// import Service from '../Entity/Service';
import moment from 'moment';

export default class EntityHelperService {
  public static IsOfferPercentageAvaialble(productItem: any): boolean {
    return (
      productItem.ActualPrice !== productItem.ActualPrice &&
      productItem.GSTAmount !== undefined &&
      productItem.ActualPrice !== 0 &&
      !isNaN(productItem.ActualPrice)
    );
  }

  public static ConvertList<U, T>(
    OrderList: U[] | undefined,
    customConverstion: (obj: T) => void,
  ): T[] {
    var dataList: T[] = [];
    if (!OrderList) {
      return dataList;
    }

    OrderList.forEach(obj => {
      var tempExt = obj as unknown as T;
      customConverstion(tempExt);
      dataList.push(tempExt);
    });
    return dataList;
  }
  public static ToDdMmmYyyy(date: Date): string {
    if (!date) {
      return '';
    }
    return format(parseISO(date.toString()), 'dd-MMM-yyyy');
  }
  public static ToDdMmmYyyyHhMmSs(date: any): string {
    if (!date) {
      return '';
    }
    return format(parseISO(date.toString()), 'dd-MMM-yyyy hh:mm:ss a');
  }
  public static convertUTCDateToLocalDate(date: any) {
    var newDate = new Date(
      date.getTime() + date.getTimezoneOffset() * 60 * 1000,
    );

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);
    // console.log(newDate);
    const formattedDate = moment(newDate.toString()).format('HH:mm');
    return formattedDate;
  }
  public static convertLocalDate(date: any) {
    var newDate = new Date(
      date.getTime() + date.getTimezoneOffset() * 60 * 1000,
    );

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);
    // console.log(newDate);
    const formattedDate = moment(newDate.toString()).format('YYYY-MM-DD');
    return formattedDate;
  }
}
