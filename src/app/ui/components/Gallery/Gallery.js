import { gsap, Power3, Power1 } from 'gsap';
import input from '@input/input';

import GalleryItem from './GalleryItem';
import data from '../../../data/projects';
import Project from '../../pages/Project/Project';

class Gallery {
	domGallery = document.getElementById('gallery-view_menuImages');
	domGalleryItems;
	domGalleryCounter = document.querySelector('.gallery-view-counter');
	domGalleryTitle = document.querySelector('.gallery-view_menuTitle');
	galleryItems = [];
	hasFinishedIntroAnimation = false;

	animateProperties = {
		tx: { previous: 0, current: 0, amt: 0.05 },
		ty: { previous: 0, current: 0, amt: 0.05 },
		rotation: { previous: 0, current: 0, amt: 0.04 },
		opacity: { previous: 0, current: 0, amt: 0.05 },
	};

	// parrallax effect for title and gallery
	state = {
		aimX: 0,
		aimY: 0,
		current: {
			title: { x: 0, y: 0 },
			galleryCounter: { x: 0, y: 0 },
		},
	};

	// gallery follow
	globalIndex = 0;
	last = { x: 0, y: 0 };

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

	init() {
		this._initEvents();
	}

	_initEvents() {
		// window.onmousemove = (e) => this._handleOnMove();
	}

	_generateGalleryItems() {
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
			)
			// fade in gallery
			.to(
				this.domGalleryItems,
				{
					// transform: 'translate(-50%, -50%)',
					y: 0,
					opacity: 1,
					duration: 1.5,
					ease: Power3.easeInOut,
					stagger: {
						amount: 0.5,
						grid: [Math.floor(window.innerWidth / 200), Math.floor(window.innerHeight / 200)],
						from: 'start',
					},
					onComplete: () => {
						// this._startGalleryTimer();
						this.hasFinishedIntroAnimation = true;
					},
				},
				0,
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

	// gallery follow
	_activate = (image, x, y) => {
		// image.style.left = `${x}px`;
		// image.style.top = `${y}px`;
		image.style.zIndex = this.globalIndex;

		gsap.fromTo(
			image,
			{
				opacity: 0,
				scale: 0.8,
				transformOrigin: 'center center',
			},
			{
				left: x,
				top: y,
				transform: 'translate(-50%, -50%)',
				ease: 'Power3.easeInOut',
				duration: 0.8,
				opacity: 1,
				scale: 1,
			},
		);

		image.dataset.status = 'active';

		this.last = { x, y };
	};

	// gallery follow
	_distanceFromLast = (x, y) => {
		return Math.hypot(x - this.last.x, y - this.last.y);
	};

	// gallery follow
	_handleOnMove = (x, y) => {
		if (this._distanceFromLast(input.mousePixelXY.x, input.mousePixelXY.y) > window.innerWidth / 15) {
			const lead = this.domGalleryItems[this.globalIndex % this.domGalleryItems.length],
				tail = this.domGalleryItems[(this.globalIndex - 5) % this.domGalleryItems.length];

			this._activate(lead, x, y);

			if (tail) tail.dataset.status = 'inactive';

			this.globalIndex++;
		}
	};

	_normalize = () => {
		// normalize from -1.-1 / 0.0 / 1.1
		this.state.aimX = (input.mousePixelXY.x * 2) / window.innerWidth - 1;
		this.state.aimY = (input.mousePixelXY.y * 2) / window.innerHeight - 1;
	};

	_ease = (target, current, factor) => (target - current) * factor;

	_parallaxTitle = (element, factorX, factorY) => {
		this._normalize();
		const { aimX, aimY, current } = this.state;
		current[element].x += this._ease(aimX, current[element].x, factorX);
		current[element].y += this._ease(aimY, current[element].y, factorY);
	};

	_animateParallax() {
		// parallax the title + galleryCounter
		this._parallaxTitle('title', 0.15, 0.15);
		this._parallaxTitle('galleryCounter', 0.1, 0.1);

		this.domGalleryTitle.style.transform = `translate(-50%, -50%) translate(${2 * this.state.current.title.x}rem, ${2 * this.state.current.title.y}rem)`;
		this.domGalleryCounter.style.transform = `translate(-50%, -50%) translate(${1 * this.state.current.title.x}rem, ${1 * this.state.current.title.y}rem)`;
	}

	resize(width, height) {}

	delete() {}

	update(dt) {
		// Update gallery items
		this.galleryItems.forEach((galleryItem) => galleryItem.update());

		// update parallax
		this._animateParallax();

		this._handleOnMove(input.mousePixelXY.x, input.mousePixelXY.y);
	}
}

export default new Gallery();
