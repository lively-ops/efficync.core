import { MessageProtocol } from './message-protocol'

class PluginAPI {
  constructor(messageProtocol) {
    this.messageProtocol = MessageProtocol
    this.plugins = [] // Store information about installed plugins
    this.eventSubscriptions = {} // Store event subscriptions for plugins
  }

  addPlugin(plugin) {
    // Validate plugin manifest and structure
    if (!plugin.id || !plugin.manifest || !plugin.actions) {
      throw new Error('Invalid plugin manifest')
    }

    // Register plugin actions
    this.plugins.push(plugin)

    // Send message to renderer process to update UI with new plugin
    this.messageProtocol.sendRequest('renderer', 'plugin-added', plugin)

    // Register event listeners for supported plugin events
    for (const event of plugin.manifest.events) {
      this.messageProtocol.on(`plugin-${plugin.id}-${event}`, (data) => {
        const subscribers = this.eventSubscriptions[`${plugin.id}-${event}`]
        if (subscribers) {
          for (const subscriber of subscribers) {
            subscriber(data)
          }
        }
      })
    }
  }

  removePlugin(pluginId) {
    // Find plugin by ID
    const pluginIndex = this.plugins.findIndex((plugin) => plugin.id === pluginId)
    if (pluginIndex === -1) {
      return
    }

    // Remove plugin from internal data
    this.plugins.splice(pluginIndex, 1)

    // Send message to renderer process to update UI with removed plugin
    this.messageProtocol.sendRequest('renderer', 'plugin-removed', pluginId)

    // Unregister event listeners for the plugin
    for (const event of plugin.manifest.events) {
      this.messageProtocol.off(`plugin-${pluginId}-${event}`)
    }
  }

  executeAction(pluginId, action, data, callback) {
    // Check if plugin exists
    const plugin = this.plugins.find((plugin) => plugin.id === pluginId)
    if (!plugin) {
      callback(new Error('Plugin not found'))
      return
    }

    // Check if action exists for the plugin
    if (!plugin.actions[action]) {
      callback(new Error('Invalid action for plugin'))
      return
    }

    // Send request to plugin process to execute the action
    this.messageProtocol.sendRequest(pluginId, action, data, callback)
  }

  updatePlugin(pluginId, newVersion) {
    // Implement logic to download and install the new plugin version
    // ...

    // Update internal plugin data with new version information
    // ...

    // Send message to renderer process to update UI with plugin update
    this.messageProtocol.sendRequest('renderer', 'plugin-updated', pluginId)
  }

  findPlugin(pluginId) {
    return this.plugins.find((plugin) => plugin.id === pluginId)
  }

  getAllPlugins() {
    return this.plugins
  }

  subscribeToEvent(pluginId, event, callback) {
    const key = `${pluginId}-${event}`
    if (!this.eventSubscriptions[key]) {
      this.eventSubscriptions[key] = []
    }
    this.eventSubscriptions[key].push(callback)
  }

  unsubscribeToEvent(pluginId, event, callback) {
    const key = `${pluginId}-${event}`
    if (!this.eventSubscriptions[key]) return
    this.eventSubscriptions[key] = this.eventSubscriptions[key].filter(
      (subscriber) => subscriber !== callback
    )
  }
}

export default PluginAPI
