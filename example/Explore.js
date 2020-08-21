
import * as UI from '../dist/ui.js';

let Map = new UI.HashManager('map');

Map.style.height = "500px";
Map.style.width = "500px";

Map.handler('{x},{y}', (hash)=>{
	console.log(hash);
	let x = parseInt(hash.x);
	let y = parseInt(hash.y);

	return [new UI.Panel([

		new UI.Json([x,y]),

		new UI.Button("North", ()=>{y-=1; Map.set(`${x},${y}`)}),
		new UI.Button("South", ()=>{y+=1; Map.set(`${x},${y}`)}),
		new UI.Button("East",  ()=>{x+=1; Map.set(`${x},${y}`)}),
		new UI.Button("West",  ()=>{x-=1; Map.set(`${x},${y}`)})
	]), [x,y]];
});

Map.attach();

Map.set("0,0");
Map.hashChange();