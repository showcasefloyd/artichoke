import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

if (!globalThis.TextEncoder) {
    Object.assign(globalThis, { TextEncoder, TextDecoder });
}

if (!globalThis.fetch) {
    Object.defineProperty(globalThis, 'fetch', {
        writable: true,
        value: jest.fn(),
    });
}
