declare module 'xmlrpc' {
  export interface ClientOptions {
    host: string
    port?: number
    path: string
    basic_auth?: {
      user: string
      pass: string
    }
    secure?: boolean
  }

  export interface Client {
    methodCall(method: string, params: any[], callback: (error: any, value: any) => void): void
  }

  export function createClient(options: ClientOptions): Client
  export function createSecureClient(options: ClientOptions): Client
}

