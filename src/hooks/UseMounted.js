import React from 'react';

export function useMounted() {
	const mountedRef = React.useRef(true);

	React.useEffect(() => {
		return () => {
			mountedRef.current = false;
		};
	}, []);

	const isMounted = () => {
		return mountedRef.current;
	};

	return { isMounted };
}
