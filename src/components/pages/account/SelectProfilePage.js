import TopBar from 'components/shared/TopBar';
import { useProfileState } from 'context/GlobalContext';
import { useDatabase } from 'hooks/UseDatabase';
import Profile from 'models/Profile';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Container from '@material-ui/core/Container';
import Fab from '@material-ui/core/Fab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import { makeStyles } from '@material-ui/core/styles';

export default function SelectProfilePage() {
	/// INIT
	const { profileTable } = useDatabase();
	const [profiles, setProfiles] = React.useState([]);

	React.useEffect(() => {
		profileTable.toArray().then((array) => setProfiles(array));
	}, [profileTable]);

	/// EVENTS

	const [, setProfile] = useProfileState();

	const history = useHistory();

	const onItemListClick = (p) => () => {
		const profile = Profile.fromObject(p);
		setProfile(profile);
		history.push('/');
	};

	const onSignInClick = () => {
		history.push('/sign-in');
	};

	/// RENDER

	const { t } = useTranslation();
	const classes = useStyles();

	return (
		<React.Fragment>
			<TopBar big title={t('select-profile-page.title')} />
			<Container className={classes.body} maxWidth='md'>
				<List>
					{profiles.length === 0 ? (
						<ListSubheader>{t('select-profile-page.empty-list')}</ListSubheader>
					) : null}
					{profiles.map((p) => (
						<ListItem button key={p.id} onClick={onItemListClick(p)}>
							<ListItemAvatar>
								<Avatar alt={p.name}>{p.name.substr(0, 1).toUpperCase()}</Avatar>
							</ListItemAvatar>
							<ListItemText
								primary={p.name}
								secondary={`ID: ${p.id.substr(0, 4).toUpperCase()}`}
							></ListItemText>
						</ListItem>
					))}
				</List>
				<Fab
					variant='extended'
					color='primary'
					className={classes.fab}
					onClick={onSignInClick}
				>
					{t('select-profile-page.sign-in')}
				</Fab>
			</Container>
		</React.Fragment>
	);
}

const useStyles = makeStyles((theme) => ({
	body: {
		flex: 1,
		position: 'relative',
	},
	fab: {
		position: 'absolute',
		bottom: theme.spacing(2),
		right: theme.spacing(2),
	},
}));
