import GalleryItem from './GalleryItem';
import data from '../../../data/projects';
import Project from '../Project/Project';

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
		let project = new Project(data);
		this.domGalleryItems = document.querySelectorAll('.gallery-view_menuImage');
		[...this.domGalleryItems].forEach((el, i) => {
			this.galleryItems.push(new GalleryItem(el, i, this));
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
