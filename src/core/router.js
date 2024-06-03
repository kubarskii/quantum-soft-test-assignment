class Router {
    constructor() {
        this.routes = [];
    }

    addRoute(method, path, handler) {
        this.routes.push({ method, path, handler });
    }

    match(requestMethod, requestPath) {
        for (const route of this.routes) {
            if (route.method === requestMethod) {
                const params = this.extractParams(route.path, requestPath);
                if (params !== null) {
                    return { handler: route.handler, params };
                }
            }
        }
        return null;
    }

    extractParams(routePath, requestPath) {
        const routeParts = routePath.split('/').filter(Boolean);
        const requestParts = requestPath.split('/').filter(Boolean);
        if (routeParts.length !== requestParts.length) return null;
        const params = {};
        for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
                const paramName = routeParts[i].slice(1);
                params[paramName] = requestParts[i];
            } else if (routeParts[i] !== requestParts[i]) {
                return null;
            }
        }
        return params;
    }
}

module.exports = { Router }