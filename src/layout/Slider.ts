const style = `

:host{
	display: block;
    max-width: 100vw;
	position: relative;
}

:host > slot#slider{
	width: 100%;
    overflow: hidden;
    display: flex;
    box-sizing: border-box;
}

:host ::slotted(*){
    width: var(--element-width) !important;
    margin-left: var(--element-margin) !important;
	margin-right: var(--element-margin) !important;
    flex: 0 0 auto !important;
    box-sizing: border-box !important;
}

:host slot.button{
	position: absolute;
	top:0;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	opacity: 0.5;
	transition: opacity 0.3s;
}

:host(:hover) slot.button{
	opacity: 0.8;
}

:host slot.button:hover{
	opacity: 1; 
}

:host slot.button.inactive{
	opacity: 0.2;
	pointer-events: none;
}

slot#back{
	left:0;
}

slot#forward{
	right:0;
}`

type ElementCallback = (element: HTMLElement)=>void;

type SliderOptions = {
	minElementWidth: number
	elementMargin: number
	visibleElementCallback: ElementCallback
}

export class Slider extends HTMLElement{

	sliderContainer: HTMLElement;
	backButton: HTMLElement;
	forwardButton: HTMLElement;

	#index: number = 0;

	itemsPerPage: number = 1;

	itemWidth: number = 1;

	#options: SliderOptions = {
		minElementWidth: 140,
		elementMargin: 20,
		visibleElementCallback: null
	};

	#initializedItems = new WeakSet<HTMLElement>();

	constructor(){
		super();

		const shadowRoot = this.attachShadow({mode: 'open'});
		shadowRoot.innerHTML = `
		<style>${style}</style>
		<slot id="slider"></slot>
		<slot class="button" id="back" name="back"><span style="font-size: 40px">〈</span></slot>
		<slot class="button" id="forward" name="forward"><span style="font-size: 40px">〉</span></slot>
		`;

		this.forwardButton = shadowRoot.querySelector('#forward');
		this.forwardButton.addEventListener("click", this.slideForward.bind(this));

		this.backButton = shadowRoot.querySelector('#back')
		this.backButton.addEventListener("click", this.slideBack.bind(this));

		this.sliderContainer = shadowRoot.querySelector('slot');

		this.#bindTouchEvents(this.sliderContainer);
		new ResizeObserver(this.redraw.bind(this)).observe(this);

		this.index = 0;
	}

	slideForward(){
		// if we are at the end scroll to the start, otherwise scroll forward
		this.index = (this.index == this.length - this.itemsPerPage)? 0 : Math.min(this.length - this.itemsPerPage, this.index + this.itemsPerPage);
	}

	slideBack(){
		this.index = Math.max(0, this.index - this.itemsPerPage);
	}

	get index(){
		return this.#index;
	}

	set index(i: number){
		if(this.length==0)
			return;
		this.#index = i;
		this.backButton.classList.toggle('inactive', this.index==0);
		// scroll
		this.scrollToIndex(true);
	}

	get options(){
		return this.#options;
	}

	set options(options: SliderOptions){
		this.#options = options;
		this.redraw();
	}

	redraw(){
		if(this.length==0)
			return;
		// compute the number of elements that should be visible per scroll
		let rect = this.sliderContainer.getBoundingClientRect();
		let width = rect.width;
		let maxElements = Math.floor(width / (this.options.minElementWidth+2*this.options.elementMargin));
		this.itemsPerPage = maxElements;
		// set the element size to match
		this.itemWidth = (width / maxElements) - this.options.elementMargin*2;
		this.style.setProperty('--element-width', this.itemWidth + "px");
		this.style.setProperty('--element-margin', this.options.elementMargin + "px");
		// we'll need to update our scroller
		this.scrollToIndex(false);
	}

	get length(){
		return this.children.length;
	}

	scrollToIndex(smooth: boolean){
		if(this.length==0)
			return;
		// Find items that are now visible, or will be visible in one scroll, and trigger callback
		if(this.options.visibleElementCallback){
			for(let itemIndex = this.index - this.itemsPerPage; itemIndex < this.index + this.itemsPerPage * 2; itemIndex++){
				let wrappedIndex = itemIndex<0?this.length -(-itemIndex % this.length):itemIndex % this.length;
				console.log(wrappedIndex);
				let item = <HTMLElement> this.children[wrappedIndex];
				if(!this.#initializedItems.has(item)){
					this.#initializedItems.add(item);
					this.options.visibleElementCallback(item);
				}
			}
		}
		// actually scroll the slider
		let element: HTMLElement = <HTMLElement> this.children[this.index];
		let position = element.offsetLeft - this.sliderContainer.offsetLeft - this.options.elementMargin;
		if(smooth){
			this.sliderContainer.scrollTo({
				top: 0,
				left: position,
				behavior: 'smooth'
			});
		}else{
			this.sliderContainer.scrollLeft = position;
		}
	}

	#bindTouchEvents(frame: HTMLElement){
		let touchOffset: {
			originX: number // scroll position at start of touch
			x: number // touch position at start of touch
			y: number
			amountX: number // touch distance at end of touch
			amountY: number
			time: number
		} = null;

		frame.addEventListener('touchstart', (event)=>{
			let touch = event.touches[0];
			if(!touchOffset){
				touchOffset = {
					originX: this.sliderContainer.scrollLeft,
					x: touch.pageX,
					y: touch.pageY,
					amountX: 0,
					amountY: 0,
					time: Date.now()
				}
			}
		});
		frame.addEventListener('touchmove', (event)=>{
			let touch = event.touches[0];
			touchOffset.amountX = touchOffset.x - touch.pageX;
			touchOffset.amountY = touchOffset.y - touch.pageY;
			this.sliderContainer.scrollLeft = touchOffset.amountX + touchOffset.originX;
		});
		frame.addEventListener('touchend', (event)=>{
			console.log(touchOffset);
			// decide if the user scrolled far enough
			if(Math.abs(touchOffset.amountX) > this.itemWidth){
				// SCROLL
				if(touchOffset.amountX>0){
					this.slideForward();
				}else{
					this.slideBack();
				}
			}else{
				this.scrollToIndex(true);
			}
			touchOffset = null;
		});
	}
}
customElements.define('ui-slider', Slider);