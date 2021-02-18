import { initAnalytics, trackEvent } from "./shared/analytics";
import { checkGames } from "./shared/game";
import { FARMERSI_URL, COMPLETE_SETTING_KEY, INTERVAL_SETTING_KEY, RESTART_MESSAGE_PROPERTY } from "./shared/consts";
import { getSettings, clearSettingsCache } from "./shared/settings";

const CHECK_GAMES_ALARM_NAME = "check-games-alarm";
const INSUFFICIENT_SETTINGS_MESSAGE = "Insufficient settings. Username, password and interval needed.";

const init = async () => {
    const settings = await getSettings();

    if (settings[COMPLETE_SETTING_KEY]) {
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
        delayInMinutes: settings[INTERVAL_SETTING_KEY],
        periodInMinutes: settings[INTERVAL_SETTING_KEY],
    });
};

const removeCheckGamesAlarm = () => {
    chrome.alarms.clear(CHECK_GAMES_ALARM_NAME);
};

chrome.runtime.onInstalled.addListener(async () => {
    trackEvent("extension-installed");
    const settings = await getSettings();

    if (!settings[COMPLETE_SETTING_KEY]) {
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

        if (settings[COMPLETE_SETTING_KEY]) {
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
