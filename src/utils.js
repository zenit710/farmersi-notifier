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

const getSettingByKey = (settings, key) => {
    let value = null;

    try {
        value = settings.find(item => item.key === key).value;
    } catch (e) {
        console.error(`Setting ${key} could not be read from settings`, e);
    }

    return value;
};

const sendNotification = message => {
    const id = "farmersi_notifier_" + Date.now();

    chrome.notifications.create(id, {
        title: "Farmersi Notifier",
        iconUrl: "/dist/images/logo-16.png",
        type: "basic",
        message,
    }, () => {
        console.log("Notification was send");
    });
};

export {
    getItemFromStorage,
    setItemInStorage,
    getSettingByKey,
    sendNotification,
};
