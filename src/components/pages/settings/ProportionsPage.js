import Api from 'common/Api';
import Utils from 'common/Utils';
import DialogConfirm from 'components/shared/DialogConfirm';
import Display from 'components/shared/Display';
import TopBar from 'components/shared/TopBar';
import { useProfileState } from 'context/GlobalContext';
import { useDatabase } from 'hooks/UseDatabase';
import Profile from 'models/Profile';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

export default function ProportionsPage() {
	const { t } = useTranslation();
	const { profileTable } = useDatabase();
	const [profile, setProfile] = useProfileState();
	const classes = useStyles();
	const history = useHistory();

	const statusMessage = {
		empty: '-',
		notFound: t('proportions-page.status-not-found'),
		notComplete: t('proportions-page.status-not-complete'),
		notTPose: t('proportions-page.status-not-t-pose'),
		scanning: t('proportions-page.status-scanning'),
		scanComplete: t('proportions-page.status-scan-complete'),
	};

	const [status, setStatus] = React.useState(statusMessage.empty);
	const [fps, setFps] = React.useState(0);
	const captured = React.useRef([]);
	const [dialogOpen, setDialogOpen] = React.useState(true);

	const onPoseChange = (pose) => {
		const kps = pose.keypointsArray.filter((kp) => kp.score > 0.9);
		const ske = pose.skeleton;

		let currentStatus = status.empty;
		if (captured.current.length === 50) {
			captured.current.push(null);
			currentStatus = statusMessage.scanComplete;
			calcProportions();
		} else if (kps.length === 0) {
			currentStatus = statusMessage.notFound;
		} else if (Object.keys(ske).length < 8) {
			currentStatus = statusMessage.notComplete;
		} else if (!isTPose(pose)) {
			currentStatus = statusMessage.notTPose;
		} else if (Object.keys(ske).length === 8) {
			pose.extract_proportions();
			captured.current.push(pose);
			const percentageValue = captured.current.length / 50;
			const percentage = (percentageValue * 100).toFixed(2).toString();
			currentStatus = `${statusMessage.scanning} ${percentage}%`;
		}
		setStatus(currentStatus);
	};

	const onProcessCamera = (data) => {
		setFps(parseInt(data.fps));
	};

	const calcProportions = () => {
		const poses = captured.current.filter((p) => p !== null && p !== undefined);
		const parts = Object.keys(poses[0].proportions);
		const averaged = {};
		parts.forEach((part) => {
			averaged[part] = poses.reduce((accum, pose) => accum + pose.proportions[part], 0);
			averaged[part] /= poses.length;
		});

		const withProportions = {
			...profile,
			proportions: averaged,
		};

		const editedProfile = Profile.fromObject(withProportions);

		setProfile(editedProfile);

		profileTable.put(editedProfile);

		if (editedProfile.type === Profile.type.guest) {
			redirect();
		} else {
			console.log({ sentProfile: editedProfile });
			Api.user
				.update(editedProfile)
				.then((response) => {
					console.log({ response });
					return response.json();
				})
				.then((data) => {
					console.log({ data });
					redirect();
				});
		}
	};

	const redirect = () => {
		alert(statusMessage.scanComplete);
		history.push(Utils.getUrlQueryParam('redirect') || '/');
	};

	const isTPose = (pose) => {
		const kps = pose.keypoints;
		const threshold = 15;

		// ANGLE -- Wrist - Shoulder - Ankle

		// Right
		const rightAngleWSA = Utils.calculateAngleThreePoints(
			kps.rightWrist,
			kps.rightShoulder,
			kps.rightAnkle
		);

		if (Math.abs(rightAngleWSA - 90) > threshold) {
			return false;
		}

		// Left
		const leftAngleWSA = Utils.calculateAngleThreePoints(
			kps.leftWrist,
			kps.leftShoulder,
			kps.leftAnkle
		);

		if (Math.abs(leftAngleWSA - 90) > threshold) {
			return false;
		}

		// ANGLE -- Elbow - Shoulder - Knee

		// Right
		const rightAngleESK = Utils.calculateAngleThreePoints(
			kps.rightElbow,
			kps.rightShoulder,
			kps.rightKnee
		);

		if (Math.abs(rightAngleESK - 90) > threshold) {
			return false;
		}

		// Left
		const leftAngleESK = Utils.calculateAngleThreePoints(
			kps.leftElbow,
			kps.leftShoulder,
			kps.leftKnee
		);

		if (Math.abs(leftAngleESK - 90) > threshold) {
			return false;
		}

		return true;
	};

	// Todo: Take photo tpose example

	return (
		<>
			<TopBar title={t('proportions-page.title')} />
			<Container maxWidth='md' className={classes.container}>
				<Typography variant='subtitle1'>{t('proportions-page.instructions')}</Typography>
				<Typography className={classes.status} variant='subtitle1'>
					{status}
				</Typography>
				<div className={classes.displayContainer}>
					<Display
						onCurrentPoseChange={onPoseChange}
						onProcessCamera={onProcessCamera}
						enableCamera={true}
						label={t('training-page.click-camera')}
					/>
					<div className={classes.fps}>FPS: {fps}</div>
				</div>
			</Container>
			<DialogConfirm
				openState={[dialogOpen, setDialogOpen]}
				text={t('proportions-page.instructions')}
				hideCancelButton={true}
			>
				<img
					alt='feedback'
					src={process.env.PUBLIC_URL + '/img/tpose.png'}
					className={classes.image}
				/>
			</DialogConfirm>
		</>
	);
}

const useStyles = makeStyles((theme) => ({
	container: {
		paddingTop: theme.spacing(2),
		paddingBottom: theme.spacing(2),
		height: '100%',
		display: 'flex',
		flexFlow: 'column',
	},
	status: {
		marginTop: theme.spacing(2),
	},
	displayContainer: {
		marginTop: theme.spacing(2),
		flex: '1',
		position: 'relative',
	},
	fps: {
		color: 'white',
		backgroundColor: 'black',
		position: 'absolute',
		width: '80px',
		height: '40px',
		top: '0',
		left: '0',
		lineHeight: '40px',
		fontSize: 'larger',
		padding: '0 8px',
		opacity: '80%',
	},
	image: {
		maxWidth: '100%',
		padding: theme.spacing(2),
	},
}));
