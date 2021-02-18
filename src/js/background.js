import { initAnalytics, trackEvent } from "./shared/analytics";
import { checkGames } from "./shared/game";
import { FARMERSI_URL, COMPLETE_SETTING_KEY } from "./shared/consts";
import { getSettings } from "./shared/settings";

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
