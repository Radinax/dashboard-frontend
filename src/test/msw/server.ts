import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/** MSW server mocking the BFF boundary. Started/stopped in src/test/setup.ts. */
export const server = setupServer(...handlers);
