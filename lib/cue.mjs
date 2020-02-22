/**
 *   This file is part of lûd, an opinionated browser based media player.
 *   Copyright (C) 2018  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.1.  See copyleft-next-0.3.1.txt.
 *
 *   SPDX-License-Identifier: copyleft-next-0.3.1
 */

import * as import_types from './types.mjs';
import * as log from './log.mjs';

import { default as import_runtypes } from 'runtypes';

export const runtypes = import_runtypes;
export const types = import_types;

const t = runtypes;
const { Contract } = runtypes;
const { NaturalNumber, PartialTrack, Track } = types;

const UUID_PATTERN = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const MBID_URL_REGEX = new RegExp('^https?://musicbrainz.org/([a-z-]*)/(' + UUID_PATTERN + ')');
const MBID_PLAIN_REGEX = new RegExp(UUID_PATTERN);

export const makeMbid = Contract(t.String, t.String, t.String).enforce((type, id) => {
    return 'https://musicbrainz.org/' + type + '/' + id + '#_';
});

export const normalizeMbid = Contract(t.String, t.String, t.String.Or(t.Null)).enforce(
    (type, id) => {
        const matches = MBID_URL_REGEX.exec(id);
        if (matches) {
            return makeMbid(matches[1], matches[2]);
        }

        if (MBID_PLAIN_REGEX.exec(id)) {
            return makeMbid(type, id);
        }

        return null;
    },
);

export const framesToSeconds = Contract(t.String, NaturalNumber.Or(t.Null)).enforce(str => {
    const parts = str.split(':');
    if (parts.length < 3) {
        return null;
    }

    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    const frames = parseInt(parts[2], 10);

    // 75 frames per second.

    return minutes * 60 + seconds + frames / 75;
});

export const removeQuotes = Contract(t.String, t.String).enforce(str => {
    if (str[0] != str[str.length - 1]) {
        // start and end quotes don't match
        return str;
    }

    if (str[0] === '"' || str[0] === "'") {
        return str.substr(1, str.length - 2);
    }

    return str;
});

export function parseCommand(command, args, track) {
    switch (command) {
        case 'REM':
            if (args[0] == 'MUSICBRAINZ_ALBUM_ID' && args.length > 1) {
                return { mbid: normalizeMbid('release', args[1]) };
            }

            if (args[0] == 'COMMENT' && args.length > 1) {
                args.shift();
                const comments = track.comments ? track.comments : [];
                comments.push(args.join(' '));
                return { comments };
            }

            if (args[0] == 'LUD_DURATION_IN_SECONDS') {
                const duration = parseFloat(args[1]);
                return { duration: Number.isNaN(duration) ? null : duration };
            }

            log.info('Skipping unrecognized REM line', command, args);
            return {};
        case 'CATALOG':
            return { barcode: args.join(' ') };
        case 'TITLE':
            return { title: removeQuotes(args.join(' ')) };
        case 'PERFORMER':
            return { artist: removeQuotes(args.join(' ')) };
        case 'FILE':
            const format = args.pop();
            return {
                filename: removeQuotes(args.join(' ')),
                format: format,
            };
        case 'TRACK':
            if (args.pop() != 'AUDIO') {
                log.warning('non-audio tracks are untested');
            }
            return { pos: parseInt(args[0], 10) };
        case 'INDEX':
            const startTime = args.pop();
            const idx = args.pop();

            const indexes = track.indexes ? track.indexes : [];
            const seconds = framesToSeconds(startTime);
            indexes.push({
                index: parseInt(idx, 10),
                'minutes-seconds-frames': startTime,
                seconds,
            });

            return { indexes };
        case 'ISRC':
        case '':
            return {};
        default:
            log.info('Unrecognized command:', command, args);
            return {};
    }
}

export function parseCue(cueStr, filename) {
    const lines = cueStr.split(/[\n|\r|\r\n]/).map(x => x.trim());

    const grouped = [];

    const tracks = lines.reduce(
        (memo, line) => {
            const parts = line.split(/ /);

            const command = parts.shift();
            if (command == 'TRACK') {
                memo.push({});
            }
            if (command == 'FILE') {
                grouped.push(memo);
                memo = [{}];
            }

            Object.assign(
                memo[memo.length - 1],
                parseCommand(command, parts, memo[memo.length - 1]),
            );

            return memo;
        },
        [{}],
    );

    grouped.push(tracks);

    const disc = grouped.shift()[0];
    const groupDuration = grouped.length > 1 ? null : disc.duration;

    if (!disc.duration) {
        log.error(
            'disc length unknown for [' + (disc.artist || '') + ' - ' + (disc.title || '') + ']',
        );
        disc.duration = null;
    }

    if (!disc.barcode) {
        disc.barcode = null;
    }

    disc.files = grouped.map(tracks => {
        const file = tracks.shift();
        file.tracks = addTrackLengths(processSubTracks(tracks), groupDuration);
        return file;
    });

    const matches = filename.match(/disc([0-9]+).cue$/);
    disc.pos = matches ? parseInt(matches[1], 10) : null;

    return disc;
}

export function indexCue(records) {
    let error = false;

    if (records.length < 2) {
        return [];
    }

    const ret = records.slice(1).map((item, pos) => {
        if (item.start) {
            return item.start.seconds;
        } else {
            error = true;
            return 0;
        }
    });

    return error ? [] : ret;
}

export function processSubTracks(records) {
    return records.reduce((memo, record) => {
        record.pregap = null;

        if (record.indexes.length === 0) {
            record.start = null;
            delete record.indexes;
            memo.push(record);
            return memo;
        }

        if (record.indexes.length === 1) {
            record.start = record.indexes[0];
            delete record.indexes;
            memo.push(record);
            return memo;
        }

        const pregap = record.indexes.filter(i => i.index === 0);
        if (pregap.length) {
            record.pregap = pregap[0];
            delete record.pregap.index;
        }

        const indexes = record.indexes.filter(i => i.index > 0);

        if (indexes.length === 1) {
            record.start = indexes[0];
            delete record.indexes;
            memo.push(record);
            return memo;
        }

        const matches = /^([^\/]*):(.*)$/.exec(record.title);

        const groupTitle = matches ? matches[1].trim() : null;
        const titles = matches ? matches[2].split('/') : record.title.split('/');
        const artists = record.artist.split('/');
        indexes.map((trackIndex, i) => {
            const subtrack = Object.assign({}, record);
            subtrack.start = trackIndex;
            delete subtrack.indexes;

            if (titles.length === indexes.length) {
                subtrack.title = titles[i].trim();
            }

            if (artists.length === indexes.length) {
                subtrack.artist = artists[i].trim();
            }

            if (groupTitle) {
                subtrack.groupTitle = groupTitle;
            }

            memo.push(subtrack);
        });

        return memo;
    }, []);
}

export const addTrackLengths = Contract(
    t.Array(PartialTrack),
    NaturalNumber.Or(t.Null),
    t.Array(Track),
).enforce((records, duration) => {
    const lastIdx = records.length - 1;

    return records.map((record, idx) => {
        if (!record.start) {
            return record;
        }

        if (idx == lastIdx) {
            record.duration = duration ? (record.duration = duration - record.start.seconds) : null;
        } else {
            const nextRecord = records[idx + 1];
            if (!nextRecord.start) {
                return record;
            }

            record.duration = nextRecord.start.seconds - record.start.seconds;
        }

        return record;
    });
});
