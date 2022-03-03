import Utils from 'common/Utils';
import SelectVideoPage from 'components/pages/main/SelectVideoPage';
import SettingsPage from 'components/pages/main/SettingsPage';
import TopBar from 'components/shared/TopBar';
import { useMounted } from 'hooks/UseMounted';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AppBar from '@material-ui/core/AppBar';
import Container from '@material-ui/core/Container';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { makeStyles } from '@material-ui/core/styles';

export default function MainPage() {
	const classes = useStyles();
	const [value, setValue] = React.useState(0);
	const { isMounted } = useMounted();
	const { t } = useTranslation();

	const handleChange = (event, newValue) => {
		if (isMounted()) {
			setValue(newValue);
			setHash(newValue);
		}
	};

	const tabs = [
		{
			name: 'videos',
			label: t('main-page.videos'),
			page: <SelectVideoPage />,
		},
		{
			name: 'settings',
			label: t('main-page.settings'),
			page: <SettingsPage />,
		},
	];

	const setHash = (val) => {
		let hash = tabs[val].name;
		window.location.hash = hash;
	};

	React.useEffect(() => {
		let hash = Utils.getUrlHash();
		let tabIndex = tabs.findIndex((tab) => tab.name === hash);
		if (tabIndex !== -1) {
			setValue(tabIndex);
		} else {
			window.location.hash = tabs[0].name;
		}
	}, [tabs]);

	return (
		<>
			<TopBar title='DTCoach' />
			<AppBar position='static' color='default'>
				<Container maxWidth='md'>
					<Tabs
						value={value}
						onChange={handleChange}
						indicatorColor='primary'
						textColor='primary'
					>
						{tabs.map((tab, idx) => (
							<Tab key={tab.name} label={tab.label} {...a11yProps(idx)} />
						))}
					</Tabs>
				</Container>
			</AppBar>
			<Container maxWidth='md' className={classes.body}>
				{tabs.map((tab, idx) => (
					<TabPanel key={tab.name} value={value} index={idx}>
						{tab.page}
					</TabPanel>
				))}
			</Container>
		</>
	);
}

function TabPanel(props) {
	const { children, value, index, ...other } = props;
	const classes = useStyles();
	return (
		<div
			role='tabpanel'
			hidden={value !== index}
			id={`scrollable-auto-tabpanel-${index}`}
			aria-labelledby={`scrollable-auto-tab-${index}`}
			className={classes.flex}
			{...other}
		>
			{value === index && <>{children}</>}
		</div>
	);
}

TabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.any.isRequired,
	value: PropTypes.any.isRequired,
};

function a11yProps(index) {
	return {
		id: `scrollable-auto-tab-${index}`,
		'aria-controls': `scrollable-auto-tabpanel-${index}`,
	};
}

const useStyles = makeStyles((theme) => ({
	body: {
		flex: 1,
	},
	flex: {
		display: 'flex',
		flexFlow: 'column',
	},
}));
