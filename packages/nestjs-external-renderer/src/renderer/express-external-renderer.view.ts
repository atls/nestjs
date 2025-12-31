export interface ExpressExternalRendererViewParams {
  data?: Record<string, unknown>
  query?: Record<string, boolean | number | string>
  headers?: Record<string, string>
}

export class ExpressExternalRendererView {
  path: string

  baseUrl: string

  constructor(name: string, options: { root: string }) {
    this.baseUrl = options.root
    this.path = name
  }

  render(
    { data, query, headers }: ExpressExternalRendererViewParams,
    callback: (error: unknown, result?: string) => void
  ): void {
    this.exec(this.getUrl(query ?? {}), headers ?? {}, data ?? {})
      .then((result) => {
        callback(null, result)
      })
      .catch((error) => {
        callback(error)
      })
  }

  protected getUrl(query: Record<string, boolean | number | string> = {}): string {
    const url = new URL(this.path, this.baseUrl)

    Object.keys(query).forEach((key) => {
      url.searchParams.append(key, String(query[key]))
    })

    return url.toString()
  }

  protected async exec(
    url: string,
    headers: Record<string, string> = {},
    data: Record<string, unknown> = {}
  ): Promise<string> {
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
