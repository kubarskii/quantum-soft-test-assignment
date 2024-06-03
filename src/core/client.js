class Client {
    constructor(transport) {
        this.transport = transport;
    }

    error(code, reason = '') {
        this.transport.error(code, reason)
    }

    /**
   *
   * @param {any} obj
   * @param {string | number} code
   */
    send(obj, code) {
        this.transport.message(obj, code);
    }
}

module.exports = { Client }