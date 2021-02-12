const SETTINGS_STORAGE_KEY = 'settings';
const NICK_SETTING_KEY = 'nick';
const INTERVAL_SETTING_KEY = 'interval';

const USERNAME_FIELD_ID = 'nick';
const INTERVAL_FIELD_ID = 'interval';
const FORM_SELECTOR = '.options-form';
const SUCCESS_SELECTOR = '.success';
const SUCCESS_CLASS_NAME = 'success--show';

const DEFAULT_INTERVAL = 10;

const applyUserSettings = () => {
    chrome.storage.sync.get(SETTINGS_STORAGE_KEY, result => {
        const storedSettings = result[SETTINGS_STORAGE_KEY];
        const settings = {
            [NICK_SETTING_KEY]: '',
            [INTERVAL_SETTING_KEY]: 10,
        };

        if (storedSettings) {
            try {
                settings[NICK_SETTING_KEY] = storedSettings.find(item => item.key === NICK_SETTING_KEY).value;
                settings[INTERVAL_SETTING_KEY] = storedSettings.find(item => item.key === INTERVAL_SETTING_KEY).value;
            } catch (e) {
                console.error('Settings could not be get from store', e);
            }
        }

        document.getElementById(USERNAME_FIELD_ID).value = settings[NICK_SETTING_KEY];
        document.getElementById(INTERVAL_FIELD_ID).value = settings[INTERVAL_SETTING_KEY];
    });
};

const saveUserSettings = settings => {
    chrome.storage.sync.set({
        [SETTINGS_STORAGE_KEY]: settings
    }, result => {
        console.log('Settings saved');
        document.querySelector(SUCCESS_SELECTOR).classList.add(SUCCESS_CLASS_NAME);
        chrome.runtime.reload();
    });
};

const handleFormInput = () => {
    document.querySelector(FORM_SELECTOR).addEventListener('submit', event => {
        event.preventDefault();

        const settings = [...event.target.querySelectorAll('input')]
            .filter(input => input.type !== 'submit')
            .map(input => ({
                key: input.name,
                value: input.value,
            }));

        saveUserSettings(settings);
    });
};

applyUserSettings();
handleFormInput();
