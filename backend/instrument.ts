import dotenv from 'dotenv';

// Must be the first file executed. Loads .env before any other module
// reads process.env — import hoisting means dotenv.config() in server.ts
// runs too late for modules that validate env vars at load time.
dotenv.config();
