export interface ExpressExternalRendererViewParams {
  data?: object
  query?: object
  headers?: object
}

export class ExpressExternalRendererView {
  path: string

  baseUrl: string

  constructor(name: string, options: { root: string }) {
    this.baseUrl = options.root
    this.path = name
  }

  render({ data, query, headers }: ExpressExternalRendererViewParams, callback: Function) {
    this.exec(this.getUrl(query), headers, data)
      .then((result) => callback(null, result))
      .catch((error) => callback(error))
  }

  protected getUrl(query = {}) {
    const url = new URL(this.path, this.baseUrl)

    Object.keys(query).forEach((key) => {
      // @ts-ignore
      url.searchParams.append(key, query[key])
    })

    return url.toString()
  }

  protected async exec(url: string, headers = {}, data = {}) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    return response.text()
  }
}
