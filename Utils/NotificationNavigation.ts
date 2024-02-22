import {CommonActions } from '@react-navigation/native';

let _navigator: { navigate: (arg0: any, arg1: any) => void; dispatch: (arg0: CommonActions.Action) => void; };

function setTopLevelNavigator(navigatorRef: { navigate: (arg0: any, arg1: any) => void; dispatch: (arg0: CommonActions.Action) => void; }) {
	_navigator = navigatorRef;
}

function navigate(routeName: any, params: any) {
	_navigator.navigate(routeName,params);
}

function goBack() {
	_navigator.dispatch(CommonActions.goBack());
}


export default {
	navigate,
	setTopLevelNavigator,
	goBack,
};