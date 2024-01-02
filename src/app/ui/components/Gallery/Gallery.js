import input from '@input/input';
import properties from '@app/core/properties';
import { STATUS } from '../../constants';
import { gsap, Power3, Power1 } from 'gsap';

import GalleryItem from './GalleryItem';
import data from '../../../data/projects';
import Project from '../../pages/Project/Project';

class Gallery {
	domGallery = document.getElementById('gallery-view_menuImages');
	domGalleryItems;
	domGalleryCounter = document.querySelector('.gallery-view-counter');
	domGalleryCounterCurrentIndex = document.querySelector('.gallery-view-counter_currentIndex');
	domGalleryCounterLine = document.querySelector('.gallery-view-counter_barFiller');
	domGalleryTitle = document.querySelector('.gallery-view_menuTitle');
	galleryItems = [];
	hasFinishedIntroAnimation = false;
	// animation
	globalIndex = 0;
	intervalId = null;

	mainTimeline = gsap.timeline();

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
		properties.statusSignal.add((status) => {
			if (status === STATUS.PROJECT) {
				this._pauseGallery();
			} else if (status === STATUS.GALLERY) {
				this._rePlayGallery();
			}
		});
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
		// console.log('show gallery');
		this.isActive = true;
		// console.log('show the gallery component now');

		this.domGalleryCounterLine.style.transform = `scaleX(0)`;

		// fade in title
		this.mainTimeline
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
			.fromTo(
				this.domGalleryCounterLine,
				{
					scaleX: 0,
				},
				{
					scaleX: 1,
					duration: 5,
					ease: 'Linear.easeNone',
				},
				0,
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
						this.hasFinishedIntroAnimation = true;
						this._startGallery();
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

	_animateGallery(lead) {
		this.domGalleryItems.forEach((el, index) => {
			let positions = el.getBoundingClientRect();
			let { left, top, width, height } = positions;
			gsap.set(el, {
				x: this.animateProperties.tx.previous,
				y: this.animateProperties.ty.previous,
				// x: (input.mousePixelXY.x + window.scrollX - (left + width / 2)) * 0.4,
				// y: (input.mousePixelXY.y + window.scrollY - (top + height / 2)) * 0.4,
				ease: Power3.easeInOut,
				duration: 0.8,
				delay: index * 0.09,
				onStart: () => {
					// Animation start code here
				},
			});
		});
	}

	_startGallery = (e) => {
		// Clear any existing interval
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}

		// Store the starting z-index and reset it
		const startingZIndex = 1;

		// Start a new interval to increase zIndex and reset when needed
		this.intervalId = setInterval(() => {
			this.domGalleryItems.forEach((item) => {
				// Remove the 'lead-image' class from all items
				item.classList.remove('lead-image');
				// maybe not ideal but to force last image to remove the zindex
				this.domGalleryItems[this.domGalleryItems.length - 1].style.zIndex = '';
			});

			// Find the lead image
			const lead = this.domGalleryItems[this.globalIndex % this.domGalleryItems.length];

			// Add the 'lead-image' class for styling or any other purposes
			lead.classList.add('lead-image');

			// Determine the zIndex based on the globalIndex
			const zIndex = startingZIndex + (this.globalIndex % this.domGalleryItems.length);

			gsap.fromTo(
				lead,
				{
					opacity: 0,
				},
				{
					zIndex: zIndex, //startingZIndex + (this.globalIndex % this.domGalleryItems.length),
					duration: 0.5,
					opacity: 1,
					ease: 'Sine.easeInOut',
				},
			);

			this.globalIndex += 1;

			// if reached the end
			if (zIndex === this.domGalleryItems.length) {
				// Reset the z-index values for all items
				this.domGalleryItems.forEach((item, index) => {
					item.style.zIndex = ''; // Remove the zIndex style
				});
			}

			this._updateCounter();
		}, 4500);
	};

	_pauseGallery() {
		// Pause the gallery-specific animations
		this.mainTimeline.pause();
		this._pauseCounter();
	}

	_rePlayGallery() {
		// Play the gallery-specific animations
		this.mainTimeline.play();
		if (this.hasFinishedIntroAnimation) {
			this._startGallery();
		}
	}

	_updateCounter() {
		const startingZIndex = 1;

		// Calculate the actual index based on the global index and the number of gallery items
		const numItems = this.domGalleryItems.length;
		let actualIndex = startingZIndex + (this.globalIndex % numItems);

		// Update the counter
		this.domGalleryCounterCurrentIndex.textContent = actualIndex < 10 ? '0' + actualIndex : actualIndex;

		gsap.timeline().fromTo(
			this.domGalleryCounterLine,
			{
				scaleX: 0,
			},
			{
				scaleX: 1,
				duration: 5,
				ease: 'Linear.easeNone',
			},
			0,
		);
	}

	_pauseCounter() {
		// Clear the interval
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	resize(width, height) {}

	delete() {}

	update(dt) {
		// Update gallery items
		this.galleryItems.forEach((galleryItem) => galleryItem.update());

		// update parallax
		this._animateParallax();

		// check if is moving
		for (const el in this.animateProperties) {
			if (Math.abs(this.animateProperties[el].current - this.animateProperties[el].previous) > 0.001) {
				this.allowAnimation = true;
				// no need to update the animation if nothing is happening, so adding this allowAnimation
			}
		}

		if (this.allowAnimation && this.hasFinishedIntroAnimation) {
			this._animateGallery();
		}
	}
}

export default new Gallery();
