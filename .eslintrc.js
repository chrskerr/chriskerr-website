module.exports = {
	"env": {
		"browser": true,
		"es2021": true,
		"node": true,
	},
	"extends": [
		"eslint:recommended",
		"plugin:react/recommended",
		"plugin:@typescript-eslint/recommended",
		"next",
	],
	"globals": {
		"Atomics": "readonly",
		"SharedArrayBuffer": "readonly",
	},
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"ecmaFeatures": {
			"jsx": true,
		},
		"ecmaVersion": 12,
		"sourceType": "module",
	},
	"plugins": [
		"react",
		"@typescript-eslint",
	],
	"rules": {
		"indent": "off",
		"@typescript-eslint/indent": [ "error", "tab" ],
		"linebreak-style": [ "error", "unix" ],
		"quotes": [ "error", "double" ],
		"semi": [ "error", "always" ],
		"array-bracket-spacing": [ "error", "always", { "objectsInArrays": false, "arraysInArrays": false }],
		"object-curly-spacing": [ "error", "always", { "objectsInObjects": false, "arraysInObjects": false }],
		"space-in-parens": [ "error", "always", { "exceptions": [ "{}", "()", "[]" ]}],
		"computed-property-spacing": [ "error", "always" ],
		"comma-dangle": [ "error", "always-multiline" ],
		"prefer-const": "error",
		"prefer-spread": "error",
		"func-call-spacing": [ "error", "never" ],
		"no-loop-func": "error",
		"no-undef": "error",
		"react/prop-types": "off",
		"react-hooks/exhaustive-deps": "off",
		"@typescript-eslint/adjacent-overload-signatures": "error",
		"@typescript-eslint/ban-ts-comment": "off",
		"@typescript-eslint/no-extra-non-null-assertion": [ "off" ],
	},
};
