const path = require("path");

const isDev = (nodeEnv) => {
    return "development" === nodeEnv;
};

module.exports = ({ NODE_ENV = "production" }) => {
    return {
        entry: {
            background: "./src/js/background.js",
            options: "./src/js/options-page.js",
            popup: "./src/js/popup-page.js",
        },
        devtool: isDev(NODE_ENV) ? "inline-source-map" : undefined,
        module: {
            rules: [
                {
                    test: /\.scss$/i,
                    use: [
                        "style-loader",
                        "css-loader",
                        "sass-loader",
                    ],
                },
            ],
        },
        output: {
            path: __dirname + "/dist/js",
        },
        resolve: {
            alias: {
                config: path.join(__dirname, "config", NODE_ENV),
            },
        },
    };
};
