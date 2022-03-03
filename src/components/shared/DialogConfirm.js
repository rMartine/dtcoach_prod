import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function DialogConfirm(props) {
	const { t } = useTranslation();

	const [open, setOpen] = props.openState;

	const onBtn = (res) => () => {
		setOpen(false);
		if (props.onCallback) {
			props.onCallback(res);
		}
	};

	const handleSubmit = (ev) => {
		onBtn(true)();
		ev.preventDefault();
	};

	let title = props.title ? <DialogTitle>{props.title}</DialogTitle> : null;

	let text = props.text ? <DialogContentText>{props.text}</DialogContentText> : null;

	let content =
		text || props.children ? (
			<DialogContent>
				{text}
				{props.children}
			</DialogContent>
		) : null;

	let cancelButton = props.hideCancelButton ? null : (
		<Button type='button' onClick={onBtn(false)} color='primary'>
			{t('general.cancel')}
		</Button>
	);

	let confirmButton = props.hideConfirmButton ? null : (
		<Button type='submit' color='primary'>
			{t('general.confirm')}
		</Button>
	);

	return (
		<Dialog open={open}>
			{title}
			<form onSubmit={handleSubmit}>
				{content}
				<DialogActions>
					{cancelButton}
					{confirmButton}
				</DialogActions>
			</form>
		</Dialog>
	);
}
