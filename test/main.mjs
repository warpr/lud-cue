/**
 *   This file is part of lûd, an opinionated browser based media player.
 *   Copyright (C) 2020  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.1.  See copyleft-next-0.3.1.txt.
 */

import { Artist, File, Mbid, Track } from '../lib/types.mjs';

import chai from 'chai';

const assert = chai.assert;

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

const artist = {
    name: 'Lijkenpikkers',
    mbid: 'https://musicbrainz.org/artist/2604d889-f1ef-48c2-b6ac-d8818cec246d#_',
};

const file = {
    name: 'disc01a.m4a',
    groups: [
        {
            title: null,
            tracks: [],
        },
    ],
};

file.groups[0].tracks = [
    {
        pos: 1,
        title: 'Heb je al gehoord',
        artist: artist,
        file: file,
        index: 0,
        duration: null,
        mbid: null,
    },
    {
        pos: 2,
        title: 'Op je hoeden',
        artist: artist,
        file: file,
        index: 120000,
        duration: null,
        mbid: 'https://musicbrainz.org/track/4000d35e-d6f1-3d83-a48a-78179b651f2c#_',
    },
];

suite('Main', () => {
    suite('Sub test', () => {
        test('valid artist', () => {
            assert.doesNotThrow(() => Artist.check(artist));
        });

        test('valid track does not throw', () => {
            assert.doesNotThrow(() => File.check(file));
        });

        test('invalid track throws', () => {
            assert.throws(() => Track.check({ pos: 1, title: 'Ponle' }));
        });
    });
});
