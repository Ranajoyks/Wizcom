export enum AppName {
  Royalserry = 'Royalserry',
  A2Z = 'A2Z-Freshmart',
}

export class AppEnvironmentService {
  public static GetCurrentApp(): AppName {
    //TODO:switch on app release ,Production
    return AppName.Royalserry;
  }
  public static IsDeug(): boolean {
    //TODO:switch on app release ,Production
    return false;
  }
  public static IsPeepPeep(): boolean {
    //do not switch here
    return AppEnvironmentService.GetCurrentApp()===AppName.Royalserry;
  }
}
