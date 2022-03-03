import Api from 'common/Api';
import Pose from 'common/Pose';
import Utils from 'common/Utils';
import DialogConfirm from 'components/shared/DialogConfirm';
import Display from 'components/shared/Display';
import TopBar from 'components/shared/TopBar';
import { useDatabase } from 'hooks/UseDatabase';
import { useInterval } from 'hooks/UseInterval';
import { useOrientation } from 'hooks/UseOrientation';
import Session from 'models/Session';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactLoading from 'react-loading';
import { useHistory } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';

export default function TrainingPage() {
	/// INIT

	const { t } = useTranslation();
	const { sessionTable } = useDatabase();

	const [profile] = React.useState(Utils.loadFromLocalStorage('profile'));
	const [video] = React.useState(Utils.loadFromLocalStorage('video'));

	const [showLoading, setShowLoading] = React.useState(false);

	document.title = 'DTCoach - ' + t('training-page.title');

	localStorage.removeItem('session');

	React.useEffect(() => {}, []);

	useInterval(() => {
		compare();
	}, 100);

	/// COMPARE

	const [studentPose, setStudentPose] = React.useState(null);
	const [coachPose, setCoachPose] = React.useState(null);

	// let scores = [];

	const [score, setScore] = React.useState(t('training-page.score'));
	const [scores, setScores] = React.useState([]);
	const frames = React.useRef([]);

	const compare = () => {
		if (studentPose && coachPose) {
			try {
				let res = Pose.compare(studentPose, coachPose);
				let s = res.score;

				if (isNaN(s)) {
					setScore(t('training-page.distance-warning'));
					setScores([...scores, null]);
				} else {
					const scoreValue = (s * 100).toFixed(2).toString();
					const scoreLabel = `${t('training-page.score')}: ${scoreValue}`;
					setScore(scoreLabel);
					setScores([...scores, s]);

					studentPose.extract_proportions();
					frames.current.push({
						co: Pose.simplifyAttrs(studentPose.keypoints), // Coordinates
						coc: Pose.simplifyAttrs(coachPose.keypoints), // CoachCoordinates
						an: Pose.simplifyAttrs(studentPose.skeleton), // Angles
						di: Pose.simplifyAttrs(studentPose.proportions), // Distances
						sc: s, // Score
					});
				}
			} catch (ex) {
				console.log(ex);
				setScore('-');
			}
		}
	};

	/// DIALOG

	const [dialogOpen, setDialogOpen] = React.useState(true);

	/// EVENTS

	const history = useHistory();

	const [progress, setProgress] = React.useState(0);

	const sent = React.useRef(false);

	React.useEffect(() => {
		const saveScoring = () => {
			if (sent.current) return;
			sent.current = true;

			setShowLoading(true);

			let scoring = {
				id: Utils.newGuid(),
				id_video: video.id,
				id_profile: profile?.id,
				scores: scores,
			};

			let session = new Session({
				id: Utils.newGuid(),
				idVideo: video.id,
				idProfile: profile?.id,
				date: new Date(),
				fps: 10,
				frames: frames.current,
			});

			Api.session
				.save(session)
				.then((response) => {
					console.log({ response });
					return response.json();
				})
				.then((data) => {
					session.id = data.id;
					// sessionTable.put(session);
					// Utils.saveIntoLocalStorage('session', session);
					Utils.saveIntoLocalStorage('scores', scores);
					history.push('/training-summary');
				})
				.catch((error) => {
					console.log({ error });
				});
		};

		if (progress === 100) {
			setProgress(101);
			saveScoring();
		}
	}, [progress, history, video, profile, scores]);

	const [fps, setFps] = React.useState('');

	const onProcessCamera = (data) => {
		setFps(parseInt(data.fps));
	};

	/// RENDER

	const orientation = useOrientation((newOrientation) => {
		setGridSm(calcGridSm(newOrientation));
	});

	const calcGridSm = (ori) => {
		if (ori === orientation.PORTRAIT) {
			return 12;
		} else if (ori === orientation.LANDSCAPE) {
			return 6;
		}
	};

	const [gridSm, setGridSm] = React.useState(calcGridSm(orientation.getOrientation()));

	const classes = useStyles();

	return (
		<>
			{showLoading ? (
				<div className={classes.loadingContainer}>
					<ReactLoading className={classes.loading} type='spin' />
				</div>
			) : null}

			<TopBar title={t('training-page.title')} />
			<Grid container spacing={2} justify='center' className={classes.container}>
				<Grid item xs={12} sm={gridSm} md={6} lg={6} className={classes.item}>
					<Paper className={classes.paper}>
						<Display
							onCurrentPoseChange={(p) => setStudentPose(p)}
							onProcessCamera={onProcessCamera}
							enableCamera={true}
							label={t('training-page.click-camera')}
						/>
						<div className={classes.score}>{score}</div>
						<div className={classes.fps}>FPS: {fps}</div>
					</Paper>
				</Grid>
				<Grid item xs={12} sm={gridSm} md={6} lg={6} className={classes.item}>
					<Paper className={classes.paper}>
						<Display
							onCurrentPoseChange={(p) => setCoachPose(p)}
							onProgress={(p) => setProgress(p)}
							enableVideo={true}
							label={t('training-page.click-coach')}
						/>
					</Paper>
				</Grid>
			</Grid>

			<DialogConfirm
				openState={[dialogOpen, setDialogOpen]}
				title={t('training-page.dialog-title')}
				text={t('training-page.dialog-text')}
				noCancelButton={true}
			></DialogConfirm>
		</>
	);
}

const useStyles = makeStyles((theme) => ({
	loadingContainer: {
		position: 'absolute',
		height: '100vh',
		width: '100vw',
		backgroundColor: 'black',
		opacity: '0.8',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: '9999',
	},
	loading: {},
	root: {
		// flex: "1 1 auto",
		height: '100%',
		position: 'relative',
	},
	container: {
		height: '100%',
		width: 'auto',
		padding: theme.spacing(1),
		margin: '0',
	},
	item: {},
	paper: {
		height: '100%',
		position: 'relative',
	},
	score: {
		color: 'white',
		backgroundColor: 'black',
		opacity: '80%',
		position: 'absolute',
		width: '100%',
		height: '40px',
		lineHeight: '40px',
		textAlign: 'center',
		fontSize: 'larger',
		bottom: '0',
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
}));
