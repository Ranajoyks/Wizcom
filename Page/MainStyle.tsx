import {StyleSheet} from 'react-native';

export const ColorCode = {
  Yellow: '#FDDD3C',
  Black: '#010103',
  DimGray: '#E0E0E0',
  White: '#FFFFFF',
  Blue: 'blue',
  Red: 'red',
  LightBlue: '#C9CC3F',
  Brown: '#5C4033',
  LightGray: '#404040',
  LightOrange: '#fef0e1',
  DrakOrange: '#c66e12',
};

const MainStyle = StyleSheet.create({
  UseLabel: {
    fontFamily: 'OpenSans-SemiBold',
    marginTop: 15,
    paddingLeft: 20,
    color: '#0383FA',
    alignSelf: 'flex-start',
    fontSize: 12,
  },
  UserInfo: {
    paddingLeft: 20,
    color: 'black',
    alignSelf: 'flex-start',
    fontSize: 12,
    fontFamily: 'OpenSans-SemiBold',
  },
  UserName: {
    color: 'black',
    fontWeight: '600',
    fontFamily: 'OpenSans-SemiBold',
    marginBottom: 5,
    fontSize: 14.5,
    // letterSpacing:0.5
  },
  MsgStyle: {
    color: '#0383FA',
    fontWeight: '200',
    fontFamily: 'OpenSans-SemiBold',
    letterSpacing: 0.2,
    fontSize: 12,
  },
  NoMsgStyle: {
    color: '#a6a6a6',
    fontWeight: '200',
    fontFamily: 'OpenSans-SemiBold',
    letterSpacing: 0.2,
    fontSize: 12,
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
  BadgeStyle: {
    backgroundColor: '#E9E9E9',
    width: 35,
    height: 35,
    borderRadius: 50,
    alignItems: 'center',
    display: 'flex',
  },
  BadgeTextStyle: {
    color: 'black',
    fontSize: 22,
    fontWeight: '400',
    fontFamily: 'OpenSans-Regular',
  },
  SendInputView: {
    backgroundColor: '#F1F1F1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    flexDirection: 'row',
  },
  emptyListStyle: {
    padding: 10,
    fontSize: 18,
    textAlign: 'center',
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ListItemContainerStyle: {
    marginBottom: -10,
    marginTop: -10,
    padding: 0,
  },
  CardStyle: {
    // margin: 8,
    // padding: 8,
    backgroundColor: ColorCode.White,
  },
  CardCover: {
    margin: 5,
  },
  CardContent: {
    padding: 5,
    backgroundColor: ColorCode.DimGray,
    borderRadius: 10,
  },
  FabIconColor: {
    backgroundColor: 'orange',
  },

  scrollView: {
    marginLeft: 5,
    marginRight: 5,
  },

  PageContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Soft blue background
  },

  ButtonStyle: {
    alignSelf: 'center',
    // marginTop: '80%',
    position: 'absolute',
    bottom: 20,
    // marginBottom:0,
    height: 50,
    textAlign: 'center',
    justifyContent: 'center',
    backgroundColor: '#0383FA',
    color: 'white',
    borderRadius: 7,
    width: '90%',
    // right: 10,
  },
});

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    marginLeft: 5,
    marginRight: 5,
  },
  text: {
    fontSize: 42,
  },
  fab: {
    backgroundColor: 'orange',
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  emptyListStyle: {
    padding: 10,
    fontSize: 18,
    textAlign: 'center',
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ListItemContainerStyle: {
    marginBottom: -10,
    marginTop: -10,
    padding: 0,
  },
  CardStyle: {
    margin: 8,
    padding: 8,
    backgroundColor: ColorCode.White,
  },
  CardCover: {
    margin: 5,
  },
  CardContent: {
    padding: 5,
    backgroundColor: ColorCode.DimGray,
    borderRadius: 10,
  },
  FabIconColor: {
    backgroundColor: 'orange',
  },
  TextGap: {
    marginTop: 20,
    marginBottom: 15,
    alignSelf: 'center',
  },
  GroupChatHeader: {
    backgroundColor: '#FFFFFF', // Lighter blue header
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 999,
  },
  Grouptitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins-bold',
  },
  GroupChatBadge: {
    backgroundColor: '#404040',
    width: 35,
    height: 35,
    borderRadius: 50,
    // justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    marginTop: -5,
  },
  GroupChatMsgBadge: {
    backgroundColor: '#404040',
    width: 35,
    height: 35,
    borderRadius: 50,
    // paddingTop:-100,
    // justifyContent: 'center',
    // alignItems: 'center',
    // display: 'flex',
    // marginTop: -100,
  },
  groupcontainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    flexDirection: 'row',
    height: 60,
    marginLeft: '5%',
    borderBottomWidth: 1,
    borderColor: '#d9eeff',
  },
  headerText: {
    fontSize: 17,
    fontWeight: '700',
    color: 'black',
    fontFamily: 'Poppins-Regular',
    width: 'auto',
  },
  memberCount: {
    marginBottom: 10,
  },

  memberCountText: {
    fontSize: 14,
    color: '#888',
  },

  avatarContainer: {
    flexDirection: 'row',
    //marginRight:100
    width: 40,
    marginLeft: '30%', // Adjust layout properties as needed
  },

  topLayer: {
    position: 'absolute',
    top: 10,
    left: 5,
    flexDirection: 'row',
    // zIndex: 3,
  },

  // middleLayer: {
  //   position: 'absolute',
  //  // zIndex: 2,
  // },

  bottomLayer: {
    position: 'absolute',
    top: 10,
    left: 25,
    flexDirection: 'row',
    //   zIndex: 1,
  },
  bottomLayer2: {
    position: 'absolute',
    top: 10,
    left: 45,
    flexDirection: 'row',
    //   zIndex: 1,
  },
  bottomLayer3: {
    position: 'absolute',
    top: 10,
    left: 65,
    flexDirection: 'row',
    //   zIndex: 1,
  },
  GroupMemberBadge: {
    backgroundColor: '#404040',
    borderRadius: 50,
    alignItems: 'center',
    display: 'flex',
    fontSize: 10,
    fontFamily: 'OpenSans_Condensed-Bold',
  },
  GroupNameStyle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0383FA',
    marginLeft: 20,
  },
  topAvatar: {
    width: 45,
    height: 45,
    borderRadius: 30,
    right: 40,
    // top: 10, // Adjust vertical positioning
    // left: 20, // Adjust horizontal positioning
  },

  middleAvatar: {
    width: 45, // Adjust size for overlap
    height: 45,
    borderRadius: 30,
    left: 20,
    right: 40,
    // marginHorizontal: 5, // Adjust spacing
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 20,
    right: 60,
    //  left: 40,
  },
  avatar2: {
    width: 45,
    height: 45,
    borderRadius: 30,
    // left: 20,
    right: 80,
  },
  avatar3: {
    width: 45,
    height: 45,
    borderRadius: 30,
    // left: 20,
    right: 100,
  },
  rejectbuttontest: {
    alignSelf: 'center',
    // marginTop: '90%',
    height: 34,
    // textAlign: 'center',
    // justifyContent: 'center',
    backgroundColor: 'red',
    color: 'white',
    borderRadius: 5,

    paddingHorizontal: 10,
    paddingVertical: 0,

    // width: '95%',
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
  input: {
    alignSelf: 'center',
    backgroundColor: '#F1F1F1',
    borderColor: '#F1F1F1',
    paddingHorizontal: 5,
  },
  messagefrom: {
    flexDirection: 'column',
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexWrap: 'wrap',
  },
  messagefrommessage: {flexDirection: 'row'},
  messagefromicon: {
    backgroundColor: '#E9E9E9',
    width: 40,
    height: 40,
    borderRadius: 20,
    padding: 5,
    alignItems: 'center',
    flexDirection: 'row',
  },
  messagefromtext: {
    paddingLeft: 10,
    paddingRight: 30,
    paddingVertical: 0,
    alignContent: 'center',
  },
  messagefromtextcontent: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#E9E9E9',
    borderRadius: 5,
    fontSize: 15,
    color: '#000',
    lineHeight: 25,
    marginHorizontal: 5,
    fontFamily: 'OpenSans-VariableFont_wdth,wght',
    // flexWrap: 'wrap'
  },
  messagefromtextcontenttext: {
    fontSize: 15,
    color: '#000',
    lineHeight: 25,
    fontFamily: 'OpenSans-VariableFont_wdth,wght',
    // flexWrap: 'wrap'
  },
  messagefromtime: {
    // flexDirections: 'row-reverse',
    paddingRight: 30,
    paddingBottom: 6,
    // paddingTop:0,
    // marginTop:0
  },
  messagefromtimetext: {
    // flexShrink: 1,
    textAlign: 'right',
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    // marginVertical:0
  },
  messageto: {
    flexDirection: 'column',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messagetomessage: {flexDirection: 'row-reverse'},
  messagetotext: {paddingLeft: 10, paddingRight: 0, zIndex: 1},
  messagetotextcontent: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fef0e1',
    borderRadius: 5,
    fontSize: 15,
    color: '#C66E12',
    marginHorizontal: 5,
    // lineHeight: 30,
    fontFamily: 'OpenSans-VariableFont_wdth,wght',
    // zIndex: 1,
    flexDirection: 'row',
    // width:"50%"
  },
  messagetotime: {
    // flexDirections: 'row',
    paddingRight: 0,
    // paddingVertical: 5,
  },
  messagetotimetext: {flexShrink: 1, textAlign: 'right'},
});
export default MainStyle;
