export interface ChatServer {
  start(): Promise<void>
  stop(): void
}
