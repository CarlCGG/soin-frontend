import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, TextInput } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import FeedScreen from './src/screens/FeedScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CommentsScreen from './src/screens/CommentsScreen';
import { useUser } from './src/store';
import GroupScreen from './src/screens/GroupScreen';
import ChatScreen from './src/screens/ChatScreen';
import AiChatScreen from './src/screens/AiChatScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#F97316',
        tabBarInactiveTintColor: '#ccc',
        tabBarStyle: {
          backgroundColor: '#6B21A8',
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
        },
        headerStyle: { backgroundColor: '#6B21A8' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerTitle: () => (
          <TextInput
            placeholder="Search for businesses or groups..."
            placeholderTextColor="#ccc"
            style={{
              backgroundColor: '#7c3aad',
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 6,
              color: '#fff',
              width: 280,
              fontSize: 14,
            }}
          />
        ),
        headerRight: () => (
          <View style={{ flexDirection: 'row', marginRight: 16, gap: 16, alignItems: 'center' }}>
            <Text style={{ fontSize: 22 }}>🔔</Text>
            <Text style={{ fontSize: 22 }}>✉️</Text>
            <View style={{
              width: 34, height: 34, borderRadius: 17,
              backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center'
            }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>U</Text>
            </View>
          </View>
        ),
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          title: '首页',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          title: '私信',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>💬</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: '我的',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>👤</Text>,
        }}
      />
      <Tab.Screen
        name="AiChat"
        component={AiChatScreen}
        options={{
          title: 'AI',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🤖</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
}, []);
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen 
          name="Comments" 
          component={CommentsScreen}
          options={{ 
            headerShown: true,
            title: 'Comments',
            headerStyle: { backgroundColor: '#6B21A8' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="Group"
          component={GroupScreen}
          options={{
            headerShown: true,
            title: '群组',
            headerStyle: { backgroundColor: '#6B21A8' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="AiChat"
          component={AiChatScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={({ route }: any) => ({
            headerShown: true,
            title: route.params?.username || '私信',
            headerStyle: { backgroundColor: '#6B21A8' },
            headerTintColor: '#fff',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}