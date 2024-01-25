import { ActionSheet } from "native-base";
import { ConfirmBoxResult, ConstantMessage } from "./Index";

export default class UIHelper {

    public static async   TimeAgo (timeAgo:any) {
      var self:any = {};
      
      // Public Methods
      self.locales = {
        prefix: '',
        sufix:  'ago',
        
        seconds: 'less than a minute',
        minute:  'about a minute',
        minutes: '%d minutes',
        hour:    'about an hour',
        hours:   'about %d hours',
        day:     'a day',
        days:    '%d days',
        month:   'about a month',
        months:  '%d months',
        year:    'about a year',
        years:   '%d years'
      };
      
      self.inWords = ()=> {
        var seconds = Math.floor((new Date() as any - parseInt(timeAgo)) / 1000),
            separator = self.locales.separator || ' ',
            words = self.locales.prefix + separator,
            interval = 0,
            intervals:any = {
              year:   seconds / 31536000,
              month:  seconds / 2592000,
              day:    seconds / 86400,
              hour:   seconds / 3600,
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
  
    public static async LogTime(Module:"GetUser"|"ABC",Mode:"Start"|"End", url:string){
      console.log(`TimeTest: ${Module} ${Mode} at-> ${new Date()}: on url ${url}`)
    }
    public static async ShowConfirmBox(Title: string): Promise<ConfirmBoxResult> {
        return this.ShowConfirmBoxDetail(Title, ConstantMessage.DefaultConfirmBoxYesButtonText, ConstantMessage.DefaultConfirmBoxNoButtonText)
      }
      public static async ShowConfirmBoxDetail(Title: string, OkButtonText: string, CancelButtonText: string): Promise<ConfirmBoxResult> {
    
        return new Promise((resolve, reject) => {
          var BUTTONS = [
            {text: OkButtonText, icon: 'checkmark', iconColor: 'green'},
            {text: CancelButtonText, icon: 'close', iconColor: 'red'},
          ];
      
          ActionSheet.show(
            {
              options: BUTTONS,
              cancelButtonIndex: 1,
              destructiveButtonIndex: 1,
              title: Title,
            },
            (buttonIndex) => {
              
            var result = ConfirmBoxResult.Cancel;
            if (BUTTONS[buttonIndex].text === OkButtonText) {
              result = ConfirmBoxResult.OK
            }
            resolve(result)
            },
          ); 
        })
    
      }
    
}