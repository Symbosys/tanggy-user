import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SetLocation from './SetLocation';
import { AppNavigation } from '../../types/type';

const SelectYourLocation = ({ navigation }: AppNavigation) => {
    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <View style={styles.container}>
                <SetLocation navigation={navigation} />
            </View>
        </SafeAreaView>
    );
};

export default SelectYourLocation;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff', // or whatever background you want
    },
    container: {
        flex: 1,
    },
});
