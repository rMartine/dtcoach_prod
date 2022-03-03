import Utils from 'common/Utils';
import React from 'react';

export function useStateLocalStorage(key, defaultVal = null, castFn = null) {
	const savedVal = Utils.loadFromLocalStorage(key, defaultVal);
	const [value, setValue] = React.useState(castFn ? castFn(savedVal) : savedVal);

	React.useEffect(() => {
		Utils.saveIntoLocalStorage(key, value);
	}, [key, value]);

	return [value, setValue];
}
