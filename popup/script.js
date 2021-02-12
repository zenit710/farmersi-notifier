const SETTINGS_STORAGE_KEY = 'settings';
const TO_PLAY_STORAGE_KEY = 'toPlay';

const NICK_SETTING_KEY = 'nick';
const PASSWORD_SETTING_KEY = 'password';

const ACTION_REQUIRED_SELECTOR = '.action-required';
const NO_SETTINGS_SELECTOR = '.no-settings';
const GAME_COUNT_SELECTOR = '.game-count';
const SETTINGS_PAGE_SELECTOR = '.settings-page-link';

const ACTION_REQUIRED_SHOW_CLASS_NAME = 'action-required--show';
const NO_SETTINGS_SHOW_CLASS_NAME = 'no-settings--show';

chrome.storage.sync.get([SETTINGS_STORAGE_KEY, TO_PLAY_STORAGE_KEY], storage => {
    const settings = storage[SETTINGS_STORAGE_KEY];
    const toPlay = storage[TO_PLAY_STORAGE_KEY];
    const username = getSettingByKey(settings, NICK_SETTING_KEY);
    const password = getSettingByKey(settings, PASSWORD_SETTING_KEY);

    if (username && password) {
        const gamesCount = Array.isArray(toPlay) ? toPlay.length : 0;
        document.querySelector(GAME_COUNT_SELECTOR).innerHTML = gamesCount;
        document.querySelector(ACTION_REQUIRED_SELECTOR).classList.add(ACTION_REQUIRED_SHOW_CLASS_NAME);
    } else {
        document.querySelector(NO_SETTINGS_SELECTOR).classList.add(NO_SETTINGS_SHOW_CLASS_NAME);
    }
});

const getSettingByKey = (settings, key) => {
    let value = null;

    try {
        value = settings.find(item => item.key === key).value;
    } catch (e) {
        console.error(`Setting ${key} could not be read from settings`, e);
    }

    return value;
};

document.querySelector(SETTINGS_PAGE_SELECTOR).addEventListener('click', event => {
    event.preventDefault();
    chrome.runtime.openOptionsPage();
});
