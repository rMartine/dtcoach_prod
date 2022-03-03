import { poseChain } from '@tensorflow-models/posenet';

function getUrl(endpoint) {
	// return 'http://localhost:3333' + endpoint;
	// return process.env.API_URL + endpoint;
	return 'https://mcrlab-dtcoach.herokuapp.com' + endpoint;
}

// function get(endpoint) {
//   const url = getUrl(endpoint);
//   return fetch(url, {
//     method: 'GET',
//     headers: { 'Content-Type': 'application/json;charset=utf-8' },
//   });
// }

function post(endpoint, data) {
	const url = getUrl(endpoint);
	console.log(url);
	return fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json;charset=utf-8' },
		body: JSON.stringify(data),
	});
}

export default class Api {
	static user = {
		create: (user) => post('/user/create', user),
		login: (user) => post('/user/login', user),
		logWithGoogle: (user) => post('/user/logWithGoogle', user),
		logout: (user) => post('/user/logout', user),
		delete: (user) => post('/user/delete', user),
		update: (user) => post('/user/update/basicInfo', user),
	};

	static session = {
		save: (session) => post('/coachingSession/save', session),
	};
}
