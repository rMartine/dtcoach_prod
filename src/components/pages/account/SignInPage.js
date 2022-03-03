import Api from 'common/Api';
import TopBar from 'components/shared/TopBar';
import { useProfileState } from 'context/GlobalContext';
import { useDatabase } from 'hooks/UseDatabase';
import Profile from 'models/Profile';
import React from 'react';
import GoogleLogin from 'react-google-login';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';

export default function SignInPage() {
	const { t } = useTranslation();
	const { register, handleSubmit } = useForm();
	const [, setProfile] = useProfileState();
	const history = useHistory();
	const { profileTable } = useDatabase();

	/// EVENTS

	const onSubmit = (credentials) => {
		Api.user
			.login(credentials)
			.then((response) => {
				console.log({ response });
				if (response.status === 400) {
					alert(t('sign-in-page.wrong-credentials'));
				} else {
					return response.json();
				}
			})
			.then((data) => {
				if (data && data.user) {
					let p = Profile.fromObject(data.user);
					setProfile(p);
					profileTable.put(p);
					history.push('/');
				}
			});
	};

	const onSubmitAnon = () => {
		Api.user
			.login({ email: 'anon@anon.com', password: 'anon1234' })
			.then((response) => {
				console.log({ response });
				if (response.status === 400) {
					alert(t('sign-in-page.wrong-credentials'));
				} else {
					return response.json();
				}
			})
			.then((data) => {
				if (data && data.user) {
					let p = Profile.fromObject(data.user);
					setProfile(p);
					profileTable.put(p);
					history.push('/');
				}
			});
	};

	const onResponseGoogle = (data) => {
		let p = Profile.fromGoogle(data);
		console.log(p);
		if (p.email && p.token) {
			Api.user
				.logWithGoogle(p)
				.then((res) => {
					console.log({ res });
					return res.json();
				})
				.then((json) => {
					p = Profile.fromObject({
						...json,
						...p,
					});
					console.log({ json, p });
					setProfile(p);
					profileTable.put(p);
					history.push('/');
				})
				.catch((error) => {
					console.log({ error });
				});
		}
	};

	const onBtnSignAsProfile = () => {
		history.push('/sign-up');
	};

	/// RENDER

	const classes = useStyles();

	return (
		<React.Fragment>
			<TopBar big title={t('sign-in-page.title')} />
			<Container maxWidth='sm'>
				<form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
					<TextField
						required
						type='email'
						variant='outlined'
						inputRef={register}
						className={classes.field}
						name='email'
						label={t('sign-in-page.email')}
					/>

					<TextField
						required
						type='password'
						variant='outlined'
						inputRef={register}
						className={classes.field}
						name='password'
						label={t('sign-in-page.password')}
					/>

					<Button type='submit' variant='contained' color='primary' className={classes.field}>
						{t('sign-in-page.sign-in')}
					</Button>

					<div className={classes.separator}>or</div>

					{/* <GoogleLogin
						clientId='1051007771607-oem5va2nac8jncvvnqgrckee739k9rj5.apps.googleusercontent.com'
						onSuccess={onResponseGoogle}
						onFailure={onResponseGoogle}
						render={(renderProps) => (
							<Button
								variant='outlined'
								color='primary'
								className={classes.field}
								onClick={renderProps.onClick}
							>
								{t('sign-in-page.with-google')}
							</Button>
						)}
					/> */}

					<Button
						variant='outlined'
						color='primary'
						className={classes.field}
						onClick={onSubmitAnon}
					>
						{t('sign-in-page.anon')}
					</Button>

					<Button
						variant='outlined'
						color='primary'
						className={classes.field}
						onClick={onBtnSignAsProfile}
					>
						{t('sign-in-page.sign-up')}
					</Button>
				</form>
			</Container>
		</React.Fragment>
	);
}

const useStyles = makeStyles((theme) => ({
	form: {
		display: 'flex',
		flexFlow: 'column',
	},
	field: {
		marginBottom: theme.spacing(2),
	},
	separator: {
		textAlign: 'center',
		marginBottom: theme.spacing(2),
	},
}));
