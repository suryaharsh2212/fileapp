
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import UploadScreen from './screens/UploadScreen';
import GetFileScreen from './screens/GetFileScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();


export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Upload"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Upload') {
              iconName = focused ? 'cloud-upload' : 'cloud-upload-outline';
            } else if (route.name === 'GetFile') {
              iconName = focused ? 'document-text' : 'document-text-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4f46e5',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        {/* <Tab.Screen name="Upload" component={UploadScreen} /> */}
        {/* <Tab.Screen name="GetFile" component={GetFileScreen} /> */}
        <Tab.Screen
          name="Upload"
          component={UploadScreen}
          options={{
            title: 'Upload File', 
            headerStyle: {
              backgroundColor: '#4f46e5',
              borderRadius: 5,
             
            
            },
            headerTintColor: '#fff', 
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 20,
            },
          }}
        />
        <Tab.Screen
          name="GetFile"
          component={GetFileScreen}
          options={{
            title: 'Retrieve File',
            headerStyle: {
              backgroundColor: '#4f46e5',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 20,
            },
          }}
        />

      </Tab.Navigator>
    </NavigationContainer>
  );
}
