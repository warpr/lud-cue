/**
 *   This file is part of lûd, an opinionated browser based media player.
 *   Copyright (C) 2020  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.1.  See copyleft-next-0.3.1.txt.
 */

import { Artist, AudioOffset, File, Mbid, MinutesSecondsFrames, Track } from '../lib/types.mjs';

import chai from 'chai';

const assert = chai.assert;

suite('Types', () => {
    test('MinutesSecondsFrames', () => {
        assert.isOk(MinutesSecondsFrames.guard('0:59:23'));
        assert.isOk(MinutesSecondsFrames.guard('0:59:69'));
        assert.isOk(MinutesSecondsFrames.guard('0:59:75'));
        assert.isNotOk(MinutesSecondsFrames.guard('0:59:76', 'frames cannot be > 75'));
        assert.isNotOk(MinutesSecondsFrames.guard('0:60:00', 'seconds cannot be > 59'));

        // even though CDs cannot be much longer than around 80 minutes, .cue files
        // are also used as playlists for digital only releases, so allow much longer
        // total track offset/duration.
        assert.isOk(MinutesSecondsFrames.guard('803:32:00'));
    });
});
