


import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../Root/AppStack';
import { Dispatch } from 'redux';

import { connect, ConnectedProps } from 'react-redux';
import { type } from 'os';
import { RootState } from '../Redux/Store';
import React from 'react';


export interface BaseProps<RouteName extends keyof RootStackParamList> extends StackScreenProps<RootStackParamList, RouteName> {
    dispatch: Dispatch;
}

export type NavigationProps = StackNavigationProp<RootStackParamList>;

export const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        dispatch
    }
}



// const selectThing = (state: RootState) => state

// const mapState<RouteName> = (state: RootState, props: BaseProps<RouteName extends keyof RootStackParamList> ) => ({
//     thing: selectThing(state, props.id),
// });

// const mapDispatch = {
//     //whatever
// };

// const connector = connect(mapState, mapDispatch);

// //PropsFromRedux circularly references itself
// type PropsFromRedux = ConnectedProps<typeof connector>;
