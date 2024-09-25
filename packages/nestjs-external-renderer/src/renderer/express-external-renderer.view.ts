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

  // eslint-disable-next-line @typescript-eslint/ban-types
  render({ data, query, headers }: ExpressExternalRendererViewParams, callback: Function): void {
    this.exec(this.getUrl(query), headers, data)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      .then((result) => callback(null, result))
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      .catch((error) => callback(error))
  }

  protected getUrl(query = {}): string {
    const url = new URL(this.path, this.baseUrl)

    Object.keys(query).forEach((key) => {
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      url.searchParams.append(key, query[key])
    })

    return url.toString()
  }

  protected async exec(url: string, headers = {}, data = {}): Promise<string> {
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
