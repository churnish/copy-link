// Test setup file

// Mock clipboard API
Object.assign(navigator, {
	clipboard: {
		writeText: jest.fn().mockResolvedValue(undefined),
		readText: jest.fn().mockResolvedValue('')
	}
});

// Mock Math.random for predictable block IDs in tests
let mockRandomValue = 0.123456789;
const originalRandom = Math.random;

// Override Math.random globally
Math.random = () => mockRandomValue;

global.setMockRandomValue = (value: number) => {
	mockRandomValue = value;
};

global.resetMockRandom = () => {
	Math.random = originalRandom;
};

global.mockMathRandom = () => {
	Math.random = () => mockRandomValue;
};

// Reset mocks before each test
beforeEach(() => {
	jest.clearAllMocks();
	mockRandomValue = 0.123456789;
	Math.random = () => mockRandomValue;
});

// Global test utilities
declare global {
	function setMockRandomValue(value: number): void;
	function resetMockRandom(): void;
	function mockMathRandom(): void;
}
