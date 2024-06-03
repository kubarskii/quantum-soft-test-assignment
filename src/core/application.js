const { Statics } = require('./statics/statics');
const { Router } = require('./router');
const path = require('node:path')

class Application {
    static BASE_DIR = process.cwd();
    static APPLICATION_FOLDER = path.join(Application.BASE_DIR);
    /**
     * 
     * @param {string} config.statics
     */
    constructor(config) {
        const { statics } = config;
        if (!statics) throw new Error('Invalid parameteres in Application')
        this.applicationFolder = Application.APPLICATION_FOLDER;
        this.staticsFolter = path
            .join(this.applicationFolder, statics);
        this.statics = new Statics(this.staticsFolter, this);
        this.router = new Router();
    }

    /**
     * @returns { Promise<void> }
     */
    init() {
        return this.statics.init();
    }

    /**
     * Returns controller based on url and method
     * @param {string} url 
     * @param {string} method 
     */
    async getMethod(url, method) {
        const { router } = this;
        const result = router.match(method, url);
        return result;
    }
}

module.exports = { Application }