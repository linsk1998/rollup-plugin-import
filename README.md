# rollup-plugin-import

Modular import plugin for babel, compatible with antd, antd-mobile, lodash, material-ui, and so on.

## Before

```javascript
import { Button } from "@material-ui/core";
console.log(Button);
```

## After

```javascript
import Button from '@material-ui/core/Button';
console.log(Button);
```

# Options

### libraryName

For Example:"@material-ui/core"

### libraryDirectory

default is undefined

### namedComponent

A function namedComponent, default will NOT change name.

### customName

A function custom name of libraryName/libraryDirectory/ComponentName

### exportName

For Example:"default". Default will NOT change export name.

### sourceMap

default is true

### include/exclude

See @rollup/pluginutils

# Example

## @material-ui/core

```javascript
import importPlugin from 'rollup-plugin-import';
importPlugin({
	libraryName: "@material-ui/core",
	exportName:"default"
})
```

## antd

```javascript
import importPlugin from 'rollup-plugin-import';
import { paramCase } from "param-case";
importPlugin({
	libraryName: "antd",
	libraryDirectory: "lib",
	namedComponent: paramCase,
	exportName:"*"//should be "default"
})
```

## sky-core

```javascript
import importPlugin from 'rollup-plugin-import';
importPlugin({
	libraryName: "sky-core/utils",
	customName:function(name){
		switch(name){
			case "getCurrentScript":
			case "getCurrentPath":
			case "getScript":
			case "forOwn":
				return "sky-core/utils";//这4个不变，其它变
		}
		return `sky-core/utils/${name}`;
	}
})
```