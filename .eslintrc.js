module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
    },
    "extends": "eslint:recommended",
    "globals": {
        "chrome": "readonly",
        "__dirname": "readonly",
        "module": "writeable",
    },
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module",
    },
    "rules": {
        "brace-style": [
            "error",
            "1tbs",
        ],
        "comma-dangle": [
            "error",
            "always-multiline",
        ],
        "comma-spacing": [
            "error",
            {
                "before": false,
                "after": true,
            },
        ],
        "curly": [
            "error",
            "all",
        ],
        "eol-last": [
            "error",
            "always",
        ],
        "indent": [
            "error",
            4,
        ],
        "linebreak-style": [
            "error",
            "unix",
        ],
        "max-len": [
            "error",
            120,
        ],
        "no-multiple-empty-lines": [
            "error",
            {
                "max": 1,
                "maxEOF": 1,
                "maxBOF": 0,
            },
        ],
        "no-trailing-spaces": [
            "error",
        ],
        "quotes": [
            "error",
            "double",
        ],
        "semi": [
            "error",
            "always",
        ],
    },
};
