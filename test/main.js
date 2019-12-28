/**
 *   This file is part of lûd, an opinionated browser based media player.
 *   Copyright (C) 2020  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.1.  See copyleft-next-0.3.1.txt.
 */

const assert = require('chai').assert;

const tests = [
    // plain CD, test sub tracks
    'pc-and-strictly-kev.blechsdottir.cue',
    // plain CD, test sub tracks with an overarching title
    'enigma.mcmxc-ad.cue',
    // vinyl rip, the cue file is the entire disc, but each side is 1 file
    'lijkenpikkers.mag-dat.cue',
    // longer than is possible with a physical CD, each track is 1 file
    'id-t.mysteryland-nl-2014-l-afrique.cue',
];

/*
  FIXME: following tests still to be added

  plain CD, with track introductions in the pre-gaps
  - for example: paddy reilly live

  plain CD, with a "secret" track in the pre-gap of the first track
  - for example: lamb - fear of fours
*/

suite('Main', () => {
    suite('Sub test', () => {
        test('one should equal one', () => {
            assert.equal(1, 1);
        });
    });
});
