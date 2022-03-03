import React from 'react';
import * as posenet from '@tensorflow-models/posenet';
import * as tf from '@tensorflow/tfjs';
import * as tfconv from '@tensorflow/tfjs-converter';

export default function TestPage() {
	const pn = React.useRef();
	const ml = React.useRef();
	const data = React.useRef();

	React.useEffect(() => {
		(async () => {
			const url = process.env.PUBLIC_URL;

			const pn = await posenet.load({
				inputResolution: { width: 320, height: 240 },
				modelUrl: url + '/posenet/model-stride16.json',
			});

			const ml = await tf.loadLayersModel(url + '/model/model.json');

			const data = await fetch(url + '/tests/r_04.json').then((r) => r.json());

			const start = new Date();

			data.forEach((f) => {
				const t = tf.tensor(f, [1, 42]);
				ml.predict(t);
			});

			const end = new Date();

			console.log('s', (end - start) / 1000);

			pn.current = pn;
			ml.current = ml;
			data.current = data;
		})();
	}, []);

	return <div>Test</div>;
}
