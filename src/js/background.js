import { initAnalytics, trackEvent } from "./shared/analytics";
import { checkGames } from "./shared/game";
import { FARMERSI_URL, SETTING_KEY_COMPLETE, SETTING_KEY_INTERVAL, RESTART_MESSAGE_PROPERTY } from "./shared/consts";
import { getSettings, clearSettingsCache } from "./shared/settings";

const CHECK_GAMES_ALARM_NAME = "check-games-alarm";
const INSUFFICIENT_SETTINGS_MESSAGE = "Insufficient settings. Username, password and interval needed.";

const init = async () => {
    const settings = await getSettings();

    if (settings[SETTING_KEY_COMPLETE]) {
        checkGames();
        setCheckGamesAlarm();
    } else {
        console.log(INSUFFICIENT_SETTINGS_MESSAGE);
    }
};

const clean = () => {
    clearSettingsCache();
    removeCheckGamesAlarm();
};

const setCheckGamesAlarm = async () => {
    const settings = await getSettings();

    chrome.alarms.create(CHECK_GAMES_ALARM_NAME, {
        delayInMinutes: settings[SETTING_KEY_INTERVAL],
        periodInMinutes: settings[SETTING_KEY_INTERVAL],
    });
};

const removeCheckGamesAlarm = () => {
    chrome.alarms.clear(CHECK_GAMES_ALARM_NAME);
};

chrome.runtime.onInstalled.addListener(async () => {
    trackEvent("extension-installed");
    const settings = await getSettings();

    if (!settings[SETTING_KEY_COMPLETE]) {
        trackEvent("extension-installed-no-settings-available");
        chrome.runtime.openOptionsPage();
    }
});

chrome.runtime.onMessage.addListener(message => {
    if (message[RESTART_MESSAGE_PROPERTY]) {
        clean();
        init();
    }
});

chrome.alarms.onAlarm.addListener(async alarm => {
    if (alarm.name === CHECK_GAMES_ALARM_NAME) {
        const settings = await getSettings();

        if (settings[SETTING_KEY_COMPLETE]) {
            checkGames();
        } else {
            console.log(INSUFFICIENT_SETTINGS_MESSAGE);
        }
    }
});

chrome.notifications.onClicked.addListener(() => {
    trackEvent("notification-click");
    chrome.tabs.create({url: FARMERSI_URL});
});

initAnalytics();
init();
