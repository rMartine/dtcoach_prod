import React from 'react';

export const PORTRAIT = 'portrait';
export const LANDSCAPE = 'landscape';

export function useOrientation(onChange) {
	const calcOrientation = () =>
		window.innerHeight > window.innerWidth ? PORTRAIT : LANDSCAPE;

	const ref = React.useRef(calcOrientation());

	const getOrientation = () => ref.current;

	window.onresize = () => {
		let o = calcOrientation();
		if (ref.current !== o) {
			ref.current = calcOrientation();
			if (onChange(ref.current));
		}
	};

	return {
		PORTRAIT,
		LANDSCAPE,
		calcOrientation,
		getOrientation,
	};
}
