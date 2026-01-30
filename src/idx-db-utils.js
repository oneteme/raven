import { ravenLog } from "./settings";

const DB_NAME = 'raven-db';
const VERSION = 1;
// -----------------------------
// database funcitons 
// -----------------------------
export function createDB(schemas, name = DB_NAME, version = VERSION) {
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
export function openDB(name = DB_NAME, version = VERSION) {
    //utils.debugRaven("opening DB... ", name)
    const cnx = indexedDB.open(name, version);
    return new Promise(resolve => {
        cnx.onsuccess = (event) => { //utils.debugRaven("Database -> " + name + " opened sucessfully");
            resolve(event.target.result)
        }
    });

}


// Open DB HELPER function
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
};
// -----------------------------
// QUERY FUNCTIONS
// -----------------------------
export const QUERIES = {
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
    }
};

