import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Container from '@material-ui/core/Container';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

export default function TopBar(props) {
	const classes = useStyles();

	let title = '';
	if (props.title) {
		title = <Typography variant={props.big ? 'h4' : 'h6'}>{props.title}</Typography>;
		document.title = 'DTCoach - ' + props.title;
	}

	// let logo = ''
	// if (props.logo) {
	//   logo = <img alt='Logo' src={process.env.PUBLIC_URL + '/img/logo512.png'} height={50} />
	// }

	return (
		<AppBar
			position='static'
			className={props.big ? classes.topBarRootBig : classes.topBarRoot}
			elevation={props.noElevation ? 0 : 3}
		>
			<Toolbar disableGutters>
				<Container maxWidth='md'>{title}</Container>
			</Toolbar>
		</AppBar>
	);
}

const useStyles = makeStyles((theme) => ({
	topBarRoot: {},
	topBarRootBig: {
		height: theme.mixins.toolbar.minHeight * 2,
		justifyContent: 'flex-end',
		paddingBottom: theme.spacing(1),
		marginBottom: theme.spacing(2),
	},
	topBarRootLogo: {},
}));
