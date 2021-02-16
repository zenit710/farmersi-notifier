# Farmersi Notifier
Simple Chrome Extension which gives the user notifications about games waiting for action.

## Development

After cloning repository run `npm install`

### Build
`npm run build`

### Instalation
To install local extension read <https://developer.chrome.com/docs/extensions/mv2/faq/#faq-dev-01>

### Formatting
#### JavaScript
- `npm run lint` to check is file formatting correct
- `npm run lint:fix` to fix formatting errors

#### SCSS
- `npm run stylelint` to check is file formatting correct
- `npm run stylelint:fix` to fix formatting errors

### Publishing
`npm run publish` - extension code will be build and located in `build/farmersi-notifier.zip`

### Visual Studio Code support
You can have automatically formatted code (JS, SCSS) in VSCode in few steps:
1. Install VSCode plugins [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)
2. Create file `.vscode/settings.json` if not exists
3. Add configuration:
```
{
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true,
		"source.fixAll.stylelint": true
    },
    "eslint.validate": ["javascript"]
}
```

## Contact

Contact me via <zenit710@gmail.com>
