import React from 'react';
import Fab from '@material-ui/core/Fab';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';

export default function FabAdd(props) {
	const classes = useStyles();

	return (
		<div>
			<Fab
				className={classes.fab}
				color='primary'
				aria-label='add'
				onClick={props.onClick}
				// variant='extended'
			>
				<AddIcon />
			</Fab>
		</div>
	);
}

const useStyles = makeStyles((theme) => ({
	fab: {
		position: 'absolute',
		bottom: theme.spacing(2),
		right: theme.spacing(2),
	},
}));
