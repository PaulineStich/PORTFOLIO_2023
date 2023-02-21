import { DetectUA } from 'detect-ua';

const detectUA = new DetectUA();
const userAgent = (navigator.userAgent || navigator.vendor).toLowerCase();
const browserName = detectUA.browser['name'];

class Browser {
	// device
	isMobile = detectUA.isMobile || detectUA.isTablet;
	isDesktop = detectUA.isDesktop;
	device = this.isMobile ? 'mobile' : 'desktop';

	// os
	isAndroid = Boolean(detectUA.isAndroid);
	isIOS = Boolean(detectUA.isiOS);
	isMacOS = Boolean(detectUA.isMacOS);
	isWindows = Boolean(detectUA.isWindows['version'] !== null);
	isLinux = Boolean(userAgent.indexOf('linux') != -1);

	// browser
	ua = userAgent;
	isEdge = browserName === 'Microsoft Edge';
	isIE = browserName === 'Internet Explorer';
	isFirefox = browserName === 'Firefox';
	isChrome = browserName === 'Chrome';
	isOpera = browserName === 'Opera';
	isSafari = browserName === 'Safari';

	isRetina = window.devicePixelRatio && window.devicePixelRatio >= 1.5;
	devicePixelRatio = window.devicePixelRatio || 1;
	cpuCoreCount = navigator.hardwareConcurrency || 1;

	baseUrl = document.location.origin;
	isIFrame = window.self !== window.top;

	constructor() {
		// console.log(this);
	}
}

const browser = new Browser();
export default browser;
