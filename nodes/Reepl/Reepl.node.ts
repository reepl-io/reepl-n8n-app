import type {
  IDataObject,
  IHttpRequestOptions,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  INodePropertyOptions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { REEPL_OPERATION_MAP, REEPL_OPERATIONS } from './operations';
import { getBaseUrl, interpolatePath, parseJsonObject } from './helpers';

const operationOptions: INodePropertyOptions[] = REEPL_OPERATIONS.map((operation) => ({
  name: `${operation.group}: ${operation.name}`,
  value: operation.id,
  description: `${operation.method} ${operation.path}`,
}));

export class Reepl implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Reepl',
    name: 'reepl',
    icon: 'file:reepl.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Execute Reepl External API operations with API-key auth',
    defaults: {
      name: 'Reepl',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'reeplApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        options: operationOptions,
        default: 'getCurrentUser',
        required: true,
      },
      {
        displayName: 'Path Params (JSON)',
        name: 'pathParamsJson',
        type: 'json',
        default: '{}',
        required: false,
        description: 'JSON object used to fill path placeholders like {postId}',
      },
      {
        displayName: 'Query Params (JSON)',
        name: 'queryJson',
        type: 'json',
        default: '{}',
        required: false,
        description: 'JSON object used as query string parameters',
      },
      {
        displayName: 'Body (JSON)',
        name: 'bodyJson',
        type: 'json',
        default: '{}',
        required: false,
        description: 'JSON request body for POST/PUT operations',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const credentials = await this.getCredentials('reeplApi');
    const baseUrl = getBaseUrl(credentials);

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        const operationId = this.getNodeParameter('operation', itemIndex) as string;
        const operation = REEPL_OPERATION_MAP[operationId];

        if (!operation) {
          throw new Error(`Unsupported operation: ${operationId}`);
        }

        const pathParams = parseJsonObject(this.getNodeParameter('pathParamsJson', itemIndex), 'pathParamsJson', itemIndex);
        const query = parseJsonObject(this.getNodeParameter('queryJson', itemIndex), 'queryJson', itemIndex);
        const body = parseJsonObject(this.getNodeParameter('bodyJson', itemIndex), 'bodyJson', itemIndex);

        const path = interpolatePath(operation.path, pathParams);

        const options: IHttpRequestOptions = {
          method: operation.method,
          url: `${baseUrl}${path}`,
          json: true,
        };

        if (Object.keys(query).length > 0) {
          options.qs = query;
        }

        if (['POST', 'PUT', 'PATCH'].includes(operation.method) && Object.keys(body).length > 0) {
          options.body = body;
        }

        const response = await this.helpers.httpRequestWithAuthentication.call(this, 'reeplApi', options);

        returnData.push({
          json: {
            operationId,
            method: operation.method,
            path,
            data: response,
          },
          pairedItem: { item: itemIndex },
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message,
            },
            pairedItem: { item: itemIndex },
          });
          continue;
        }

        throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
      }
    }

    return [returnData];
  }
}
