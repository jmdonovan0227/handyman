import { StyleSheet, View, Text, TextInput, Switch, TouchableOpacity, Alert, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useState, useEffect } from "react";
import { Task } from "@/types/interfaces";
// This is a native module for accessing the user's photo library. Native modules are bridging between JS and platform specific code.
// They allow us to access native features like camera, photo library, etc. Remember too, that with
// native modules wew are accessing device features so we need to request permission from the user to use them
// which is important for user privacy and security.
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';

// In this scenario we are using local notifications which helps alert users about events or updates when the app is not in use.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function NewTask() {
    const { id: locationId, taskId } = useLocalSearchParams<{ id: string, taskId?: string }>(); // rename id to locationId
    console.log('id: ', locationId);
    console.log('taskId: ', taskId);

    const router = useRouter();
    const db = useSQLiteContext();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);
    const [imageUri, setImageUri] = useState<string | null>(null);

    const loadTaskData = async () => {
        const task = await db.getFirstAsync<Task>('SELECT * FROM tasks WHERE id = ?', [Number(taskId)]);

        if(task) {
            setTitle(task.title);
            setDescription(task.description);

            if(task.isUrgent) { // 1 for urgent, 0 for not urgent
                setIsUrgent(true);
            } else {
                setIsUrgent(false);
            }

            setImageUri(task.imageUri || null);
        }
    };

    const handleSaveTask = async () => {
        let newTaskId = Number(taskId);

        if(taskId) {
            // update
            await db.runAsync(`
                UPDATE tasks SET title = ?, description = ?, isUrgent = ?, imageUri = ? WHERE id = ?
            `, [
                title,
                description,
                isUrgent ? 1 : 0,
                imageUri,
                Number(taskId),
            ]);
        } else {
            // insert
            const result = await db.runAsync(`INSERT INTO tasks (locationId, title, description, isUrgent, imageUri) VALUES (?, ?, ?, ?, ?)`, [
                Number(locationId),
                title, 
                description, 
                isUrgent ? 1 : 0,
                imageUri,
            ]);

            newTaskId = result.lastInsertRowId;
        }

        if(isUrgent) {
            scheduleNotification(newTaskId, title);
        }

        router.back();
    };

    const handleFinishTask = async () => {
        Alert.alert('Finish Task', 'Are you sure you want to finish this task? It will be removed from the database.', [
            {
                text: 'Cancel',
                style: 'cancel',
            },

            {
                text: 'Finish',
                onPress: async () => {
                    await db.runAsync(`DELETE FROM tasks WHERE id = ?`, [Number(taskId)]);
                    router.back();
                }
            },
        ]);
    };

    const scheduleNotification = async (taskId: number, title: string) => {
        Notifications.scheduleNotificationAsync({
            content: {
                title: 'Urgent Task Reminder',
                body: `Don't forget to complete your urgent task: ${title}`,
                data: {
                    taskId,
                    locationId,
                },
            },

            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 5,
            },
        });
    };

    useEffect(() => {
        if(taskId) {
            loadTaskData();
        }

        Notifications.requestPermissionsAsync(); // users have to grant permission to receive notifications
    }, [taskId]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if(!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput style={styles.input} placeholder='Task Title' value={title} onChangeText={setTitle} />
            <TextInput 
                style={[styles.input, styles.multilineInput]} 
                placeholder='Task Description' 
                value={description} 
                onChangeText={setDescription} 
                multiline 
            />

            <View style={styles.row}>
                <Text>Urgent</Text>
                <Switch 
                    value={isUrgent} 
                    onValueChange={setIsUrgent}
                    trackColor={{ false: '#767577', true: '#F2A310' }}
                />
            </View>

            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Text style={styles.buttonText}>{imageUri ? 'Change Image' : 'Add Image'}</Text>
            </TouchableOpacity>

            {
                imageUri && (
                    <Image source={{ uri: imageUri }} style={styles.image} />
                )
            }

            <TouchableOpacity style={styles.button} onPress={handleSaveTask}>
                <Text style={styles.buttonText}>{taskId ? 'Update Task' : 'Create Task'}</Text>
            </TouchableOpacity>

            {
                taskId && (
                    <TouchableOpacity style={[styles.button, styles.finishButton]} onPress={handleFinishTask}>
                        <Text style={styles.buttonText}>Finish Task</Text>
                    </TouchableOpacity>
                )
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },

    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 8,
        marginBottom: 16,
        backgroundColor: '#fff',
    },

    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },

    button: {
        backgroundColor: '#F2A310',
        padding: 16,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    finishButton: {
        backgroundColor: '#4CAF50',
    },

    imageButton: {
        backgroundColor: '#3498db',
        padding: 16,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },

    image: {
        width: '100%',
        height: 200,
        marginBottom: 16,
        resizeMode: 'contain',
    },
});