import { trackEvent } from "./analytics";
import {
    FARMERSI_URL,
    FARMERSI_LOGOUT_URL,
    NICK_SETTING_KEY,
    PASSWORD_SETTING_KEY,
    TO_PLAY_STORAGE_KEY,
    UNREADED_MESSAGES_STORAGE_KEY,
    TEAM_COMMENTS_GAMES_STORAGE_KEY,
} from "./consts";
import { HtmlResponse } from "./htmlResponse";
import { sendNotification } from "./notifications";
import { request } from "./request";
import { getSettings } from "./settings";
import { getItemFromStorage, setItemInStorage } from "./storage";

const checkGames = async () => {
    trackEvent("check games", "fired");

    let htmlResponse = await fetchHomePage();
    const isUserLogged = htmlResponse.isUserLoggedIn();
    const verifiedLogin = await isLoggedAsUserFromSettings(htmlResponse);
    const shouldLogOut = isUserLogged && !verifiedLogin;
    const shouldLogIn = !isUserLogged || !verifiedLogin;

    if (shouldLogOut) {
        await logout();
    }

    if (shouldLogIn) {
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

const logout = async () => {
    const response = await request(FARMERSI_LOGOUT_URL);

    return !!response;
};

const handleGameResponse = htmlResponse => {
    handleGamesToPlay(htmlResponse);
    handleUnreadedMessages(htmlResponse);
    handleTeamComments(htmlResponse);
};

const handleGamesToPlay = async (htmlResponse) => {
    const actionNeedingGames = htmlResponse.getNeedingActionGames();
    const toPlay = await getItemFromStorage(TO_PLAY_STORAGE_KEY) || [];
    const gameCount = actionNeedingGames.length;
    const newGamesToPlay = actionNeedingGames.filter(game => !toPlay.includes(game));
    setItemInStorage(TO_PLAY_STORAGE_KEY, actionNeedingGames);

    if (newGamesToPlay.length) {
        sendNotification(`Gry (${gameCount}) oczekują na podjęcie decyzji!`);
    }
};

const handleUnreadedMessages = async (htmlResponse) => {
    const storedUnreadedMessageCount = await getItemFromStorage(UNREADED_MESSAGES_STORAGE_KEY) || 0;
    const unreadedMessageCount = htmlResponse.getUnreadedMessageCount();
    setItemInStorage(UNREADED_MESSAGES_STORAGE_KEY, unreadedMessageCount);

    if (unreadedMessageCount > storedUnreadedMessageCount) {
        sendNotification(`Masz ${unreadedMessageCount} nieprzeczytanych wiadomości!`);
    }
};

const handleTeamComments = async (htmlResponse) => {
    const storedGames = await getItemFromStorage(TEAM_COMMENTS_GAMES_STORAGE_KEY) || [];
    const games = htmlResponse.getTeamCommentsGames();
    console.log("storedGames", storedGames);
    console.log("games", games);
    const gamesCount = games.length;
    const newComments = games.filter(game => !storedGames.includes(game));
    setItemInStorage(TEAM_COMMENTS_GAMES_STORAGE_KEY, games);

    if (newComments.length) {
        sendNotification(`W ${gamesCount} grach pojawiły się komentarze druzynowe!`);
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
