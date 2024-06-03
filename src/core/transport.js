'use strict';

const { DEFAULT_HEADERS, MIME_TYPES } = require('./constants');
const http = require('node:http');
const { Readable } = require('node:stream');

class Transport {


    /**
     * Supports 'application/json' only
     * 
     * @param {http.IncommingMessage} req 
     * @returns {string | number | Record<string, any> | null | never}
     */
    static async parseBody(req) {
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        if (!chunks.length) return null;
        const contentType = req.headers['content-type'];
        if (contentType === 'application/json')
            return JSON.parse(body.toString());
        throw new Error('Unknown contentType')
    }

    /**
     * 
     * @param {Server} server 
     * @param {IncommingMessage} req 
     * @param {ServerResponse} res 
     */
    constructor(server, req, res) {
        this.server = server;
        this.req = req;
        this.res = res;
    }

    /**
     * 
     * @param {number} code 
     * @param {string} reason 
     * @returns 
     */
    error(code, reason) {
        const { res } = this;
        if (res.writableEnded) return void 0;
        const isValidCode = this.#isValidHttpCode(code);
        const validatedCode = isValidCode ? code : 500;
        const message = 'Error occured, the error code is not valid for http error response';
        if (validatedCode < 400)
            this.server.application.logger.warn(message);
        return void this.message(reason, validatedCode);
    }

    /**
     * 
     * @param {any} data 
     * @param {number} code 
     * @param {extension} code 
     * @returns 
     */
    message(data, code, extension) {
        if (!this.#isValidHttpCode(code))
            throw new Error('Invalid http code: ' + code + '. Valid codes are from 100 to 599');
        const { res } = this;
        if (res.writableEnded) return void 0;
        const mimeType = extension ? MIME_TYPES[extension] : MIME_TYPES.json;
        const headers = { ...DEFAULT_HEADERS, 'Content-Type': mimeType };
        const processed = data instanceof Buffer ? Readable.from(data) : data;
        const isStream = processed instanceof Readable || data instanceof Readable;
        res.writeHead(code, headers);
        if (isStream) processed.pipe(res);
        else res.end(typeof data !== 'string' ? JSON.stringify(processed) : processed);
    }


    #isValidHttpCode(code) {
        if (typeof code !== 'number') {
            return false;
        }
        return code >= 100 && code <= 599;
    }

}

module.exports = { Transport }