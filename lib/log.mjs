/**
 *   This file is part of lûd, an opinionated browser based media player.
 *   Copyright (C) 2020  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.1.  See copyleft-next-0.3.1.txt.
 *
 *   SPDX-License-Identifier: copyleft-next-0.3.1
 */

if (typeof window !== 'undefined') {
    if (!window.lûd) {
        window.lûd = {};
    }

    if (typeof window.lûd.verbose === 'undefined') {
        window.lûd.verbose = true;
    }
} else {
    var __log_global_verbose = true;
}

export function setVerbose(val) {
    if (typeof window !== 'undefined') {
        window.lûd.verbose = val;
    }

    __log_global_verbose = val;
}

function verbose() {
    if (typeof window !== 'undefined') {
        return window.lûd && window.lûd.verbose;
    }

    return __log_global_verbose;
}

export function info() {
    if (verbose()) {
        console.error.apply(this, ['INFO:', ...arguments]);
    }
}

export function warning() {
    if (verbose()) {
        console.error.apply(this, ['WARNING:', ...arguments]);
    }
}

export function error() {
    if (verbose()) {
        console.error.apply(this, ['ERROR:', ...arguments]);
    }
}
