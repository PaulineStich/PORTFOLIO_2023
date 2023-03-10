import properties from '@core/properties';
import settings from '@core/settings';
import {STATUS} from '../constants';

import menu from '@app/ui/components/Menu/Menu';

class Home {

	galleryListMenu;
	components = [menu];

	preInit() {
		this.domContainer = document.querySelector('#home');
		this.components.forEach((component) => component.preInit());
	}
	
	init() {
		this.galleryListMenu = menu;
		this.components.forEach((component) => component.init());
	}
	
	show() {
		this.isActive = true;
		// console.log("show home page")
		// this.fadeInAnimation();
	}
	
	hide() {
		// console.log("hide home page")
		// this.fadeOutAnimation();
		return;
	}

	resize(width, height) {
		this.components.forEach((component) => component.resize(width, height));
		return;
	}

    // fadeInAnimation() {}

	// fadeOutAnimation() {}

	delete() {}

	update(dt) {
		this.components.forEach((component) => component.update(dt));
	}
}

export default new Home();
