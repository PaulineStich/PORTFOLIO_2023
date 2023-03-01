import properties from '@core/properties';
import settings from '@core/settings';
import {gsap, Power3, Expo} from 'gsap';

import MenuItem from './MenuItem';

class Menu {
    domMenuItems;
    menuItems = [] // array of menuItem instances
    animateProperties = {
        tx: {previous: 0, current: 0, amt: 0.05},
        ty: {previous: 0, current: 0, amt: 0.05},
        rotation: {previous: 0, current: 0, amt: 0.04}, 
        opacity: {previous: 0, current: 0, amt: 0.05}
    }

	preInit() {
		this.domMenuItems = document.querySelectorAll('.gallery-list_menu_item');
        [...this.domMenuItems].forEach((el, i) => {
            this.menuItems.push(new MenuItem(el, i, this.animateProperties))
        });
    }

	init() {
		return;
	}

	show() {
		this.isActive = true;
	}

	hide() {
		console.log('hide menu')
		return;
	}

	resize(width, height) {
	}

	delete() {}

	update(dt) {
        // if (this.menuItems) {
        //     console.log(this.menuItems)
        //     // this.menuItems.forEach(el => el.update(dt))
        // }
    }
}

export default new Menu();