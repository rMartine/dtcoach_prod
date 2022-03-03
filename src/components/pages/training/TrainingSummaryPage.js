import Utils from 'common/Utils';
import TopBar from 'components/shared/TopBar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';

export default function TrainingSummaryPage() {
	const { t } = useTranslation();
	const [scores, setScores] = React.useState([]);

	document.title = 'DTCoach - ' + t('training-summary-page.title');

	React.useEffect(() => {
		const load = () => {
			// const session = Utils.loadFromLocalStorage('session');
			// if (session) {
			// 	console.log({ session });
			// 	const mapped = session.frames.map((frame, index) => ({
			// 		score: frame.sc ? parseInt(frame.sc * 100) : null,
			// 		time: (index * 0.1).toFixed(2),
			// 	}));
			// 	setScores(mapped);
			// } else {
			// 	setTimeout(load, 300);
			// }
			const scores = Utils.loadFromLocalStorage('scores');
			if (scores) {
				console.log({ scores });
				const mapped = scores.map((score, index) => ({
					score: score ? parseInt(score * 100) : null,
					time: (index * 0.1).toFixed(2),
				}));
				setScores(mapped);
			} else {
				setTimeout(load, 300);
			}
		};

		load();
	}, []);

	/// EVENTS

	const history = useHistory();

	const onBtnSelectClick = () => {
		history.push('/');
	};

	/// RENDER

	const classes = useStyles();

	return (
		<>
			<TopBar title={t('training-summary-page.title')} />
			<Container maxWidth='md' className={classes.body}>
				<div className={classes.label}>{t('training-summary-page.graph-desc')}</div>
				<div className={classes.chart}>
					<ResponsiveContainer>
						<LineChart data={scores} margin={{ right: 30, left: 10, bottom: 20 }}>
							<CartesianGrid strokeDasharray='3 3' />
							<XAxis
								dataKey='time'
								interval={499}
								label={{
									value: t('training-summary-page.time') + ' (s)',
									position: 'bottom',
									// dx: 20, dy: -30
								}}
							></XAxis>
							<YAxis
								dataKey='score'
								label={{
									value: t('training-summary-page.score') + ' (%)',
									angle: -90,
									position: 'left',
									dx: 20,
									dy: -30,
								}}
							></YAxis>
							<Tooltip />
							<Legend />
							<Line
								type='basis'
								dataKey='score'
								stroke='#3f51b5'
								strokeWidth='3'
								legendType='none'
								dot={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
				<div className={classes.buttons}>
					{/* <Button
						color='primary'
						variant='contained'
						target='_blank'
						// href='https://docs.google.com/forms/d/e/1FAIpQLScu7GRfppxwTBiXnUK1p5an2MXWV-eaIGZsTIIyLpvwOEsLAQ/viewform?usp=sf_link'
						href={t('training-summary-page.evaluation-url')}
					>
						{t('training-summary-page.evaluate-system')}
					</Button> */}
					<Button color='default' variant='contained' onClick={onBtnSelectClick}>
						{t('training-summary-page.select-video')}
					</Button>
				</div>
			</Container>
		</>
	);
}

const useStyles = makeStyles((theme) => ({
	body: {
		height: '100%',
		// padding: '15px'
		display: 'flex',
		flexDirection: 'column',
	},
	label: {
		padding: '24px 0',
		// fontSize: '0.875rem'
	},
	chart: {
		flex: '1',
		maxHeight: '600px',
	},
	buttons: {
		padding: '24px 16px',
		display: 'flex',
		justifyContent: 'space-evenly',
		textAlign: 'center',
	},
}));
