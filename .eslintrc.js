module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": false
        },
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "ignorePatterns": [
        "*/"
    ],
    "rules": {
        "react/prop-types": "off",
        "react/jsx-key": "off",
        "react/react-in-jsx-scope": "off",
        "react/jsx-no-target-blank": "off",
        "react/no-unescaped-entities": "off",
        "no-undef": "off",
        "no-dupe-else-if": "off",
        "no-unreachable": "off",
        "react/jsx-no-undef": "off"
    }
};
