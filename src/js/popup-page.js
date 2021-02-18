import { initAnalytics, trackEvent } from "./shared/analytics";
import { TO_PLAY_STORAGE_KEY, FARMERSI_URL, COMPLETE_SETTING_KEY } from "./shared/consts";
import { getSettings } from "./shared/settings";
import { getItemFromStorage } from "./shared/storage";
import "../scss/popup-page.scss";

const ACTION_REQUIRED_SELECTOR = ".action-required";
const NO_SETTINGS_SELECTOR = ".no-settings";
const GAME_COUNT_SELECTOR = ".game-count";
const SETTINGS_PAGE_SELECTOR = ".settings-page-link";
const FARMERSI_LINK_SELECTOR = ".farmersi-link";

const ACTION_REQUIRED_SHOW_CLASS_NAME = "action-required--show";
const NO_SETTINGS_SHOW_CLASS_NAME = "no-settings--show";

const init = async () => {
    const settings = await getSettings();
    const toPlay = await getItemFromStorage(TO_PLAY_STORAGE_KEY);

    if (settings[COMPLETE_SETTING_KEY]) {
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
