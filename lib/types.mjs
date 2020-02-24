/**
 *   This file is part of lûd, an opinionated browser based media player.
 *   Copyright (C) 2018  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.1.  See copyleft-next-0.3.1.txt.
 *
 *   SPDX-License-Identifier: copyleft-next-0.3.1
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

export const NaturalNumber = Number.withConstraint(n => n >= 0 || `${n} is not >= 0`);

export const Artist = Record({
    name: String,
    mbid: Mbid.artist.Or(Null),
});

export const PartialTrack = Record({
    pos: NaturalNumber,
    title: String,
    artist: String,
});

const MinutesSecondsFramesRegex = /^[0-9]*:[0-5][0-9]:(7[0-5]|[0-6][0-9])$/;
export const MinutesSecondsFrames = String.withConstraint(
    s => MinutesSecondsFramesRegex.test(s) || `${s} is not in Minutes:Seconds:Frames format`,
);

export const AudioOffset = Record({
    'minutes-seconds-frames': MinutesSecondsFrames,
    seconds: NaturalNumber,
});

export const Track = Record({
    pos: NaturalNumber,
    title: String,
    artist: String,
    duration: NaturalNumber.Or(Null),
    pregap: AudioOffset.Or(Null),
    start: AudioOffset,

    //    index: NaturalNumber.Or(Null),

    // NOTE: the file key is not currently checked by runtypes, as it cannot handle
    // cyclical data.  https://github.com/pelotom/runtypes/issues/115
    // The key can still be set, runtypes doesn't complain about extra keys.
    //    file: File,
});

// export const Group = Record({
//     title: String.Or(Null),
//     tracks: Array(Track),
// });

export const File = Record({
    filename: String,
    format: String.Or(Null),
    tracks: Array(Track),
    //    groups: Array(Group),
});

export const Disc = Record({
    artist: String.Or(Null),
    title: String.Or(Null),
    barcode: String.Or(Null),
    comments: Array(String),
    mbid: Mbid.release.Or(Null),
    // FIXME: enable pos
    pos: NaturalNumber.Or(Null),
    files: Array(File),
});

export const Album = Record({
    title: String,
    artist: Artist,
    discs: Array(Disc.Or(Null)),
    duration: NaturalNumber.Or(Null),
});
