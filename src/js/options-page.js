import { initAnalytics, trackEvent } from "./shared/analytics";
import {
    SETTINGS_STORAGE_KEY,
    NICK_SETTING_KEY,
    INTERVAL_SETTING_KEY,
    RESTART_MESSAGE_PROPERTY,
    PASSWORD_SETTING_KEY,
} from "./shared/consts";
import { areCredentialsOk } from "./shared/game";
import { getSettings, getSettingByKey } from "./shared/settings";
import { setItemInStorage } from "./shared/storage";
import "../scss/options-page.scss";

const USERNAME_FIELD_ID = "nick";
const INTERVAL_FIELD_ID = "interval";
const FORM_SELECTOR = ".options-form";
const STATUS_SELECTOR = ".status";
const SUCCESS_MESSAGE = "Ustawienia zostały zapisane!";
const INVALID_CREDENTIALS_MESSAGE = "Nieprawidłowe dane logowania";
const SUCCESS_CLASS_NAME = "status--success";
const FAILURE_CLASS_NAME = "status--failure";

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
        displayStatus(true);
        restartExtension();
    }
};

const handleFormInput = () => {
    document.querySelector(FORM_SELECTOR).addEventListener("submit", async event => {
        event.preventDefault();

        const settings = [...event.target.querySelectorAll("input")]
            .filter(input => input.type !== "submit")
            .map(input => ({
                key: input.name,
                value: input.value,
            }));

        const user = getSettingByKey(settings, NICK_SETTING_KEY);
        const password = getSettingByKey(settings, PASSWORD_SETTING_KEY);
        const credentialsOk = await areCredentialsOk(user, password);

        if (credentialsOk) {
            saveUserSettings(settings);
        } else {
            displayStatus(false);
        }
    });
};

const displayStatus = (success = false) => {
    const $status = document.querySelector(STATUS_SELECTOR);
    $status.classList.remove(SUCCESS_CLASS_NAME, FAILURE_CLASS_NAME);
    $status.classList.add(success ? SUCCESS_CLASS_NAME : FAILURE_CLASS_NAME);
    $status.innerHTML = success ? SUCCESS_MESSAGE : INVALID_CREDENTIALS_MESSAGE;
};

const restartExtension = () => {
    chrome.runtime.sendMessage({[RESTART_MESSAGE_PROPERTY]: true});
};

initAnalytics();
applyUserSettings();
handleFormInput();
