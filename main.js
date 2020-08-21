import "./base.css";

import { BasicElement } from "./src/BasicElement.js";
import * as utils from "./src/utils.js";

import { Badge } from "./src/component/Badge.js";
import { Button } from "./src/forms/Button.js";
import { Cancel } from "./src/forms/Cancel.js";
import { Card } from "./src/component/Card.js";
import { Code } from "./src/text/Code.js";
import { ContextMenu } from "./src/ContextMenu.js";
import { Form } from "./src/forms/Form.js";
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

// @ts-ignore
let URL = import.meta.url;
let css = [
	URL + "/../ui.css",
	"https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,200;0,300;0,400;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,600;1,700;1,800;1,900&display=swap",
	"https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"];


let h = document.createElement('head');
h.innerHTML = css.map(url=>`<link href="${url}" rel="stylesheet">`).join('');
document.head.append(...h.childNodes);

const UI = {
	BasicElement,

	Badge,
	Button,
	Cancel,
	Card,
	Code,
	ContextMenu,
	Form,
	HashManager,
	Json,
	List, Table,
	Modal,
	Panel,
	Spacer,
	Spinner,
	Splash,
	Toast,
	Toggle,

	utils
};



window["UI"] = UI;

export {BasicElement};
export {Badge};
export {Button};
export {Cancel};
export {Card};
export {Code};
export {ContextMenu};
export {Form};
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
export {utils};