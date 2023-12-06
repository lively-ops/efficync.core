import { electronAPI } from '@electron-toolkit/preload'

const MESSAGE_TYPES = {
  REQUEST: 'REQUEST',
  RESPONSE: 'RESPONSE',
  EVENT: 'EVENT'
}

class MessageProtocol {
  constructor(ipcRenderer) {
    this.ipcRenderer = electronAPI.ipcRenderer

    ipcRenderer.on('plugin-message', (event, message) => {
      switch (message.type) {
        case MESSAGE_TYPES.RESPONSE:
          this.handleResponse(message)
          break
        case MESSAGE_TYPES.EVENT:
          this.handleEvent(message)
          break
        default:
          console.warn('Unknown message received:', message)
      }
    })
  }

  sendRequest(pluginId, action, data, callback) {
    const message = {
      type: MESSAGE_TYPES.REQUEST,
      pluginId,
      action,
      data
    }
    this.ipcRenderer.send('plugin-message', message)

    // Set a timeout for the response
    const timeoutId = setTimeout(() => {
      callback(new Error('Timeout waiting for response from plugin'))
    }, 5000)

    // Store the callback for later use
    this.pendingRequests[message.id] = { callback, timeoutId }
  }

  handleResponse(message) {
    const request = this.pendingRequests[message.id]
    if (!request) {
      console.warn('Received response for unknown request:', message)
      return
    }

    clearTimeout(request.timeoutId)
    delete this.pendingRequests[message.id]

    // Handle response data based on plugin and action
    request.callback(null, message.data)
  }

  handleEvent(message) {
    // Handle event data based on plugin and event
    // ...

    // Emit event with specific name for subscribers
    const eventName = `plugin-${message.pluginId}-${message.event}`
    this.ipcRenderer.emit(eventName, message.data)
  }
}

export { MESSAGE_TYPES, MessageProtocol }
