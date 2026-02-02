import { createDB, openDB, QUERIES } from "./idx-db-utils";
import { ravenLog, ravenWarn } from "./settings";

const SCHEMAS = {
    REQUESTS: {
        name: 'request', indexes: [
            { index: 'by_route_request', columns: ["routeId", "url"] },
            { index: 'by_route', columns: "routeId" }]
    },
    SESSION: { name: 'session', indexes: [{ index: 'by_title', columns: "title" }] },
    ROUTES: {
        name: 'route', indexes: [
            { index: 'by_session', columns: "sessionId" },
            { index: 'by_session_url', columns: ["sessionId", "route"] }]
    }
};

createDB(SCHEMAS);
const sessionName = SCHEMAS.SESSION.name,
    requestName = SCHEMAS.REQUESTS.name,
    routeName = SCHEMAS.ROUTES.name;
// -----------------------------
// SESSION FUNCTIONS
// -----------------------------
export function getAllSessions() {
    return QUERIES.list(sessionName);
}
export function insertSession(metaData) {
    return new Promise((res, rej) => {
        openDB().then(db => {
            const tx = db.transaction([sessionName, routeName, requestName], 'readwrite'),
                sessionStore = tx.objectStore(sessionName),
                routeStore = tx.objectStore(routeName),
                requestStore = tx.objectStore(requestName);
            sessionStore.add({ title: metaData.title, description: metaData.description }).onsuccess = evn => {
                const sessionId = evn.target.result;
                saveSessionRoutes(routeStore, requestStore, metaData.navigations, sessionId)
            };
            tx.oncomplete = evn => res(evn.target.result);
            tx.onerror = err => rej(err)
        })
    })
}
function saveSessionRoutes(routesStore, requestsStore, routes, sessionId) {
    for (const route of Object.keys(routes)) {
        const requests = routes[route];
        routesStore.add({ route, "sessionId": sessionId }).onsuccess = evn => {
            for (const request of Object.keys(requests)) {
                requestsStore.add({ routeId: evn.target.result, url: request, xhr: requests[request] });
            }
        }
    }
};
export function exportSession(session) {
    let navigations = {},
        exportedData = {
            "title": session.title,
            "description": session.description,
            "navigations": navigations
        }
    return new Promise((res, rej) => {
        openDB().then(db => {
            const tx = db.transaction([routeName, requestName], "readonly"),
                routesCursor = tx.objectStore(routeName)
                    .index('by_session')
                    .openCursor(IDBKeyRange.only(session.id)),
                requestindex = tx.objectStore(requestName).index('by_route');
            routesCursor.onsuccess = (evnRoute) => {
                const routeCur = evnRoute.target.result;
                if (routeCur) {
                    const route = routeCur.value;
                    navigations[route.route] = {}
                    let requestsCursor = requestindex.openCursor(IDBKeyRange.only(route.id));
                    requestsCursor.onsuccess = (evnReq) => {
                        const reqCur = evnReq.target.result;
                        if (reqCur) {
                            const request = reqCur.value;
                            navigations[route.route][request.url] = request.xhr;
                            reqCur.continue()
                        } else {
                            routeCur.continue();
                        }
                    }
                } else {
                    exportedData["navigations"] = navigations
                }
            };

            //TRANSACTION FINISHED
            tx.oncomplete = () => res(exportedData);
            tx.onerror = err => rej(err)
        })
    })
}
// -----------------------------
// ROUTES FUNCTIONS
// -----------------------------
export function getRouteBySession(sessionId) {
    ravenWarn("getRouteBySession -> session : ", sessionId)
    return QUERIES.getByIndex(routeName, 'by_session', sessionId);
}
export function getAllRoutesBySessionId(sessionId) {
    ravenWarn("getAllRoutesBySessionId -> session : ", sessionId)
    return QUERIES.getAllByIndex(routeName, 'by_session', sessionId);
}
export function getRouteBySessionUrl(sessionId, url) {
    ravenLog("sesison : ", sessionId)
    ravenWarn("getRouteBySessionUrl -> session : ", sessionId, " url : ", url)
    return QUERIES.getByIndex(routeName, 'by_session_url', sessionId, url);
}
// -----------------------------
// REQUESTS FUNCTIONS
// -----------------------------
export function getRequestbyRouteRequest(routeId, requestUrl) {
    ravenWarn("getRequestbyRouteRequest -> session : ", routeId, " request : ", requestUrl)
    return QUERIES.getByIndex(requestName, 'by_route_request', routeId, requestUrl)
}
