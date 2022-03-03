import { v4 as uuidv4 } from 'uuid';

export default class Utils {
	static saveIntoLocalStorage = (key, val, parse = true) => {
		// if (parse) {
		localStorage.setItem(key, JSON.stringify(val));
		// } else {
		// 	localStorage.setItem(key, val);
		// }
	};

	static loadFromLocalStorage = (key, defaultVal = null, parse = true) => {
		try {
			// if (parse) {
			return JSON.parse(localStorage.getItem(key)) || defaultVal;
			// } else {
			// 	return localStorage.getItem(key);
			// }
		} catch (ex) {
			return defaultVal;
		}
	};

	/**
	 * Calculates the centroid of a set of points. Z is optional.
	 *
	 * @param {Object[]} points Array of points in format {x, y}.
	 * @returns {Object} Centroid of points in format {x, y}.
	 */
	static calculateCentroid = (points) => {
		let n = points.length;
		let c = { x: 0, y: 0, score: 0 };
		points.forEach((p) => {
			c.x += p.x || 0;
			c.y += p.y || 0;
			c.score += p.score || 0;
		});
		c.x = c.x / n;
		c.y = c.y / n;
		c.score = c.score / n;
		return c;
	};

	/**
	 * Calculates the angle between two points in degrees.
	 *
	 * @param {Object} origin Origin point in format {x, y}.
	 * @param {Object} target Target point in format {x, y}.
	 * @returns {float} Angle between origin and target in degrees.
	 */
	static calculateAngle = (origin, target) => {
		let a = (Math.atan2(target.y - origin.y, target.x - origin.x) * 180) / Math.PI;
		if (a < 0) {
			a = 360 + a;
		}
		return a;
	};

	/**
	 * Calculates the angle between three points in degrees.
	 *
	 * @param {Object} origin Origin point in format {x, y}.
	 * @param {Object} target Target point in format {x, y}.
	 * @returns {float} Angle between origin and target in degrees.
	 */
	static calculateAngleThreePoints = (p0, p1, p2) => {
		const b = Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2);
		const a = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
		const c = Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2);
		const r = Math.acos((a + b - c) / Math.sqrt(4 * a * b));
		const d = (r * 180) / Math.PI;
		return d;
	};

	/**
	 * Calculates the distance between two points.
	 *
	 * @param {Object} p1 Point in format {x, y}.
	 * @param {Object} p2 Point in format {x, y}.
	 * @returns {float} Distance.
	 */
	static distanceBetweenPoints = (p1, p2) => {
		try {
			return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
		} catch (ex) {
			return 0;
		}
	};

	/**
	 * Downloads object as a json file.
	 *
	 * @param {Object} obj Object to download.
	 * @param {string} filename Filename.
	 */
	static downloadJson = (obj, filename) => {
		let encoded = encodeURIComponent(JSON.stringify(obj));
		let data = 'data:text/json;charset=utf-8,' + encoded;
		var downloadAnchorNode = document.createElement('a');
		downloadAnchorNode.setAttribute('href', data);
		downloadAnchorNode.setAttribute('download', filename);
		document.body.appendChild(downloadAnchorNode);
		downloadAnchorNode.click();
		downloadAnchorNode.remove();
	};

	static newGuid() {
		return uuidv4();
	}

	static isInstalled() {
		return window.matchMedia('(display-mode: standalone)').matches;
	}

	static absoluteUrl(relativeUrl) {
		return process.env.PUBLIC_URL + '/' + relativeUrl;
	}

	static getUrlQueryParam(key) {
		return new URLSearchParams(window.location.search).get(key);
	}

	static getUrlHash() {
		return window.location.hash.replace('#', '');
	}
}
