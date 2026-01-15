(function () {
    let currentUrl = window.location.href
    let cache = {};
    let recordCache = {};

    // --------------------------------------------------
    // Receive cache dynamically
    // --------------------------------------------------
    window.addEventListener('chooseExample', (e) => {
        console.log('📦 Cache received');
        cache = e.detail || null;
    });

    // ==================================================
    // FETCH INTERCEPTOR
    // ==================================================
    // const originalFetch = window.fetch;

    // window.fetch = async function (input, init) {
    //     try {
    //         const loadEnabled = localStorage.getItem('loadData') === 'enabled';
    //         console.log("FETCH -> INTERCEPTOR")
    //         if (!loadEnabled || !cache) {
    //             console.log("FETCH -> DIDNT WORK CACHE IS NULL OR LOAD NOT ENABLED")
    //             return originalFetch(input, init);
    //         }

    //         const method = (init?.method || 'GET').toUpperCase();
    //         if (method !== 'GET') {
    //             console.log("FETCH -> method not GET")
    //             return originalFetch(input, init);
    //         }

    //         const url = typeof input === 'string' ? input : input.url;
    //         const key = encodeURIComponent(url);
    //         console.log("FETCH ->  key is :", key)
    //         if (cache[key] !== undefined) {
    //             console.log('🟢 FETCH CACHE HIT →', url);
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
    if (window.RAVEN.isRecordMode) {
        applyXHR(saveXHR, "🔴 new RECORD XHR")
    } else if (window.RAVEN.isReplayMode && window.RAVEN.loadedExample) {
        setupXHRData();
    }
    async function setupXHRData() {
        applyXHR(loadXHR, "📳 new DEMO XHR")
    }
    function applyXHR(fn, msg = "New XHR") {
        window.XMLHttpRequest = function () {
            console.log(msg)
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
        const originalSend = xhr.send;
        xhr.send = function () {
            if (xhr.__method !== 'GET') {
                return originalSend.apply(xhr, arguments);
            }
            // xhr.abort();
            window.QUERIES.getByIndex("route", "by_session_url", window.RAVEN.loadedExample, xhr.__pageUrl)
                .then(route => {
                    if (!route || route.length === 0) {
                        console.log("route not found")
                        return originalSend.apply(xhr, arguments);
                        fakeEmptyResponse(xhr)
                        return;
                    }
                    route = route[0]
                    console.log("xhr route : ", route)
                    window.QUERIES.getByIndex("request", "by_route", route.id, encodeURIComponent(xhr.__url))
                        .then(request => {
                            if (!request || request.length === 0) {
                                console.log("🔴 could not find request for url : ", xhr.__url)
                                return originalSend.apply(xhr, arguments);
                                fakeEmptyResponse(xhr)
                                return;
                            }
                            console.log("xhr request : ", request)
                            console.log("🟢 XHR CACHE HIT →", xhr.__url);
                            const fakeResponse = JSON.stringify(request[0].response);
                            Object.defineProperties(xhr, {
                                readyState: { get: () => 4 },
                                status: { get: () => 200 },
                                responseText: { get: () => fakeResponse },
                                response: { get: () => fakeResponse }
                            });
                            fireXHR(xhr)
                            return;
                        })
                });
        };
        return xhr;
    }
    function fireXHR(xhr) {
        xhr.dispatchEvent(new Event('readystatechange'));
        xhr.dispatchEvent(new Event('load'));
        xhr.dispatchEvent(new Event('loadend'));
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
                if (cache[key] != undefined) return;
                recordCache[window.location.href] ??= {}
                recordCache[window.location.href][key] = JSON.parse(xhr.responseText)
                cache[key] = JSON.parse(xhr.responseText);
            } catch { }
        });
        return xhr;
    }
    addEventListener("snapshot", (e) => {
        cache["url"] = currentUrl
        console.log("SNAPSHOT! -> details : ", e.detail)
        downloadJson(cache)
        downloadJson(recordCache, "fullcache.json")
        const metaData = { "json": recordCache, "title": e.detail.title ?? "case title", "description": e.detail.description ?? "case description" };
        window.dispatchEvent(new CustomEvent('saveExample', { detail: metaData }));
    });
    function downloadJson(json, filename = 'cache.json') {
        const blob = new Blob(
            [JSON.stringify(json, null, 2)],
            { type: 'application/json' }
        );
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
    }

})();
