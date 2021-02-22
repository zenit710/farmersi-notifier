import { initAnalytics, trackEvent } from "./shared/analytics";
import {
    STORAGE_KEY_SETTINGS,
    SETTING_KEY_NICK,
    SETTING_KEY_INTERVAL,
    RESTART_MESSAGE_PROPERTY,
    SETTING_KEY_PASSWORD,
    SETTING_KEY_NOTIFY_GAME,
    SETTING_KEY_NOTIFY_MESSAGE,
    SETTING_KEY_NOTIFY_COMMENT,
} from "./shared/consts";
import { areCredentialsOk } from "./shared/game";
import { getSettings, getSettingByKey } from "./shared/settings";
import { setItemInStorage } from "./shared/storage";
import "../scss/options-page.scss";

const FIELD_ID_USERNAME = "nick";
const FIELD_ID_INTERVAL = "interval";
const FIELD_ID_NOTIFY_GAME = "notify-game";
const FIELD_ID_NOTIFY_MESSAGE = "notify-message";
const FIELD_ID_NOTIFY_COMMENT = "notify-comment";
const FORM_SELECTOR = ".options-form";
const STATUS_SELECTOR = ".status";
const SUCCESS_MESSAGE = "Ustawienia zostały zapisane!";
const INVALID_CREDENTIALS_MESSAGE = "Nieprawidłowe dane logowania";
const SUCCESS_CLASS_NAME = "status--success";
const FAILURE_CLASS_NAME = "status--failure";
const STATUS = {
    SUCCESS: "success",
    FAILURE: "failure",
};
const DEFAULT_INTERVAL = 10;

const applyUserSettings = async () => {
    const storedSettings = await getSettings();
    const settings = {
        [SETTING_KEY_NICK]: storedSettings[SETTING_KEY_NICK] || "",
        [SETTING_KEY_INTERVAL]: storedSettings[SETTING_KEY_INTERVAL] || DEFAULT_INTERVAL,
        [SETTING_KEY_NOTIFY_GAME]: getBooleanWithDefault(storedSettings[SETTING_KEY_NOTIFY_GAME], true),
        [SETTING_KEY_NOTIFY_MESSAGE]: getBooleanWithDefault(storedSettings[SETTING_KEY_NOTIFY_MESSAGE], true),
        [SETTING_KEY_NOTIFY_COMMENT]: getBooleanWithDefault(storedSettings[SETTING_KEY_NOTIFY_COMMENT], true),
    };

    setFieldValue(FIELD_ID_USERNAME, settings[SETTING_KEY_NICK]);
    setFieldValue(FIELD_ID_INTERVAL, settings[SETTING_KEY_INTERVAL]);
    setFieldValue(FIELD_ID_NOTIFY_GAME, settings[SETTING_KEY_NOTIFY_GAME]);
    setFieldValue(FIELD_ID_NOTIFY_MESSAGE, settings[SETTING_KEY_NOTIFY_MESSAGE]);
    setFieldValue(FIELD_ID_NOTIFY_COMMENT, settings[SETTING_KEY_NOTIFY_COMMENT]);
};

const getBooleanWithDefault = (value, defaultValue) => {
    return value === undefined ? defaultValue : value;
};

const setFieldValue = (field, value) => {
    const $field = document.getElementById(field);
    const property = $field.type === "checkbox" ? "checked" : "value";
    $field[property] = value;
};

const saveUserSettings = async settings => {
    const saved = await setItemInStorage(STORAGE_KEY_SETTINGS, settings);

    if (saved) {
        trackEvent("user-settings-set", "set");
        displayStatus(STATUS.SUCCESS);
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
                value: input.type === "checkbox" ? input.checked : input.value,
            }));

        const user = getSettingByKey(settings, SETTING_KEY_NICK);
        const password = getSettingByKey(settings, SETTING_KEY_PASSWORD);
        const credentialsOk = await areCredentialsOk(user, password);

        if (credentialsOk) {
            saveUserSettings(settings);
        } else {
            displayStatus(STATUS.FAILURE);
        }
    });
};

const displayStatus = (status) => {
    const success = STATUS.SUCCESS === status;
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
