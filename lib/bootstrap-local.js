'use strict';

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

global.qdtCliIsLocal = true;
global.qdtCliPackages = require('./packages');

const compilerOptions = JSON.parse(fs.readFileSync(path.join(__dirname, '../tsconfig.json')));
const oldRequireTs = require.extensions['.ts'];
require.extensions['.ts'] = function (m, filename) {
	if (!filename.match(/qdt-cli/) && filename.match(/node_modules/)) {
		if (oldRequireTs) {
			return oldRequireTs(m, filename);
		}
		return m._compile(fs.readFileSync(filename), filename);
	}

	const source = fs.readFileSync(filename).toString();

	try {
		const result = ts.transpile(source, compilerOptions['compilerOptions']);
		return m._compile(result, filename);
	} catch (err) {
		console.error(`Error while running script ${filename}:`);
		console.error(err.stack);
		throw err;
	}
};

if (!__dirname.match(new RegExp(`\\${path.sep}node_modules\\${path.sep}`))) {
	const packages = require('./packages');
	const Module = require('module');
	const oldLoad = Module._load;
	Module._load = function (request, parent) {
		if (request in packages) {
			return oldLoad.call(this, packages[request].main, parent);
		} else if (request.startsWith('qdt-cli/')) {
			const dir = path.dirname(parent.filename);
			const newRequest = path.relative(dir, path.join(__dirname, '../packages', request));
			return oldLoad.call(this, newRequest, parent);
		} else {
			let match = Object.keys(packages).find(pkgName => request.startsWith(pkgName + '/'));
			if (match) {
				const p = path.join(packages[match].root, request.substr(match.length));
				return oldLoad.call(this, p, parent);
			} else {
				console.log(arguments);
				return oldLoad.apply(this, arguments);
			}
		}
	};
}