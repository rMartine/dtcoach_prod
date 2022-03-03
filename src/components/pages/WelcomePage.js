import '@brainhubeu/react-carousel/lib/style.css';

import Utils from 'common/Utils';
import DialogSelectLanguage from 'components/shared/DialogSelectLanguage';
import TopBar from 'components/shared/TopBar';
import { useDatabase } from 'hooks/UseDatabase';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import Carousel from '@brainhubeu/react-carousel';
import Container from '@material-ui/core/Container';
import Fab from '@material-ui/core/Fab';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import ArrowForward from '@material-ui/icons/ArrowForward';
import Language from '@material-ui/icons/Language';

export default function WelcomePage() {
	/// LANG

	const [openLangDialog, setOpenLangDialog] = React.useState(false);

	React.useEffect(() => {
		const lang = Utils.loadFromLocalStorage('lang', '');
		if (!lang) {
			setOpenLangDialog(true);
		}
	}, []);

	/// NAVIGATION

	const finalSlideIndex = 2;
	const [slide, setSlide] = React.useState(0);

	const history = useHistory();
	const { profileTable } = useDatabase();

	const onBtnContinueClick = () => {
		if (slide < finalSlideIndex) {
			setSlide(slide + 1);
		} else {
			profileTable.count().then((count) => {
				if (count > 0) {
					history.push('/select-profile');
				} else {
					history.push('/sign-in');
				}
			});
		}
	};

	/// RENDER

	const { t } = useTranslation();

	const classes = useStyles();

	return (
		<React.Fragment>
			<TopBar big title={t('welcome-page.title')} />
			<Container className={classes.body} maxWidth='sm'>
				<Carousel value={slide} onChange={(v) => setSlide(v)} keepDirectionWhenDragging>
					<div className={classes.carouselPage}>
						<img
							alt='pose'
							src={process.env.PUBLIC_URL + '/img/icons/pose.png'}
							className={classes.image}
						/>
						<Typography>{t('welcome-page.p1')}</Typography>
					</div>
					<div className={classes.carouselPage}>
						<img
							alt='feedback'
							src={process.env.PUBLIC_URL + '/img/icons/feedback.png'}
							className={classes.image}
						/>
						<Typography>{t('welcome-page.p2')}</Typography>
					</div>
					<div className={classes.carouselPage}>
						<img
							alt='no_camera'
							src={process.env.PUBLIC_URL + '/img/icons/no_camera.png'}
							className={classes.image}
						/>
						<Typography>{t('welcome-page.p3')}</Typography>
					</div>
				</Carousel>
				<Fab
					color='primary'
					className={classes.fabLeft}
					onClick={() => setOpenLangDialog(true)}
				>
					<Language />
				</Fab>
				<Fab
					variant='extended'
					color='primary'
					className={classes.fabRight}
					onClick={onBtnContinueClick}
				>
					{t('general.continue')} &nbsp; <ArrowForward />
				</Fab>
			</Container>
			<DialogSelectLanguage open={openLangDialog} setOpen={setOpenLangDialog} />
		</React.Fragment>
	);
}

const useStyles = makeStyles((theme) => ({
	body: {
		flex: 1,
		position: 'relative',
		display: 'flex',
		flexFlow: 'column',
		alignItems: 'center',
	},
	image: {
		height: '150px',
		margin: theme.spacing(2),
	},
	fabLeft: {
		position: 'absolute',
		bottom: theme.spacing(2),
		left: theme.spacing(2),
	},
	fabRight: {
		position: 'absolute',
		bottom: theme.spacing(2),
		right: theme.spacing(2),
	},
	carouselPage: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		height: '100%',
	},
}));
