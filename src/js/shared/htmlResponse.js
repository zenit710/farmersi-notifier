const GAME_SELECTOR = ".dwa a[href*='user.php?id_gra']";
const LOGOUT_SELECTOR = "a[href*='?logout=1']";
const USERNAME_SELECTOR = "a[href*='user_info.php'] span";
const TO_PLAY_TEXT = "podejmij decyzje";

class HtmlResponse {
    constructor() {
        this.response = null;
        this.$html = document.createElement("html");
    }

    setResponse(response) {
        this.response = response;
        this.$html.innerHTML = response;
    }

    getGameElements() {
        return this.$html.querySelectorAll(GAME_SELECTOR);
    }

    getNeedingActionGames() {
        const actionNeedingGames = [];

        this.getGameElements().forEach($game => {
            if (this.isNeedingActionGame($game)) {
                actionNeedingGames.push($game.textContent);
            }
        });

        return actionNeedingGames;
    }

    getLoggedUserName() {
        let username = "";
        const logoutElement = this.$html.querySelector(LOGOUT_SELECTOR);

        if (logoutElement) {
            const nameElement = logoutElement.parentElement.querySelector(USERNAME_SELECTOR);

            if (nameElement) {
                username = nameElement.innerHTML;
            }
        }

        return username;
    }

    isNeedingActionGame($game) {
        let toPlay = false;
        let $element = $game;
        let doNextStep = true;

        while (doNextStep) {
            $element = $element.nextElementSibling;

            if ($element?.textContent === TO_PLAY_TEXT) {
                toPlay = true;
                doNextStep = false;
            }

            if (!$element || $element?.tagName.toLowerCase() === "a") {
                doNextStep = false;
            }
        }

        return toPlay;
    }

    isUserLoggedIn() {
        return !!this.$html.querySelector(LOGOUT_SELECTOR);
    }
}

export {
    HtmlResponse,
};
