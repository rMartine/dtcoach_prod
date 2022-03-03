import Utils from 'common/Utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core/styles';

export default function DialogSelectLanguage(props) {
	const { t, i18n } = useTranslation();

	const setLanguage = (lang) => () => {
		i18n.changeLanguage(lang);
		Utils.saveIntoLocalStorage('lang', lang);
		close();
	};

	const close = () => {
		setOpen(false);
	};

	/// RENDER

	const { open, setOpen } = props;

	const classes = useStyles();

	return (
		<Dialog open={open}>
			<DialogTitle>{t('select-language-dialog.title')}</DialogTitle>
			<DialogContent>
				<div className={classes.buttons}>
					<Button onClick={setLanguage('en')} variant='contained'>
						English
					</Button>
					<Button onClick={setLanguage('fr')} variant='contained'>
						Français
					</Button>
					<Button onClick={setLanguage('cn')} variant='contained'>
						中文
					</Button>
					<Button onClick={setLanguage('es')} variant='contained'>
						Español
					</Button>
				</div>
			</DialogContent>
			<DialogActions>
				<Button type='submit' color='primary' onClick={close}>
					{t('general.cancel')}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

const useStyles = makeStyles((theme) => ({
	buttons: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
		width: '200px',
		height: '180px',
	},
}));
