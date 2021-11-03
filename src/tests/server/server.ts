import { setupServer } from "msw/node";

import { FetchMiddlewareInstance } from "middleware";
import { FetchMockType, getInterceptEndpoint, getMethod } from "tests/mocks";
import { ErrorCodesType, ErrorMockType, errorResponses } from "./server.constants";

export const server = setupServer();

export const startServer = (): void => {
  server.listen();
};

export const resetMocks = (): void => {
  server.resetHandlers();
};

export const stopServer = (): void => {
  server.close();
};

export const createInterceptor = <
  T extends FetchMockType<FetchMiddlewareInstance>,
  StatusType extends number | ErrorCodesType,
>(
  apiStub: T,
  status: StatusType,
): StatusType extends ErrorCodesType ? ErrorMockType : ReturnType<T>["fixture"] => {
  const { endpoint, method, fixture } = apiStub();
  const url = getInterceptEndpoint(endpoint);

  const mock = status in errorResponses ? errorResponses[status as ErrorCodesType] : fixture;

  server.use(getMethod(url, method, status, mock));

  return mock;
};
