export enum MessageType {
  PLUGIN_REGISTER,
  PLUGIN_UNREGISTER,
  PLUGIN_MESSAGE,
  APP_MESSAGE
}

export interface MessageProtocol {
  type: MessageType
  payload: unknown
}
