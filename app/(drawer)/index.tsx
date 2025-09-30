import { View, FlatList, StyleSheet, Text } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { Location } from "@/types/interfaces";
import LocationForm from "@/components/LocationForm";
import LocationListItem from "@/components/LocationListItem";

export default function Home() {
  const db = useSQLiteContext();
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    const locations = await db.getAllAsync<Location>('SELECT * FROM locations');
    console.log('🚀 ~ loadLocations ~ locations:', locations);
    setLocations(locations);
  };

  const addLocation = async (name: string) => {
    await db.runAsync(`INSERT INTO locations (name) VALUES (?)`, name);
    loadLocations();
  };

  return (
    <View style={styles.container}>
      <LocationForm onSubmit={addLocation} />
      <FlatList
        data={locations}
        renderItem={({ item }) => <LocationListItem location={item}  onDelete={loadLocations} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No locations found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});