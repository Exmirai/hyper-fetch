import {
  NullableKeys,
  NegativeTypes,
  ExtractParams,
  ExtractRequestData,
  HttpMethodsType,
  ExtractQueryParams,
  ExtractClientOptions,
  ExtractEndpoint,
  ExtractHasData,
  ExtractHasParams,
  ExtractHasQueryParams,
  ExtractError,
  ExtractResponse,
} from "types";
import { Command } from "command";
import { ClientResponseType, ClientQueryParamsType, FetchProgressType } from "client";
import { CommandEventDetails, CommandResponseDetails } from "managers";

// Progress
export type ClientProgressEvent = { total: number; loaded: number };
export type ClientProgressResponse = {
  progress: number;
  timeLeft: number;
  sizeLeft: number;
};

// Dump

/**
 * Dump of the command used to later recreate it
 */
export type CommandDump<
  Command extends CommandInstance,
  // Bellow generics provided only to overcome the typescript bugs
  ClientOptions = unknown,
  QueryParamsType = ClientQueryParamsType,
  Params = ExtractParams<Command>,
> = {
  commandOptions: CommandConfig<string, ClientOptions | ExtractClientOptions<Command>>;
  endpoint: string;
  method: HttpMethodsType;
  headers?: HeadersInit;
  auth: boolean;
  cancelable: boolean;
  retry: number;
  retryTime: number;
  garbageCollection: number;
  cache: boolean;
  cacheTime: number;
  queued: boolean;
  offline: boolean;
  disableResponseInterceptors: boolean | undefined;
  disableRequestInterceptors: boolean | undefined;
  options?: ClientOptions | ExtractClientOptions<Command>;
  data: CommandData<ExtractRequestData<Command>, unknown>;
  params: Params | NegativeTypes;
  queryParams: QueryParamsType | NegativeTypes;
  abortKey: string;
  cacheKey: string;
  queueKey: string;
  effectKey: string;
  used: boolean;
  updatedAbortKey: boolean;
  updatedCacheKey: boolean;
  updatedQueueKey: boolean;
  updatedEffectKey: boolean;
  deduplicate: boolean;
  deduplicateTime: number;
};

// Command

/**
 * Configuration options for command creation
 */
export type CommandConfig<GenericEndpoint extends string, ClientOptions> = {
  /**
   * Determine the endpoint for command request
   */
  endpoint: GenericEndpoint;
  /**
   * Custom headers for command
   */
  headers?: HeadersInit;
  /**
   * Should the onAuth method get called on this command
   */
  auth?: boolean;
  /**
   * Request method GET | POST | PATCH | PUT | DELETE
   */
  method?: HttpMethodsType;
  /**
   * Should enable cancelable mode in the Dispatcher
   */
  cancelable?: boolean;
  /**
   * Retry count when request is failed
   */
  retry?: number;
  /**
   * Retry time delay between retries
   */
  retryTime?: number;
  /**
   * Should we trigger garbage collection or leave data in memory
   */
  garbageCollection?: number;
  /**
   * Should we save the response to cache
   */
  cache?: boolean;
  /**
   * Time for which the cache is considered up-to-date
   */
  cacheTime?: number;
  /**
   * Should the requests from this command be send one-by-one
   */
  queued?: boolean;
  /**
   * Do we want to store request made in offline mode for latter use when we go back online
   */
  offline?: boolean;
  /**
   * Disable post-request interceptors
   */
  disableResponseInterceptors?: boolean;
  /**
   * Disable pre-request interceptors
   */
  disableRequestInterceptors?: boolean;
  /**
   * Additional options for your client, by default XHR options
   */
  options?: ClientOptions;
  /**
   * Key which will be used to cancel requests. Autogenerated by default.
   */
  abortKey?: string;
  /**
   * Key which will be used to cache requests. Autogenerated by default.
   */
  cacheKey?: string;
  /**
   * Key which will be used to queue requests. Autogenerated by default.
   */
  queueKey?: string;
  /**
   * Key which will be used to use effects. Autogenerated by default.
   */
  effectKey?: string;
  /**
   * Should we deduplicate two requests made at the same time into one
   */
  deduplicate?: boolean;
  /**
   * Time of pooling for the deduplication to be active (default 10ms)
   */
  deduplicateTime?: number;
};

export type CommandMapperType<RequestDataType, MappedData> = (data: RequestDataType) => MappedData;

export type CommandData<RequestDataType, MappedData> =
  | (MappedData extends never ? RequestDataType : MappedData)
  | NegativeTypes;

