const request = async (url, options = {}) => {
    let response = null;

    try {
        response = await fetch(url, {
            method: "GET",
            mode: "no-cors",
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

export {
    request,
};
