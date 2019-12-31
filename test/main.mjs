/**
 *   This file is part of lûd, an opinionated browser based media player.
 *   Copyright (C) 2020  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.1.  See copyleft-next-0.3.1.txt.
 */

import * as log from '../lib/log.mjs';

import { Artist, File, Mbid, Track } from '../lib/types.mjs';
import { addTrackLengths, framesToSeconds, parseCue, removeQuotes } from '../lib/cue.mjs';

import chai from 'chai';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import stringify from 'json-stable-stringify';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assert = chai.assert;

log.setVerbose(false);

function testCue() {
    const givenFile = __dirname + '/' + this.test.title;
    const expectedFile = givenFile + '.expected.json';

    // suffix with ~, so it's ignored by watch and git.
    const outputFile = givenFile + '.actual.json~';

    const body = fs.readFileSync(givenFile, { encoding: 'utf-8' });
    const disc = parseCue(body);

    fs.writeFileSync(outputFile, stringify(disc, { space: 2 }), { encoding: 'utf-8' });

    const expected = fs.readFileSync(expectedFile, { encoding: 'utf-8' });
    assert.deepEqual(disc, JSON.parse(expected));
}

suite('Main', () => {
    suite('Utility functions', () => {
        test('framesToSeconds', () => {
            assert.closeTo(framesToSeconds('1:59:70'), 119.93333, 0.00001);
            assert.equal(framesToSeconds('2:00:00'), 120);
        });

        test('removeQuotes', () => {
            assert.equal(removeQuotes('"foo"'), 'foo');
            assert.equal(removeQuotes("'foo'"), 'foo');
            assert.equal(removeQuotes('"foo\''), '"foo\'');
            assert.equal(removeQuotes(' "foo" '), ' "foo" ');

            assert.throws(() => removeQuotes(23));
            assert.throws(() => removeQuotes());
        });
    });

    suite('Cue files', () => {
        // plain CD, test sub tracks
        test('pc-and-strictly-kev.blechsdottir.cue', testCue);

        // plain CD, test sub tracks with an overarching title
        test('enigma.mcmxc-ad.cue', testCue);

        // vinyl rip, the cue file is the entire disc, but each side is 1 file
        test('lijkenpikkers.mag-dat.cue', testCue);

        // longer than is possible with a physical CD, each track is 1 file
        test('id-t.mysteryland-nl-2014-l-afrique.cue', testCue);

        /*
          FIXME: following tests still to be added

          plain CD, with track introductions in the pre-gaps
          - for example: paddy reilly live

          plain CD, with a "secret" track in the pre-gap of the first track
          - for example: lamb - fear of fours
        */
    });

    // suite('Sub test', () => {
    //     test('valid artist', () => {
    //         assert.doesNotThrow(() => Artist.check(artist));
    //     });

    //     test('valid track does not throw', () => {
    //         assert.doesNotThrow(() => File.check(file));
    //     });

    //     test('invalid track throws', () => {
    //         assert.throws(() => Track.check({ pos: 1, title: 'Ponle' }));
    //     });
    // });
});
