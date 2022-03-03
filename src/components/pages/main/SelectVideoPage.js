import Utils from 'common/Utils';
import DialogConfirm from 'components/shared/DialogConfirm';
import { useMounted } from 'hooks/UseMounted';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

export default function SelectVideoPage() {
	const { t } = useTranslation();
	const { isMounted } = useMounted();

	document.title = `DTCoach - ${t('select-video-page.title')}`;

	/// INIT

	React.useEffect(() => {
		localStorage.removeItem('video');
	});

	/// VIDEO LIST

	const [videos, setVideos] = React.useState([]);

	React.useEffect(() => {
		fetch(process.env.PUBLIC_URL + '/clips/index.json')
			.then((res) => res.json())
			.then((data) => {
				data = data.sort((a, b) => a.title > b.title);
				if (isMounted()) {
					setVideos(data);
				}
			});
	}, []);

	/// LIST

	const [videoSelected, setVideoSelected] = React.useState(null);

	const onItemListClick = (video) => () => {
		setVideoSelected(video);
		setOpenDialog(true);
	};

	window.onpopstate = function (event) {
		if (isMounted()) {
			setOpenDialog(false);
		}
	};

	/// DIALOG

	const [openDialog, setOpenDialog] = React.useState(false);

	const history = useHistory();

	const onDialogCallback = (confirm) => {
		if (confirm) {
			Utils.saveIntoLocalStorage('video', videoSelected);
			history.push('/training');
			// const profile = Utils.loadFromLocalStorage('profile');
			// if (profile) {
			// 	history.push('/training');
			// } else {
			// 	history.push('/select-profile');
			// }
		} else {
			setVideoSelected(null);
			// history.goBack();
		}
	};

	/// VIDEO PREVIEW

	const [videoElement, setVideoElement] = React.useState(null);

	const onVidRefChange = React.useCallback((elem) => {
		setVideoElement(elem);
	}, []);

	React.useEffect(() => {
		if (videoElement && videoSelected) {
			videoElement.src = Utils.absoluteUrl(videoSelected.url);
		}
	}, [videoElement, videoSelected]);

	/// RENDER

	const lang = Utils.loadFromLocalStorage('lang');

	return (
		<>
			<List>
				{videos.map((video) => (
					<ListItem button key={video.id} onClick={onItemListClick(video)}>
						<img
							alt={video.title}
							src={process.env.PUBLIC_URL + '/' + video.thumb_url}
							style={{ height: '48px', marginRight: '15px' }}
						/>
						<ListItemText
							primary={lang ? video[`title_${lang}`] : video.title}
							secondary={
								<>
									{t('select-video-page.duration')}: {video.duration}s
									<br />
									{t('select-video-page.creator')}: {video.original_creator}
								</>
							}
						/>
					</ListItem>
				))}
			</List>
			<DialogConfirm
				openState={[openDialog, setOpenDialog]}
				title={t('select-video-page.preview')}
				onCallback={onDialogCallback}
			>
				<video
					controls
					autoPlay
					playsInline
					ref={onVidRefChange}
					type='video/mp4'
					id='vid-preview'
					style={{ width: '100%' }}
				/>
			</DialogConfirm>
		</>
	);
}
