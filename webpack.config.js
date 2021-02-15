module.exports = {
    entry: {
        background: "./src/js/background.js",
        options: "./src/js/options-page.js",
        popup: "./src/js/popup-page.js",
    },
    output: {
        path: __dirname + "/dist/js",
    },
};
