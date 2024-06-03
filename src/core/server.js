const http = require('node:http')
const { Transport } = require('./transport');
const { URL } = require('node:url');
const { Client } = require('./client');

const API_START = 'api'

class Server {
    /**
     * 
     * @param {object} options 
     * @param {string} options.host
     * @param {number} options.port 
     * @param {import('./application').Application} application
     */
    constructor(options, application) {
        this.port = options.port;
        this.host = options.host;
        this.application = application;
        const server = http
            .createServer()
            .listen(this.port, this.host);
        this.server = server;
        this.init()
    }

    init() {
        const listener = this.httpListener.bind(this);
        this.server.on('request', listener);
    }

    /**
    *
    * @param {http.IncomingMessage} req
    * @param {http.ServerResponse} res
    * @returns {void}
    */
    async httpListener(req, res) {
        const { server } = this;
        const transport = new Transport(server, req, res);
        const client = new Client(transport);
        const { url, method, headers } = req;
        if (!url.startsWith('/' + API_START)) {
            return void (await this.application.statics.serve(url, transport))
        }
        let body;
        try {
            body = await Transport.parseBody(req);
        } catch (e) {
            return void client.error(500, e.message);
        }
        const controller = await this.application.getMethod(url, method);
        if (!controller) return void client.error(404, 'Endpoint does not exist!');
        const { handler, params } = controller;
        const result = await handler(params);
        return void client.send(result, 200);
    }

}

module.exports = { Server }