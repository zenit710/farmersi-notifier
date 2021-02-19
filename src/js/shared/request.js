const request = (url, options = {}) => {
    return fetch(url, {
        method: "GET",
        mode: "no-cors",
        ...options,
    }).then(
        res => res.text(),
        err => {
            console.log("fetch error occured", err);
            return "";
        },
    );
};

export {
    request,
};
