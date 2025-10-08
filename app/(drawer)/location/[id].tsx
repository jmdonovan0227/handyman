import { StyleSheet, View, FlatList, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect, Link } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useState, useCallback } from "react";
import { Task } from "@/types/interfaces";
import { Stack } from "expo-router";
import TaskListItem from "@/components/TaskListItem";

export default function Location() {
    const { id } = useLocalSearchParams<{ id: string }>(); // use this hook to get the id of the location
    const router = useRouter();
    const db = useSQLiteContext();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [locationName, setLocationName] = useState<string>('');

    const loadLocationData = useCallback(async () => {
        const [location] = await db.getAllAsync<{ name: string }>('SELECT * FROM locations WHERE id = ?', [Number(id)]);
        console.log('🚀 ~ loadLocationData ~ locations:', location);

        if(location) {
            setLocationName(location.name);
        }

        // Load tasks
        // the return type 'Task' represents a singular row from the tasks table,
        // but this could return multiple rows of Task meaning this is actually a Task[].
        const tasks = await db.getAllAsync<Task>('SELECT * FROM tasks WHERE locationId = ?', [Number(id)]);
        console.log('🚀 ~ loadLocationData ~ tasks:', tasks);
        setTasks(tasks);
    }, [id, db]);

    console.log('tasks: ', tasks);

    useFocusEffect(
        useCallback(() => {
            loadLocationData();
        }, [loadLocationData])
    ); // useFocusEffect is a hook for handling side effects when the screen is focused.

    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{
                title: locationName || 'Tasks',
            }} />

            <FlatList
                data={tasks}
                renderItem={({ item }) => <TaskListItem task={item} />}
                ListEmptyComponent={<Text>No tasks found</Text>}
            />

            <Link href={`/location/${id}/new-task`} asChild>
                <TouchableOpacity style={styles.fab}>
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F2A310',
        borderRadius: 28,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },

    fabText: {
        color: '#fff',
        fontSize: 24,
    },
});