export type CommandCurrentType<
  ResponseType,
  RequestDataType,
  QueryParamsType,
  ErrorType,
  GenericEndpoint extends string,
  ClientOptions,
  MappedData,
> = {
  used?: boolean;
  params?: ExtractRouteParams<GenericEndpoint> | NegativeTypes;
  queryParams?: QueryParamsType | NegativeTypes;
  data?: CommandData<RequestDataType, MappedData>;
  mockCallback?: ((data: RequestDataType) => ClientResponseType<ResponseType, ErrorType>) | undefined;
  headers?: HeadersInit;
  updatedAbortKey?: boolean;
  updatedCacheKey?: boolean;
  updatedQueueKey?: boolean;
  updatedEffectKey?: boolean;
} & Partial<NullableKeys<CommandConfig<GenericEndpoint, ClientOptions>>>;

export type ParamType = string | number;
export type ParamsType = Record<string, ParamType>;

export type ExtractRouteParams<T extends string> = string extends T
  ? NegativeTypes
  : T extends `${string}:${infer Param}/${infer Rest}`
  ? { [k in Param | keyof ExtractRouteParams<Rest>]: ParamType }
  : T extends `${string}:${infer Param}`
  ? { [k in Param]: ParamType }
  : NegativeTypes;

export type FetchOptionsType<ClientOptions> = Omit<
  Partial<CommandConfig<string, ClientOptions>>,
  "endpoint" | "method"
>;

/**
 * It will check if the query params are already set
 */
export type FetchQueryParamsType<
  QueryParamsType extends ClientQueryParamsType | string,
  HasQuery extends true | false = false,
> = HasQuery extends true
  ? { queryParams?: NegativeTypes }
  : {
      queryParams?: QueryParamsType | string;
    };

/**
 * If the command endpoint parameters are not filled it will throw an error
 */
export type FetchParamsType<
  EndpointType extends string,
  HasParams extends true | false,
> = ExtractRouteParams<EndpointType> extends NegativeTypes
  ? { params?: NegativeTypes }
  : true extends HasParams
  ? { params?: NegativeTypes }
  : { params: NonNullable<ExtractRouteParams<EndpointType>> };

/**
 * If the command data is not filled it will throw an error
 */
export type FetchRequestDataType<RequestDataType, HasData extends true | false> = RequestDataType extends NegativeTypes
  ? { data?: NegativeTypes }
  : HasData extends true
  ? { data?: NegativeTypes }
  : { data: NonNullable<RequestDataType> };

export type CommandQueueOptions = {
  dispatcherType?: "auto" | "fetch" | "submit";
};

export type FetchType<Command extends CommandInstance> = FetchQueryParamsType<
  ExtractQueryParams<Command>,
  ExtractHasQueryParams<Command>
> &
  FetchParamsType<ExtractEndpoint<Command>, ExtractHasParams<Command>> &
  FetchRequestDataType<ExtractRequestData<Command>, ExtractHasData<Command>> &
  Omit<FetchOptionsType<ExtractClientOptions<Command>>, "params" | "data"> &
  FetchSendActionsType<Command> &
  CommandQueueOptions;

export type FetchSendActionsType<Command extends CommandInstance> = {
  onSettle?: (requestId: string, command: Command) => void;
  onRequestStart?: (details: CommandEventDetails<Command>) => void;
  onResponseStart?: (details: CommandEventDetails<Command>) => void;
  onUploadProgress?: (values: FetchProgressType, details: CommandEventDetails<Command>) => void;
  onDownloadProgress?: (values: FetchProgressType, details: CommandEventDetails<Command>) => void;
  onResponse?: (
    response: ClientResponseType<ExtractResponse<Command>, ExtractError<Command>>,
    details: CommandResponseDetails,
  ) => void;
  onRemove?: (details: CommandEventDetails<Command>) => void;
};

export type FetchMethodType<Command extends CommandInstance> = FetchType<Command>["data"] extends NegativeTypes
  ? FetchType<Command>["params"] extends NegativeTypes
    ? (options?: FetchType<Command>) => Promise<ClientResponseType<ExtractResponse<Command>, ExtractError<Command>>>
    : (options: FetchType<Command>) => Promise<ClientResponseType<ExtractResponse<Command>, ExtractError<Command>>>
  : (options: FetchType<Command>) => Promise<ClientResponseType<ExtractResponse<Command>, ExtractError<Command>>>;

export type CommandInstance = Command<any, any, any, any, any, any, any, any, any, any, any>;
