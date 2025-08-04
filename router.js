/**
 * Router Module - Client-side routing for single-page application
 * Handles navigation between modules without page refresh
 */

export class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = '';
        this.initializeRouter();
    }

    initializeRouter() {
        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRouteChange());
        window.addEventListener('load', () => this.handleRouteChange());
    }

    addRoute(path, handler) {
        this.routes.set(path, handler);
    }

    navigate(hash) {
        // Remove # if present and get route name
        const route = hash.replace('#', '');

        if (this.routes.has(route)) {
            window.location.hash = `#${route}`;
        } else {
            console.warn(`Route '${route}' not found, redirecting to default`);
            window.location.hash = '#todo';
        }
    }

    handleRouteChange() {
        const hash = window.location.hash.replace('#', '') || 'todo';

        if (this.routes.has(hash)) {
            this.currentRoute = hash;
            this.routes.get(hash)();
        } else {
            this.navigate('#todo');
        }
    }

    getCurrentRoute() {
        return this.currentRoute;
    }
}
