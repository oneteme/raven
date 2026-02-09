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
    },
    CATEGORIES: {
        name: 'categories', indexes: [{ index: 'by_name', columns: "name" }]
    }
};

createDB(SCHEMAS);
const sessionName = SCHEMAS.SESSION.name,
    requestName = SCHEMAS.REQUESTS.name,
    routeName = SCHEMAS.ROUTES.name,
    categoryName = SCHEMAS.CATEGORIES.name;
// -----------------------------
// SESSION FUNCTIONS
// -----------------------------
export function getAllSessions() {
    return QUERIES.list(sessionName);
}
export function insertSession(metaData, categoryId = null) {
    return new Promise((res, rej) => {
        openDB().then(db => {
            const tx = db.transaction([sessionName, routeName, requestName], 'readwrite'),
                sessionStore = tx.objectStore(sessionName),
                routeStore = tx.objectStore(routeName),
                requestStore = tx.objectStore(requestName),
                category = Number.isNaN(categoryId) ? null : Number.parseInt(categoryId);
            sessionStore.add({ title: metaData.title, description: metaData.description, category: category }).onsuccess = evn => {
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
            "category": null,
            "navigations": navigations
        }
    ravenLog("exported Session : ", session)
    return new Promise((res, rej) => {
        getCategoryNameFromSession(session).then(categoryName => {
            exportedData["category"] = categoryName
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
    })
}
// -----------------------------
// CATEGORIES FUNCTIONS
// -----------------------------
export function insertCategory(name) {
    return new Promise((res, rej) => {
        openDB().then(db => {
            const tx = db.transaction([categoryName], 'readwrite'),
                categoryStore = tx.objectStore(categoryName);
            categoryStore.add({ name: name }).onsuccess = evn => {
                res(evn.target.result)
            };
            tx.onerror = err => rej(err);
        })
    })
}
export function insertNonExistantCategory(name) {
    return new Promise(res => {
        if (name) {
            getCategoryByName(name).then(cat => {
                res(cat.id)
            }).catch(() => {
                insertCategory(name).then(categoryId => {
                    res(categoryId)
                })
            })
        } else {
            res(NaN)
        }
    })
}
export function getAllCategories() {
    return QUERIES.list(categoryName)
}
export function getCategoryById(categoryId) {
    return QUERIES.getById(categoryName, categoryId);
}
export function getCategoryByName(name) {
    ravenLog("category ", name)
    return QUERIES.getByIndex(categoryName, 'by_name', name);
}
export function getCategoryNameFromSession(session) {
    return new Promise(res => {
        getCategoryById(session.category).then(category => {
            res(category.name)
        }).catch(err => {
            res(null)
        })
    })
}
// -----------------------------
// ROUTES FUNCTIONS
// -----------------------------
export function getRouteBySessionId(sessionId) {
    ravenLog("getRouteBySession -> session : ", sessionId)
    return QUERIES.getByIndex(routeName, 'by_session', sessionId);
}
export function getAllRoutesBySessionId(sessionId) {
    ravenLog("getAllRoutesBySessionId -> session : ", sessionId)
    return QUERIES.getAllByIndex(routeName, 'by_session', sessionId);
}
export function getRouteBySessionUrl(sessionId, url) {
    ravenLog("getRouteBySessionUrl -> session : ", sessionId, " url : ", url)
    return QUERIES.getByIndex(routeName, 'by_session_url', sessionId, url);
}
// -----------------------------
// REQUESTS FUNCTIONS
// -----------------------------
export function getRequestbyRouteRequest(routeId, requestUrl) {
    ravenLog("getRequestbyRouteRequest -> session : ", routeId, " request : ", requestUrl)
    return QUERIES.getByIndex(requestName, 'by_route_request', routeId, requestUrl)
}
