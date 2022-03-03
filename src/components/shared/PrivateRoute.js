import { useGlobalContext } from 'context/GlobalContext';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';

export default function PrivateRoute({ component: Component, ...rest }) {
	const {
		profileState: [profile],
	} = useGlobalContext();

	const render = (props) => {
		let component = '';
		if (profile && profile.id) {
			component = <Component {...props} />;
		} else {
			component = (
				<Redirect to={{ pathname: '/welcome', state: { referer: props.location } }} />
			);
		}
		return component;
	};

	return <Route {...rest} render={render} />;
}
