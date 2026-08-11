import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class ReeplApi implements ICredentialType {
  name = 'reeplApi';

  displayName = 'Reepl API';

  documentationUrl = 'https://developers.reepl.io';

  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Reepl API key from app.reepl.io/settings/api-keys',
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.reepl.io/v1',
      required: true,
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic' as const,
    properties: {
      headers: {
        'X-API-Key': '={{$credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.baseUrl}}',
      url: '/external/me',
      method: 'GET' as const,
    },
  };
}
