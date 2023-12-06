import { PluginAPI } from './plugin-api'
import { MessageProtocol } from './message-protocol'

export class APIManager {
  private plugins: PluginAPI[] = []

  public getPluginList(): PluginAPI[] {
    return this.plugins.slice() // Copy the array to prevent mutation
  }

  public findPlugin(pluginId: string | number): PluginAPI | undefined {
    for (const plugin of this.plugins) {
      if (plugin.id === pluginId) {
        return plugin
      }
    }
    return undefined
  }

  public registerPlugin(plugin: PluginAPI): void {
    this.plugins.push(plugin)
  }

  public unregisterPlugin(plugin: PluginAPI): void {
    this.plugins = this.plugins.filter((p) => p !== plugin)
  }

  public updatePlugin(pluginId: string | number, updateFn: (plugin: PluginAPI) => void): void {
    const matchingPlugin = this.findPlugin(pluginId)
    if (matchingPlugin) {
      updateFn(matchingPlugin)
    }
  }

  public subscribeToPluginEvents(
    pluginId: string | number,
    eventType: string,
    handler: (event: any) => void
  ): void {
    const matchingPlugin = this.findPlugin(pluginId)
    if (matchingPlugin) {
      matchingPlugin.subscribeToEvent(eventType, handler)
    }
  }

  public unsubscribeFromPluginEvents(
    pluginId: string | number,
    eventType: string,
    handler: (event: any) => void
  ): void {
    const matchingPlugin = this.findPlugin(pluginId)
    if (matchingPlugin) {
      matchingPlugin.unsubscribeFromEvent(eventType, handler)
    }
  }

  public sendMessage(message: MessageProtocol): void {
    for (const plugin of this.plugins) {
      plugin.handleMessage(message)
    }
  }
}

export const apiManager = new APIManager()
