import '@tensorflow/tfjs-backend-webgl';

import Pose from 'common/Pose';
import Utils from 'common/Utils';
import { useMounted } from 'hooks/UseMounted';
import React from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';
import Portal from '@material-ui/core/Portal';
import { makeStyles } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import * as posenet from '@tensorflow-models/posenet';
import * as tf from '@tensorflow/tfjs';

export default function Display(props) {
	let framerate = 10;
	let timeStep = 1 / framerate;

	const [label, setLabel] = React.useState(props.label);

	/// REFS

	const vidRef = React.useRef(null); // Video
	const cvsRef = React.useRef(null); // Canvas video copy
	const cvkRef = React.useRef(null); // Canvas keypoints

	/// INIT

	const { isMounted } = useMounted();

	React.useEffect(() => {
		let cvs = cvsRef.current;
		let cvk = cvkRef.current;
		cvs.ctx = cvs.getContext('2d');
		cvk.ctx = cvk.getContext('2d');

		let vid = vidRef.current;
		vid.addEventListener('loadedmetadata', () => {
			cvs.height = vid.videoHeight;
			cvs.width = vid.videoWidth;
			cvk.height = vid.videoHeight;
			cvk.width = vid.videoWidth;
		});

		return () => {
			stopCanvasUpdate();
		};
	}, []);

	/// CAMERA

	React.useEffect(() => {
		const video = vidRef.current;
		return () => {
			if (props.enableCamera) {
				video.pause();
				video.src = '';
				if (video.cameraStream) {
					video.cameraStream.getTracks()[0].stop();
				}
				console.log('camera stop');
			}
		};
	}, [props.enableCamera]);

	const tryStartCamera = () => {
		if (props.enableCamera) {
			setLabel('');
			startCamera();
		}
	};

	const startCamera = () => {
		if (window.confirm('Start camera?')) {
			let video = vidRef.current;

			if (!video.srcObject && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
				navigator.mediaDevices
					.getUserMedia({
						video: { deviceId: undefined },
					})
					.then((stream) => {
						video.srcObject = stream;
						video.cameraStream = stream;
						video.play();
						startCanvasUpdate();
						processCamera();
					})
					.catch((error) => {
						alert(error.message);
					});
			}
		}
	};

	let ticks = 0;
	let fps = 0;

	const processCamera = () => {
		if (cvsRef.current && net && isMounted()) {
			net.estimateSinglePose(cvsRef.current).then(function (framePose) {
				if (isMounted()) {
					currentPose = new Pose(framePose.keypoints);
					if (props.onCurrentPoseChange) {
						props.onCurrentPoseChange(currentPose);
					}
					drawKeypoints(framePose.keypoints);
					let now = new Date().getTime();
					if (ticks) {
						fps = 1000 / (now - ticks);
						if (props.onProcessCamera) {
							props.onProcessCamera({ fps: fps });
						}
					}
					ticks = now;
					setTimeout(processCamera, 0);
				}
			});
		}
	};

	/// VIDEO

	// let routine = null;
	let currentPose = null;

	React.useEffect(() => {
		let vid = vidRef.current;

		if (props.enableVideo) {
			let video = Utils.loadFromLocalStorage('video');
			if (video) {
				vid.src = process.env.PUBLIC_URL + '/' + video.url;
				getPoseFile(video);
			}
		}

		return () => {
			vid.removeEventListener('timeupdate', onVideoTimeUpdate);
		};
	}, [props.enableVideo]);

	const [routine, setRoutine] = React.useState(null);

	const getPoseFile = (video) => {
		fetch(process.env.PUBLIC_URL + '/' + video.pose_file_url)
			.then((res) => res.json())
			.then((data) => {
				setRoutine(data);
			});
	};

	const controlVideoClick = () => {
		if (props.enableVideo) {
			let vid = vidRef.current;
			if (vid.playing) {
				// pauseVideo();
			} else {
				setLabel('');
				playVideo();
			}
		}
	};

	const playVideo = () => {
		let vid = vidRef.current;
		if (vid && vid.src) {
			vid.addEventListener('timeupdate', onVideoTimeUpdate);
			vid.play();
			vid.playing = true;
			startCanvasUpdate();
		}
	};

	// const pauseVideo = () => {
	//     let vid = vidRef.current;
	//     if (vid.playing) {
	//         vid.removeEventListener('timeupdate', onVideoTimeUpdate);
	//         vid.pause();
	//         vid.playing = false;
	//         stopCanvasUpdate();
	//         props.onRoutine(0);
	//     }
	// }

	const getCurrentFrameNumber = () => {
		const ct = vidRef.current.currentTime;
		const cf = parseInt(ct * framerate);
		return cf;
	};

	/// CANVAS

	let intervalCanvasHandler = null;

	const startCanvasUpdate = () => {
		if (!intervalCanvasHandler) {
			intervalCanvasHandler = setInterval(updateCanvas, timeStep * 1000);
		}
	};

	const stopCanvasUpdate = () => {
		if (intervalCanvasHandler) {
			clearInterval(intervalCanvasHandler);
			intervalCanvasHandler = null;
		}
	};

	const updateCanvas = () => {
		let vid = vidRef?.current;
		let cvs = cvsRef?.current;

		if (vid && cvs) {
			cvs.ctx.drawImage(vid, 0, 0, vid.videoWidth, vid.videoHeight, 0, 0, cvs.width, cvs.height);

			if (routine) {
				const cfn = getCurrentFrameNumber();
				const f = routine.frames[cfn];
				if (f) {
					currentPose = new Pose(f.keypoints);
					if (props.onCurrentPoseChange && Object.keys(currentPose.skeleton).length > 0) {
						props.onCurrentPoseChange(currentPose);
					}
					drawKeypoints(f.keypoints);
				}
			}
		} else {
			stopCanvasUpdate();
		}
	};

	const clearCanvas = (cvs) => {
		cvs.ctx.clearRect(0, 0, cvs.width, cvs.height);
	};

	/// KEYPOINTS

	let pastKeypoints = null;

	const drawKeypoints = (keypoints) => {
		if (cvkRef && cvkRef.current) {
			clearCanvas(cvkRef.current);
			keypoints.forEach((kp, idx) => {
				if (kp.score > 0.9) {
					if (pastKeypoints) {
						let pastKp = pastKeypoints[idx];
						let d = Utils.distanceBetweenPoints(pastKp.position, kp.position);
						if (d < 5 && pastKp.score > kp.score) {
							// Checking if enough movement
							kp.position = pastKp.position;
							kp.score = pastKp.score;
						}
					}
					drawPoint(cvkRef.current, kp.position.x, kp.position.y, 5, 'aqua');
				}
			});
			pastKeypoints = keypoints;
		}
	};

	const drawPoint = (cvs, x, y, r, color) => {
		cvs.ctx.beginPath();
		cvs.ctx.arc(x, y, r, 0, 2 * Math.PI);
		cvs.ctx.fillStyle = color;
		cvs.ctx.fill();
	};

	/// MODAL

	const classes = useStyles();

	let [showModal, setShowModal] = React.useState(props.enableCamera);

	// React.useEffect(() => {
	// 	// setShowModal(props.enableVideo);
	// 	console.log({ enableVideo: props.enableVideo });
	// }, [props.enableVideo]);
	// let modal = '';
	// if (props.enableVideo) {
	// 	modal = showModal ? <div className={classes.modal}>Loading...</div> : null;
	// }

	/// POSENET

	const [net, setNet] = React.useState(null);

	React.useEffect(() => {
		if (props.enableCamera) {
			posenet
				.load({
					inputResolution: { width: 320, height: 240 },
					modelUrl: process.env.PUBLIC_URL + '/posenet/model-stride16.json',
				})
				.then(function (n) {
					setNet(n);
					console.log('posenet loaded');
					setShowModal(false);
				});
		}
	}, [props.enableCamera]);

	/// EVENTS

	const [progress, setProgress] = React.useState(0);

	const onVideoTimeUpdate = () => {
		let vid = vidRef.current;
		if (vid) {
			let currentTime = vid.currentTime;
			const vidDuration = props.videoDuration ? props.videoDuration : vid.duration;
			let currentProgress = parseInt((currentTime / vidDuration) * 100);
			if (isMounted()) {
				setProgress(currentProgress);
				if (props.onProgress) {
					props.onProgress(currentProgress);
				}
			}
		}
	};

	const onClick = () => {
		tryStartCamera();
		controlVideoClick();
	};

	/// RENDER

	let flip = '';
	let progressBar = '';

	if (props.enableCamera) {
		flip += ' ' + classes.flipHorizontal;
	} else if (props.enableVideo) {
		progressBar = (
			<LinearProgress variant='determinate' value={progress} className={classes.progressBar} />
		);
	}

	return (
		<div className={classes.root} onClick={showModal ? undefined : onClick}>
			<video ref={vidRef} className={classes.vid + flip} playsInline />
			<canvas ref={cvsRef} className={classes.cvs + flip} />
			<canvas ref={cvkRef} className={classes.cvk + flip} />
			<div className={classes.lbl}>{label}</div>
			{progressBar}
			{showModal ? (
				<Portal>
					<div className={classes.modal}>
						<Skeleton variant='rect' animation='wave' className={classes.flexFill} />
					</div>
				</Portal>
			) : null}
		</div>
	);
}

