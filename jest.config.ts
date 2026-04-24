import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/modules/ts/__tests__/setupTests.ts'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: {
                jsx: 'react-jsx',
                esModuleInterop: true,
                moduleResolution: 'node',
                types: ['jest', 'node'],
            },
        }],
    },
    moduleNameMapper: {
        '\\.(scss|css)$': '<rootDir>/src/modules/ts/__mocks__/styleMock.ts',
    },
    testMatch: ['<rootDir>/src/**/__tests__/**/*.test.tsx'],
};

export default config;
