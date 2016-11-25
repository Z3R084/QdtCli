const cli = require('../../ember-cli/lib/cli');
const UI = require('../../ember-cli/lib/ui');
const Watcher = require('../../ember-cli/lib/models/watcher');
const path = require('path');

Error.stackTraceLimit = Infinity;

module.exports = function (options) {
	UI.prototype.writeWarnLine = function () { }

	Watcher.detectWatcher = function (ui, _options) {
		var options = _options || {};
		options.watcher = 'node';
		return Promise.resolve(options);
	}

	const oldStdoutWrite = process.stdout.write;
	process.stdout.write = function (line) {
		line = line.toString();
		if (line.match(/ember-cli-(inject-)?live-reload/)) {
			return oldStdoutWrite.apply(process.stdout, arguments);
		}
		line = line.replace(/ember-cli(?!.com)/g, 'qdt-cli')
			.replace(/\bember\b(?!-cli.com)/g, 'qdt');
		return oldStdoutWrite.apply(process.stdout, arguments);
	};

	const oldStderrWrite = process.stderr.write;
	process.stderr.write = function (line) {
		line = line.toString()
			.replace(/ember-cli(?!.com)/g, 'qdt-cli')
			.replace(/\bember\b(?!-cli.com)/g, 'qdt');
		return oldStderrWrite.apply(process.stdout, arguments);
	};

	options.cli = {
		name: 'qdt',
		root: path.join(__dirname, '..', '..'),
		npmPackage: 'qdt-cli'
	};

	process.env.PWD = process.env.PWD | process.cwd();
	process.env.CLI_ROOT = process.env.CLI_ROOT || path.resolve(__dirname, '..', '..');

	return cli(options);
};