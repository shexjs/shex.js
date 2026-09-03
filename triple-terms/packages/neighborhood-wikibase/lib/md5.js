"use strict";
/** md5, because Wikibase names things with it.
 *
 * Value nodes (`wdv:<32 hex>`), somevalue blank nodes and novalue class
 * restrictions are all md5 digests of a serialization -- see wikibase-rdf --
 * so a package that synthesizes Wikidata's RDF cannot avoid computing them.
 * Node has `crypto.createHash`, but browsers do not: WebCrypto offers no md5
 * (rightly -- it is broken for every security purpose) and is asynchronous
 * besides, while the NeighborhoodDb API is synchronous.  Rather than make
 * the package node-only or drag in a dependency, here is RFC 1321 in about
 * fifty lines.
 *
 * NOT FOR SECURITY.  This is a naming scheme's arithmetic: the digests it
 * computes are Wikibase's identifiers, and nothing here authenticates
 * anything.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.md5 = md5;
const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];
/** K[i] = floor(2^32 * abs(sin(i + 1))) */
const K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296));
const rotl = (x, c) => (x << c) | (x >>> (32 - c));
/** UTF-8 bytes of a string, without TextEncoder (which older embedders and
 * some bundler targets lack). */
function utf8Bytes(text) {
    const bytes = [];
    for (let i = 0; i < text.length; ++i) {
        let code = text.charCodeAt(i);
        if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length) {
            const low = text.charCodeAt(i + 1);
            if (low >= 0xdc00 && low <= 0xdfff) {
                code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
                ++i;
            }
        }
        if (code < 0x80) {
            bytes.push(code);
        }
        else if (code < 0x800) {
            bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
        }
        else if (code < 0x10000) {
            bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
        }
        else {
            bytes.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
        }
    }
    return bytes;
}
/** Lowercase hex md5 of a string's UTF-8 encoding. */
function md5(text) {
    const bytes = utf8Bytes(text);
    const bitLength = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56)
        bytes.push(0);
    // length as a little-endian 64-bit count of bits; a string long enough to
    // overflow 53 bits of float can't be held in memory anyway
    for (let i = 0; i < 8; ++i)
        bytes.push(Math.floor(bitLength / Math.pow(2, 8 * i)) & 0xff);
    let [a0, b0, c0, d0] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
    for (let chunk = 0; chunk < bytes.length; chunk += 64) {
        const M = new Array(16);
        for (let j = 0; j < 16; ++j) {
            const o = chunk + j * 4;
            M[j] = bytes[o] | (bytes[o + 1] << 8) | (bytes[o + 2] << 16) | (bytes[o + 3] << 24);
        }
        let [A, B, C, D] = [a0, b0, c0, d0];
        for (let i = 0; i < 64; ++i) {
            let F, g;
            if (i < 16) {
                F = (B & C) | (~B & D);
                g = i;
            }
            else if (i < 32) {
                F = (D & B) | (~D & C);
                g = (5 * i + 1) % 16;
            }
            else if (i < 48) {
                F = B ^ C ^ D;
                g = (3 * i + 5) % 16;
            }
            else {
                F = C ^ (B | ~D);
                g = (7 * i) % 16;
            }
            F = (F + A + K[i] + M[g]) | 0;
            A = D;
            D = C;
            C = B;
            B = (B + rotl(F, S[i])) | 0;
        }
        a0 = (a0 + A) | 0;
        b0 = (b0 + B) | 0;
        c0 = (c0 + C) | 0;
        d0 = (d0 + D) | 0;
    }
    return [a0, b0, c0, d0].map(word => Array.from({ length: 4 }, (_, i) => ((word >>> (8 * i)) & 0xff).toString(16).padStart(2, "0"))
        .join("")).join("");
}
//# sourceMappingURL=md5.js.map