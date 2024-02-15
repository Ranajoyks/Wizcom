import React from 'react';
import {
    View,
    StyleSheet,
    Modal,
} from 'react-native';

import PropTypes from 'prop-types';

import * as Animatable from 'react-native-animatable';
import { ActivityIndicator } from 'react-native-paper';




export default function CustomModalIndicator(props: { IsLoading: boolean }) {
    const { IsLoading } = props;



    return (
        <Modal animationType="fade" transparent={true} visible={IsLoading}>
            <View style={styles.modalContainer}></View>
            <View style={styles.activityIndicator}>
                <Animatable.View
                    animation="rotate"
                    direction="normal"
                    iterationCount="infinite"
                    useNativeDriver={true}>
                    <ActivityIndicator style={{ maxHeight: 75, maxWidth: 75, opacity: 1 }} accessibilityLabel="Loading.." />
                </Animatable.View>
            </View>
        </Modal>
    );
}

CustomModalIndicator.propTypes = {
    IsLoading: PropTypes.bool.isRequired,
};

const styles = StyleSheet.create({
    activityIndicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#000',
        opacity: 0.2,
    },
});
