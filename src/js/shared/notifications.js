const sendNotification = message => {
    const id = "farmersi_notifier_" + Date.now();

    chrome.notifications.create(id, {
        title: "Farmersi Notifier",
        iconUrl: "images/logo-128.png",
        type: "basic",
        message,
    }, () => {
        console.log("Notification was send");
    });
};

export {
    sendNotification,
};
