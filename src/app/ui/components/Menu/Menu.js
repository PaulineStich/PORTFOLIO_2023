import properties from '@core/properties';
import settings from '@core/settings';
import { gsap, Power3, Expo } from 'gsap';

import MenuItem from './MenuItem';
import data from '../../../data/projects';
import Project from '../Project/Project';

class Menu {
	domMenu;
	domMenuItems;
	menuItems = []; // array of menuItem instances
	animateProperties = {
		tx: { previous: 0, current: 0, amt: 0.05 },
		ty: { previous: 0, current: 0, amt: 0.05 },
		rotation: { previous: 0, current: 0, amt: 0.04 },
		opacity: { previous: 0, current: 0, amt: 0.05 },
	};

	preInit() {
		this._generateMenuItems();
		let project = new Project(data);
		this.domMenuItems = document.querySelectorAll('.gallery-list_menu_item');
		[...this.domMenuItems].forEach((el, i) => {
			this.menuItems.push(new MenuItem(el, i, this.animateProperties, project, project.listItems[i]));
		});
	}

	init() {
		return;
	}

	_generateMenuItems() {
		this.domMenu = document.getElementById('gallery-list_menu');
		data.forEach((item, index) => {
			//<a class="gallery-list_menu_item" data-text="Your text here">Your text here</a>
			let menuItem = document.createElement('a');
			menuItem.className = 'gallery-list_menu_item';
			menuItem.dataset.img = item.img;
			menuItem.dataset.text = item.id;

			let h2 = document.createElement('h2');
			h2.textContent = item.id;

			menuItem.appendChild(h2);
			this.domMenu.appendChild(menuItem);
		});
	}

	show() {
		this.isActive = true;
	}

	hide() {
		// console.log('hide menu');
		return;
	}

	resize(width, height) {}

	delete() {}

	update(dt) {
		// if (this.menuItems) {
		//     console.log(this.menuItems)
		//     // this.menuItems.forEach(el => el.update(dt))
		// }
	}
}

export default new Menu();
