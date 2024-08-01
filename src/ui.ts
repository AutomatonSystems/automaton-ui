import "./base.css";

import { BasicElement } from "./BasicElement.js";
import * as utils from "./utils.js";
import * as factory from "./Factory.js";
import * as mixin from './Mixins.js';

import { Badge } from "./component/Badge.js";
import { Button } from "./forms/Button.js";
import { Cancel } from "./forms/Cancel.js";
import { Card } from "./component/Card.js";
import { Code } from "./text/Code.js";
import { ContextMenu } from "./ContextMenu.js";
import { Form } from "./forms/Form.js";
import { Form2 } from "./forms/Form2.js";
import { Grid } from "./layout/Grid.js";
import { JsonInput, InputLabel, NumberInput, StringInput, SliderInput, ToggleInput, LabelledInput, SelectInput, MultiSelectInput, TextInput} from "./forms/Input.js";
import { HashManager } from "./layout/HashManager.js";
import { Json } from "./text/Json.js";
import { List} from "./data/List.js";
import { HashController } from "./data/HashController.js";
import { Table } from "./data/Table";
import { Modal } from "./Modal.js";
import { Panel } from "./layout/Panel.js";
import { Spacer } from "./layout/Spacer.js";
import { Spinner } from "./component/Spinner.js";
import { Splash } from "./Splash.js";
import { Tabs } from "./layout/Tabs.js";
import { Toast } from "./feedback/Toast.js";
import { Toggle } from "./forms/Toggle.js";
import { Viewport } from "./canvas/Viewport.js";
import { Slider } from "./layout/Slider.js";

// @ts-ignore
let URL = import.meta.url;
let css = [
	// URL + "/../ui.css",
	"https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,200;0,300;0,400;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,600;1,700;1,800;1,900&display=swap",
	"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.css"];


let h = document.createElement('head');
h.innerHTML = css.map(url=>`<link href="${url}" rel="stylesheet">`).join('');
// push them to the start of the head so that same-specificity rules (eg [ui-panel]{} 
// in a client css file) override the defaults
document.head.prepend(...h.childNodes);

const UI = {
	BasicElement,

	Badge,
	Button,
	Cancel,
	Card,
	Code,
	ContextMenu,
	Form,Form2,
	Grid,

	HashManager, HashController,
	InputLabel, 
	Json,
	JsonInput,
	LabelledInput,
	TextInput,
	List, 
	Modal,
	MultiSelectInput,
	NumberInput,
	Panel,
	SelectInput,
	Slider,
	SliderInput,
	Spacer,
	Spinner,
	Splash,
	StringInput,
	Table,
	Tabs,
	Toast,
	Toggle,
	ToggleInput,
	Viewport,

	info: factory.info,
	warn: factory.warn,
	error: factory.error,

	html: utils.htmlToElement,

	uuid: utils.uuid,

	sleep: utils.sleep,

	utils,
	factory,
	mixin
};

// @ts-ignore
window["UI"] = UI;

let createElement = utils.htmlToElement;

export {createElement}

export {BasicElement};
export {Badge};
export {Button};
export {Cancel};
export {Card};
export {Code};
export {ContextMenu};
export {Form};
export {Form2};
export {JsonInput, InputLabel, NumberInput, StringInput, SliderInput, ToggleInput, LabelledInput, SelectInput, MultiSelectInput, TextInput};
export {Grid};
export {HashManager, HashController};
export {Json};
export {List, Table};
export {Modal};
export {Panel};
export {Slider};
export {Spacer};
export {Spinner};
export {Splash};
export {Tabs};
export {Toast};
export {Toggle};
export {Viewport};

export {utils};
export {factory};
export {mixin};

export default UI;