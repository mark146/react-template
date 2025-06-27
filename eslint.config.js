import { customRulesPlugin } from './tools/eslint/index.js';
import fsdLint from 'eslint-plugin-fsd-lint';

export default [
	{
		files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
		plugins: {
			'fsd': fsdLint,
			'custom': customRulesPlugin,
		},
		rules: {
			// 커스텀 규칙
			'custom/no-console-log': 'error',

			// 기본 규칙들
			'no-console': 'off',
			'no-unused-vars': 'warn',
			'prefer-const': 'error',

			// FSD 규칙들
			// FSD 레이어 import 규칙 강제 (예: features는 pages를 import 불가)
			'fsd/forbidden-imports': 'error',

			// 슬라이스/레이어 간 상대 경로 import 금지, 별칭(@) 사용
			// 기본적으로 같은 슬라이스 내 상대 경로는 허용 (설정 가능)
			'fsd/no-relative-imports': 'error',

			// Public API (index 파일)를 통한 import만 허용
			'fsd/no-public-api-sidestep': 'error',

			// 같은 레이어 내 슬라이스 간 직접 import 방지
			'fsd/no-cross-slice-dependency': 'error',

			// 비즈니스 로직 레이어에서 UI import 방지
			'fsd/no-ui-in-business-logic': 'error',

			// 전역 스토어 직접 import 금지
			'fsd/no-global-store-imports': 'error',

			// FSD 레이어 기반으로 import 순서 강제
			'fsd/ordered-imports': 'warn',
		},
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			parserOptions: {
				ecmaFeatures: {
					jsx: true
				}
			},
			globals: {
				console: 'readonly',
				window: 'readonly',
				document: 'readonly',
				process: 'readonly',
			}
		},
		settings: {
			// FSD 설정
			fsd: {
				rootDir: './src',
				layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'],
				alias: '@'
			},
			// Import resolver 설정 (절대경로 인식용)
			'import/resolver': {
				alias: {
					map: [
						['@', './src']
					],
					extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
				}
			}
		}
	},
	{
		// 테스트 파일들은 규칙 완화
		files: ['**/*.test.js', '**/*.test.jsx', '**/*.spec.js', '**/*.spec.jsx', '**/tests/**/*.js'],
		rules: {
			'custom/no-console-log': 'off',
			'fsd/no-relative-imports': 'off', // 테스트에서는 상대경로 허용
		}
	},
	{
		// 설정 파일들과 빌드 도구들은 규칙 완화
		files: ['*.config.js', '*.config.ts', '**/tools/**/*.js', '**/scripts/**/*.js'],
		rules: {
			'custom/no-console-log': 'off',
			'fsd/no-relative-imports': 'off', // 설정 파일에서는 상대경로 허용
		}
	}
];