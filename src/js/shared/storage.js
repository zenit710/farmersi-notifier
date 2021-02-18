const getItemFromStorage = key => {
    return new Promise(result => {
        chrome.storage.sync.get(key, res => result(res[key]));
    });
};

const setItemInStorage = (key, value) => {
    return new Promise(result => {
        chrome.storage.sync.set({[key]: value}, () => {
            console.log(`${key} saved in storage.`);
            result(true);
        });
    });
};

export {
    getItemFromStorage,
    setItemInStorage,
};
