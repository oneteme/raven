import { ravenError, ravenLog, ravenWarn } from "./settings";

// -----------------------------
// database funcitons 
// -----------------------------
export function createDB(schemas, name, version) {
    ravenLog("RAVEN CREATE DB => SCHEMAS : ", schemas, " name : ", name, " VERSION : ", version)
    const req = indexedDB.open(name, version);
    req.onupgradeneeded = (event) => {
        const db = event.target.result;

        Object.values(schemas).forEach(schema => {
            const storeName = schema.name,
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
export function openDB(name, version) {
    //utils.debugRaven("opening DB... ", name)
    const cnx = indexedDB.open(name, version);
    return new Promise(resolve => {
        cnx.onsuccess = (event) => { //utils.debugRaven("Database -> " + name + " opened sucessfully");
            resolve(event.target.result)
        }
    });

}


// Open DB HELPER function
function getByIndexHelperFn(openMethod, storeName, indexName, fn) {
    return new Promise((res, rej) => {
        openMethod().then(db => {
            const tx = db.transaction([storeName], "readonly");
            const index = tx.objectStore(storeName).index(indexName);
            const req = fn(index);
            req.onsuccess = evn => {
                if (evn.target.result) {
                    res(evn.target.result)
                } else {
                    rej("[RAVEN indexedDB] could not find " + storeName + " " + indexName)
                }
            }
            req.onerror = err => rej(err);
        });
    })
};
// -----------------------------
// QUERY FUNCTIONS
// -----------------------------
export const QUERIES = {
    list(openMethod, storeName) {
        return new Promise((res, rej) => {
            return openMethod().then(db => {
                const tx = db.transaction([storeName], "readonly");
                const req = tx.objectStore(storeName).getAll();
                req.onsuccess = evn => {
                    if (evn.target.result.length > 0) {
                        ravenLog("QUERIES list", storeName, " FOUND", evn.target.result);
                        res(evn.target.result)
                    } else {
                        ravenWarn("QUERIES list", storeName, " ERROR");
                        rej("No " + storeName + "s were found");
                    }
                };
                req.onerror = err => rej(err)
            }).catch(err => {
                rej("Error opening database while listing " + storeName + "s => " + err)
            })
        })
    },
    getById(openMethod, storeName, id) {
        return new Promise((res, rej) => {
            return openMethod().then(db => {
                const tx = db.transaction([storeName], "readonly");
                const req = tx.objectStore(storeName).get(id ?? -1);
                req.onsuccess = evn => {
                    if (id > 0 && evn.target.result) {
                        res(evn.target.result)
                    } else {
                        rej("Can't find " + storeName + " with ID => ", id)
                    }
                };
                req.onerror = err => rej(err)
            })
        })
    },
    getByIndex(openMethod, storeName, indexName, ...args) {
        const key = args.length === 1 ? args[0] : args;
        return getByIndexHelperFn(openMethod, storeName, indexName, idx => idx.get(key));
    },
    getAllByIndex(openMethod, storeName, indexName, ...args) {
        const key = args.length === 1 ? args[0] : args;
        return getByIndexHelperFn(openMethod, storeName, indexName, idx => idx.getAll(key));
    }
};

