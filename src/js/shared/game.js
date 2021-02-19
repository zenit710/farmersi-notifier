import { trackEvent } from "./analytics";
import { FARMERSI_URL, NICK_SETTING_KEY, PASSWORD_SETTING_KEY, TO_PLAY_STORAGE_KEY } from "./consts";
import { HtmlResponse } from "./htmlResponse";
import { sendNotification } from "./notifications";
import { request } from "./request";
import { getSettings } from "./settings";
import { getItemFromStorage, setItemInStorage } from "./storage";

const checkGames = async () => {
    trackEvent("check games", "fired");

    let htmlResponse = await fetchHomePage();
    const verifiedLogin = await isLoggedAsUserFromSettings(htmlResponse);

    if (!htmlResponse.isUserLoggedIn() || !verifiedLogin) {
        const loginBody = await getLoginBody();
        htmlResponse = await fetchHomePageWithLogin(loginBody);
    }

    handleGameResponse(htmlResponse);
};

const fetchHomePage = async () => {
    const response = await request(FARMERSI_URL);
    const html = response ? await response.text() : "";
    const htmlResponse = new HtmlResponse();
    htmlResponse.setResponse(html);

    return htmlResponse;
};

const fetchHomePageWithLogin = async (loginBody, options = {}) => {
    const response = await request(FARMERSI_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": loginBody.length,
        },
        credentials: "include",
        body: loginBody,
        ...options,
    });
    const html = response ? await response.text() : "";
    const htmlResponse = new HtmlResponse();
    htmlResponse.setResponse(html);

    return htmlResponse;
};

const handleGameResponse = async htmlResponse => {
    const actionNeedingGames = htmlResponse.getNeedingActionGames();
    let toPlay = await getItemFromStorage(TO_PLAY_STORAGE_KEY) || [];
    const gameCount = actionNeedingGames.length;
    const newGamesToPlay = actionNeedingGames.filter(game => !toPlay.includes(game));

    setItemInStorage(TO_PLAY_STORAGE_KEY, actionNeedingGames);

    if (newGamesToPlay.length) {
        sendNotification(`Gry (${gameCount}) oczekują na podjęcie decyzji!`);
    }
};

const getLoginBody = async ({ user, password } = {}) => {
    const settings = await getSettings();
    const bodyValues = {
        login: user || settings[NICK_SETTING_KEY],
        password: password || settings[PASSWORD_SETTING_KEY],
        logowanie: "zaloguj",
    };
    const formData = new FormData();

    for (let param in bodyValues) {
        formData.append(param, bodyValues[param]);
    }

    return new URLSearchParams(formData).toString();
};

const areCredentialsOk = async (user, password) => {
    let isOk = false;

    if (user && password) {
        const loginBody = await getLoginBody({
            user,
            password,
        });
        const htmlResponse = await fetchHomePageWithLogin(loginBody, {
            credentials: "omit",
        });
        isOk = htmlResponse.isUserLoggedIn();
    }

    return isOk;
};

const isLoggedAsUserFromSettings = async htmlResponse => {
    const settings = await getSettings();

    return settings[NICK_SETTING_KEY] === htmlResponse.getLoggedUserName();
};

export {
    checkGames,
    areCredentialsOk,
};
