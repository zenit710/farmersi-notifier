import { initAnalytics, trackEvent } from "./shared/analytics";
import {
    SETTINGS_STORAGE_KEY,
    TO_PLAY_STORAGE_KEY,
    NICK_SETTING_KEY,
    PASSWORD_SETTING_KEY,
    FARMERSI_URL,
} from "./shared/consts";
import { getItemFromStorage, getSettingByKey } from "./shared/utils";
import "../scss/popup-page.scss";

const ACTION_REQUIRED_SELECTOR = ".action-required";
const NO_SETTINGS_SELECTOR = ".no-settings";
const GAME_COUNT_SELECTOR = ".game-count";
const SETTINGS_PAGE_SELECTOR = ".settings-page-link";
const FARMERSI_LINK_SELECTOR = ".farmersi-link";

const ACTION_REQUIRED_SHOW_CLASS_NAME = "action-required--show";
const NO_SETTINGS_SHOW_CLASS_NAME = "no-settings--show";

const init = async () => {
    const settings = await getItemFromStorage(SETTINGS_STORAGE_KEY);
    const toPlay = await getItemFromStorage(TO_PLAY_STORAGE_KEY);
    const username = getSettingByKey(settings, NICK_SETTING_KEY);
    const password = getSettingByKey(settings, PASSWORD_SETTING_KEY);

    if (username && password) {
        const gamesCount = Array.isArray(toPlay) ? toPlay.length : 0;
        document.querySelector(GAME_COUNT_SELECTOR).innerHTML = gamesCount;
        document.querySelector(ACTION_REQUIRED_SELECTOR).classList.add(ACTION_REQUIRED_SHOW_CLASS_NAME);
    } else {
        document.querySelector(NO_SETTINGS_SELECTOR).classList.add(NO_SETTINGS_SHOW_CLASS_NAME);
    }

    document.querySelector(SETTINGS_PAGE_SELECTOR).addEventListener("click", event => {
        event.preventDefault();
        trackEvent("go-to-settings-click");
        chrome.runtime.openOptionsPage();
    });

    document.querySelector(FARMERSI_LINK_SELECTOR).addEventListener("click", event => {
        event.preventDefault();
        trackEvent("go-to-farmersi-click");
        chrome.tabs.create({url: FARMERSI_URL});
    });
};

initAnalytics();
init();
