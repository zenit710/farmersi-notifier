class GameNotification {
    constructor() {
        this.title = "Farmersi Notifier";
        this.iconUrl = "images/logo-128.png";
        this.gamesCount = 0;
        this.messageCount = 0;
        this.teamCommentGamesCount = 0;
    }

    setGamesCount(count) {
        this.gamesCount = count;
        return this;
    }

    setMessageCount(count) {
        this.messageCount = count;
        return this;
    }

    setTeamCommentGamesCount(count) {
        this.teamCommentGamesCount = count;
        return this;
    }

    hasContentToSend() {
        return this.gamesCount > 0 || this.messageCount > 0 || this.teamCommentGamesCount > 0;
    }

    send() {
        const messageParts = [];

        if (this.gamesCount) {
            messageParts.push(`Gry do przeliczenia: ${this.gamesCount}`);
        }

        if (this.messageCount) {
            messageParts.push(`Nieprzeczytane wiadomości: ${this.messageCount}`);
        }

        if (this.teamCommentGamesCount) {
            messageParts.push(`Komentarze druzynowe: ${this.teamCommentGamesCount}`);
        }

        chrome.notifications.create({
            title: this.title,
            iconUrl: this.iconUrl,
            type: "basic",
            message: messageParts.join("\n"),
        });
    }
}

export {
    GameNotification,
};
