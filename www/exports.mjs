/**
 *   This file is part of lûd, an opinionated browser based media player.
 *   Copyright (C) 2020  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.1.  See copyleft-next-0.3.1.txt.
 */

import * as cue from './dist/lud-cue.mjs';

const assert = chai.assert;
const { Artist, AudioOffset, File, Mbid, MinutesSecondsFrames, Track } = cue.types;

suite('Test browser exports', () => {
    /* WARNING: this is not the full test suit.
     *
     * The main test suite doesn't currently run in the browser,
     * run those tests with bin/test or bin/watch from the
     * project root.
     *
     * The tests in the file are focused on verifying that the
     * dist/ bundle file was generated correctly.
     */
    test('types', () => {
        assert.isOk(MinutesSecondsFrames.guard('0:59:23'));
    });

    test('cue', () => {
        const expected = 'https://musicbrainz.org/artist/a1fa1d96-df37-4e78-92c0-c6cf76049349#_';
        const result = cue.makeMbid('artist', 'a1fa1d96-df37-4e78-92c0-c6cf76049349');
        assert.equal(expected, result);
    });
});
