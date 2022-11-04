
var pluginutils = require('@rollup/pluginutils');
var MagicString = require('magic-string');
//var kebabCase = require('kebab-case');

function noChange(name) {
	return name;
}
function plugin(options) {
	if (!options) { throw new Error('Missing options'); }
	if (!options.libraryName) { throw new Error('Missing options.libraryName'); }
	//options.libraryDirectory=options.libraryDirectory || "lib";
	options.namedComponent = options.namedComponent || noChange;
	options.customName = options.customName || function(name) {
		if (options.libraryDirectory) {
			return `${options.libraryName}/${options.libraryDirectory}/${options.namedComponent(name)}`;
		}
		return `${options.libraryName}/${options.namedComponent(name)}`;
	};
	//options.exportName=undefined;
	var style = options.style;
	if (style === true) {
		style = "style";
	}
	if (typeof style !== "function") {
		options.style = function(name) {
			return `${name}/${style}`;
		};
	}
	var filter = pluginutils.createFilter(options.include, options.exclude);

	var sourceMap = options.sourceMap !== false && options.sourcemap !== false;
	return {
		name: "import",
		transform(code, id) {
			if (!filter(id)) { return null; }
			var ast = null;
			try {
				ast = this.parse(code);
			} catch (err) {
				this.warn({
					code: 'PARSE_ERROR',
					message: ("rollup-plugin-inject: failed to parse " + id + ". Consider restricting the plugin to particular files via options.include")
				});
			}
			if (!ast) {
				return null;
			}
			var magicString = new MagicString(code);
			var hasChanged = false;
			//console.log(JSON.stringify(ast, null, 1));
			ast.body.forEach(function(node) {
				if (node.type === 'ImportDeclaration') {
					if (node.source.value == options.libraryName) {
						var imports = [];
						node.specifiers.forEach(function(specifier) {
							var importedName = specifier.imported ? specifier.imported.name : "default";
							var localName = specifier.local.name;
							var modName = options.customName(importedName);
							var exportName = options.exportName || importedName;
							if (exportName === "default") {
								imports.push(`import ${localName} from ${JSON.stringify(modName)};`);
							} else if (exportName === localName) {
								imports.push(`import {${exportName}} from ${JSON.stringify(modName)};`);
							} else if (exportName === "*") {
								imports.push(`import ${exportName} as ${localName} from ${JSON.stringify(modName)};`);
							} else {
								imports.push(`import {${exportName} as ${localName}} from ${JSON.stringify(modName)};`);
							}
							if (options.style) {
								var styleName = options.style(modName);
								if (styleName) {
									imports.push(`import ${JSON.stringify(styleName)};`);
								}
							}
						});
						hasChanged = true;
						magicString.overwrite(node.start, node.end, imports.join(''));
					}
				}
			});

			if (!hasChanged) {
				return {
					code: code,
					ast: ast,
					map: sourceMap ? magicString.generateMap({ hires: true }) : null
				};
			}
			return {
				code: magicString.toString(),
				map: sourceMap ? magicString.generateMap({ hires: true }) : null
			};
		}
	};
}
plugin.default = plugin;
module.exports = plugin;