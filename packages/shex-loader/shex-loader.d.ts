export = ShExLoader;

declare function ShExLoader(config?: ShExLoader.Config): ShExLoader.Loader;

declare namespace ShExLoader {

  /** A loaded ShEx extension (e.g. @shexjs/extension-map). */
  interface ShExExtension {
    url: string;
    register(validator: any, api: { ShExTerm: any }): void;
    done(validator: any): void;
  }

  /** Result of a GET request. */
  interface LoadedResource {
    text: string;
    url: string;
  }

  /** Result of a load() call. */
  interface LoadResult {
    schema: any;
    data: any;
    schemaMeta: any[];
    dataMeta: any[];
  }

  /** Schema inputs accepted by load(). */
  interface SchemaInput {
    shexc?: Array<string | { url: string; text?: string }>;
    json?:  Array<string | { url: string; text?: string }>;
    turtle?: Array<string | { url: string; text?: string }>;
  }

  /** Data inputs accepted by load(). */
  interface DataInput {
    turtle?: Array<string | { url: string; text?: string }>;
    jsonld?: Array<string | { url: string; text?: string }>;
  }

  /** Configuration passed to the ShExLoader factory. */
  interface Config {
    /** Override the default no-op extension loader. */
    loadExtensions?: (globs: string[]) => Record<string, ShExExtension>;
    /** HTTP fetch implementation (e.g. node-fetch). */
    fetch?: (url: string, options?: any) => Promise<any>;
    /** RDF/JS DataFactory + Store implementation (e.g. N3). */
    rdfjs?: any;
    /** jsonld library instance. */
    jsonld?: any;
    /** Options forwarded to jsonld.toRDF(). */
    jsonLdOptions?: any;
  }

  class WebError extends Error {
    url: string;
    constructor(msg: string, url: string);
  }

  class FetchError extends WebError {
    status: number;
    text: string;
    constructor(msg: string, url: string, status: number, text: string);
  }

  /** The object returned by the ShExLoader factory. */
  interface Loader {
    load(
      schema: SchemaInput | null,
      data: DataInput | null,
      schemaOptions?: any,
      dataOptions?: any,
    ): Promise<LoadResult>;

    /** Load ShEx validator extensions matching the given globs. */
    loadExtensions(globs: string[]): Record<string, ShExExtension>;

    /** Fetch a URL, returning its text content and resolved URL. */
    GET(url: string, mediaType?: string): Promise<LoadedResource>;

    loadSchemaImports(
      schema: any,
      importers: string[],
      resourceLoadControler: any,
      schemaOptions?: any,
    ): any;

    ResourceLoadControler: any;
    WebError: typeof WebError;
    FetchError: typeof FetchError;
  }
}
