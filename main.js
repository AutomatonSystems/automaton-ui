import "./base.css";

import { BasicElement } from "./src/BasicElement.js";
import * as utils from "./src/utils.js";
import * as factory from "./src/Factory.js";

import { Badge } from "./src/component/Badge.js";
import { Button } from "./src/forms/Button.js";
import { Cancel } from "./src/forms/Cancel.js";
import { Card } from "./src/component/Card.js";
import { Code } from "./src/text/Code.js";
import { ContextMenu } from "./src/ContextMenu.js";
import { Form } from "./src/forms/Form.js";
import { Form2 } from "./src/forms/Form2.js";
import { Grid } from "./src/layout/Grid.js";
import { JsonInput, InputLabel, NumberInput, StringInput, LabelledInput, SelectInput} from "./src/forms/Input.js";
import { HashManager } from "./src/HashManager.js";
import { Json } from "./src/text/Json.js";
import { List, Table} from "./src/data/List.js";
import { Modal } from "./src/Modal.js";
import { Panel } from "./src/layout/Panel.js";
import { Spacer } from "./src/layout/Spacer.js";
import { Spinner } from "./src/component/Spinner.js";
import { Splash } from "./src/Splash.js";
import { Toast } from "./src/feedback/Toast.js";
import { Toggle } from "./src/forms/Toggle.js";
import { Viewport } from "./src/canvas/Viewport.js";

// @ts-ignore
let URL = import.meta.url;
let css = [
	URL + "/../ui.css",
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

	HashManager,
	InputLabel, 
	Json,
	JsonInput,
	LabelledInput,
	List, Table,
	Modal,
	NumberInput,
	Panel,
	SelectInput,
	Spacer,
	Spinner,
	Splash,
	StringInput,
	Table,
	Toast,
	Toggle,
	Viewport,

	info: factory.info,
	warn: factory.warn,
	error: factory.error,

	html: utils.htmlToElement,

	uuid: utils.uuid,

	utils,
	factory
};

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
export {InputLabel, NumberInput, StringInput, LabelledInput};
export {Grid};
export {HashManager};
export {Json};
export {List, Table};
export {Modal};
export {Panel};
export {Spacer};
export {Spinner};
export {Splash};
export {Toast};
export {Toggle};
export {Viewport};

export {utils};
export {factory};

export default UI;