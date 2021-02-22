import {
    STORAGE_KEY_SETTINGS,
    SETTING_KEY_NICK,
    SETTING_KEY_PASSWORD,
    SETTING_KEY_INTERVAL,
    SETTING_KEY_COMPLETE,
    SETTING_KEY_NOTIFY_GAME,
    SETTING_KEY_NOTIFY_MESSAGE,
    SETTING_KEY_NOTIFY_COMMENT,
} from "./consts";
import { getItemFromStorage } from "./storage";

let settingsCached;

const getSettingByKey = (settings, key) => {
    let value = null;

    try {
        value = settings.find(item => item.key === key).value;
    } catch (e) {
        console.error(`Setting ${key} could not be read from settings`, e);
    }

    return value;
};

const getSettingsFromStorage = async() => {
    const settings = {
        [SETTING_KEY_COMPLETE]: false,
    };
    const storedSettings = await getItemFromStorage(STORAGE_KEY_SETTINGS);

    if (storedSettings) {
        settings[SETTING_KEY_NICK] = getSettingByKey(storedSettings, SETTING_KEY_NICK);
        settings[SETTING_KEY_PASSWORD] = getSettingByKey(storedSettings, SETTING_KEY_PASSWORD);
        settings[SETTING_KEY_INTERVAL] = parseInt(getSettingByKey(storedSettings, SETTING_KEY_INTERVAL));
        settings[SETTING_KEY_NOTIFY_GAME] = getSettingByKey(storedSettings, SETTING_KEY_NOTIFY_GAME);
        settings[SETTING_KEY_NOTIFY_MESSAGE] = getSettingByKey(storedSettings, SETTING_KEY_NOTIFY_MESSAGE);
        settings[SETTING_KEY_NOTIFY_COMMENT] = getSettingByKey(storedSettings, SETTING_KEY_NOTIFY_COMMENT);
        settings[SETTING_KEY_COMPLETE] = settings[SETTING_KEY_NICK]
            && settings[SETTING_KEY_PASSWORD]
            && settings[SETTING_KEY_INTERVAL];
    }

    return settings;
};

const getSettings = async () => {
    if (!settingsCached) {
        settingsCached = await getSettingsFromStorage();
    }

    return settingsCached;
};

const clearSettingsCache = () => {
    settingsCached = null;
};

export {
    getSettings,
    getSettingByKey,
    clearSettingsCache,
};