const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: 'black',
		height: '100%',
		width: '100%',
		display: 'flex',
		flexFlow: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
	},
	lbl: {
		color: 'white',
		backgroundColor: 'black',
		fontSize: 'larger',
		textAlign: 'center',
		height: '30px',
		maxWidth: '80%',
		zIndex: '1',
	},
	vid: {
		// display: 'none',
		height: '0px',
	},
	vidDev: {
		height: '150px',
		border: 'red solid 5px',
	},
	cvs: {
		position: 'absolute',
		maxHeight: '100%',
		maxWidth: '100%',
	},
	cvsDev: {
		height: '150px',
		border: 'blue solid 5px',
	},
	cvk: {
		position: 'absolute',
		maxHeight: '100%',
		maxWidth: '100%',
	},
	cvkDev: {
		height: '150px',
		border: 'green solid 5px',
	},
	flipHorizontal: {
		transform: 'rotateY(180deg)',
	},
	progressBar: {
		zIndex: '1',
		width: '100%',
		position: 'absolute',
		bottom: '0',
		height: '15px',
	},
	modal: {
		position: 'fixed',
		top: theme.mixins.toolbar.minHeight,
		width: '100%',
		height: `calc(100% - ${theme.mixins.toolbar.minHeight}px)`,
		backgroundColor: 'white',
		zIndex: 1300,
		// paddingTop: theme.spacing(2),
		// paddingBottom: theme.spacing(2),
		padding: theme.spacing(2),
		display: 'flex',
		flexFlow: 'column',
	},
	flexFill: {
		display: 'flex',
		flexFlow: 'column',
		flex: 1,
	},
}));
