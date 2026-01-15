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
        utils.debugRaven("opening DB... ", name)
        const cnx = indexedDB.open(name, version);
        return new Promise(resolve => {
            cnx.onsuccess = (event) => { utils.debugRaven("Database -> " + name + " opened sucessfully"); resolve(event.target.result) }
        })

    }
    // -----------------------------
    // HELPER TO USE STORE(S)
    // -----------------------------
    function useStore2(stores, mode = 'readonly', dbName = DB_NAME, dbVersion = VERSION) {

    }
    function useStores(db, stores, mode) {
        // utils.debugRaven("creating transaction for Stores -> ", stores, " with mode : ", mode)
        let storesObj = {}
        const tx = db.transaction(stores, mode);
        // More than one store
        if (stores.length > 1) {
            for (const store of stores) {
                storesObj[store] = tx.objectStore(store);
            }
        } else { // only one store
            storesObj = tx.objectStore(stores[0]);
        }
        return storesObj;
    }

    function getByIndexHelperFn(fn, storeName, indexName, ...args) {
        const key = args.length === 1 ? args[0] : args;
        // if (key && !key.includes(null)) {
        return openDB().then(db => {
            const store = useStores(db, [storeName], "readonly");
            const index = store.index(indexName);
            return new Promise(resolve => {
                const req = index[fn](key);
                req.onsuccess = () => { utils.debugRaven("get by index result: ", req.result, " key : ", key, " store : ", storeName, " indexName : ", indexName); resolve(req.result) };
                req.onerror = () => { utils.debugRaven("Could not find index for store ", storeName, " and index : ", args); resolve([]) };
            });
        })
        // }
        // return new Promise(resolve => {
        //     resolve([])
        // })
    }
    // -----------------------------
    // PUBLIC QUERY FUNCTIONS
    // -----------------------------
    window.QUERIES = {
        save(storeName, snapshot) {
            useStore(storeName, 'readwrite').then(store => store.add(snapshot).result)
        },
        list(storeName) {
            return openDB().then(db => {
                const store = useStores(db, [storeName], "readonly");
                return new Promise(resolve => {
                    utils.debugRaven("list store : ", store)
                    const req = store.getAll();
                    req.onsuccess = () => resolve(req.result);
                    req.onerror = () => console.error("IndexedDB listing failed")
                })
            })
        },
        getById(storeName, id) {
            return openDB().then(db => {
                const store = useStores(db, [storeName], "readonly");
                return new Promise(resolve => {
                    const req = store.get(id);
                    req.onsuccess = () => { utils.debugRaven("getById result -> ", req.result); resolve(req.result) };
                    req.onerror = () => utils.debugRaven("IndexedDB select failed")
                })
            })
        },
        getByIndex(storeName, indexName, ...args) {
            const key = args.length === 1 ? args[0] : args;
            // if (key && !key.includes(null)) {
            return openDB().then(db => {
                const store = useStores(db, [storeName], "readonly");
                const index = store.index(indexName);
                return new Promise(resolve => {
                    const req = index.getAll(key);
                    req.onsuccess = () => { utils.debugRaven("get by index result: ", req.result, " key : ", key, " store : ", storeName, " indexName : ", indexName); resolve(req.result) };
                    req.onerror = () => { utils.debugRaven("Could not find index for store ", storeName, " and index : ", args); resolve([]) };
                });
            })
        },
        getAllByIndex(storeName, indexName, ...args) {
            return getByIndexHelperFn("getAll", storeName, indexName, args).then(
                data => {
                    return new Promise(resolve => {
                        resolve(data)
                    })
                }
            )
        },
        remove(storeName, id) {
            return openDB().then(db => {
                const store = useStores(db, [storeName], "readwrite")
                store.delete(id);
                utils.debugRaven("removed ", storeName, " with ID : ", id)
            })
        },

        saveExample(metaData) {
            utils.debugRaven("saving...", metaData)
            openDB().then(db => {
                const stores = useStores(db, [SCHEMAS.SESSION.store, SCHEMAS.ROUTES.store, SCHEMAS.REQUESTS.store], 'readwrite')
                stores[SCHEMAS.SESSION.store].add({ title: metaData.title, description: metaData.description }).onsuccess = e1 => {
                    for (const route of Object.keys(metaData.navigations)) {
                        const requests = metaData.navigations[route];
                        stores[SCHEMAS.ROUTES.store].add({ route, "sessionId": e1.target.result }).onsuccess = e2 => {
                            // Loop through requests in the route
                            for (const request of Object.keys(requests)) {
                                stores[SCHEMAS.REQUESTS.store].add({ routeId: e2.target.result, url: request, xhr: requests[request] })
                            }
                            utils.debugRaven("saved...", metaData)
                            //tx.commit();
                        }
                    }
                };
            })
        },

        async join(leftStore, rightStore, leftKey, rightKey) {
            const leftData = await QUERIES.list(leftStore);
            const rightData = await QUERIES.list(rightStore);

            const joined = [];

            leftData.forEach(leftRow => {
                const matches = rightData.filter(rightRow => rightRow[rightKey] === leftRow[leftKey]);
                matches.forEach(rightRow => {
                    joined.push({ ...leftRow, ...rightRow });
                });
            });

            return joined;
        },
        async selectWhere(storeName, filters = {}) {
            const all = await QUERIES.list(storeName);

            // Filter by all keys in filters object
            return all.filter(item => {
                return Object.keys(filters).every(key => item[key] === filters[key]);
            });
        },
        async selectRequests(exampleId) {
            console.log("example : ", exampleId)
            const routes = await QUERIES.selectWhere(SCHEMAS.ROUTES, { 'exampleId': exampleId, 'route': "http%3A%2F%2Flocalhost%3A9001%2Fjquery%2Finstance%…nvironement.notNull%3D%26order%3Denvironement.asc" });
            console.log("routes : ", routes)
            const requests = await QUERIES.selectWhere(SCHEMAS.REQUESTS, { 'routeId': routes.id, 'route': window.location.href });
            console.log("requests : ", requests)
            // const result = [];
            // routes.forEach(route => {
            //     requests
            //         .filter(r => r.routeId === route.id)
            //         .forEach(r => result.push({ route, request: r }));
            // });

            // return result;
        }

    };

    // -----------------------------
    // Custom event listener
    // -----------------------------
    // window.addEventListener('saveExample', async (e) => {
    //     await QUERIES.saveExample(e.detail)
    // });
    // new CustomEvent('selectExample', { detail: QUERIES.getById(STORES.METADATA,) })
    console.log('📦 IndexedDB ready');
})();
