'use strict';

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path')
const { Cache } = require('./cache')

class Statics extends Cache {
    files = new Map();
    constructor(path, application) {
        super(path, application);
    }

    getExtension(filePath) {
        const name = path.extname(filePath);
        return name ? name.slice(1) : null;
    }

    #parseRangeHeader(rangeHeader) {
        const range = { start: 0, end: 0 };
        if (rangeHeader && rangeHeader.startsWith('bytes=')) {
            const [start, end] = rangeHeader.replace('bytes=', '').split('-');
            range.start = parseInt(start);
            range.end = end ? parseInt(end) : null;
        }

        return range;
    }

    get(key) {
        if (key.startsWith('/')) key = key.slice(1);
        return this.files.get(key);
    }

    getKey(filePath) {
        /**
         * @type string
         */
        let key = filePath.substring(this.path.length);
        if (key.startsWith(path.sep)) key = key.slice(path.sep.length);
        return key;
    }

    async update(filePath) {
        const path = this.fromRelative(filePath);
        const key = this.getKey(path);
        const data = await fsp.readFile(path);
        this.files.set(key, data);
        this.emit('update', this);
    }

    delete(filePath) {
        const path = this.fromRelative(filePath);
        const key = this.getKey(path);
        this.files.delete(key);
        this.emit('delete', this);
    }

    async prepare(ref) {
        const filePath = ref.path;
        const ext = this.getExtension(filePath);
        if (this.ext && !this.ext.includes(ext)) return;
        try {
            const key = this.getKey(filePath);
            const data = await fsp.readFile(filePath);
            this.files.set(key, data);
        } catch (e) {
            this.application.logger.error(e);
            this.delete(filePath);
        } finally {
            this.emit('prepared', this);
        }
    }

    async serve(url, transport) {
        const [urlPath, params] = url.split('?');
        const folder = urlPath.endsWith('/');
        const filePath = urlPath + (folder ? 'index.html' : '');
        const fileExt = this.getExtension(filePath);
        const data = this.get(filePath);
        if (Buffer.isBuffer(data)) return void transport.message(data, 200, fileExt);
        if (!folder && this.get(urlPath + '/index.html')) {
            const query = params ? '?' + params : '';
            return void transport.redirect(urlPath + '/' + query);
        }
        const absPath = path.join(this.path, url);
        if (absPath.startsWith(this.path)) {
            const stat = await fsp.stat(absPath).catch(() => null);
            if (!stat) return void transport.error(404);
            const { size } = stat;
            const range = this.#parseRangeHeader(transport.req.headers.range);
            const { start, end = size - 1 } = range;
            // TEMP FIX
            // if (start >= end || start >= size || end >= size) {
            //     return void transport.error(416);
            // }
            const options = { start, end, size };
            const readable = fs.createReadStream(absPath, options);
            readable.on('error', () => {
                transport.error(404);
            });
            return void transport.write(readable, 206, fileExt, options);
        }
        transport.error(404);
    }
}

module.exports = { Statics }