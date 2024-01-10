import React, { Component } from 'react';
import { Text, View } from 'react-native';
import AppStack from './Root/AppStack';
import { Root } from "native-base";
import { Provider } from 'react-redux';
import store from './Redux/Store';




export default class App extends Component {
  render() {
    return (
    // <View>
    //   <Text>Hello</Text>
    // </View>
   // <Provider store={store}>
      <Root>
        <AppStack />
        </Root>
    
  //  </Provider>
    );
  }
}
