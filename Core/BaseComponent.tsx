import { Component } from 'react'

import { NavigationState } from '@react-navigation/native';
import BaseState from './BaseState';

import BaseResponse, { ErrorMessage, ErrorType } from './BaseResponse';
import { BackHandler, Alert } from 'react-native';
import BaseViewModel from './BaseViewModel';

import BaseColor from './BaseTheme';
import { ConstantMessage, UIHelper } from "./Index";

import { BaseProps } from './BaseProps';
import { RootStackParamList } from '../Root/AppStack';
import PageOptions from '../Redux/Reducer/PageOptions';
import SnackbarOptions from '../Redux/Reducer/SnackbarOptions';



export default class BaseComponent<RouteName extends keyof RootStackParamList, U> extends Component<BaseProps<RouteName>, BaseState<U>> {

  ViewModel: BaseState<U> | undefined;
  constructor(props: BaseProps<RouteName>) {
    super(props)
    this.HandleAuthentication(props);
  }

  onBackPress?(): boolean;

  HandleAuthentication(props: BaseProps<RouteName>) {


  }
  SetModelValueX = (event: any) => {
    this.SetModelValue(event.name, event.value)
  }

  SetModelValue = (name: string, text?: any) => {

    Object.assign(this.state.Model as Object, { [name]: text })


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




  ShowPageLoader(IsLoading: boolean) {
    this.props.dispatch(PageOptions.actions.ShowPageLoader(IsLoading))
  }
  ShowToast(ErrorMessage: string, Type: "Sucess" | "Error" = "Error") {

    this.props.dispatch(SnackbarOptions.actions.Show(ErrorMessage))
    setTimeout(() => {
      this.props.dispatch(SnackbarOptions.actions.Close())
    }, 5000)
  }
}

export enum ConfirmBoxResult {
  OK,
  Cancel
}