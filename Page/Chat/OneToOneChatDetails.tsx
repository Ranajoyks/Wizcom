import {useEffect, useState} from 'react';
import SessionHelper from '../../Core/SessionHelper';
import User from '../../Entity/User';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  TextInput,
  AppState,
  ActivityIndicator,
} from 'react-native';
import {
  Badge,
  Body,
  Content,
  Left,
  List,
  ListItem,
  Right,
  Root,
  Container,
  Header,
  Tab,
  Tabs,
  TabHeading,
} from 'native-base';
// import { TabHeading} from 'native-base';
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';
import DeviceInfo from 'react-native-device-info';
import * as signalR from '@microsoft/signalr';
import {TouchableOpacity} from 'react-native-gesture-handler';
import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';
import BackgroundTimer from 'react-native-background-timer';
import MainStyle from '../MainStyle';
import CustomPageLoader from '../../Control/CustomPageLoader';
import {useNavigation} from '@react-navigation/native';
import { now } from 'moment';
import UIHelper from '../../Core/UIHelper';

const MainPage = () => {}
export default MainPage