const jest = require('eslint-plugin-jest')
const js = require('@eslint/js')
const { FlatCompat } = require('@eslint/eslintrc')
const globals = require('globals')

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
})

module.exports = [...compat.extends("eslint:recommended", "plugin:jest/recommended"), {
	ignores: [
		"node_modules/*",
		"coverage/*",
		"dist/*",
	],
},{
	plugins: {
		jest,
	},

	languageOptions: {
		globals: {
			...globals.commonjs,
			...globals.jest,
			...globals.node,
		},

		ecmaVersion: 2023,
		sourceType: "module",
	},

	rules: {
		"i18n-text/no-en": "off",
		"import/no-commonjs": "off",
		"import/no-namespace": "off",
		"prettier/prettier": "off",
		semi: ["error", "never"],
		indent: ["error", "tab"],
		"filenames/match-regex": "off",
	},
}]