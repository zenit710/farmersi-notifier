import { initAnalytics, trackEvent } from "./shared/analytics";
import { TO_PLAY_STORAGE_KEY, FARMERSI_URL, COMPLETE_SETTING_KEY } from "./shared/consts";
import { sendNotification } from "./shared/notifications";
import { getSettings } from "./shared/settings";
import {
    getItemFromStorage,
    setItemInStorage,
} from "./shared/utils";

const CHECK_GAMES_ALARM_NAME = "check-games-alarm";
const INSUFFICIENT_SETTINGS_MESSAGE = "Insufficient settings. Username, password and interval needed.";

const init = async () => {
    initAnalytics();
    const settings = await getSettings();

    if (settings[COMPLETE_SETTING_KEY]) {
        checkGames();
        setCheckGamesAlarm();
    } else {
        console.log(INSUFFICIENT_SETTINGS_MESSAGE);
    }
};

const checkGames = async () => {
    const postData = await getLoginBody();

    trackEvent("check games", "fired");

    fetch(FARMERSI_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": postData.length,
        },
        body: postData,
    }).then(
        res => res.text().then(response => handleResponse(response)),
        err => console.log("fetch error occured", err),
    );
};

const handleResponse = async response => {
    const html = document.createElement("html");
    html.innerHTML = response;

    const games = html.querySelectorAll(".dwa a[href*='user.php?id_gra']");
    const actionNeedingGames = getNeedingActionGames(games);

    let toPlay = await getItemFromStorage(TO_PLAY_STORAGE_KEY) || [];

    const gameCount = actionNeedingGames.length;
    const newGamesToPlay = actionNeedingGames.filter(game => !toPlay.includes(game));

    setItemInStorage(TO_PLAY_STORAGE_KEY, actionNeedingGames);

    if (newGamesToPlay.length) {
        sendNotification(`Gry (${gameCount}) oczekują na podjęcie decyzji!`);
    }
};

const getNeedingActionGames = games => {
    const actionNeedingGames = [];

    games.forEach(game => {
        if (isNeedingActionGame(game)) {
            actionNeedingGames.push(game.textContent);
        }
    });

    return actionNeedingGames;
};

const isNeedingActionGame = game => game.nextElementSibling
    && game.nextElementSibling.nextElementSibling
    && game.nextElementSibling.nextElementSibling.textContent === "podejmij decyzje";

const getLoginBody = async () => {
    const settings = await getSettings();
    const bodyValues = {
        login: settings.user,
        password: settings.password,
        logowanie: "zaloguj",
    };
    const formData = new FormData();

    for (let param in bodyValues) {
        formData.append(param, bodyValues[param]);
    }

    return new URLSearchParams(formData).toString();
};

const setCheckGamesAlarm = async () => {
    const settings = await getSettings();

    chrome.alarms.create(CHECK_GAMES_ALARM_NAME, {
        delayInMinutes: settings.interval,
        periodInMinutes: settings.interval,
    });
};

chrome.runtime.onInstalled.addListener(async () => {
    trackEvent("extension-installed");
    const settings = await getSettings();

    if (!settings[COMPLETE_SETTING_KEY]) {
        trackEvent("extension-installed-no-settings-available");
        chrome.runtime.openOptionsPage();
    }
});

chrome.alarms.onAlarm.addListener(async alarm => {
    if (alarm.name === CHECK_GAMES_ALARM_NAME) {
        const settings = await getSettings();

        if (settings[COMPLETE_SETTING_KEY]) {
            checkGames(settings.user, settings.password);
        } else {
            console.log(INSUFFICIENT_SETTINGS_MESSAGE);
        }
    }
});

chrome.notifications.onClicked.addListener(() => {
    trackEvent("notification-click");
    chrome.tabs.create({url: FARMERSI_URL});
});

init();
