import '@testing-library/jest-dom';

if (!globalThis.fetch) {
    Object.defineProperty(globalThis, 'fetch', {
        writable: true,
        value: jest.fn(),
    });
}
