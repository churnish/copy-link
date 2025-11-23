module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	roots: ['<rootDir>/tests'],
	testMatch: ['**/*.test.ts'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	collectCoverageFrom: [
		'main.ts',
		'!**/*.d.ts',
		'!**/node_modules/**',
		'!**/vendor/**'
	],
	coverageThreshold: {
		global: {
			branches: 65,
			functions: 30,
			lines: 65,
			statements: 65
		}
	},
	coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
	setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
	moduleNameMapper: {
		'^obsidian$': '<rootDir>/tests/__mocks__/obsidian.ts'
	},
	transform: {
		'^.+\\.tsx?$': ['ts-jest', {
			tsconfig: {
				esModuleInterop: true,
				allowSyntheticDefaultImports: true
			}
		}]
	}
};
