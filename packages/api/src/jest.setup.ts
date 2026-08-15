import { afterAll, afterEach, beforeAll } from "@jest/globals";
import { setupServer } from "msw/node";
import { httpHandlers } from "./__mocks__/handlers";

export const server = setupServer(...httpHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
