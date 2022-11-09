const fs = require('fs');

const features = fs.readdirSync('./src/app/features');

const siblingFeatureZones = features.map(feature => {
	const siblings = features.filter(item => item !== feature);

	return {
		target: `./src/app/features/${feature}`,
		from: `./src/app/features/(${siblings.join('|')})`
	};
});

module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true
	},
	parser: 'babel-eslint',
	extends: ['airbnb', 'react-app', 'plugin:prettier/recommended', 'prettier/react'],
	plugins: ['prettier', '@babel'],
	settings: {
		'import/resolver': {
			node: {
				paths: ['src']
			}
		}
	},
	rules: {
		'react/jsx-key': 'error',
		'import/no-restricted-paths': [
			'error',
			{
				zones: [
					{
						target: './src/app/common',
						from: './src/app/features'
					},
					...siblingFeatureZones
				]
			}
		],
		'import/no-deprecated': 'warn',
		'prettier/prettier': ['error'],
		'react/jsx-filename-extension': [
			'warn',
			{
				extensions: ['.js', '.jsx']
			}
		],
		'jsx-a11y/label-has-associated-control': [
			'error',
			{
				required: {
					some: ['nesting', 'id']
				}
			}
		],
		'jsx-a11y/label-has-for': [
			'error',
			{
				required: {
					some: ['nesting', 'id']
				}
			}
		],
		'no-param-reassign': 'warn',
		'no-use-before-define': 'off',
		'no-nested-ternary': 'off',
		'no-underscore-dangle': 'off',
		'import/no-unresolved': 'off',
		'no-constant-condition': 'off',
		'global-require': 'off',
		'react/no-array-index-key': 'off',
		'react/no-unescaped-entities': 'off',
		'react/destructuring-assignment': 'off',
		'react/jsx-props-no-spreading': 'off',
		'react/state-in-constructor': 'off',
		'react/no-danger': 'off',
		'react/prop-types': 'warn',
		'react/forbid-prop-types': 'warn',
		'react/require-default-props': 'warn',
		'react/default-props-match-prop-types': 'warn',
		'react/no-unused-prop-types': 'warn',
		'import/prefer-default-export': 'off',
		'no-unused-expressions': 'off',
		'@babel/no-unused-expressions': 'error',
		camelcase: 'off'
	}
};
