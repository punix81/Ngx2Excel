declare module 'papaparse' {
  export interface ParseResult<T> {
    data: T[];
    errors: any[];
    meta: any;
  }

  export interface ParseError {
    type?: string;
    code?: string;
    message?: string;
    row?: number;
  }

  const Papa: {
    parse: <T = any>(
      input: string,
      config?: {
        header?: boolean;
        skipEmptyLines?: boolean | RegExp;
        complete?: (results: ParseResult<T>) => void;
        error?: (err: ParseError) => void;
        [key: string]: any;
      }
    ) => void;
    unparse?: (data: any, config?: any) => string;
    [key: string]: any;
  };

  export default Papa;
}
