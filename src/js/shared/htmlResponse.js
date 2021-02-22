const GAME_SELECTOR = ".dwa a[href*='user.php?id_gra']";
const LOGOUT_SELECTOR = "a[href*='?logout=1']";
const USERNAME_SELECTOR = "a[href*='user_info.php'] span";
const UNREAD_MESSAGE_SELECTOR = "form[action*='message.php'] span.info";
const UNREAD_COUNT_PATTERN = /\((\d+)\)/;
const TO_PLAY_TEXT = "podejmij decyzje";
const LINK_TAG_NAME = "a";
const TEAM_COMMENT_SOURCE_PART = "komentarz_ico.png";

class HtmlResponse {
    constructor() {
        this.response = null;
        this.$html = document.createElement("html");
        this.toPlay = null;
        this.withComments = null;
    }

    setResponse(response) {
        this.response = response;
        this.$html.innerHTML = response;
    }

    getGameElements() {
        return this.$html.querySelectorAll(GAME_SELECTOR);
    }

    getNeedingActionGames() {
        if (!this.toPlay) {
            this.categorizeGames();
        }

        return this.toPlay;
    }

    getTeamCommentsGames() {
        if (!this.withComments) {
            this.categorizeGames();
        }

        return this.withComments;
    }

    getUnreadedMessageCount() {
        let count = 0;
        const $unreadCount = this.$html.querySelector(UNREAD_MESSAGE_SELECTOR);

        if ($unreadCount) {
            const matches = UNREAD_COUNT_PATTERN.exec($unreadCount.textContent);
            count = matches ? parseInt(matches[1]) : 0;
        }

        return count;
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

    isUserLoggedIn() {
        return !!this.$html.querySelector(LOGOUT_SELECTOR);
    }

    categorizeGames() {
        const toPlay = [];
        const withTeamComment = [];

        this.getGameElements().forEach($game => {
            const gameName = $game.textContent;
            let $element = $game;
            let doNextStep = true;

            while (doNextStep) {
                $element = $element.nextElementSibling;

                if (!$element || LINK_TAG_NAME === $element?.tagName?.toLowerCase()) {
                    doNextStep = false;
                } else {
                    if ($element.textContent === TO_PLAY_TEXT) {
                        toPlay.push(gameName);
                    }
                    if ($element.src?.includes(TEAM_COMMENT_SOURCE_PART)) {
                        withTeamComment.push(gameName);
                    }
                }
            }
        });

        this.toPlay = toPlay;
        this.withComments = withTeamComment;
    }
}

export {
    HtmlResponse,
};
