import { initAnalytics, trackEvent } from "./shared/analytics";
import {
    STORAGE_KEY_TO_PLAY,
    FARMERSI_URL,
    SETTING_KEY_COMPLETE,
    STORAGE_KEY_UNREADED_MESSAGES,
    STORAGE_KEY_TEAM_COMMENTS,
} from "./shared/consts";
import { getSettings } from "./shared/settings";
import { getItemFromStorage } from "./shared/storage";
import "../scss/popup-page.scss";

const ACTION_REQUIRED_SELECTOR = ".action-required";
const NO_SETTINGS_SELECTOR = ".no-settings";
const GAME_COUNT_SELECTOR = ".game-count";
const MESSAGE_COUNT_SELECTOR = ".message-count";
const COMMENT_COUNT_SELECTOR = ".comment-count";
const SETTINGS_PAGE_SELECTOR = ".settings-page-link";
const FARMERSI_LINK_SELECTOR = ".farmersi-link";

const ACTION_REQUIRED_SHOW_CLASS_NAME = "action-required--show";
const NO_SETTINGS_SHOW_CLASS_NAME = "no-settings--show";

const init = async () => {
    const settings = await getSettings();

    if (settings[SETTING_KEY_COMPLETE]) {
        showGameStatus();
    } else {
        showConfigAlert();
    }

    attachListeners();
};

const showGameStatus = async () => {
    const toPlay = await getItemFromStorage(STORAGE_KEY_TO_PLAY);
    const unreadedMessages = await getItemFromStorage(STORAGE_KEY_UNREADED_MESSAGES);
    const teamComments = await getItemFromStorage(STORAGE_KEY_TEAM_COMMENTS);
    const gamesCount = toPlay?.length || 0;
    const messagesCount = unreadedMessages || 0;
    const commentsCount = teamComments?.length || 0;

    document.querySelector(GAME_COUNT_SELECTOR).innerHTML = gamesCount;
    document.querySelector(MESSAGE_COUNT_SELECTOR).innerHTML = messagesCount;
    document.querySelector(COMMENT_COUNT_SELECTOR).innerHTML = commentsCount;
    document.querySelector(ACTION_REQUIRED_SELECTOR).classList.add(ACTION_REQUIRED_SHOW_CLASS_NAME);
};

const showConfigAlert = () => {
    document.querySelector(NO_SETTINGS_SELECTOR).classList.add(NO_SETTINGS_SHOW_CLASS_NAME);
};

const attachListeners = () => {
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
