import { MessageProtocol } from './message-protocol'
import { electronAPI } from '@electron-toolkit/preload'

class APIManager {
  constructor() {
    this.messageProtocol = new MessageProtocol(electronAPI.ipcRenderer)
    this.plugins = {} // Store information about loaded plugins
    this.eventSubscriptions = {} // Store event subscriptions for plugins
  }

  // Load plugin with initialization
  loadPlugin(pluginId) {
    if (this.plugins[pluginId]) {
      console.warn('Plugin already loaded:', pluginId)
      return
    }

    this.messageProtocol.sendRequest(pluginId, 'initialize', {}, (error, data) => {
      if (error) {
        console.error('Error initializing plugin:', pluginId, error)
        return
      }

      this.plugins[pluginId] = data
      for (const eventName in data.events) {
        this.subscribeToEvent(pluginId, eventName, (data) => {
          console.log('Plugin event received:', pluginId, eventName, data)
        })
      }
    })
  }

  // Unload plugin with cleanup
  unloadPlugin(pluginId) {
    if (!this.plugins[pluginId]) {
      console.warn('Plugin not loaded:', pluginId)
      return
    }

    this.messageProtocol.sendRequest(pluginId, 'shutdown', {})

    // Unsubscribe from all plugin events
    for (const eventName in this.plugins[pluginId].events) {
      this.unsubscribeFromEvent(pluginId, eventName)
    }

    // Remove plugin information and subscriptions
    delete this.plugins[pluginId]
    for (const eventKey in this.eventSubscriptions) {
      if (eventKey.startsWith(`${pluginId}-`)) {
        delete this.eventSubscriptions[eventKey]
      }
    }
  }

  // Call action on a specific plugin
  callAction(pluginId, action, data, callback) {
    this.messageProtocol.sendRequest(pluginId, action, data, callback)
  }

  // Subscribe to a specific plugin event
  subscribeToEvent(pluginId, eventName, callback) {
    const eventKey = `${pluginId}-${eventName}`

    if (!this.eventSubscriptions[eventKey]) {
      this.eventSubscriptions[eventKey] = []
    }
    this.eventSubscriptions[eventKey].push(callback)

    this.messageProtocol.on(`plugin-${eventKey}`, callback)
  }

  // Unsubscribe from a specific plugin event
  unsubscribeFromEvent(pluginId, eventName, callback) {
    const eventKey = `${pluginId}-${eventName}`

    const callbacks = this.eventSubscriptions[eventKey]
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index >= 0) {
        callbacks.splice(index, 1)
      }
    }

    this.messageProtocol.removeListener(`plugin-${eventKey}`, callback)
  }

  // Get information about a specific plugin
  getPluginInfo(pluginId) {
    return this.plugins[pluginId]
  }

  // List all loaded plugins
  getLoadedPlugins() {
    return Object.keys(this.plugins)
  }
}

export default APIManager
