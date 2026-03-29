# Development
```hugo server --ignoreCache --disableFastRender --noHTTPCache```

with drafts - ```hugo server --buildDrafts```

## Linting

[ESLint](https://eslint.org/) is set up for the JavaScript files under `static/js/`.

```bash
npm install        # first time only
npx eslint assets/js/
```

Config is in `.eslintrc.json` (ES2022 + browser globals, `eslint:recommended` rules).

# Deployment
```hugo```

# Other info
## Passphrase generator
The wordlists come from (EFF)[https://www.eff.org/files/2016/07/18/eff_large_wordlist.txt] and (Maciek Talaska)[https://github.com/MaciekTalaska/diceware-pl/blob/master/diceware-pl.txt]