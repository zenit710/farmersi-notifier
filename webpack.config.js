module.exports = {
    entry: {
        background: './src/background.js',
        options: './src/options-page.js',
        popup: './src/popup-page.js',
    },
    output: {
        path: __dirname + '/dist/js',
    }
};
