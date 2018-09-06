# JavaScript Grid Web Component
Autonomous open source grid component with RTL support built on Custom Elements and Shadow DOM specifications.

## How to use

### Install
##### Install with `npm`
`$ npm install zino-grid`

##### Install with `bower`
`$ bower install zino-grid`

### Using `zino-grid`
##### HTML way
```html
<link rel="stylesheet" href="../../font-awesome/css/font-awesome.min.css">

<zino-grid data-url="data.json"></zino-grid>

<script src="../../@webcomponents/webcomponentsjs/webcomponents-bundle.js"></script>
<script src="../zino-grid.js"></script>
```
Grid customizations are possible via `data-*` attributes.

##### using the DOM API
```html
<script>
const grid = document.createElement("zino-grid");
grid.url = "data.json";
document.body.appendChild(grid);
</script>
```

##### using the constructor
```html
<script>
const grid = new ZinoGrid({
  url: "data.json"
});
document.body.appendChild(grid);
</script>
```

##### Styling
```css
:root {
  --background-head: #fff;
  --color-head: #FA4251;
  --color-head-active: #FA4251;
  --background-foot: #fff;
  --color-foot: #222;
  --background-odd: #fff;
  --background-even: #fff;
  --color-odd: #333;
  --color-even: #222;
}
zino-grid {
  margin: 20px auto 0;
  width: 100%;
  max-width: 1024px;
}
```

## Options
|Option|Required|Type|Default|Description|
|---|:---:|---|---|---|
|**url**|Yes|String|**(empty)**|An URL with data to display in JSON format.|
|**page**|No|Number|**1**|Currently displayed page.|
|**perPage**|No|Number|**5**|Number of records displayed per page.|
|**debug**|No|Boolean|**false**|Log actions in DevTools console.|
|**filter**|No|Boolean|**false**|Allows a filtering functionallity.|
|**sort**|No|Boolean|**false**|Allows a sort by column functionallity.|
|**reorder**|No|Boolean|**false**|Allows a column reordering functionallity.|
|**dir**|No|String|**ltr**|Text direction. Accepted values are **ltr** (left-to-right) and **rtl** (right-to-left)|

## Browser Support
|Polyfill|Edge|IE11+|Chrome 54+|Firefox 63+|Safari 10.1+|Opera 41+|
|---|:---:|:---:|:---:|:---:|:---:|:---:|
|Yes|✓|✓|✓|✓|✓|✓|
|No|✗|✗|✓|✓|✓|✓| 

## License
zino-grid is licensed under the MIT license.

Copyright (c) 2018 Dimitar Ivanov