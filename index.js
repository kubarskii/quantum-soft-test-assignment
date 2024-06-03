const { Application } = require('./src/core/application');
const { Server } = require('./src/core/server');
const { applyChanges, getNodes, refresh, getNode } = require('./src/controllers/nodes');

/**
 * 
 * GET  /nodes: Get all nodes (to share on UI)
 * GET  /nodes/:id: Get node by id
 * POST /nodes/refresh: Refreshing the tree to initial state
 * POST /nodes/apply: Apply all changes at once
 */
(async () => {
    const application = new Application({ statics: './frontend' })
    application.router.addRoute('GET', '/api/nodes', getNodes)
    application.router.addRoute('GET', '/api/nodes/:id', getNode)
    application.router.addRoute('POST', '/api/nodes/refresh', refresh)
    application.router.addRoute('POST', '/api/nodes/apply', applyChanges)
    await application.init();
    const server = new Server({ port: 3006, host: '0.0.0.0' }, application);
})()