import { getRequestbyRouteRequest, getRouteBySessionUrl, insertSession } from "./raven-dao";
import { downloadJson, generateJsonName } from "./raven-utils";
import { getSession, isRecording, isReplaying, ravenError, ravenLog, ravenParams, ravenWarn } from "./settings";
(function () {
    let recordCache = {};

    // ==================================================
    // FETCH INTERCEPTOR
    // ==================================================
    // const originalFetch = window.fetch;

    // window.fetch = async function (input, init) {
    //     try {
    //         const loadEnabled = localStorage.getItem('loadData') === 'enabled';
    //         ravenLog("FETCH -> INTERCEPTOR")
    //         if (!loadEnabled || !cache) {
    //             ravenLog("FETCH -> DIDNT WORK CACHE IS NULL OR LOAD NOT ENABLED")
    //             return originalFetch(input, init);
    //         }

    //         const method = (init?.method || 'GET').toUpperCase();
    //         if (method !== 'GET') {
    //             ravenLog("FETCH -> method not GET")
    //             return originalFetch(input, init);
    //         }

    //         const url = typeof input === 'string' ? input : input.url;
    //         const key = encodeURIComponent(url);
    //         ravenLog("FETCH ->  key is :", key)
    //         if (cache[key] !== undefined) {
    //             ravenLog('🟢 FETCH CACHE HIT →', url);
    //             return new Response(JSON.stringify(cache[key]), {
    //                 status: 200,
    //                 headers: { 'Content-Type': 'application/json' }
    //             });
    //         }

    //         return originalFetch(input, init);
    //     } catch (e) {
    //         console.warn('⚠️ fetch interceptor error, fallback', e);
    //         return originalFetch(input, init);
    //     }
    // };

    // ==================================================
    // XMLHttpRequest INTERCEPTOR 
    // ==================================================
    const OriginalXHR = window.XMLHttpRequest;
    if (isRecording()) {
        recordCache["navigations"] = {}
        applyXHR(saveXHR, "🔴 new RECORD XHR")
    } else if (isReplaying()) {
        setupXHRData();
    }
    async function setupXHRData() {
        applyXHR(loadXHR, "📳 new DEMO XHR")
    }
    function applyXHR(fn, msg = "New XHR") {
        window.XMLHttpRequest = function () {
            const xhr = new OriginalXHR();
            openXHR(xhr)
            return fn(xhr);
        }
    }
    function openXHR(xhr) {
        const originalOpen = xhr.open;
        xhr.open = function (m, url) {
            xhr.__method = m.toUpperCase();
            xhr.__url = url;
            xhr.__pageUrl = window.location.href;
            return originalOpen.apply(xhr, arguments);
        };
    }

    // LOAD INTERCEPTOR
    function loadXHR(xhr) {
        ravenLog("loadXHR : ", xhr)
        const originalSend = xhr.send;
        xhr.send = function () {
            if (xhr.__method !== 'GET') {
                return originalSend.apply(xhr, arguments);
            }
            // xhr.abort();
            getRouteBySessionUrl(getSession(), xhr.__pageUrl)
                .then(route => {
                    getRequestbyRouteRequest(route.id, encodeURIComponent(xhr.__url))
                        .then(request => {
                            ravenLog("[RAVEN INTERCEPTOR]","FOUND REQUEST : ", request)
                            const fakeXHR = request.xhr,
                                fakeResponse = JSON.stringify(fakeXHR.response)
                            // ravenLog("FOUND RESPONSE : ", fakeXHR)
                            Object.defineProperties(xhr, {
                                readyState: { get: () => fakeXHR.readyState },
                                status: { get: () => fakeXHR.status },
                                responseText: { get: () => fakeResponse },
                                response: { get: () => fakeResponse }
                            });
                            fireXHR(xhr)
                            return;
                        }).catch(err => {
                            ravenWarn(err)
                            fakeEmptyResponse(xhr)
                            return;
                        })
                }).catch(err => {
                    ravenWarn(err)
                    fakeEmptyResponse(xhr)
                    return;
                });
        };
        return xhr;
    }
    function fireXHR(xhr) {
        setTimeout(() => {
            xhr.dispatchEvent(new Event('readystatechange'));
            xhr.dispatchEvent(new Event('load'));
            xhr.dispatchEvent(new Event('loadend'));
        }, 0);
    }
    function fakeEmptyResponse(xhr, status = 404) {
        const emptyResponse = JSON.stringify({});

        Object.defineProperties(xhr, {
            readyState: { get: () => 4, configurable: true },
            status: { get: () => status, configurable: true },
            statusText: { get: () => status === 404 ? "Not Found" : "Internal Server Error", configurable: true },
            responseText: { get: () => emptyResponse, configurable: true },
            response: { get: () => emptyResponse, configurable: true }
        });

        fireXHR(xhr);
    }

    // SAVE INTERCEPTOR

    function saveXHR(xhr) {
        xhr.addEventListener('load', () => {
            try {
                if (xhr.__method !== 'GET') return;
                const key = encodeURIComponent(xhr.__url);
                recordCache["navigations"][xhr.__pageUrl] ??= {}
                if (recordCache["navigations"][xhr.__pageUrl][key] != undefined) return;
                recordCache["navigations"][xhr.__pageUrl][key] = {}
                recordCache["navigations"][xhr.__pageUrl][key]["response"] = JSON.parse(xhr.responseText);
                recordCache["navigations"][xhr.__pageUrl][key]["status"] = xhr.status;
                recordCache["navigations"][xhr.__pageUrl][key]["readyState"] = xhr.readyState;
            } catch { }
        });
        return xhr;
    }
    addEventListener("snapshot", (e) => {
        recordCache["title"] = e.detail.title;
        recordCache["description"] = e.detail.description;
        recordCache["category"] = e.detail.category
        insertSession(recordCache, e.detail.categoryId).then(session => {
            ravenLog("session inserted : ", session)
            if (e.detail.download) {
                downloadJson(recordCache, generateJsonName(recordCache["title"]))
            }
            window.location.reload()
        })
    });
})();
