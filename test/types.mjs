/**
 *   This file is part of lûd, an opinionated browser based media player.
 *   Copyright (C) 2020  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.1.  See copyleft-next-0.3.1.txt.
 *
 *   SPDX-License-Identifier: copyleft-next-0.3.1
 */

import * as cue from '../lib/cue.mjs';

import chai from 'chai';

const { Artist, AudioOffset, File, Mbid, MinutesSecondsFrames, Track } = cue.types;
const assert = chai.assert;

suite('Types', () => {
    test('Minutes:Seconds:Frames', () => {
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

    test('MusicBrainz identifier', () => {
        assert.isOk(
            Mbid.artist.guard(
                'https://musicbrainz.org/artist/45a663b5-b1cb-4a91-bff6-2bef7bbfdd76#_',
            ),
        );

        // The Mbid type requires a trailing #_.
        //
        // This is to distinguish the identifier for the artist ('#_' suffix)
        // from the the identifier of the musicbrainz web page about this
        // artist (without the '#_' suffix).
        //
        // See also [httpRange-14](https://en.wikipedia.org/wiki/HTTPRange-14)
        assert.isNotOk(
            Mbid.artist.guard(
                'https://musicbrainz.org/artist/45a663b5-b1cb-4a91-bff6-2bef7bbfdd76',
            ),
        );

        // It's 2020, require https:// for everything.
        assert.isNotOk(
            Mbid.artist.guard(
                'http://musicbrainz.org/artist/45a663b5-b1cb-4a91-bff6-2bef7bbfdd76#_',
            ),
        );

        // An artist MBID is not a release MBID.
        assert.isNotOk(
            Mbid.release.guard(
                'https://musicbrainz.org/artist/45a663b5-b1cb-4a91-bff6-2bef7bbfdd76#_',
            ),
        );
    });
});
