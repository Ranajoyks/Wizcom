import React from 'react';

import { View, Text, SafeAreaView } from 'react-native';
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';


import SessionHelper from '../../Core/SessionHelper';
import { BaseProps, mapDispatchToProps } from '../../Core/BaseProps';
import ERESApi from '../../DataAccess/ERESApi';
import { Company } from '../../Entity/JInitializeResponse';
import BaseViewModel from '../../Core/BaseViewModel';

import { Picker } from '@react-native-picker/picker';
import { styles } from '../MainStyle';
import { connect } from 'react-redux';
import UIHelper from '../../Core/UIHelper';
import { MHeader } from '../../Control/MHeader';
import MPicker from '../../Control/MPicker';


export class CompanyViewModel extends BaseViewModel {
  Company?: Company;
  CompanyList: Company[] = [];
}

export class CompanySelectionPage extends BaseComponent<"CompanySelectionPage", CompanyViewModel> {
  constructor(props: BaseProps<"CompanySelectionPage">) {
    super(props);
    this.state = new BaseState(new CompanyViewModel());

  }
  async componentDidMount() {
    this.Initializes();
  }
  SetCompany = (value: Company) => {
    var Model = this.state.Model;
    Model.Company = value
    this.UpdateViewModel()
    if (value) {
      this.ValidateCompany()
    }

  }

  Initializes = async () => {
    this.ShowPageLoader(true)

    var res = await ERESApi.GetCompanyArrayJInitialize()
    this.ShowPageLoader(false)

    if (res.IsKSError || !res.data) {
      this.ShowToast(res.ErrorInfo!)
      return
    }

    var CompanyArray = res.data.d.data.ado;

    if (res.data.d.bStatus) {
      var model = this.state.Model;
      model.CompanyList = CompanyArray;
      this.UpdateViewModel();
    }

    if (CompanyArray.length === 1) {
      this.state.Model.Company = CompanyArray[0]
      this.UpdateViewModel()
      this.ValidateCompany()
    }

  }



  ValidateCompany = async () => {
    var model = this.state.Model

    if (!model.Company) {
      return
    }
    const postData = {
      sCode: model.Company.CODE,
      dtOffSet: new Date().getTimezoneOffset(),
      cPlatForm: 'M',
    };

    var companyRes = await ERESApi.GetCompanyDetailJConnect(postData)
    if (companyRes.IsKSError || !companyRes.data) {
      this.ShowToast(companyRes.ErrorInfo!)
      return
    }
    if (companyRes.data.d.bStatus) {
      // await SessionHelper.SetCompanyID(model.Company.CODE);
      // await SessionHelper.SetSessionId(companyRes.data.d.cError);

      this.props.navigation.navigate('LoginPage');
    }
  }


  render() {
    var model = this.state.Model;


    return (
      <SafeAreaView style={styles.container}>
        <MHeader Title='Login'></MHeader>
        <View>
          <Text style={styles.TextGap} >Please Select Company</Text>
          <Text style={styles.TextGap} >Select Company</Text>

          <MPicker
            Data={model.CompanyList}
            Label='NAME'
            Value='CODE'
            AddPlaceHolderItem='Select Company'
            selectedValue={model.Company}
            onValueChange={(itemValue, itemIndex) =>
              this.SetCompany(itemValue)
            }>
          </MPicker>
        </View>
      </SafeAreaView>
    );
  }
}

var connector = connect(null, mapDispatchToProps)(CompanySelectionPage);
export default connector