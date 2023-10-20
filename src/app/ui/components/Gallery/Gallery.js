import { gsap } from 'gsap';

import GalleryItem from './GalleryItem';
import data from '../../../data/projects';
import Project from '../../pages/Project/Project';

class Gallery {
	domGallery;
	domGalleryItems;
	galleryItems = [];
	animateProperties = {
		tx: { previous: 0, current: 0, amt: 0.05 },
		ty: { previous: 0, current: 0, amt: 0.05 },
		rotation: { previous: 0, current: 0, amt: 0.04 },
		opacity: { previous: 0, current: 0, amt: 0.05 },
	};

	preInit() {
		this._generateGalleryItems();
		this.project = new Project(data);
		this.domGalleryItems = document.querySelectorAll('.gallery-view_menuImage');
		[...this.domGalleryItems].forEach((el, i) => {
			// console.log(this.project);
			this.galleryItems.push(new GalleryItem(el, i, this, this.project, this.project.listItems[i]));
			this.index = i;
		});
	}

	init() {}

	_generateGalleryItems() {
		this.domGallery = document.getElementById('gallery-view_menuImages');
		data.forEach((item) => {
			let galleryItem = document.createElement('img');
			galleryItem.className = 'gallery-view_menuImage';
			galleryItem.src = item.imgHero;
			galleryItem.alt = item.id;
			this.domGallery.appendChild(galleryItem);
		});
	}

	show() {
		this.isActive = true;
		// console.log('show the gallery component now');

		// fade in title
		gsap.timeline()
			.to(
				'.gallery-view_menuTitle',
				{
					opacity: 1,
				},
				0.15,
			)
			.fromTo(
				'.gallery-view_menuTitle span',
				{
					willChange: 'transform, opacity',
					transformOrigin: '50% 100%',
					opacity: 0,
					rotationX: 90,
					translateY: 100,
				},
				{
					duration: 1.7,
					ease: 'expo',
					opacity: 1,
					rotationX: 0,
					translateY: 0,
					stagger: {
						each: 0.015,
						from: 'start',
					},
				},
				0.15,
			);

		// fade in images from gallery
		this.galleryItems.forEach((galleryItem) => galleryItem.show());

		return;
	}

	hide() {
		this.isActive = false;
		// console.log('hide gallery now');

		this.galleryItems.forEach((galleryItem) => galleryItem.hide());
		return;
	}

	resize(width, height) {}

	delete() {}

	update(dt) {
		// Update gallery items
		this.galleryItems.forEach((galleryItem) => galleryItem.update());
	}
}

export default new Gallery();
