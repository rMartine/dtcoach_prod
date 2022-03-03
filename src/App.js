import TestPage from 'components/pages/TestPage';
import WelcomePage from 'components/pages/WelcomePage';
import SelectProfilePage from 'components/pages/account/SelectProfilePage';
import SignAsGuestPage from 'components/pages/account/SignAsGuestPage';
import SignInPage from 'components/pages/account/SignInPage';
import SignUpPage from 'components/pages/account/SignUpPage';
import MainPage from 'components/pages/main/MainPage';
import ProfilePage from 'components/pages/settings/ProfilePage';
import ProportionsPage from 'components/pages/settings/ProportionsPage';
import TrainingPage from 'components/pages/training/TrainingPage';
import TrainingSummaryPage from 'components/pages/training/TrainingSummaryPage';
import PrivateRoute from 'components/shared/PrivateRoute';
import { GlobalContextWrapper } from 'context/GlobalContext';
import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';

export default function App() {
	const theme = createMuiTheme({
		palette: {
			primary: {
				main: '#29388e',
			},
		},
	});

	const classes = useStyles();

	return (
		<React.Suspense fallback={<div>Loading...</div>}>
			<GlobalContextWrapper>
				<ThemeProvider theme={theme}>
					<CssBaseline />
					<BrowserRouter basename={process.env.PUBLIC_URL}>
						<div id='content' className={classes.content}>
							<Switch>
								<Route path='/welcome' component={WelcomePage} />
								<Route path='/sign-up' component={SignUpPage} />
								<Route path='/sign-in' component={SignInPage} />
								<Route path='/sign-as-guest' component={SignAsGuestPage} />
								<Route path='/select-profile' component={SelectProfilePage} />
								<Route path='/test' component={TestPage} />
								<PrivateRoute path='/training' component={TrainingPage} />
								<PrivateRoute path='/training-summary' component={TrainingSummaryPage} />
								<PrivateRoute path='/profile' component={ProfilePage} />
								<PrivateRoute path='/proportions' component={ProportionsPage} />
								<PrivateRoute path='/' component={MainPage} />
							</Switch>
						</div>
					</BrowserRouter>
				</ThemeProvider>
			</GlobalContextWrapper>
		</React.Suspense>
	);
}

const useStyles = makeStyles((theme) => ({
	content: {
		flex: 1,
		display: 'flex',
		flexFlow: 'column',
	},
}));
