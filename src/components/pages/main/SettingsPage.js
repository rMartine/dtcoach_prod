import Api from 'common/Api';
import AboutPage from 'components/pages/settings/AboutPage';
import DialogConfirm from 'components/shared/DialogConfirm';
import DialogSelectLanguage from 'components/shared/DialogSelectLanguage';
import { useProfileState } from 'context/GlobalContext';
import { useDatabase } from 'hooks/UseDatabase';
import Profile from 'models/Profile';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { Face, Info, Language, MeetingRoom, SupervisorAccount } from '@material-ui/icons';

export default function SettingsPage() {
	const { t } = useTranslation();
	const history = useHistory();

	document.title = `DTCoach - ${t('settings-page.title')}`;

	/// ABOUT

	const [dialogAboutOpen, setDialogAboutOpen] = React.useState(false);

	const onBtnAbout = () => {
		setDialogAboutOpen(true);
	};

	/// LANGUAGE

	const [dialogLanguageOpen, setDialogLanguageOpen] = React.useState(false);

	const onBtnLanguage = () => {
		setDialogLanguageOpen(true);
	};

	/// PROFILE

	const onBtnProfile = () => {
		history.push('/profile?redirect=' + encodeURIComponent('/#settings'));
	};

	/// CHANGE PROFILE

	const [profile, setProfile] = useProfileState();

	const { profileTable } = useDatabase();

	const onBtnChangeProfile = () => {
		if (window.confirm(t('settings-page.change-profile') + '?')) {
			setProfile(null);
			history.push('/select-profile');
		}
	};

	/// SIGN OUT

	const onBtnSignOut = () => {
		if (window.confirm(t('settings-page.sign-out') + '?')) {
			if (profile.type !== Profile.type.guest) {
				profileTable.delete(profile.id);
				Api.user.logout(profile);
			}
			setProfile(null);
			history.push('/select-profile');
		}
	};

	/// RENDER

	return (
		<>
			<List>
				<ListItem button key='about' onClick={onBtnAbout}>
					<ListItemIcon>
						<Info />
					</ListItemIcon>
					<ListItemText primary={t('settings-page.about')} />
				</ListItem>
				<ListItem button key='language' onClick={onBtnLanguage}>
					<ListItemIcon>
						<Language />
					</ListItemIcon>
					<ListItemText primary={t('settings-page.language')} />
				</ListItem>
				{/* <ListItem button key='profile' onClick={onBtnProfile}>
					<ListItemIcon>
						<Face />
					</ListItemIcon>
					<ListItemText primary={t('settings-page.profile')} />
				</ListItem> */}
				<ListItem button key='changeProfile' onClick={onBtnChangeProfile}>
					<ListItemIcon>
						<SupervisorAccount />
					</ListItemIcon>
					<ListItemText primary={t('settings-page.change-profile')} />
				</ListItem>
				<ListItem button key='signOut' onClick={onBtnSignOut}>
					<ListItemIcon>
						<MeetingRoom />
					</ListItemIcon>
					<ListItemText primary={t('settings-page.sign-out')} />
				</ListItem>
			</List>
			<DialogSelectLanguage open={dialogLanguageOpen} setOpen={setDialogLanguageOpen} />
			<DialogConfirm openState={[dialogAboutOpen, setDialogAboutOpen]} hideConfirmButton>
				<AboutPage />
			</DialogConfirm>
		</>
	);
}
