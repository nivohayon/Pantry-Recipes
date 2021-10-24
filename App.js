import 'react-native-gesture-handler';
import React, {useState} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Main from './Components/Main';
import Favorites from './Components/Favorites';
import Ingredients from './Components/Ingredients'
import Recepies from './Components/Recepies'
import { AuthProvider } from './Context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as eva from '@eva-design/eva';
import {ApplicationProvider} from '@ui-kitten/components'

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
    <AuthProvider>
        <NavigationContainer>
        <Tab.Navigator initialRouteName="Settings" tabBarOptions={{
          activeTintColor: "#00d3f7",
          inactiveTintColor: "gray",
          labelStyle: {
            fontSize: 15,
          },
        }}>
      <Tab.Screen
        name="Ingredients"
        component={Ingredients}
        options={{
          tabBarLabel: 'Ingredients',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="food-apple" color="#11cf00" size={26} />
          ),
        }}
      />
        <Tab.Screen
        name="Recepies"
        component={Recepies}
        options={{
          tabBarLabel: 'Recepies',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="book-open-variant" color="orange" size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={Favorites}
        options={{
          tabBarLabel: 'Favorites',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="heart" color="red" size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Main}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="cog" color="grey" size={26} />
          ),
        }}
      />
      </Tab.Navigator>
        </NavigationContainer>
    </AuthProvider>
    </ApplicationProvider>
  );
}