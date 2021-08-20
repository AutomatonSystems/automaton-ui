var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Viewport_view, _Viewport_lastV;
import "./Viewport.css";
import { BasicElement } from "../BasicElement.js";
export class Viewport extends BasicElement {
    constructor({ flipY = false } = {}) {
        super();
        _Viewport_view.set(this, {
            parent: null,
            // what position the top left corner maps to
            x: 0,
            y: 0,
            zoom: 1,
            /** @type {Number} */
            get width() {
                return this.parent.element.width / this.zoom;
            },
            /** @type {Number} */
            get height() {
                return this.parent.element.height / this.zoom;
            }
        });
        this.attachments = [];
        _Viewport_lastV.set(this, void 0);
        this.grid = [
            { step: 1, offset: 1, color: "#7772" },
            { step: 6, offset: 6, color: "#7772" },
            { step: 12, offset: 0, color: "#7774" },
            { step: Infinity, offset: 0, color: "#999" }
        ];
        __classPrivateFieldGet(this, _Viewport_view, "f").parent = this;
        this.canvas = document.createElement('canvas');
        this.append(this.canvas);
    }
    addAttachment(element, update = true) {
        this.attachments.push(element);
        this.append(element);
        if (update) {
            this.updateAttachments();
        }
    }
    removeAttachment(element, update = true) {
        this.attachments = this.attachments.filter(e => e != element);
        this.removeChild(element);
        if (update) {
            this.updateAttachments();
        }
    }
    /**
     * @deprecated use setZoom instead
     *
     * Move the view so vx,vy is in the center of the viewport
     *
     * @param {Number} vx
     * @param {Number} vy
     */
    center(vx, vy) {
        this.setCenter(vx, vy);
    }
    /**
     * Move the view so vx,vy is in the center of the viewport
     *
     * @param {Number} vx
     * @param {Number} vy
     */
    setCenter(vx, vy) {
        __classPrivateFieldGet(this, _Viewport_view, "f").x = vx - (__classPrivateFieldGet(this, _Viewport_view, "f").width / 2);
        __classPrivateFieldGet(this, _Viewport_view, "f").y = vy - (__classPrivateFieldGet(this, _Viewport_view, "f").height / 2);
    }
    /**
     * Get the current worldspace coordinate at the center of the viewport
     *
     * @returns {{x,y}}
     */
    getCenter() {
        return this.toView(__classPrivateFieldGet(this, _Viewport_view, "f").width / 2, __classPrivateFieldGet(this, _Viewport_view, "f").height / 2);
    }
    /**
     * @deprecated use setZoom instead
     *
     * Zoom on a point in screen space, keeping that point in the same place
     *
     * @param {Number} vz target zoom level
     * @param {Number} vx point to keep in the same position on screen
     * @param {Number} vy point to keep in the same position on screen
     */
    zoom(vz, vx, vy) {
        this.setZoom(vz, vx, vy);
    }
    /**
     *
     * Zoom on a point in screen space, keeping that point in the same place
     *
     * @param {Number} vz target zoom level
     * @param {Number?} vx point to keep in the same position on screen
     * @param {Number?} vy point to keep in the same position on screen
     */
    setZoom(vz, vx = null, vy = null) {
        if (vx == null) {
            let vxy = this.getCenter();
            vx = vxy.x;
            vy = vxy.y;
        }
        let s1 = this.toScreen(vx, vy);
        __classPrivateFieldGet(this, _Viewport_view, "f").zoom = vz;
        let s2 = this.toScreen(vx, vy);
        let px = s2.x - s1.x;
        let py = s2.y - s1.y;
        this.panScreen(px, py);
    }
    /**
     *
     * @param {Number} rsx
     * @param {Number} rsy
     */
    pan(rsx, rsy) {
        this.panScreen(rsx, rsy);
    }
    /**
     *
     * @param {Number} rsx
     * @param {Number} rsy
     */
    panScreen(rsx, rsy) {
        __classPrivateFieldGet(this, _Viewport_view, "f").x += rsx / __classPrivateFieldGet(this, _Viewport_view, "f").zoom;
        __classPrivateFieldGet(this, _Viewport_view, "f").y += rsy / __classPrivateFieldGet(this, _Viewport_view, "f").zoom;
    }
    /**
     * convert the element-relative screen cordinates to the location
     * in the viewspace
     *
     * @param {Number} sx
     * @param {Number} sy
     *
     * @returns {{x:number,y:number, out: boolean}}
     */
    toView(sx, sy) {
        let v = __classPrivateFieldGet(this, _Viewport_view, "f");
        let e = this.element;
        let xy = {
            x: (sx - e.x) / v.zoom + v.x,
            y: (sy - e.y) / v.zoom + v.y,
        };
        xy.out = xy.x < v.x || xy.x > v.x + v.width
            || xy.y < v.y || xy.y > v.y + v.height;
        return xy;
    }
    /**
     * convert the viewport cordinates to screen co-ordinates
     *
     * @param {Number} sx
     * @param {Number} sy
     *
     * @returns {{x:number,y:number}}
     */
    toScreen(vx, vy) {
        let v = __classPrivateFieldGet(this, _Viewport_view, "f");
        return {
            x: (vx - v.x) * v.zoom,
            y: (vy - v.y) * v.zoom
        };
    }
    get element() {
        return this.getBoundingClientRect();
    }
    render() {
        var _a;
        let v = __classPrivateFieldGet(this, _Viewport_view, "f");
        let lv = JSON.stringify({ x: v.x, y: v.y, w: v.width, h: v.height, z: v.zoom });
        if (!(__classPrivateFieldGet(this, _Viewport_lastV, "f") == null || __classPrivateFieldGet(this, _Viewport_lastV, "f") != lv)) {
            __classPrivateFieldSet(this, _Viewport_lastV, lv, "f");
            this.updateAttachments();
            return;
        }
        __classPrivateFieldSet(this, _Viewport_lastV, lv, "f");
        let element = this.element;
        if (this.canvas.width != element.width || this.canvas.height != element.height) {
            this.canvas.width = element.width;
            this.canvas.height = element.height;
        }
        // clear the canvas
        let context = this.canvas.getContext("2d");
        context.resetTransform();
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // set correct position
        let xOff = -v.x * v.zoom;
        let yOff = -v.y * v.zoom;
        let xmin = 0;
        let xmax = v.width * v.zoom;
        let ymin = 0;
        let ymax = v.height * v.zoom;
        context.lineWidth = 1;
        // grid
        for (let grid of this.grid) {
            if (v.zoom * grid.step < 10) {
                continue;
            }
            context.beginPath();
            context.strokeStyle = grid.color;
            // TODO sort this out!
            for (let offset = (_a = grid.offset) !== null && _a !== void 0 ? _a : 0; offset < 1000 * grid.step; offset += grid.step) {
                let offStep = offset * v.zoom;
                if (offStep + yOff > ymin && offStep + yOff < ymax) {
                    context.moveTo(xmin, offStep + yOff);
                    context.lineTo(xmax, offStep + yOff);
                }
                if (-offStep + yOff > ymin && -offStep + yOff < ymax) {
                    context.moveTo(xmin, -offStep + yOff);
                    context.lineTo(xmax, -offStep + yOff);
                }
                if (offStep + xOff > xmin && offStep + xOff < xmax) {
                    context.moveTo(offStep + xOff, ymin);
                    context.lineTo(offStep + xOff, ymax);
                }
                if (-offStep + xOff > xmin && -offStep + xOff < xmax) {
                    context.moveTo(-offStep + xOff, ymin);
                    context.lineTo(-offStep + xOff, ymax);
                }
            }
            context.stroke();
        }
        this.updateAttachments();
    }
    updateAttachments() {
        var _a, _b, _c;
        let v = __classPrivateFieldGet(this, _Viewport_view, "f");
        for (let attachment of this.attachments) {
            if (attachment.render) {
                attachment.render(this);
            }
            else {
                let scale = (_a = attachment.scalar) !== null && _a !== void 0 ? _a : 1;
                let x = ((_b = attachment.x) !== null && _b !== void 0 ? _b : 0) * scale - v.x;
                let y = ((_c = attachment.y) !== null && _c !== void 0 ? _c : 0) * scale - v.y;
                let t = `translate(${x * v.zoom}px, ${y * v.zoom}px) scale(${v.zoom * scale})`;
                attachment.style.transform = t;
            }
        }
    }
    /***********/
    bindMouse() {
        const LEFT_MOUSE = 0;
        const MIDDLE_MOUSE = 1;
        const RIGHT_MOUSE = 2;
        let lmouse = false;
        let rmouse = false;
        let drag = null;
        this.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        this.addEventListener('wheel', (e) => {
            let v = this.toView(e.x, e.y);
            // this looks funky but give a nice UX
            let zoom = Math.exp((Math.log(__classPrivateFieldGet(this, _Viewport_view, "f").zoom) * 480 - e.deltaY) / 480);
            this.setZoom(zoom, v.x, v.y);
            this.render();
        });
        document.addEventListener('mousedown', (e) => {
            if (e.button == MIDDLE_MOUSE) {
                drag = [e.x, e.y];
            }
            if (e.button == LEFT_MOUSE) {
                lmouse = true;
            }
            if (e.button == RIGHT_MOUSE) {
                rmouse = true;
            }
        });
        document.addEventListener('mousemove', (e) => {
            if (drag) {
                let ndrag = [e.x, e.y];
                this.panScreen(drag[0] - ndrag[0], drag[1] - ndrag[1]);
                drag = ndrag;
                this.render();
            }
            if (lmouse) {
                // dragging with leftmouse down
            }
            if (rmouse) {
                // dragging with rightmouse down
            }
        });
        document.addEventListener('mouseup', (e) => {
            if (e.button == MIDDLE_MOUSE) {
                let ndrag = [e.x, e.y];
                this.panScreen(drag[0] - ndrag[0], drag[1] - ndrag[1]);
                drag = null;
                this.render();
            }
            if (e.button == LEFT_MOUSE) {
                lmouse = false;
            }
            if (e.button == RIGHT_MOUSE) {
                rmouse = false;
            }
        });
    }
}
_Viewport_view = new WeakMap(), _Viewport_lastV = new WeakMap();
customElements.define('ui-viewport', Viewport);
//# sourceMappingURL=Viewport.js.map