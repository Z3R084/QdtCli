'use strict';

const chalk = require('chalk');
const denodeify = require('denodeify');
const fs = require('fs');
const glob = denodeify(require('glob'));
const path = require('path');
const npmRun = require('npm-run');