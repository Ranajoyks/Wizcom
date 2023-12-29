import { Component } from 'react'

import { NavigationState } from '@react-navigation/native';
import BaseState from './BaseState';
import { ActionSheet, Toast } from 'native-base';
import BaseResponse, { ErrorMessage, ErrorType } from './BaseResponse';
import { BackHandler, Alert } from 'react-native';
import BaseViewModel from './BaseViewModel';
 
import BaseColor from './BaseTheme';
import { ConstantMessage,UIHelper } from "./Index";
import ToastHelper, { ToastType } from './ToastHelper';



export default class BaseComponent<T, U> extends Component<T, BaseState<U>> {

  ViewModel: any = undefined;
  constructor(props: T) {
    super(props)
    this.HandleAuthentication(props);
  }

  onBackPress?(): boolean;

  // componentWillMount() {     
  //     BackHandler.addEventListener('hardwareBackPress', this.HandleBackButtonClick); 
  // }

  // componentWillUnmount() {         
  //     BackHandler.removeEventListener('hardwareBackPress', this.HandleBackButtonClick);
  // }
  // HandleBackButtonClick=()=> {     
  //   console.log("HandleBackButtonClick called : " + this.onBackPress)
  //   var navigation=  (this.props as any).navigation;
  //   if(this.onBackPress){
  //     return this.onBackPress();
  //   }else if(navigation){
  //     navigation.goBack(null);
  //   }

  //   return true;
  // }





  HandleAuthentication(props: T) {
    //var user = SessionHelper.GetSession();
    // console.log(token);
    // if (user === null) {
    //   this.props.navigator.resetTo({
    //     title: 'Categories',
    //     component: CategoryView,
    // })
    //}

  }
  SetModelValueX = (event:any) => {
    this.SetModelValue(event.name,event.value)
  }

  SetModelValue = (name: string, text: any) => {

    if (!name) {
      alert("propertyName undefined") 
    }

    //console.log({ [name]: text })
    Object.assign(this.state.Model, { [name]: text })

    //console.log(this.state.Model)

    this.setState({
      Model: this.state.Model
    } as Pick<BaseState<U>, keyof BaseState<U>>);
  }

  UpdateViewModelUnknown(Model: any) {
    this.setState({
      Model: Model as unknown as U
    })
  }
  UpdateViewModel() {
    this.setState({
      Model: this.state.Model
    })
  }

  public ShowToastMesage(Message: string, type: ToastType, duration: number) {
    ToastHelper.ShowToastMesage(Message,type,duration)
  }

  // #region Toast message
  public ProcessResponseData(Response: BaseResponse, ShowIsSucessMessage: boolean = true) {

    if (Response.IsSessionExpired) {
      //TODO:when redux is rady redirect to login automaticaly
      //belowis not working need redux to handle this, so for now we ares showing a message only
      //this.props.history.push("/");
      //return;
      if (!ShowIsSucessMessage) {
        this.ShowToastMesage("Your session is expired, please try to re-login", "danger", 5000)
      }
    }


    if (!ShowIsSucessMessage && Response.IsSuccess) {
      return;
    }

    var allMessages: ErrorMessage[] = [];
    var mainMesageType = Response.IsSuccess ? ErrorType.Info : ErrorType.Warning;
    allMessages.push(new ErrorMessage(
      {
        ErrorType: mainMesageType,
        Message: Response.Message,
        AdditionInfo: undefined,
        FieldName: ""
      }))

    // Response.Errors.forEach(err => {
    //   allMessages.push(new ErrorMessage(
    //     {
    //       ErrorType: err.ErrorType,
    //       Message: err.Message,
    //       AdditionInfo: err.AdditionInfo,
    //       FieldName: err.FieldName
    //     }))
    // });
    var tempM = allMessages[0];

    this.ShowToastMesage(tempM.Message, tempM.ErrorType === ErrorType.Warning ? "danger" : "success", 5000);
  }

  ShowPageLoader(IsLoading: boolean, LabelText: string = "") {
    var model = this.state.Model as unknown as BaseViewModel;
    model.IsPageLoading = IsLoading;
    model.PageLoadingLabel = LabelText ? model.TableLoadingLabel : LabelText;
    this.UpdateViewModelUnknown(model);
  }

  
  public async ShowConfirmBox(Title: string): Promise<ConfirmBoxResult> {
    return UIHelper.ShowConfirmBoxDetail(Title, ConstantMessage.DefaultConfirmBoxYesButtonText, ConstantMessage.DefaultConfirmBoxNoButtonText)
  }
 
}

export enum ConfirmBoxResult{
  OK,
  Cancel
}