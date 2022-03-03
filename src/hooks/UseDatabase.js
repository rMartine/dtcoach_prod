import Dexie from 'dexie';

const DATABASE_VERSION = 1;

export function useDatabase() {
	const database = new Dexie('db');

	database.version(DATABASE_VERSION).stores({
		profile: 'id',
		session: 'id,idProfile,idVideo',
	});

	return {
		database,
		profileTable: database.table('profile'),
		sessionTable: database.table('session'),
	};
}
