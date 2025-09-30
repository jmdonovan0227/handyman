import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Location } from "@/types/interfaces";
import { useSQLiteContext } from "expo-sqlite";

type LocationListItemProps = {
    location: Location;
    onDelete: () => void;
};

export default function LocationListItem({ location, onDelete }: LocationListItemProps) {
    const db = useSQLiteContext();

    const handleDelete = async () => {
        await db.runAsync(`DELETE FROM locations WHERE id = ?`, [location.id]);
        onDelete();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.name}>{location.name}</Text>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 4,
        marginBottom: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        elevation: 3, // this is only for android doesn't work for ios
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },

    name: {
        fontSize: 16,
        fontWeight: 500,
        color: '#333',
    },

    deleteButton: {
        padding: 8,
    }
});