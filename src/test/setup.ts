// Imports
import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';


/*
Global test setup for Vitest and React Testing Library.
This is done to ensure that each test starts with a clean slate
*/
afterEach(() => {
    cleanup();
});
