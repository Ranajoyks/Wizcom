import {BackHandler, PermissionsAndroid} from 'react-native';
import {BaseResponseCore} from './BaseResponse';
import ToastHelper from './ToastHelper';
import Geolocation from '@react-native-community/geolocation';

export default class PermissionHelper {
  public static async requestLocationPermission(): Promise<
    BaseResponseCore<GeolocationPosition>
  > {
    return new Promise(async resolve => {
      var result = new BaseResponseCore<GeolocationPosition>();
      result.IsSuccess = false;
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Beauty Executive needs access to your location',
            buttonPositive: 'Thanks',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          resolve(await this._getCurrentLocation());
        } else {
          result.Message = 'Location permission denied';
          ToastHelper.ShowToastMesage(result.Message, 'danger', 5000);

          resolve(result);
          // BackHandler.exitApp();
        }
      } catch (err) {
        result.Message = err;
        ToastHelper.ShowToastMesage(err, 'danger', 5000);

        resolve(result);
        //  BackHandler.exitApp();
      }
    });
  }

  public static _getCurrentLocation = (): Promise<
    BaseResponseCore<GeolocationPosition>
  > => {
    return new Promise(resolve => {
      var result = new BaseResponseCore<GeolocationPosition>();
      result.IsSuccess = false;
      Geolocation.getCurrentPosition(
        position => {
          result.Data = position;
          result.IsSuccess = true;
          return resolve(result);
        },
        error => {
          result.Message = error.message;
          result.IsSuccess = false;
          return resolve(result);
        },
        {enableHighAccuracy: true, timeout: 200000, maximumAge: 1000},
      );
    });
  };

  
  
  
}
