import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterFramework: ['@testing-library/jest-dom'],
    globals: {
        'ts-jest': {
            tsconfig: {
                jsx: 'react-jsx',
                esModuleInterop: true,
                moduleResolution: 'node',
            },
        },
    },
    moduleNameMapper: {
        '\\.(scss|css)$': '<rootDir>/src/modules/ts/__mocks__/styleMock.ts',
    },
    testMatch: ['<rootDir>/src/**/__tests__/**/*.test.tsx'],
};

export default config;
