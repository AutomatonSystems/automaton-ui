import * as UI from "/dist/ui.js";

let obj = {
	volume: 50
}

let panel = new UI.Panel();
document.body.querySelector('content').append(panel);

console.log(UI);

let jsonEle = new UI.Json(obj);
panel.append(jsonEle);
panel.append(
		new UI.SliderInput(obj, 'volume', {
			min: 0, max: 100, step: 1,
			callback: ()=>{
				// jsonEle.setContent(JSON.stringify(obj, null, '\t'))
			}
		})
	);
