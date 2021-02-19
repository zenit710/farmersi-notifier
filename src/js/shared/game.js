import { trackEvent } from "./analytics";
import { FARMERSI_URL, NICK_SETTING_KEY, PASSWORD_SETTING_KEY, TO_PLAY_STORAGE_KEY } from "./consts";
import { sendNotification } from "./notifications";
import { request } from "./request";
import { getSettings } from "./settings";
import { getItemFromStorage, setItemInStorage } from "./storage";

const checkGames = async () => {
    trackEvent("check games", "fired");

    let  response = await fetchHomePage();

    if (!isUserLoggedIn(response)) {
        const loginBody = await getLoginBody();
        response = await fetchHomePageWithLogin(loginBody);
    }

    handleGameResponse(response);
};

const fetchHomePage = () => request(FARMERSI_URL);

const fetchHomePageWithLogin = (loginBody) => request(FARMERSI_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": loginBody.length,
    },
    credentials: "omit",
    body: loginBody,
});

const handleGameResponse = async response => {
    const html = document.createElement("html");
    html.innerHTML = response;

    const games = html.querySelectorAll(".dwa a[href*='user.php?id_gra']");
    const actionNeedingGames = getNeedingActionGames(games);

    let toPlay = await getItemFromStorage(TO_PLAY_STORAGE_KEY) || [];

    const gameCount = actionNeedingGames.length;
    const newGamesToPlay = actionNeedingGames.filter(game => !toPlay.includes(game));

    setItemInStorage(TO_PLAY_STORAGE_KEY, actionNeedingGames);

    if (newGamesToPlay.length) {
        sendNotification(`Gry (${gameCount}) oczekują na podjęcie decyzji!`);
    }
};

const getNeedingActionGames = games => {
    const actionNeedingGames = [];

    games.forEach(game => {
        if (isNeedingActionGame(game)) {
            actionNeedingGames.push(game.textContent);
        }
    });

    return actionNeedingGames;
};

const isNeedingActionGame = game => game.nextElementSibling
    && game.nextElementSibling.nextElementSibling
    && game.nextElementSibling.nextElementSibling.textContent === "podejmij decyzje";

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
        const response = await fetchHomePageWithLogin(loginBody);
        isOk = isUserLoggedIn(response);
    }

    return isOk;
};

const isUserLoggedIn = response => {
    const html = document.createElement("html");
    html.innerHTML = response;

    return !!html.querySelector("a[href*='?logout=1'");
};

export {
    checkGames,
    areCredentialsOk,
};
