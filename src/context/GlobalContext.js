import { useStateLocalStorage } from 'hooks/UseStateLocalStorage';
import Profile from 'models/Profile';
import React from 'react';

const GlobalContext = React.createContext();

export function useGlobalContext() {
	return React.useContext(GlobalContext);
}

export function GlobalContextWrapper(props) {
	const value = {
		profileState: useStateLocalStorage('profile', null, Profile.fromObject),
		videoState: useStateLocalStorage('video'),
	};

	return <GlobalContext.Provider value={value}>{props.children}</GlobalContext.Provider>;
}

export function useProfileState() {
	const { profileState } = useGlobalContext();
	return profileState;
}

export function useVideoState() {
	const { videoState } = useGlobalContext();
	return videoState;
}
