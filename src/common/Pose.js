import Utils from 'common/Utils';

export default class Pose {
	constructor(keypointsArray, threshold) {
		this.keypointsArray = keypointsArray;
		this.threshold = threshold || 0.8;
		this.initialize();
	}

	/**
	 * Calculates everything needed.
	 */
	initialize() {
		this.map_keypoints();
		this.generate_origins();
		this.extract_skeleton();
	}

	/**
	 * Maps a keypoints array to a Keypoint object.
	 */
	map_keypoints() {
		let kpsArray = this.keypointsArray;
		let kps = {};

		// Mapping
		kpsArray.forEach((k) => {
			kps[k.part] = {
				x: k.position.x,
				y: k.position.y,
				// z: k.position.z,
				score: k.score,
			};
		});

		// Parent joint
		kps.leftElbow.parent = kps.leftShoulder;
		kps.rightElbow.parent = kps.rightShoulder;
		kps.leftWrist.parent = kps.leftElbow;
		kps.rightWrist.parent = kps.rightElbow;
		kps.leftKnee.parent = kps.leftHip;
		kps.rightKnee.parent = kps.rightHip;
		kps.leftAnkle.parent = kps.leftKnee;
		kps.rightAnkle.parent = kps.rightKnee;

		this.keypoints = kps;
	}

	/**
	 * Generates the shoulders and hips origins.
	 */
	generate_origins() {
		let kps = this.keypoints;
		let t = this.threshold;

		// Shoulders
		if (kps.leftShoulder.score > t && kps.rightShoulder.score > t) {
			kps.shoulders = Utils.calculateCentroid([kps.leftShoulder, kps.rightShoulder]);
		}

		// Hips
		if (kps.leftHip.score > t && kps.rightHip.score > t) {
			kps.hips = Utils.calculateCentroid([kps.leftHip, kps.rightHip]);
		}
	}

	/**
	 * Extract angle skeleton from keypoints.
	 */
	extract_skeleton() {
		let kps = this.keypoints;
		let t = this.threshold;

		let nose = kps.nose;
		let shoulders = kps.shoulders;
		let hips = kps.hips;

		let ske = {};

		Object.keys(kps).forEach(function (key) {
			let kp = kps[key];

			if (kp.score > t && kp.parent && kp.parent.score > t) {
				let joint = {
					l: undefined, // local
					n: undefined, // nose
					s: undefined, // shoulders
					h: undefined, // hips
				};

				joint.local = Utils.calculateAngle(kp.parent, kp);

				if (nose && nose.score > t) {
					joint.nose = Utils.calculateAngle(nose, kp);
				}

				if (shoulders && shoulders.score > t) {
					joint.shoulders = Utils.calculateAngle(shoulders, kp);
				}

				if (hips && hips.score > t) {
					joint.hips = Utils.calculateAngle(hips, kp);
				}

				ske[key] = joint;
			}
		});

		this.skeleton = ske;
	}

	extract_proportions() {
		let kps = this.keypoints;
		let pps = {};
		let dst = Utils.distanceBetweenPoints;

		const yFeet = (kps.rightAnkle.y + kps.leftAnkle.y) / 2;
		const yNose = kps.nose.y;
		const height = yFeet - yNose;

		pps.rightForearm = dst(kps.rightWrist, kps.rightElbow) / height; // 1
		pps.rightUpperarm = dst(kps.rightElbow, kps.rightShoulder) / height; // 2
		pps.leftForearm = dst(kps.leftWrist, kps.leftElbow) / height; // 3
		pps.leftUpperarm = dst(kps.leftElbow, kps.leftShoulder) / height; // 4
		pps.rightLowerleg = dst(kps.rightAnkle, kps.rightKnee) / height; // 5
		pps.rightUpperleg = dst(kps.rightAnkle, kps.rightHip) / height; // 6
		pps.leftLowerleg = dst(kps.leftAnkle, kps.leftKnee) / height; // 7
		pps.leftUpperleg = dst(kps.leftAnkle, kps.leftHip) / height; // 8
		pps.shoulders = dst(kps.rightShoulder, kps.leftShoulder) / height; // 9
		pps.hips = dst(kps.rightHip, kps.leftHip) / height; // 10
		pps.neck = dst(kps.shoulders, kps.nose) / height; // 11
		pps.trunk = dst(kps.shoulders, kps.hips) / height; // 12

		this.proportions = pps;
	}

	/**
	 * Compares two poses.
	 *
	 * @param {Pose} pose1
	 * @param {Pose} pose2
	 * @returns {Object} Score from 0 to 1.
	 */
	static compare(pose1, pose2) {
		let skeleton1 = pose1.skeleton;
		let skeleton2 = pose2.skeleton;

		let score = 0; // Overall score
		let skeletonScore = {}; // Score per joint

		let n = 0; // Counter for overall score

		Object.keys(skeleton1).forEach((joint) => {
			// For each relevant joint (elbows, wrists, knees, ankles)
			let joint1 = skeleton1[joint];
			let joint2 = skeleton2[joint];

			skeletonScore[joint] = 0; // Joint score

			// let m = 0 // Counter for joint score

			if (joint1 && joint2) {
				Object.keys(joint1).forEach((angle) => {
					// For each angle (local, nose, shoulders, hips)
					let angle1 = joint1[angle];
					let angle2 = joint2[angle];

					if (!isNaN(angle1) && !isNaN(angle2)) {
						let diff = 1 - Math.abs(angle1 - angle2) / 360; // 100% - diffBetweenAngles
						skeletonScore[joint] += diff;
						score += diff;
						n += 1;
						// m += 1;
					}
				});
			}

			skeletonScore[joint] /= n;
		});

		score /= n;

		return { score: score, skeletonScores: skeletonScore };
	}

	static simpleAttrs = {
		rightForearm: 'rfa',
		rightUpperarm: 'rua',
		leftForearm: 'lfa',
		leftUpperarm: 'lua',
		rightLowerleg: 'rll',
		rightUpperleg: 'rul',
		leftLowerleg: 'lll',
		leftUpperleg: 'lul',
		shoulders: 's',
		hips: 'h',
		neck: 'n',
		trunk: 't',
		rightWrist: 'rw',
		rightElbow: 're',
		rightShoulder: 'rs',
		rightAnkle: 'ra',
		rightKnee: 'rk',
		rightHip: 'rh',
		leftWrist: 'lw',
		leftElbow: 'le',
		leftShoulder: 'ls',
		leftAnkle: 'la',
		leftKnee: 'lk',
		leftHip: 'lh',
	};

	static simplifyAttrs(obj) {
		let simple = {};
		Object.keys(obj).forEach((key) => {
			let simpleKey = Pose.simpleAttrs[key];
			if (simpleKey) {
				simple[simpleKey] = obj[key];
			}
		});
		return simple;
	}
}
