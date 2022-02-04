import React, { Component, useEffect, useState } from 'react';
import { Text, AppRegistry, StyleSheet, TextInput, View, Alert, Button } from 'react-native';
import styled from 'styled-components/native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import ApiCalendar from 'react-google-calendar-api/src/ApiCalendar';
import { GoogleApiProvider, useGoogleApi } from 'react-gapi';
import { WebView } from 'react-native-webview';

const Container = styled.View`
    flex: 1;
    backgroundColor: ivory;
    justify-content: center;
    align-items: center;
`;

function handleItemClick(event: SyntheticEvent<any>, name: string): void {
    if (name === 'sign-in') {
        ApiCalendar.handleAuthClick().then(() => {
            console.log('sign in succesful!');
        }).catch((e) => {
            console.error(`sign in failed ${e}`);
        });
    } else if (name === 'sign-out') {
        ApiCalendar.handleSignoutClick();
    }
}

export default function One_Main({navigation}) {
    console.log(ApiCalendar.a);
    const user = auth().currentUser;
    console.log(user?.email);

    useEffect(() => {
        GoogleSignin.configure({
            webClientId:
            '88262564393-bn0nda8ful3423bj4b6unc914s5cj30d.apps.googleusercontent.com'
        });
    }, []);

    useEffect(() => {
        return () => setLoggedIn(false);
    }, []);

    async function onGoogleButtonPress() {
        const { idToken } = await GoogleSignin.signIn();
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
        return auth().signInWithCredential(googleCredential);
    }

    const [loggedIn, setLoggedIn] = useState(false);

    auth().onAuthStateChanged((user) => {
        if (user) {
        setLoggedIn(true);
        } else {
        setLoggedIn(false);
        }
    });

    if (loggedIn) {
        return (
            <Container>
                <View>
                    <View>
                        <Button title="Logout" onPress={() => auth().signOut()} />
                    </View>
                    <View>
                        <Button title="sign-in" onPress={(e) => handleItemClick(e, 'sign-in')} />
                    </View>
                    <View>
                        <Button title="sign-out" onPress={(e) => handleItemClick(e, 'sign-out')} />
                    </View>
                </View>
            </Container>
        );
    }
    return (
        // <Text>a</Text>
        <WebView source={{ uri: 'localhost:8080' }} />
        // <Container>
        //       <View>
        //         <GoogleSigninButton onPress={onGoogleButtonPress} />
        //      </View>
        // </Container>
    );
}

const styles = StyleSheet.create({
    MainContainer :{
        margin: 10,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    TextInputStyleClass: {
        textAlign: 'center',
        marginBottom: 7,
        height: 40,
        borderWidth: 2,
        borderColor: 'skyblue',
        width: 200,
    }
});
