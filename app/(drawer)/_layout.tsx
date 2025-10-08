import { Image, View, Text, StyleSheet } from "react-native";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SQLite from "expo-sqlite";
import { DrawerContentScrollView, DrawerItem, DrawerItemList } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const db = SQLite.openDatabaseSync('reports.db');
import { Location } from "@/types/interfaces";
import { useEffect, useState } from "react";
import { useDrawerStatus } from "@react-navigation/drawer";
import CartoonBuilderLogo from '@/assets/images/cartoon-builder.png'; // When importing like this, we need to include a defintions file otherwise we will get a error which is
// that the image is not a valid module (typescript error). So that's why we include the definitions file.
import { usePathname } from "expo-router";

const LOGO_IMAGE = Image.resolveAssetSource(CartoonBuilderLogo).uri;

// SQLite is a great solution for local data storage and offline use like we do in this app,
// but if we want real time data sync, we may want to look for a cloud database solution like supabase.

// If we want to use drizzle studio, we can do it like this =>
// useDrizzleStudio(db as any);
const CustomDrawerContent = (props: any) => { // we can build any custom drawer content we want here.
    const router = useRouter();
    const { bottom } = useSafeAreaInsets(); // makes sure the drawer content is not covered by the safe area
    const [locations, setLocations] = useState<Location[]>([]);
    const isDrawerOpen = useDrawerStatus() === 'open';
    const pathname = usePathname();

    useEffect(() => {
      if(isDrawerOpen) loadLocations();
    }, [isDrawerOpen]);
  
    const loadLocations = async () => {
      const locations = await db.getAllAsync<Location>('SELECT * FROM locations');
      console.log('🚀 ~ loadLocations ~ locations:', locations);
      setLocations(locations);
    };


    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView>
                <Image source={{ uri: LOGO_IMAGE }} style={styles.logo} />
                <View style={styles.locationsContainer}>
                    <DrawerItemList {...props} />
                    <Text style={styles.title}>Locations</Text>

                    {locations.map((location) => {
                        const isActive = pathname === `/location/${location.id}`;

                        return ( 
                            <DrawerItem
                                key={location.id}
                                label={location.name}
                                onPress={() => router.navigate(`/location/${location.id}`)} // when the user clicks on the location, we will push the location screen
                                focused={isActive}
                                activeTintColor='#F2A310'
                                inactiveTintColor='#000'
                            /> 
                        );
                    })}
                </View>
            </DrawerContentScrollView>

            <View style={{
                paddingBottom: 20 + bottom,
                borderTopWidth: 1,
                borderTopColor: '#dde3fe',
                padding: 16,
            }}> 
                <Text>Jake Donovan - 2025</Text>
            </View>
        </View>
    );
};

export default function Layout() {
  return ( // React Native will pick up drawer screen by default and render content. If we don't want this to happen,
    // we should make sure that the screen doesn't render.
    <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer
            drawerContent={CustomDrawerContent}
            screenOptions={{
                drawerHideStatusBarOnOpen: true,
                drawerActiveTintColor: '#F2A310', // color for active drawer item
                headerTintColor: '#000' // color for hamburger icon that when clicked opens the drawer
        }}>
            <Drawer.Screen name="index" options={{
                title: 'Manage Locations'
            }}/>

            <Drawer.Screen name="location" options={{
                title: 'Location',
                headerShown: false,
                drawerItemStyle: {
                    display: 'none',
                },
            }}/>
        </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 75, 
    height: 75,
    alignSelf: 'center',
    marginBottom: 10,
  },

  locationsContainer: {
    marginTop: 20,
  },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 16,
    paddingTop: 24,
    color: '#a6a6a6',
  },
});