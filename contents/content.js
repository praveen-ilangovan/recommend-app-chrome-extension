// Add a listener that listens to the extension
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    const urlInfo = getUrlInfo();
    sendResponse({data: urlInfo});
} )

function getUrlInfo() {
    let keys = ['title', 'description', 'thumbnail', 'url'];
    let urlInfo = {'title': '', 'description': '', 'thumbnail': '', 'url': ''};

    //
    fromLdJson(keys, urlInfo);

    // og:<>
    fromOgMetaTags(keys, urlInfo);

    // twitter
    fromTwitterMetaTags(keys, urlInfo);

    // meta
    fromMetaTags(keys, urlInfo);

    // Fallback: title & Url
    if (urlInfo['title'] === '') {
        urlInfo['title'] = document.title;
    }

    if (urlInfo['url'] === '') {
        urlInfo['url'] = window.location.href;
    }

    return urlInfo;
}

function fromLdJson(keys, urlInfo) {
    const mapper = {'title': 'name', 'url': 'url', 'description': 'description', 'thumbnail': 'image'};

    const jsonldTag = document.querySelector('script[type="application/ld+json"]');
    if (jsonldTag) {
        const jsonld = JSON.parse(jsonldTag.innerText);

        for (const key in mapper) {
            if (keys.includes(key) && (mapper[key] in jsonld) ) {
                urlInfo[key] = jsonld[ mapper[key] ];

                const index = keys.indexOf(key);
                if (index !== -1) {
                    keys.splice(index, 1);
                }
            }
        }
    }
}


function fromOgMetaTags(keys, urlInfo) {
    const mapper = {'title': 'og:title', 'url': 'og:url', 'description': 'og:description', 'thumbnail': 'og:image'};

    for (const key in mapper) {
        if (keys.includes(key)) {
            const tag = document.querySelector("meta[property='" + mapper[key] + "\']");
            if (tag) {
                urlInfo[key] = tag.getAttribute("content");   
                const index = keys.indexOf(key);
                if (index !== -1) {
                    keys.splice(index, 1);
                }
            }
        }
    }
}

function fromTwitterMetaTags(keys, urlInfo) {
    const mapper = {'title': 'twitter:title', 'description': 'twitter:description', 'thumbnail': 'twitter:image'};

    for (const key in mapper) {
        if (keys.includes(key)) {
            const tag = document.querySelector("meta[name='" + mapper[key] + "\']");
            if (tag) {
                urlInfo[key] = tag.getAttribute("content");   
                const index = keys.indexOf(key);
                if (index !== -1) {
                    keys.splice(index, 1);
                }
            }
        }
    }
}

function fromMetaTags(keys, urlInfo) {
    const mapper = {'title': 'title', 'description': 'description'};

    for (const key in mapper) {
        if (keys.includes(key)) {
            const tag = document.querySelector("meta[name='" + mapper[key] + "\']");
            if (tag) {
                urlInfo[key] = tag.getAttribute("content"); 
                const index = keys.indexOf(key);
                if (index !== -1) {
                    keys.splice(index, 1);
                }  
            }
        }
    }
}
