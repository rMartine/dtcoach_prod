export default class Session {
	constructor(props) {
		if (props) {
			Object.keys(this).forEach((key) => {
				const val = props[key];
				if (val !== null && val !== undefined) {
					this[key] = val;
				}
			});
		}
	}

	id = '';
	idProfile = '';
	idVideo = '';
	date = '';
	fps = '';
	frames = [];
}
