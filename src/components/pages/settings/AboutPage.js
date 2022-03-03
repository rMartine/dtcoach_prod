import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

export default function AboutPage() {
	const classes = makeStyles((theme) => ({
		rootAbout: {
			display: 'flex',
			flexFlow: 'column',
			alignItems: 'center',
		},
		image: {
			marginBottom: theme.spacing(1),
		},
		hr: {
			width: '100%',
			marginTop: theme.spacing(2),
			marginBottom: theme.spacing(2),
		},
	}))();

	return (
		<div className={classes.rootAbout}>
			<div className={classes.image}>
				<img alt='logo' src={process.env.PUBLIC_URL + '/img/logo192.png'} />
			</div>
			<div>
				Developed by&nbsp;
				<a href='https://mcrlab.net/' title='MCRLab'>
					MCRLab
				</a>
				.
			</div>
			<div className={classes.hr}>
				<hr />
			</div>
			<div>
				Icons made by&nbsp;
				<a href='http://www.freepik.com/' title='Freepik'>
					Freepik
				</a>
				&nbsp;from&nbsp;
				<a href='https://www.flaticon.com/' title='Flaticon'>
					www.flaticon.com
				</a>
				.
			</div>
		</div>
	);
}
