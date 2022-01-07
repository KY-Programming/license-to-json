#!/usr/bin/env node

import { Core } from './core';

const [,, ...args] = process.argv;
const core = new Core(args);
core.run();

