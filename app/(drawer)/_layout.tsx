import { View, Text } from "react-native";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer screenOptions={{
            drawerHideStatusBarOnOpen: true,
            drawerActiveTintColor: '#F2A310', // color for active drawer item
            headerTintColor: '#000' // color for hamburger icon that when clicked opens the drawer
        }}>
            <Drawer.Screen name="index" options={{
                title: 'Manage Locations'
            }}/>

            <Drawer.Screen name="location" options={{
                title: 'Location'
            }}/>
        </Drawer>
    </GestureHandlerRootView>
  );
}