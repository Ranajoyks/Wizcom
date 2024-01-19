import React, {Component} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  BackHandler,
  Platform,
  Alert,
} from 'react-native';
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';
import MapView, {Marker} from 'react-native-maps';
import SessionHelper from '../../Core/SessionHelper';
import axios from 'axios';

export class MapViewModel {
  ReceiverId: string = '';
  initialRegion = {
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };
}

export default class MapPage extends BaseComponent<any, MapViewModel> {
  constructor(props: any) {
    super(props);
    this.state = new BaseState(new MapViewModel());
  }
  async componentDidMount() {
    var Model = this.state.Model;
    var ReceiverID = await SessionHelper.GetReceiverIDSession();
    console.log('ReceiverID', ReceiverID);
    Model.ReceiverId = ReceiverID;
    this.UpdateViewModel();

    // var latitude = 22.700529;
    // var longitude = 88.375702;
    // Model.initialRegion.latitude = latitude;
    // Model.initialRegion.longitude = longitude;
    // this.UpdateViewModel();
    this.ReceiverLoacation();
    if (Platform.OS == 'android') {
      BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }
  handleBackButton = () => {
    this.props.navigation.navigate('Chatdetails');
    return true;
  };
  ReceiverLoacation = async () => {
    var Model = this.state.Model;
    const headers = {
      'Content-Type': 'application/json',
    };
    axios
      .get(
        `https://wemessanger.azurewebsites.net/api/user/location?userId=${Model.ReceiverId}`,
        {headers},
      )
      .then((res: any) => {
        console.log('ReceiverLocation: ', res.data);
        if (res.data.lat == null) {
          Alert.alert('No Location Found For this User', '', [
            {
              text: 'OK',
              onPress: () => {
                console.log('OK Pressed');
                this.props.navigation.navigate('Chatdetails');
              },
            },
          ]);
        }
        if (res.data.lat) {
          var lat = parseFloat(res.data.lat);
          var long = parseFloat(res.data.long);
          Model.initialRegion.latitude = lat;
          Model.initialRegion.longitude = long;
          this.UpdateViewModel();
        }
      })
      .catch((err: any) => {
        console.log('LocationERror: ', err);
      });
  };

  render() {
    var Model = this.state.Model;
    return (
      <View style={styles.container}>
        {Model.initialRegion.latitude != 0 && Model.initialRegion.longitude && (
          <MapView
            style={styles.map}
            initialRegion={Model.initialRegion}
            provider="google"
            customMapStyle={[]}>
            <Marker
              coordinate={{
                latitude: Model.initialRegion.latitude,
                longitude: Model.initialRegion.longitude,
              }}
              title="Marker Title"
              description="Marker Description"
            />
          </MapView>
        )}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
