import {
    SETTINGS_STORAGE_KEY,
    NICK_SETTING_KEY,
    PASSWORD_SETTING_KEY,
    INTERVAL_SETTING_KEY,
    COMPLETE_SETTING_KEY,
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
        [COMPLETE_SETTING_KEY]: false,
    };
    const storedSettings = await getItemFromStorage(SETTINGS_STORAGE_KEY);

    if (storedSettings) {
        settings[NICK_SETTING_KEY] = getSettingByKey(storedSettings, NICK_SETTING_KEY);
        settings[PASSWORD_SETTING_KEY] = getSettingByKey(storedSettings, PASSWORD_SETTING_KEY);
        settings[INTERVAL_SETTING_KEY] = parseInt(getSettingByKey(storedSettings, INTERVAL_SETTING_KEY));
        settings[COMPLETE_SETTING_KEY] = settings[NICK_SETTING_KEY]
            && settings[PASSWORD_SETTING_KEY]
            && settings[INTERVAL_SETTING_KEY];
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
    clearSettingsCache,
};
