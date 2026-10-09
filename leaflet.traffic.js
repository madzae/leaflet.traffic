(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['leaflet'], factory);
    } else if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory(require('leaflet'));
    } else if (typeof window !== 'undefined' && window.L) {
        factory(window.L);
    } else {
        throw new Error('leaflet.traffic.js requires Leaflet to be loaded first');
    }
}(function (L) {
    'use strict';

    L.TileLayer.Traffic = L.TileLayer.extend({
        options: {
            maxZoom: 19,
            subdomains: '0123',
            language: 'en',
            crossOrigin: 'anonymous',
            trafficLyrs: 'm,traffic', // layer string for traffic tile
            baseLyrs: 'm',            // layer string for plain tile (subtracted)
            threshold: 30             // summed RGB diff below this => transparent
        },

        _defaultUrl: 'https://mt{s}.google.com/vt/lyrs={lyrs}&x={x}&y={y}&z={z}&hl={language}',

        initialize: function (url, options) {
            if (url && typeof url === 'object') {
                options = url;
                url = null;
            }
            L.TileLayer.prototype.initialize.call(this, url || this._defaultUrl, options);
        },

        _tileUrl: function (coords, lyrs, sub) {
            var data = {
                s: sub,
                x: coords.x,
                y: coords.y,
                z: this._getZoomForUrl()
            };
            return L.Util.template(this._url, L.extend(data, this.options, { lyrs: lyrs }));
        },

        _loadImage: function (src) {
            var crossOrigin = this.options.crossOrigin;
            return new Promise(function (resolve, reject) {
                var img = new Image();
                if (crossOrigin !== false) img.crossOrigin = crossOrigin === true ? 'anonymous' : crossOrigin;
                img.onload = function () { resolve(img); };
                img.onerror = reject;
                img.src = src;
            });
        },

        _readPixels: function (img, w, h) {
            var c = document.createElement('canvas');
            c.width = w;
            c.height = h;
            var ctx = c.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(img, 0, 0, w, h);
            return ctx.getImageData(0, 0, w, h);
        },

        createTile: function (coords, done) {
            var tile = document.createElement('canvas');
            var size = this.getTileSize();
            var self = this;
            var thr = this.options.threshold;

            tile.width = size.x;
            tile.height = size.y;

            var sub = this._getSubdomain(coords);
            var urlTraffic = this._tileUrl(coords, this.options.trafficLyrs, sub);
            var urlBase = this._tileUrl(coords, this.options.baseLyrs, sub);

            Promise.all([this._loadImage(urlTraffic), this._loadImage(urlBase)])
                .then(function (imgs) {
                    var t = self._readPixels(imgs[0], size.x, size.y);
                    var b = self._readPixels(imgs[1], size.x, size.y);
                    var tp = t.data, bp = b.data;

                    for (var i = 0; i < tp.length; i += 4) {
                        var diff = Math.abs(tp[i] - bp[i]) +
                                   Math.abs(tp[i + 1] - bp[i + 1]) +
                                   Math.abs(tp[i + 2] - bp[i + 2]);
                        if (diff < thr) tp[i + 3] = 0;
                    }

                    tile.getContext('2d').putImageData(t, 0, 0);
                    done(null, tile);
                })
                .catch(function (err) {
                    done(err, tile);
                });

            return tile;
        }
    });

    L.tileLayer.traffic = function (url, options) {
        return new L.TileLayer.Traffic(url, options);
    };

    return L.TileLayer.Traffic;
}));
