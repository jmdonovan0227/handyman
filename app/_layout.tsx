import { Slot, useRouter } from "expo-router";
import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from "expo-sqlite";
import { Suspense } from "react";
import { ActivityIndicator } from "react-native";
import { useEffect } from "react";
import * as Notifications from 'expo-notifications';

// Lets add a suspense fallback because
// it is possible that the database will not be ready yet when we make a call to it
// initially and we could get an error as a result.
export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
	const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
		const taskId = response.notification.request.content.data.taskId;
		const locationId = response.notification.request.content.data.locationId;
		
		if(taskId && locationId) {
			router.push(`/location/${locationId}/new-task?taskId=${taskId}`);
		}
	});

	return () => {
		subscription.remove();
	};
  }, []);

  return (
	<Suspense fallback={<ActivityIndicator />}>
		<SQLiteProvider databaseName="reports.db" onInit={migrateDbIfNeeded}>
		<Slot />
		</SQLiteProvider>
	</Suspense>
  )
}


async function migrateDbIfNeeded(db: SQLiteDatabase) {
	try {
		const DATABASE_VERSION = 1;
		let version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
		console.log('🚀 ~ migrateDbIfNeeded ~ version:', version);

		let currentDbVersion = version?.user_version ?? 0;
		console.log('🚀 ~ currentDbVersion:', currentDbVersion);

		// Check if tables actually exist
		const tableCheck = await db.getFirstAsync<{ count: number }>(
			`SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='locations'`
		);
		console.log('🚀 ~ locations table exists:', tableCheck);

		// If version says migrated but tables don't exist, reset version
		if (currentDbVersion >= DATABASE_VERSION && tableCheck?.count === 0) {
			console.log('⚠️ Database version mismatch! Resetting and re-migrating...');
			currentDbVersion = 0;
		}

		if (currentDbVersion >= DATABASE_VERSION) {
			console.log('✅ Database is up to date');
			return;
		}
		
		if (currentDbVersion === 0) {
			console.log('🔄 Migrating db to version 1...');
			await db.execAsync(`
			PRAGMA journal_mode = 'wal';
			CREATE TABLE IF NOT EXISTS locations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);
			CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, isUrgent INTEGER NOT NULL, locationId INTEGER, imageUri TEXT, FOREIGN KEY (locationId) REFERENCES locations(id));
		`);
			console.log('✅ Tables created');
			
			await db.runAsync('INSERT INTO locations (name) VALUES (?)', 'School');
			await db.runAsync('INSERT INTO locations (name) VALUES (?)', 'Hospital');
			console.log('✅ Locations inserted');
			
			await db.runAsync(
				'INSERT INTO tasks (title, description, isUrgent, locationId) VALUES (?, ?, ?, ?)',
				['Task 1', 'Description 1', 0, 1]
			);
			await db.runAsync(
				'INSERT INTO tasks (title, description, isUrgent, locationId) VALUES (?, ?, ?, ?)',
				['Task 2', 'Description 2', 1, 2]
			);
			console.log('✅ Tasks inserted');

			currentDbVersion = 1;
		}

		await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
		console.log('✅ Migration complete! Database version:', DATABASE_VERSION);
	} catch (error) {
		console.error('❌ Migration failed:', error);
		throw error;
	}
}