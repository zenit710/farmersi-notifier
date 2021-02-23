import { trackEvent } from "./analytics";
import {
    FARMERSI_URL,
    FARMERSI_LOGOUT_URL,
    SETTING_KEY_NICK,
    SETTING_KEY_PASSWORD,
    STORAGE_KEY_TO_PLAY,
    STORAGE_KEY_UNREADED_MESSAGES,
    STORAGE_KEY_TEAM_COMMENTS,
    SETTING_KEY_NOTIFY_GAME,
    SETTING_KEY_NOTIFY_MESSAGE,
    SETTING_KEY_NOTIFY_COMMENT,
} from "./consts";
import { HtmlResponse } from "./htmlResponse";
import { GameNotification } from "./GameNotification";
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

const handleGameResponse = async htmlResponse => {
    const gamesToPlay = await getGamesToPlay(htmlResponse);
    const unreadedMessages = await getUnreadedMessages(htmlResponse);
    const teamCommentGames = await getTeamCommentGames(htmlResponse);
    const notificationContent = {
        games: gamesToPlay.newCount ? gamesToPlay.allCount : 0,
        messages: unreadedMessages.newCount > 0 ? unreadedMessages.allCount : 0,
        comments: teamCommentGames.newCount ? teamCommentGames.allCount : 0,
    };

    sendNotification(notificationContent);

    setItemInStorage(STORAGE_KEY_TO_PLAY, gamesToPlay.list);
    setItemInStorage(STORAGE_KEY_UNREADED_MESSAGES, unreadedMessages.allCount);
    setItemInStorage(STORAGE_KEY_TEAM_COMMENTS, teamCommentGames.list);
};

const getGamesToPlay = async (htmlResponse) => {
    const actionNeedingGames = htmlResponse.getNeedingActionGames();
    const toPlay = await getItemFromStorage(STORAGE_KEY_TO_PLAY) || [];
    const gameCount = actionNeedingGames.length;
    const newGamesToPlay = actionNeedingGames.filter(game => !toPlay.includes(game));

    return {
        newCount: newGamesToPlay.length,
        allCount: gameCount,
        list: actionNeedingGames,
    };
};

const getUnreadedMessages = async (htmlResponse) => {
    const storedUnreadedMessageCount = await getItemFromStorage(STORAGE_KEY_UNREADED_MESSAGES) || 0;
    const unreadedMessageCount = htmlResponse.getUnreadedMessageCount();

    return {
        newCount: unreadedMessageCount - storedUnreadedMessageCount,
        allCount: unreadedMessageCount,
    };
};

const getTeamCommentGames = async (htmlResponse) => {
    const storedGames = await getItemFromStorage(STORAGE_KEY_TEAM_COMMENTS) || [];
    const games = htmlResponse.getTeamCommentsGames();
    const gamesCount = games.length;
    const newComments = games.filter(game => !storedGames.includes(game));

    return {
        newCount: newComments.length,
        allCount: gamesCount,
        list: games,
    };
};

const sendNotification = async (content = {}) => {
    const settings = await getSettings();
    const notification = new GameNotification();

    notification.setGamesCount(settings[SETTING_KEY_NOTIFY_GAME] ? content.games : 0);
    notification.setMessageCount(settings[SETTING_KEY_NOTIFY_MESSAGE] ? content.messages : 0);
    notification.setTeamCommentGamesCount(settings[SETTING_KEY_NOTIFY_COMMENT] ? content.comments : 0);

    if (notification.hasContentToSend()) {
        notification.send();
    }
};

const getLoginBody = async ({ user, password } = {}) => {
    const settings = await getSettings();
    const bodyValues = {
        login: user || settings[SETTING_KEY_NICK],
        password: password || settings[SETTING_KEY_PASSWORD],
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

    return settings[SETTING_KEY_NICK] === htmlResponse.getLoggedUserName();
};

export {
    checkGames,
    areCredentialsOk,
};
