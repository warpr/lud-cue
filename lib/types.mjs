/**
 *   This file is part of lûd, an opinionated browser based media player.
 *   Copyright (C) 2018  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.1.  See copyleft-next-0.3.1.txt.
 */

import runtypes from 'runtypes';

const { Boolean, Number, String, Literal, Array, Tuple, Record, Union } = runtypes;

export const Track = Record({
    name: String,
});
