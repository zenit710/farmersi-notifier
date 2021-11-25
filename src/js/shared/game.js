import { trackEvent } from "./analytics";
import {
    FARMERSI_NOTIFIER_API_ENDPOINT,
    SETTING_KEY_NICK,
    SETTING_KEY_PASSWORD,
    STORAGE_KEY_TO_PLAY,
    STORAGE_KEY_UNREAD_MESSAGES,
    STORAGE_KEY_TEAM_COMMENTS,
    SETTING_KEY_NOTIFY_GAME,
    SETTING_KEY_NOTIFY_MESSAGE,
    SETTING_KEY_NOTIFY_COMMENT,
} from "./consts";
import { GameNotification } from "./GameNotification";
import { METHOD, request } from "./request";
import { getSettings } from "./settings";
import { getItemFromStorage, setItemInStorage } from "./storage";

const checkGames = async () => {
    trackEvent("check games", "fired");

    const settings = await getSettings();
    const gameData = await fetchNotifierData(settings[SETTING_KEY_NICK], settings[SETTING_KEY_PASSWORD]);

    if (gameData) {
        handleGameResponse(gameData);
    }
};

const fetchNotifierData = async (user, password) => {
    const response = await request(FARMERSI_NOTIFIER_API_ENDPOINT, {
        method: METHOD.POST,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user, password }),
    });

    if (!response) {
        return null;
    }

    const body = await response.json();

    if (body.actual_games === undefined) {
        return null;
    }

    return body;
};

const handleGameResponse = async ({ actual_games, unread_messages }) => {
    const gamesToPlay = await getGamesToPlay(actual_games);
    const unreadMessages = await getUnreadMessages(unread_messages);
    const teamCommentGames = await getTeamCommentGames(actual_games);
    const notificationContent = {
        games: gamesToPlay.newCount ? gamesToPlay.allCount : 0,
        messages: unreadMessages.newCount > 0 ? unreadMessages.allCount : 0,
        comments: teamCommentGames.newCount ? teamCommentGames.allCount : 0,
    };

    sendNotification(notificationContent);

    setItemInStorage(STORAGE_KEY_TO_PLAY, gamesToPlay.list);
    setItemInStorage(STORAGE_KEY_UNREAD_MESSAGES, unreadMessages.list);
    setItemInStorage(STORAGE_KEY_TEAM_COMMENTS, teamCommentGames.list);
};

const getGamesToPlay = async (games) => {
    const actionNeedingGames = games.filter(game => !game.decision_made).map(game => game.name);
    const toPlay = await getItemFromStorage(STORAGE_KEY_TO_PLAY) || [];
    const newGamesToPlay = actionNeedingGames.filter(game => !toPlay.includes(game));

    return {
        newCount: newGamesToPlay.length,
        allCount: actionNeedingGames.length,
        list: actionNeedingGames,
    };
};

const getUnreadMessages = async (messages) => {
    const storedUnreadMessages = await getItemFromStorage(STORAGE_KEY_UNREAD_MESSAGES) || [];
    const newUnread = messages.filter(msg => !storedUnreadMessages.includes(msg));

    return {
        newCount: newUnread.length,
        allCount: messages.length,
        list: messages,
    };
};

const getTeamCommentGames = async (games) => {
    const storedGames = await getItemFromStorage(STORAGE_KEY_TEAM_COMMENTS) || [];
    const teamCommentGames = games.filter(game => game.unread_team_comments).map(game => game.name);
    const newComments = teamCommentGames.filter(game => !storedGames.includes(game));

    return {
        newCount: newComments.length,
        allCount: teamCommentGames.length,
        list: teamCommentGames,
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

const areCredentialsOk = async (user, password) => {
    const gameData = await fetchNotifierData(user, password);

    return !!gameData;
};

export {
    checkGames,
    areCredentialsOk,
};
