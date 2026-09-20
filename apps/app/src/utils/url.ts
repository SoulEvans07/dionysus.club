import { QueryParams } from '~/types/url';

export class UrlUtils {
  public static merge(url: string, query?: QueryParams): string {
    const params = this.buildParams(query);
    if (!params) return url;
    return `${url}?${params}`;
  }

  private static buildParams(query?: QueryParams): URLSearchParams | undefined {
    if (query === undefined) return undefined;

    const entries = Object.entries(query);
    if (entries.length === 0) return undefined;

    const params = entries.reduce((acc, [key, value]) => {
      if (value === undefined) return acc;

      if (Array.isArray(value)) {
        value.forEach((val) => acc.append(key, val.toString()));
      } else if (value === null) {
        acc.append(key, 'null');
      } else {
        acc.append(key, value.toString());
      }

      return acc;
    }, new URLSearchParams());
    if (params.size === 0) return undefined;

    return params;
  }
}
