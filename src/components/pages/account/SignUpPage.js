import Api from 'common/Api';
import TopBar from 'components/shared/TopBar';
import { useGlobalContext } from 'context/GlobalContext';
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

export default function SignUpPage() {
	const { register, handleSubmit } = useForm();
	const { profileTable } = useDatabase();

	const {
		profileState: [, setProfile],
	} = useGlobalContext();

	const history = useHistory();

	/// EVENTS

	const onSubmit = (data) => {
		if (data.password !== data.passwordConfirm) {
			alert(t('sign-up-page.match'));
			return;
		}

		if (data.password.length < 8) {
			alert(t('sign-up-page.password-length'));
			return;
		}

		if (data.name.length < 3) {
			alert(t('sign-up-page.name-length'));
			return;
		}

		let p = Profile.fromObject(data);
		console.log({ profile: p });
		p.username = p.email;
		// p.password = data.password;
		delete p.passwordConfirm;

		Api.user
			.create(p)
			.then((response) => {
				console.log('Response:', response);
				return response.json();
			})
			.then((data) => {
				if (data.code && data.code === 11000) {
					alert(t('sign-up-page.profile-exists'));
				} else {
					p.id = data._id;
					p.password = data.password;
					setProfile(p);
					profileTable.put(p);
					history.push('/profile');
				}
			})
			.catch((error) => {
				console.error('Error:', error);
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
		history.push('/sign-as-guest');
	};

	/// RENDER

	const { t } = useTranslation();

	const classes = useStyles();

	return (
		<React.Fragment>
			<TopBar big title={t('sign-up-page.title')} />
			<Container maxWidth='sm'>
				<form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
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
								{t('sign-up-page.with-google')}
							</Button>
						)}
					/> */}

					{/* <Button
						variant='outlined'
						color='primary'
						className={classes.field}
						onClick={onBtnSignAsProfile}
					>
						{t('sign-up-page.as-guest')}
					</Button> */}

					<div className={classes.separator}>or</div>

					<TextField
						required
						variant='outlined'
						inputRef={register}
						className={classes.field}
						name='name'
						label={t('sign-up-page.name')}
					/>

					<TextField
						required
						type='email'
						variant='outlined'
						inputRef={register}
						className={classes.field}
						name='email'
						label={t('sign-up-page.email')}
					/>

					<TextField
						required
						type='password'
						variant='outlined'
						inputRef={register}
						className={classes.field}
						name='password'
						label={t('sign-up-page.password')}
					/>

					<TextField
						required
						type='password'
						variant='outlined'
						inputRef={register}
						className={classes.field}
						name='passwordConfirm'
						label={t('sign-up-page.confirm-password')}
					/>

					<Button type='submit' variant='contained' color='primary' className={classes.field}>
						{t('sign-up-page.sign-up')}
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
