import 'react-native-gesture-handler';
import React from 'react';
import {useAuth} from '../Context/AuthContext'
import Login from './Login';
import Settings from './Settings';
import { createStackNavigator } from '@react-navigation/stack';
import SignUp from './SignUp';
import {Text, View} from 'react-native'


export default function Main({navigation}) {
  const {currentUser} = useAuth()
  const Stack = createStackNavigator();
  if(currentUser)
  {
    return(
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Settings navigation={navigation}/>
        </View>
    )
  }
  else
  {
    return(
      <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} options={{headerShown:false}}/>
      <Stack.Screen name="SignUp" component={SignUp} options={{headerShown:false}}/>
      </Stack.Navigator>
    )
  }
}