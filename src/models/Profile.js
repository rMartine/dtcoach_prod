import Utils from 'common/Utils';

export default class Profile {
	id = '';
	name = '';
	username = '';
	email = '';
	token = '';
	type = Profile.type.normal;
	proportions = {};
	height = '';
	gender = '';
	ageRange = '';
	password = '';

	static type = {
		normal: 'normal',
		guest: 'guest',
		google: 'google',
	};

	static gender = {
		male: 'male',
		female: 'female',
		other: 'other',
	};

	static ageRange = {
		from10to19: '10-19',
		from20to29: '20-29',
		from30to39: '30-39',
		from40to49: '40-49',
		from50to59: '50-59',
		from60to69: '60-69',
		from70: '70+',
	};

	get shortName() {
		try {
			return this.name.split(' ')[0];
		} catch (ex) {
			console.log(ex);
			return this.name;
		}
	}

	hasProportions() {
		return this.proportions && Object.keys(this.proportions).length;
	}

	static fromGoogle(googleResponse) {
		let profile = new Profile();

		try {
			profile.name = googleResponse.profileObj.name;
			profile.username = googleResponse.profileObj.email;
			profile.email = googleResponse.profileObj.email;
			profile.token = googleResponse.tokenId;
			profile.type = Profile.type.google;
		} catch (ex) {
			console.log(ex);
		}

		return profile;
	}

	static fromGuest(name) {
		let profile = new Profile();

		try {
			let guid = Utils.newGuid();
			profile.id = guid;
			profile.name = name;
			profile.username = `${profile.shortName}_${guid.slice(0, 8)}`;
			profile.type = Profile.type.guest;
		} catch (ex) {
			console.log(ex);
		}

		return profile;
	}

	static fromObject(obj) {
		let profile = new Profile();
		try {
			if (obj) {
				Object.keys(profile).forEach((key) => {
					const val = obj[key];
					if (val !== null && val !== undefined) {
						profile[key] = val;
						// console.log('fromObject', { profile, obj, key, val });
					}
				});
				if (obj._id) {
					profile.id = obj._id;
				}
				if (obj.userType) {
					profile.type = obj.userType;
				}
			}
		} catch (ex) {
			console.log(ex);
		}
		return profile;
	}
}
