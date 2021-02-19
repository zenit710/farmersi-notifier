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
        return this.$html.querySelectorAll(".dwa a[href*='user.php?id_gra']");
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
        const loginElement = this.$html.querySelector("a[href*='?logout=1']");

        if (loginElement) {
            const nameElement = loginElement.parentElement.querySelector("a[href*='user_info.php'] span");

            if (nameElement) {
                username = nameElement.innerHTML;
            }
        }

        return username;
    }

    isNeedingActionGame($game) {
        return $game.nextElementSibling
            && $game.nextElementSibling.nextElementSibling
            && $game.nextElementSibling.nextElementSibling.textContent === "podejmij decyzje";
    }

    isUserLoggedIn() {
        return !!this.$html.querySelector("a[href*='?logout=1']");
    }
}

export {
    HtmlResponse,
};
