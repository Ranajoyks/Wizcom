import {StyleSheet} from 'react-native';

const MainStyle = StyleSheet.create({
  UseLabel: {
    fontFamily: 'OpenSans-SemiBold',
    marginTop: 15,
    paddingLeft: 20,
    color: '#0383FA',
    alignSelf: 'flex-start',
    fontSize: 12,
  },
  UserInfo:{
    paddingLeft: 20,
    color: 'black',
    alignSelf: 'flex-start',
    fontSize: 12,
    fontFamily: 'OpenSans-SemiBold',
  },
  UserName:{
    color: 'black',
    fontWeight: '600',
    fontFamily: 'OpenSans-SemiBold',
    marginBottom: 5,
    fontSize: 14.5,
    // letterSpacing:0.5
  },
  MsgStyle:{
    color:'#0383FA',
    fontWeight: '200',
    fontFamily: 'OpenSans-SemiBold',
    letterSpacing: 0.2,
    fontSize: 12,
  },
  NoMsgStyle:{
    color:'#a6a6a6' ,
    fontWeight: '200',
    fontFamily: 'OpenSans-SemiBold',
    letterSpacing: 0.2,
    fontSize: 12,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF', // Replace with desired background color
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Poppins-Regular',
    color: 'black', // Darker blue title
  },
  divider: {
    height: 1,
    backgroundColor: 'gray',
    marginHorizontal: 20,
    marginTop: 12,
    opacity: 0.5,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    // Set a height for the container
    height: 'auto',
    width: 200,
    zIndex: 1,
  },
  dropdown: {
    backgroundColor: '#f1f1f1',
    color: 'black',
    borderRadius: 10,
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF', // Lighter blue header
    paddingTop: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginTop:10
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchBar: {
    color: '#fff', // Replace with desired text color
    fontSize: 16, // Adjust font size as needed
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    // marginTop: 10,
  },
  tabButton: {
    padding: 10,
    backgroundColor: '#ddd', // Replace with desired tab background color
  },
  messageItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee', // Adjust border color as needed
  },
  messageName: {
    fontSize: 18, // Adjust font size as needed
  },
  input: {
    alignSelf: 'center',
    backgroundColor: '#F1F1F1',
    borderColor: '#F1F1F1',
    paddingHorizontal: 5,
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 30,
    marginTop: 6,
    marginLeft: 4,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 5,
    right: 1,
  },
  circle2: {
    width: 10,
    height: 10,
    borderRadius: 30,
    marginTop: 6,
    marginLeft: 4,
    backgroundColor: 'orange',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 5,
    right: 1,
  },
  circle3: {
    width: 20,
    height: 20,
    borderRadius: 30,
    justifyContent: 'center',
    // marginTop: 6,
    backgroundColor: '#0383FA',
    // position: 'absolute',
    // bottom: 5,
    // right: 1,
    color: 'white',
    // paddingRight: 1,
  },
  OTOheader: {
    backgroundColor: '#FFFFFF', // Lighter blue header
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  BadgeStyle:{
    backgroundColor: '#E9E9E9',
    width: 35,
    height: 35,
    borderRadius: 50,
    alignItems: 'center',
    display: 'flex',
  },
  BadgeTextStyle:{
    color: 'black',
    fontSize: 22,
    fontWeight: '400',
    fontFamily: 'OpenSans-Regular',
  },
  SendInputView:{
    backgroundColor: '#F1F1F1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    flexDirection: 'row',
  }
});

export default MainStyle;
