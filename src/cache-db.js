import * as utils from "./settings.js";
(function () {

    const DB_NAME = 'raven-db';
    const VERSION = 1;

    const SCHEMAS = {
        REQUESTS: { store: 'request', indexes: [{ index: 'by_route', columns: ["routeId", "url"] }] },
        SESSION: { store: 'session', indexes: [{ index: 'by_title', columns: "title" }] },
        ROUTES: {
            store: 'route', indexes: [
                { index: 'by_session', columns: "sessionId" },
                { index: 'by_session_url', columns: ["sessionId", "route"] }
            ]
        }
    };
    // -----------------------------
    // Open database (once)
    // -----------------------------
    createDB();
    function createDB(name = DB_NAME, version = VERSION, schemas = SCHEMAS) {
        const req = indexedDB.open(name, version);
        req.onupgradeneeded = (event) => {
            const db = event.target.result;

            Object.values(schemas).forEach(schema => {
                const storeName = schema.store,
                    storeIndexes = schema.indexes;
                if (!db.objectStoreNames.contains(storeName)) {
                    const store = db.createObjectStore(storeName, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    if (storeIndexes) {
                        for (const index of storeIndexes) {
                            store.createIndex(index.index, index.columns)
                        }
                    }
                }
            });
        };
    }

    // Open DB HELPER function
    function openDB(name = DB_NAME, version = VERSION) {
        //utils.debugRaven("opening DB... ", name)
        const cnx = indexedDB.open(name, version);
        return new Promise(resolve => {
            cnx.onsuccess = (event) => { //utils.debugRaven("Database -> " + name + " opened sucessfully");
                resolve(event.target.result)
            }
        });

    }
    // -----------------------------
    // HELPER TO USE STORE(S)
    // -----------------------------

    function getByIndexHelperFn(storeName, indexName, fn) {
        return openDB().then(db => {
            const tx = db.transaction([storeName], "readonly");
            const index = tx.objectStore(storeName).index(indexName);
            return new Promise((res, rej) => {
                const req = fn(index);
                req.onsuccess = evn => res(evn.target.result)
                req.onerror = err => rej(err);
            });
        })
    }
    // -----------------------------
    // PUBLIC QUERY FUNCTIONS
    // -----------------------------
    window.QUERIES = {
        list(storeName) {
            return openDB().then(db => {
                const tx = db.transaction([storeName], "readonly");
                return new Promise((res, rej) => {
                    const req = tx.objectStore(storeName).getAll();
                    req.onsuccess = evn => res(evn.target.result);
                    req.onerror = err => rej(err)
                })
            })
        },
        getById(storeName, id) {
            return openDB().then(db => {
                const tx = db.transaction([storeName], "readonly");
                return new Promise((res, rej) => {
                    const req = tx.objectStore(storeName).get(id);
                    req.onsuccess = evn => res(evn.target.result);
                    req.onerror = err => rej(err)
                })
            })
        },
        getByIndex(storeName, indexName, ...args) {
            const key = args.length === 1 ? args[0] : args;
            return getByIndexHelperFn(storeName, indexName, idx => idx.get(key));
        },
        getAllByIndex(storeName, indexName, ...args) {
            const key = args.length === 1 ? args[0] : args;
            return getByIndexHelperFn(storeName, indexName, idx => idx.getAll(key));
        },

        insertSession(metaData) {
            utils.debugRaven("saving...", metaData)
            return new Promise((res, rej) => {
                openDB().then(db => {
                    const tx = db.transaction([SCHEMAS.SESSION.store, SCHEMAS.ROUTES.store, SCHEMAS.REQUESTS.store], 'readwrite'),
                        sessionStore = tx.objectStore(SCHEMAS.SESSION.store),
                        routeStore = tx.objectStore(SCHEMAS.ROUTES.store),
                        requestStore = tx.objectStore(SCHEMAS.REQUESTS.store);
                    sessionStore.add({ title: metaData.title, description: metaData.description }).onsuccess = evn => {
                        const sessionId = evn.target.result;
                        saveRoutes(routeStore, requestStore, metaData.navigations, sessionId)
                    };
                    tx.oncomplete = evn => res(evn.target.result);
                    tx.onerror = err => rej(err)
                })
            })
        }
    };
    console.log('📦 IndexedDB ready');
})();

function saveRoutes(routesStore, requestsStore, routes, sessionId) {
    for (const route of Object.keys(routes)) {
        const requests = routes[route];
        routesStore.add({ route, "sessionId": sessionId }).onsuccess = evn => {
            for (const request of Object.keys(requests)) {
                requestsStore.add({ routeId: evn.target.result, url: request, xhr: requests[request] });
            }
        }
    }
}