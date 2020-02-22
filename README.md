Lûd cue
=======

![](https://github.com/warpr/lud-cue/workflows/tests/badge.svg)
![](https://img.shields.io/badge/license-copyleft--next-blue)
![](https://api.reuse.software/badge/github.com/warpr/lud-cue)

Lûd is an opinionated browser based media player.

Lûd cue is the .cue file parsing library used by [Lûd](https://github.com/warpr/lud).

Usage (browser)
===============

```js
import * as cue from './dist/lud-cue.mjs';

const { parseCue } = cue;
const { Disc } = cue.types;

// cueFile is the body of a .cue file as a string
const parsed = parseCue(cueFile);

// types can be checked at run-time with [runtypes](https://github.com/pelotom/runtypes)
const disc = Disc.check(parsed);
```

Usage (node js)
===============

```js
import * as cue from 'lud-cue';

const { parseCue } = cue;
const { Disc } = cue.types;

// cueFile is the body of a .cue file as a string
const parsed = parseCue(cueFile);

// types can be checked at run-time with [runtypes](https://github.com/pelotom/runtypes)
const disc = Disc.check(parsed);
```

License
=======

Copyright 2020 Kuno Woudt <mailto:kuno@frob.nl>

This program is free software: you can redistribute it and/or modify
it under the terms of copyleft-next 0.3.1. See
[copyleft-next-0.3.1.txt](LICENSES/copyleft-next-0.3.1.txt).

SPDX-License-Identifier: copyleft-next-0.3.1
