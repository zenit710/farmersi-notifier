export const METHOD = {
    GET: "GET",
    POST: "POST",
};

export const request = async (url, options = {}) => {
    let response = null;

    try {
        response = await fetch(url, {
            method: "GET",
            mode: "cors",
            ...options,
        });

        if (!response.ok) {
            console.log(`Response error: ${response.status}`);
        }
    } catch (e) {
        console.log("fetch error occured", e);
    }

    return response;
};
