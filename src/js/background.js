import { initAnalytics, trackEvent } from "./shared/analytics";
import {
    SETTINGS_STORAGE_KEY,
    TO_PLAY_STORAGE_KEY,
    NICK_SETTING_KEY,
    PASSWORD_SETTING_KEY,
    INTERVAL_SETTING_KEY,
    FARMERSI_URL,
} from "./shared/consts";
import {
    getItemFromStorage,
    setItemInStorage,
    getSettingByKey,
    sendNotification,
} from "./shared/utils";

const init = async () => {
    initAnalytics();
    const settings = await getItemFromStorage(SETTINGS_STORAGE_KEY);

    if (settings) {
        const user = getSettingByKey(settings, NICK_SETTING_KEY);
        const password = getSettingByKey(settings, PASSWORD_SETTING_KEY);
        const interval = parseInt(getSettingByKey(settings, INTERVAL_SETTING_KEY)) * 60 * 1000;

        if (user && password && interval) {
            handleNotificationClick();
            checkGames(user, password);
            setInterval(() => {
                checkGames(user, password);
            }, interval);
        } else {
            console.log("Insufficient settings. Username, password and interval needed.");
        }
    } else {
        console.log("There is nothing we can do. No user settings available.");
    }
};

const checkGames = (user, password) => {
    const postData = getLoginBody(user, password);

    trackEvent("check games", "fired");

    fetch(FARMERSI_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": postData.length,
        },
        body: postData,
    }).then(res => res.text()).then(async response => {
        const html = document.createElement("html");
        html.innerHTML = response;

        const games = html.querySelectorAll(".dwa a[href*='user.php?id_gra']");
        const actionNeededGames = [];

        if (games) {
            games.forEach(game => {
                if (
                    game.nextElementSibling
                && game.nextElementSibling.nextElementSibling
                && game.nextElementSibling.nextElementSibling.textContent === "podejmij decyzje"
                ) {
                    actionNeededGames.push(game.textContent);
                }
            });
        }

        let toPlay = await getItemFromStorage(TO_PLAY_STORAGE_KEY) || [];

        const gameCount = actionNeededGames.length;
        const newGamesToPlay = actionNeededGames.filter(game => !toPlay.includes(game));

        setItemInStorage(TO_PLAY_STORAGE_KEY, actionNeededGames);

        if (newGamesToPlay.length) {
            sendNotification(`Gry (${gameCount}) oczekują na podjęcie decyzji!`);
        }
    });
};

const getLoginBody = (user, password) => {
    const bodyValues = {
        login: user,
        password: password,
        logowanie: "zaloguj",
    };
    const formData = new FormData();

    for (let param in bodyValues) {
        formData.append(param, bodyValues[param]);
    }

    return new URLSearchParams(formData).toString();
};

const handleNotificationClick = () => {
    chrome.notifications.onClicked.addListener(() => {
        trackEvent("notification-click");
        chrome.tabs.create({url: FARMERSI_URL});
    });
};

chrome.runtime.onInstalled.addListener(() => {
    trackEvent("extension-installed");
    chrome.runtime.openOptionsPage();
});

init();
