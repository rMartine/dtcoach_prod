import Utils from 'common/Utils';
import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

let lang = 'en';
const langLocalStorage = Utils.loadFromLocalStorage('lang');
if (['en', 'es', 'fr', 'cn'].includes(lang)) {
	lang = langLocalStorage;
}

i18n
	// load translation using http -> see /public/locales
	// learn more: https://github.com/i18next/i18next-http-backend
	.use(Backend)
	// pass the i18n instance to react-i18next.
	.use(initReactI18next)
	// init i18next
	// for all options read: https://www.i18next.com/overview/configuration-options
	.init({
		lng: lang || 'en',
		// preload: ['en', 'es', 'fr'],
		fallbackLng: 'en',
		debug: false,
		react: {
			wait: true,
		},
		backend: {
			loadPath: '/dtcoach/locales/{{lng}}/{{ns}}.json',
		},
	});

export default i18n;
