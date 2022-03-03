import DialogConfirm from 'components/shared/DialogConfirm';
import TopBar from 'components/shared/TopBar';
import { useProfileState } from 'context/GlobalContext';
import { useDatabase } from 'hooks/UseDatabase';
import Profile from 'models/Profile';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

export default function SignAsGuestPage() {
	const [name, setName] = React.useState('');
	const [open, setOpen] = React.useState(false);
	const [, setProfile] = useProfileState();
	const history = useHistory();
	const { profileTable } = useDatabase();

	/// EVENTS

	const handleSubmit = (ev) => {
		if (name) {
			setOpen(true);
		}
		ev.preventDefault();
	};

	const onDialogConfirmCallback = (confirm) => {
		if (confirm) {
			let profile = Profile.fromGuest(name);
			profileTable.put(profile);
			setProfile(profile);
			history.push('/');
		}
	};

	/// RENDER

	const { t } = useTranslation();

	const classes = useStyles();

	return (
		<React.Fragment>
			<TopBar big title={t('sign-as-guest-page.title')} />
			<Container className={classes.body} maxWidth='sm'>
				<form onSubmit={handleSubmit} className={classes.form}>
					<TextField
						label='Name'
						variant='outlined'
						onChange={(e) => setName(e.target.value)}
					/>
					<div className={classes.separator} />
					<Button type='submit' variant='contained' color='primary'>
						{t('sign-as-guest-page.create')}
					</Button>
				</form>
				<div className={classes.separator} />
				<div className={classes.separator} />
				<Typography>{t('sign-as-guest-page.warning')}</Typography>
			</Container>
			<DialogConfirm
				openState={[open, setOpen]}
				onCallback={onDialogConfirmCallback}
				title={t('sign-as-guest-page.dialog', { name })}
			/>
		</React.Fragment>
	);
}

const useStyles = makeStyles((theme) => ({
	body: {
		flex: 1,
		height: '100%',
		position: 'relative',
		display: 'flex',
		flexFlow: 'column',
	},
	form: {
		display: 'flex',
		flexFlow: 'column',
	},
	separator: {
		height: theme.spacing(2),
	},
}));
