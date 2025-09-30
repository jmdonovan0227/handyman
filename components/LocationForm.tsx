import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";

type LocationFormProps = {
    onSubmit: (name: string) => void;
};

export default function LocationForm({ onSubmit }: LocationFormProps) {
    const [name, setName] = useState('');

    const handleSubmit = () => {
        if(name.trim()) {
            onSubmit(name);
            setName('');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter location name" />
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Add Location</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 8,
    },

    input: {
        borderWidth: 1,
        borderColor: '#fff',
        backgroundColor: '#fff',
        padding: 8,
        flex: 1,
    },

    button: {
        backgroundColor: 'black',
        padding: 8,
        borderRadius: 4,
    },

    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    }
});