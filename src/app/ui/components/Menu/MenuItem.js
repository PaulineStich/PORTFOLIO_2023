import properties from '@core/properties';
import settings from '@core/settings';
// const images = Object.entries(require('../../img/demo2/*.jpg'));

import {gsap, Power3, Expo} from 'gsap';
import math from '@app/utils/math';
import input from '@input/input';

export default class MenuItem {
    constructor(el, index, animateProperties) {
        this.DOM = {el:el}
        this.index = index
        this.animateProperties = animateProperties

        this.init()
    }

	init() {
        this.createDiv();
        this.initEvents();
	}

    createDiv() {
        // we want to add/append to the menu item the following html:
        // <div class="hover-reveal">
        //   <div class="hover-reveal_inner" style="overflow: hidden;">
        //     <div class="hover-reveal_img" style="background-image: url(pathToImage);">
        //     </div>
        //   </div>
        // </div>

        this.DOM.reveal = document.createElement('div')
        this.DOM.reveal.className = "hover-reveal"
        this.DOM.reveal.style.transformOrigin = '0% 0%';
        
        this.DOM.revealInner = document.createElement('div')
        this.DOM.revealInner.className = "hover-reveal_inner"
        
        this.DOM.revealImg = document.createElement('div')
        this.DOM.revealImg.className = 'hover-reveal_img'
        // this.DOM.revealImg.style.backgroundImage = `url(${images[this.index][1]})`;
        
        this.DOM.reveal.appendChild(this.DOM.revealInner)
        this.DOM.revealInner.appendChild(this.DOM.revealImg)
        this.DOM.el.appendChild(this.DOM.reveal)
    }

    initEvents() {
        this.mouseenterFn = (e) => {
            this.show()
            this.firstRAF = true
            this.loopRender();
        }
        this.mouseleaveFn = () => {
            this.stopRendering();
            this.hide();
        };

        this.DOM.el.addEventListener('mouseenter', this.mouseenterFn);
        this.DOM.el.addEventListener('mouseleave', this.mouseleaveFn);
    }
    
	show() {
        gsap.killTweensOf(this.DOM.reveal);

        this.tlFadeIn = gsap.timeline({
            onStart: () => {
                this.DOM.reveal.style.opacity =  1
                gsap.set(this.DOM.el, {zIndex: 50});
            }
        })
        .to(this.DOM.reveal, {
            ease: 'Expo.easeInOut',
            scale: 1,
            duration: 1.2,
        })
	}
    
	hide() {
       gsap.killTweensOf(this.DOM.reveal);

       this.tl = gsap.timeline({
           onStart: () => {
               gsap.set(this.DOM.el, {zIndex: 1});
           },
       })
       .to(this.DOM.reveal,  {
           ease: 'Power3.easeOut',
           scale: 0.3,
           opacity: 0,
           duration: 1.8
       })
	}

    calcBounds() {
        this.bounds = {
            el: this.DOM.el.getBoundingClientRect(),
            reveal: this.DOM.reveal.getBoundingClientRect()
        };
    }

	resize(width, height) {}

	delete() {}

    // start the render loop animation (rAF)
    loopRender() {
        if ( !this.requestId ) {
            this.requestId = requestAnimationFrame(() => this.update());
        }
    }
    // stop the render loop animation (rAF)
    stopRendering() {
        if ( this.requestId ) {
            window.cancelAnimationFrame(this.requestId);
            this.requestId = undefined;
        }
    }

	update(dt) {
        this.requestId = undefined;

        if (this.firstRAF) {
            // calculate position/sizes the first time
            this.calcBounds();
        }

        const mouseDistanceX = math.clamp(Math.abs(input.prevMousePixelXY.x - input.mousePixelXY.x), 0, 100)

        // new translation values
        this.animateProperties.tx.current = Math.abs(input.mousePixelXY.x - this.bounds.el.left) - this.bounds.reveal.width/2;
        this.animateProperties.ty.current = Math.abs(input.mousePixelXY.y - this.bounds.el.top) - this.bounds.reveal.height/2;

        console.log(this.animateProperties.ty.current)
    
        // new filter value
        this.animateProperties.opacity.current = this.firstRAFCycle ? 1 : math.map(mouseDistanceX,0,100,1,3);

        // set up the interpolated values
        this.animateProperties.tx.previous =  this.firstRAFCycle ? this.animateProperties.tx.current : math.lerp(this.animateProperties.tx.previous, this.animateProperties.tx.current, this.animateProperties.tx.amt);
        this.animateProperties.ty.previous = this.firstRAFCycle ? this.animateProperties.ty.current : math.lerp(this.animateProperties.ty.previous, this.animateProperties.ty.current, this.animateProperties.ty.amt);
        this.animateProperties.opacity.previous = this.firstRAFCycle ? this.animateProperties.brightness.current : math.lerp(this.animateProperties.opacity.previous, this.animateProperties.opacity.current, this.animateProperties.opacity.amt);
        
        // console.log(this.animateProperties.ty.current)

        // set styles
        gsap.set(this.DOM.reveal, {
            x: this.animateProperties.tx.previous,
            y: this.animateProperties.ty.previous,
            filter: `brightness(${this.animateProperties.opacity.previous})`
        });

        this.firstRAF = false;
        this.loopRender();
    }
}