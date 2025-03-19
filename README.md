# automaton-ui

A Basic set of components using plain HTML5 + CSS3 + Javascript ES2020 to help with the creation of User Interfaces for web applications.

## Examples

Each component can either be created via HTML or Javascript. Example of both are provided below.

### UI.Button

#### Inline HTML 
```html
<script src="/dist/ui.js" type="module"></script>
<ui-button icon="fa-hourglass" onclick="showSplash()">Splash</ui-button>
```
#### Javascript Creation
```javascript
import * as UI from './dist/ui.js';

let button = new UI.Button('Splash', showSplash, {icon="fa-hourglass"});
document.body.append(button);
```
Simple UI button with Font awesome hourglass Logo
