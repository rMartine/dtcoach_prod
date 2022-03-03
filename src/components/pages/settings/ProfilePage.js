import Api from 'common/Api';
import Utils from 'common/Utils';
import TopBar from 'components/shared/TopBar';
import { useProfileState } from 'context/GlobalContext';
import { useDatabase } from 'hooks/UseDatabase';
import Profile from 'models/Profile';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';

export default function ProfilePage() {
	const { t } = useTranslation();
	const [profile, setProfile] = useProfileState();
	const { profileTable } = useDatabase();
	const { register, handleSubmit } = useForm({
		defaultValues: {
			...profile,
			proportionsText: profile.hasProportions()
				? t('profile-page.captured')
				: t('profile-page.not-captured'),
		},
	});
	const history = useHistory();
	const classes = useStyles();

	const onSubmit = (data) => {
		saveChanges(data);
	};

	const saveChanges = (data) => {
		delete data.proportionsText;

		const editedProfile = Profile.fromObject({
			...profile,
			...data,
		});

		console.log({ editedProfile, profile, data });

		setProfile(editedProfile);
		profileTable.put(editedProfile);

		if (profile.type === Profile.type.guest) {
			checkProportions();
		} else {
			Api.user
				.update(editedProfile)
				.then((response) => {
					console.log({ response });
					return response.json();
				})
				.then((data) => {
					console.log({ data });
					checkProportions();
				});
		}
	};

	const checkProportions = () => {
		if (!profile.hasProportions()) {
			alert(t('profile-page.capture-message'));
			const redirect = Utils.getUrlQueryParam('redirect');
			if (redirect) {
				history.push('/proportions?redirect=' + encodeURIComponent(redirect));
			} else {
				history.push('/proportions');
			}
		} else {
			history.push(Utils.getUrlQueryParam('redirect') || '/');
		}
	};

	const onProportionsClick = () => {
		if (window.confirm(t('profile-page.capture-proportions-question'))) {
			history.push(
				'/proportions?redirect=' + encodeURIComponent(Utils.getUrlQueryParam('redirect'))
			);
		}
	};

	return (
		<>
			<TopBar title={t('profile-page.title')} />

			<Container maxWidth='md'>
				<form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
					<TextField
						disabled
						variant='outlined'
						inputRef={register}
						className={classes.field}
						name='name'
						// value={profile.name}
						label={t('profile-page.name')}
					/>
					{profile.type !== Profile.type.guest ? (
						<TextField
							disabled
							variant='outlined'
							inputRef={register}
							className={classes.field}
							name='email'
							// value={profile.email}
							label={t('profile-page.email')}
						/>
					) : null}
					<TextField
						required
						variant='outlined'
						inputRef={register}
						className={classes.field}
						name='height'
						type='number'
						// value={values.height}
						label={t('profile-page.height') + ' (cm)'}
					/>
					<FormControl variant='outlined' className={classes.field}>
						<InputLabel htmlFor='input-gender'>{t('profile-page.gender')}</InputLabel>
						<Select
							native
							required
							variant='outlined'
							inputRef={register}
							name='gender'
							// value={profile.gender}
							label={t('profile-page.gender')}
							inputProps={{
								name: 'gender',
								id: 'input-gender',
							}}
						>
							<option aria-label='' value='' />
							<option value={Profile.gender.male}>{t('profile-page.male')}</option>
							<option value={Profile.gender.female}>{t('profile-page.female')}</option>
							<option value={Profile.gender.other}>{t('profile-page.other')}</option>
						</Select>
					</FormControl>
					<FormControl variant='outlined' className={classes.field}>
						<InputLabel htmlFor='input-age-range'>
							{t('profile-page.age-range')}
						</InputLabel>
						<Select
							native
							required
							variant='outlined'
							inputRef={register}
							name='ageRange'
							// value={profile.ageRange}
							label={t('profile-page.age-range')}
							inputProps={{
								name: 'ageRange',
								id: 'input-age-range',
							}}
						>
							<option aria-label='' value='' />
							{Object.keys(Profile.ageRange).map((key, idx) => (
								<option key={key} value={Profile.ageRange[key]}>
									{Profile.ageRange[key]}
								</option>
							))}
						</Select>
					</FormControl>
					<TextField
						// required
						disabled
						variant='outlined'
						inputRef={register}
						className={classes.field}
						name='proportionsText'
						// value={
						// 	profile.hasProportions()
						// 		? t('profile-page.captured')
						// 		: t('profile-page.not-captured')
						// }
						label={t('profile-page.proportions')}
						onClick={onProportionsClick}
					/>
					<Button
						type='submit'
						variant='contained'
						color='primary'
						className={classes.field}
					>
						{t('profile-page.save')}
					</Button>
				</form>
			</Container>
		</>
	);
}

const useStyles = makeStyles((theme) => ({
	form: {
		display: 'flex',
		flexFlow: 'column',
		paddingTop: theme.spacing(2),
	},
	field: {
		marginBottom: theme.spacing(2),
	},
	separator: {
		textAlign: 'center',
		marginBottom: theme.spacing(2),
	},
}));
