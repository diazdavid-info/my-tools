import { Handler } from './index'

export default class Route {
  private readonly route: Record<string, Record<string, Handler>>

  constructor() {
    this.route = {}
  }

  add(method: string, path: string, handler: Handler) {
    this.route[method] = {
      ...this.route[method],
      [path]: handler
    }
  }

  getByMethod(method: string) {
    return this.route[method]
  }

  getHandler(method: string, path: string) {
    return this.route[method][path]
  }
}
