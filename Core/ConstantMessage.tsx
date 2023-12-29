// import {AppEnvironmentService, AppName} from '../Page/Service/AppEnvironmentService';

export default class ConstantMessage {
  public static DefaultClearButtonText = 'Clear';
  public static DefaultCreateButtonText = 'Create';
  public static DefaultUpdateButtonText = 'Update';

  public static DefaultColorPrimary: string = 'primary';
  public static DefaultColorDefault: string = 'default';
  public static DefaultColorSecondary: string = 'secondary';

  public static DefaultConfirmBoxYesButtonText = 'Yes';
  public static DefaultConfirmBoxNoButtonText = 'No';

  public static ImageSomeIssueWithImageText = 'Some issue with image';

  public static DropZoneAddFileText = 'Drop or click to add files';

  public static PPInitial = 'PP';
  public static RupeeSymbol='\u20B9';
  public static RupeeSymbolText='INR';
 

  public static GetInitial() {
    // switch (AppEnvironmentService.GetCurrentApp()) {
    //   case AppName.Royalserry:
    //     return this.PPInitial;      
    // }
  }

  public static PPPlayStoreAppUrl =
  'https://play.google.com/store/apps/details?id=com.cleanmate';
  public static PPAppDisplayName="Cleanmate"
  

  // public static GetPlayStoreAppUrl(): string {
  //     return this[this.GetInitial()+"PlayStoreAppUrl"];
  // }
  // public static GetAppDisplayName(): string {
  //     return this[this.GetInitial()+"AppDisplayName"];
  // }
  
}
