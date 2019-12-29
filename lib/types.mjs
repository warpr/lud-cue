/**
 *   This file is part of lûd, an opinionated browser based media player.
 *   Copyright (C) 2018  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.1.  See copyleft-next-0.3.1.txt.
 */

import runtypes from 'runtypes';

const { Boolean, Number, Null, String, Lazy, Literal, Array, Tuple, Record, Union } = runtypes;

export const Mbid = {};

['artist', 'release', 'track', 'recording', 'series'].map(t => {
    const createRegex = type =>
        new RegExp(
            'https://musicbrainz.org/' +
                type +
                '/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}#_',
        );

    Mbid[t] = String.withConstraint(s => createRegex(t).test(s) || `${s} is not an ${t} MBID`);
});

const NaturalNumber = Number.withConstraint(n => n >= 0 || `${n} is not >= 0`);

export const Artist = Record({
    name: String,
    mbid: Mbid.artist.Or(Null),
});

export const Track = Record({
    pos: NaturalNumber,
    title: String,
    artist: Artist,
    index: NaturalNumber,
    duration: NaturalNumber.Or(Null),
    mbid: Mbid.track.Or(Null),
    // NOTE: the file key is not currently checked by runtypes, as it cannot handle
    // cyclical data.  https://github.com/pelotom/runtypes/issues/115
    // The key can still be set, runtypes doesn't complain about extra keys.
    //    file: File,
});

export const Group = Record({
    title: String.Or(Null),
    tracks: Array(Track),
});

export const File = Record({
    name: String,
    groups: Array(Group),
});

export const Album = Record({
    title: String,
    artist: Artist,
    files: Array(File),
    duration: NaturalNumber.Or(Null),
});
