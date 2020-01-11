Lûd cue
=======

Lûd is an opinionated browser based media player.

Lûd cue is the .cue file parsing library used by Lûd.

Usage
=====

```js
import { parseCue } from 'lud-cue/lib/cue.mjs';
import { Disc } from 'lud-cue/lib/types.mjs';


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
[copyleft-next-0.3.1.txt](copyleft-next-0.3.1.txt).

