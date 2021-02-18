import { initAnalytics, trackEvent } from "./shared/analytics";
import { SETTINGS_STORAGE_KEY, NICK_SETTING_KEY, INTERVAL_SETTING_KEY } from "./shared/consts";
import { getSettings } from "./shared/settings";
import { setItemInStorage } from "./shared/storage";
import "../scss/options-page.scss";

const USERNAME_FIELD_ID = "nick";
const INTERVAL_FIELD_ID = "interval";
const FORM_SELECTOR = ".options-form";
const SUCCESS_SELECTOR = ".success";
const SUCCESS_CLASS_NAME = "success--show";

const DEFAULT_INTERVAL = 10;

const applyUserSettings = async () => {
    const storedSettings = await getSettings();
    const settings = {
        [NICK_SETTING_KEY]: "",
        [INTERVAL_SETTING_KEY]: DEFAULT_INTERVAL,
    };

    if (storedSettings) {
        try {
            settings[NICK_SETTING_KEY] = storedSettings[NICK_SETTING_KEY];
            settings[INTERVAL_SETTING_KEY] = storedSettings[INTERVAL_SETTING_KEY];
        } catch (e) {
            console.error("Settings could not be get from store", e);
        }
    }

    document.getElementById(USERNAME_FIELD_ID).value = settings[NICK_SETTING_KEY];
    document.getElementById(INTERVAL_FIELD_ID).value = settings[INTERVAL_SETTING_KEY];
};

const saveUserSettings = async settings => {
    const saved = await setItemInStorage(SETTINGS_STORAGE_KEY, settings);

    if (saved) {
        trackEvent("user-settings-set", "set");
        document.querySelector(SUCCESS_SELECTOR).classList.add(SUCCESS_CLASS_NAME);
        chrome.runtime.reload();
    }
};

const handleFormInput = () => {
    document.querySelector(FORM_SELECTOR).addEventListener("submit", event => {
        event.preventDefault();

        const settings = [...event.target.querySelectorAll("input")]
            .filter(input => input.type !== "submit")
            .map(input => ({
                key: input.name,
                value: input.value,
            }));

        saveUserSettings(settings);
    });
};

initAnalytics();
applyUserSettings();
handleFormInput();
