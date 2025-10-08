import { View, Text } from "react-native";
import { Stack } from "expo-router";
import { DrawerToggleButton } from "@react-navigation/drawer";

export default function LocationLayout() {
    return (
        <Stack>
            <Stack.Screen name="[id]" options={{
                headerLeft: () => (
                    <View>
                        <DrawerToggleButton tintColor='#000' />
                    </View>
                )
            }}/>

            <Stack.Screen
                name="[id]/new-task"
                options={{
                    title: 'New Task',
                    headerBackTitle: 'Back',
                    headerTintColor: '#000',
                }}
            />
        </Stack>
    );
}