import type { IDataObject } from 'n8n-workflow';

export const REEPL_API_DEFAULT_BASE_URL = 'https://api.reepl.io/v1';

export const REEPL_TRIGGER_EVENTS = [
  {
    name: 'Post Published',
    value: 'post_published',
    description: 'A LinkedIn post has been published through Reepl',
  },
  {
    name: 'Draft Created',
    value: 'draft_created',
    description: 'A new LinkedIn draft has been created in Reepl',
  },
  {
    name: 'Publish Failed',
    value: 'publish_failed',
    description: 'A scheduled LinkedIn post failed to publish',
  },
] as const;

export function getBaseUrl(credentials: IDataObject): string {
  const configuredBaseUrl = String(credentials.baseUrl || REEPL_API_DEFAULT_BASE_URL);
  return configuredBaseUrl.replace(/\/+$/, '');
}

export function parseJsonObject(value: unknown, parameterName: string, itemIndex?: number): IDataObject {
  if (value === undefined || value === null || value === '') {
    return {};
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as IDataObject;
  }

  if (typeof value !== 'string') {
    throw new Error(`Expected ${parameterName} to be a JSON object${itemIndex === undefined ? '' : ` on item ${itemIndex}`}`);
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('value must be a JSON object');
    }
    return parsed as IDataObject;
  } catch (error) {
    throw new Error(`Invalid JSON for ${parameterName}${itemIndex === undefined ? '' : ` on item ${itemIndex}`}: ${(error as Error).message}`);
  }
}

export function interpolatePath(pathTemplate: string, pathParams: IDataObject): string {
  return pathTemplate.replace(/\{([^}]+)\}/g, (_, key: string) => {
    const rawValue = pathParams[key];
    if (rawValue === undefined || rawValue === null || rawValue === '') {
      throw new Error(`Missing path parameter: ${key}`);
    }
    return encodeURIComponent(String(rawValue));
  });
}

