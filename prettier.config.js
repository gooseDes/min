export default {
    arrowParens: "avoid",
    singleQuote: false,
    trailingComma: "all",
    tabWidth: 4,
    printWidth: 128,
    plugins: ["prettier-plugin-organize-imports"],
    overrides: [
        {
            files: ["**/package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml"],
            options: {
                tabWidth: 2,
                plugins: [],
            },
        },
    ],
};
