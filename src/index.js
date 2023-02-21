import './index.less';
import * as THREE from 'three';
import scrollManager from '@scroll/scrollManager';

import settings from '@core/settings';
import properties from '@core/properties';

import app from '@app/app';
import ui from '@ui/ui';
import input from '@input/input';
import gui from '@utils/gui';

let dateTime = performance.now();
let raf;

function run() {
	for (const [domain, value] of Object.entries(settings.CROSS_ORIGINS)) {
		properties.loader.setCrossOrigin(domain, value);
	}

	properties.viewportResolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
	properties.width = properties.viewportResolution.x;
	properties.height = properties.viewportResolution.y;

	app.initEngine();
	settings.LOOK_DEV_MODE && gui.preInit();

	input.preInit();
	scrollManager.init();

	// preload the font if we need to use the font in canvas
	// properties.loader.add('Roboto:400,Roboto:400:italic', { type: 'font' });
	ui.preInit();
	app.preInit();

	window.addEventListener('resize', onResize);
	onResize();
	loop();

	ui.preload(init, start);
}

function init() {
	settings.LOOK_DEV_MODE && gui.init();
	input.init();

	ui.init();
	app.init();

	properties.hasInitialized = true;
}

function start() {
	scrollManager.isActive = true;
	ui.start();
	app.start();

	properties.hasStarted = true;
	onResize();
}

function onResize() {
	properties.viewportResolution.set(window.innerWidth, window.innerHeight);
	let viewportWidth = (properties.viewportWidth = properties.viewportResolution.x);
	let viewportHeight = (properties.viewportHeight = properties.viewportResolution.y);

	scrollManager.resize(viewportWidth, viewportHeight);
	ui.resize(viewportWidth, viewportHeight);
	app.resize(viewportWidth, viewportHeight);
}

function update(dt) {
	input.update(dt);
	scrollManager.update(dt);
	ui.update(dt);
	app.update(dt);
	input.postUpdate(dt);
}

function loop() {
	let newDateTime = performance.now();
	let dt = (newDateTime - dateTime) / 1000;
	dateTime = newDateTime;
	dt = Math.min(dt, 1 / 20);

	update(dt);

	raf = window.requestAnimationFrame(loop);
}

run();
