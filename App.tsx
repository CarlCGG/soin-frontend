import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import FeedScreen from './src/screens/FeedScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CommentsScreen from './src/screens/CommentsScreen';
import GroupScreen from './src/screens/GroupScreen';
import AiChatScreen from './src/screens/AiChatScreen';
import GroupHubScreen from './src/screens/GroupHubScreen';
import { useUser } from './src/store';
import EventsScreen from './src/screens/EventsScreen';
import SearchScreen from './src/screens/SearchScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import BusinessesScreen from './src/screens/BusinessesScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import ResourcesScreen from './src/screens/ResourcesScreen';
import SharedAssetsScreen from './src/screens/SharedAssetsScreen';

const Stack = createStackNavigator();
const DRAWER_WIDTH = 260;

const SCREENS: any = {
  Feed: FeedScreen,
  Messages: MessagesScreen,
  Profile: ProfileScreen,
  AiChat: AiChatScreen,
  GroupHub: GroupHubScreen,
  Events: EventsScreen,
  Search: SearchScreen,
  Notifications: NotificationsScreen,
  Businesses: BusinessesScreen,
  Analytics: AnalyticsScreen,
  Resources: ResourcesScreen,
  SharedAssets: SharedAssetsScreen,
};

function DrawerMenu({ visible, onClose, onNavigate }: {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}) {
  const user = useUser();
  const menuItems = [
    { icon: '🏠', label: 'Feed', screen: 'Feed' },
    { icon: '🔍', label: 'Search', screen: 'Search' },
    { icon: '👥', label: 'Group Hub', screen: 'GroupHub' },
    { icon: '💬', label: 'Messages', screen: 'Messages' },
    { icon: '🤖', label: 'AI Assistant', screen: 'AiChat' },
    { icon: '👤', label: 'My Profile', screen: 'Profile' },
    { icon: '📅', label: 'Events', screen: 'Events' },
    { icon: '🔔', label: 'Notifications', screen: 'Notifications' },
    { icon: '🏢', label: 'Businesses', screen: 'Businesses' },
    { icon: '📊', label: 'Analytics', screen: 'Analytics' },
    { icon: '📚', label: 'Resources', screen: 'Resources' },
    { icon: '📦', label: 'Shared Assets', screen: 'SharedAssets' },
    
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={drawerStyles.overlay}>
        <View style={drawerStyles.drawer}>
          <View style={drawerStyles.userSection}>
            <View style={drawerStyles.avatar}>
              <Text style={drawerStyles.avatarText}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <Text style={drawerStyles.username}>{user?.username || 'User'}</Text>
            <Text style={drawerStyles.handle}>@{user?.username || 'user'}</Text>
          </View>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={drawerStyles.menuItem}
              onPress={() => { onNavigate(item.screen); onClose(); }}
            >
              <Text style={drawerStyles.menuIcon}>{item.icon}</Text>
              <Text style={drawerStyles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={drawerStyles.backdrop} onPress={onClose} />
      </View>
    </Modal>
  );
}

const drawerStyles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  drawer: {
    width: DRAWER_WIDTH, backgroundColor: '#6B21A8',
    paddingTop: 60, paddingHorizontal: 20,
  },
  userSection: {
    alignItems: 'center', marginBottom: 32, paddingBottom: 24,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 26 },
  username: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  handle: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 },
  menuIcon: { fontSize: 22 },
  menuLabel: { color: '#fff', fontSize: 16, fontWeight: '500' },
});

const TITLES: any = {
  Feed: 'Feed',
  Messages: 'Messages',
  Profile: 'My Profile',
  AiChat: 'AI Assistant',
  GroupHub: 'Group Hub',
  Events: 'Events',
  Search: 'Search',
  Notifications: 'Notifications',
  Businesses: 'Businesses',
  Analytics: 'Analytics',
  Resources: 'Resources',
  SharedAssets: 'Shared Assets',
};

function MainApp() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('Feed');
  const CurrentComponent = SCREENS[currentScreen];

  return (
    <View style={{ flex: 1 }}>
      <DrawerMenu
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={(screen) => setCurrentScreen(screen)}
      />
      {/* 顶部导航栏 */}
      <View style={{
        backgroundColor: '#6B21A8', paddingTop: 16, paddingBottom: 12,
        paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center',
      }}>
        <TouchableOpacity onPress={() => setDrawerOpen(true)}>
          <Text style={{ fontSize: 24, color: '#fff' }}>☰</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginLeft: 16 }}>
          {TITLES[currentScreen]}
        </Text>
      </View>
      {/* 当前页面 */}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="CurrentScreen">
          {() => <CurrentComponent />}
        </Stack.Screen>
        <Stack.Screen name="Comments" component={CommentsScreen}
          options={{ headerShown: true, headerStyle: { backgroundColor: '#6B21A8' }, headerTintColor: '#fff', title: 'Comments' }} />
        <Stack.Screen name="Group" component={GroupScreen}
          options={{ headerShown: true, headerStyle: { backgroundColor: '#6B21A8' }, headerTintColor: '#fff', title: 'Group' }} />
        <Stack.Screen name="Chat" component={ChatScreen}
          options={{ headerShown: true, headerStyle: { backgroundColor: '#6B21A8' }, headerTintColor: '#fff', title: 'Chat' }} />
      </Stack.Navigator>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainApp" component={MainApp} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}