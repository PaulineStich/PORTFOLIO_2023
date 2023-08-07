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
	}

	hide() {
		console.log('hide gallery');
		return;
	}

	resize(width, height) {}

	delete() {}

	update(dt) {
		// Update gallery items
	}
}

export default new Gallery();
