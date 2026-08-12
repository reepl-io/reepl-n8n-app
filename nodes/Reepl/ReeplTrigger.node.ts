import crypto from 'node:crypto';
import type {
  IDataObject,
  IHookFunctions,
  IHttpRequestOptions,
  IWebhookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { getBaseUrl, REEPL_TRIGGER_EVENTS } from './helpers';

type WebhookSubscription = {
  subscriptionId?: string;
  targetUrl?: string;
  eventTypes?: string[];
  secret?: string;
};

type WebhookResponse = {
  subscription?: WebhookSubscription;
  subscriptions?: WebhookSubscription[];
};

async function apiRequest(
  context: IHookFunctions,
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body?: IDataObject,
): Promise<WebhookResponse> {
  const credentials = await context.getCredentials('reeplApi');
  const options: IHttpRequestOptions = {
    method,
    url: `${getBaseUrl(credentials)}${path}`,
    json: true,
  };

  if (body) {
    options.body = body;
  }

  return await context.helpers.httpRequestWithAuthentication.call(context, 'reeplApi', options) as WebhookResponse;
}

function getEventType(context: IHookFunctions): string {
  return context.getNodeParameter('eventType') as string;
}

function getStoredSubscription(context: IHookFunctions): IDataObject {
  return context.getWorkflowStaticData('node');
}

function isMissingSubscriptionError(error: unknown): boolean {
  const candidate = error as { statusCode?: number; response?: { statusCode?: number } };
  return candidate.statusCode === 404 || candidate.statusCode === 410 || candidate.response?.statusCode === 404 || candidate.response?.statusCode === 410;
}

function getHeader(headers: IDataObject, name: string): string {
  const key = Object.keys(headers).find((header) => header.toLowerCase() === name.toLowerCase());
  return key ? String(headers[key]) : '';
}

function isValidSignature(secret: string, timestamp: string, signatureHeader: string, body: IDataObject): boolean {
  const providedSignature = signatureHeader.split('v1=')[1] || '';
  if (!timestamp || !providedSignature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${JSON.stringify(body)}`)
    .digest('hex');
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);

  return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
}

export class ReeplTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Reepl Trigger',
    name: 'reeplTrigger',
    icon: {
      light: 'file:reepl.svg',
      dark: 'file:reepl.dark.svg',
    },
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["eventType"]}}',
    description: 'Starts a workflow when a Reepl webhook event occurs',
    defaults: {
      name: 'Reepl Trigger',
    },
    inputs: [],
    outputs: [NodeConnectionTypes.Main],
    credentials: [
      {
        name: 'reeplApi',
        required: true,
      },
    ],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
      {
        displayName: 'Event',
        name: 'eventType',
        type: 'options',
        options: [...REEPL_TRIGGER_EVENTS],
        default: 'post_published',
        required: true,
        description: 'The Reepl event that starts this workflow. Webhook subscriptions require a paid Reepl plan and the webhooks:manage API-key scope.',
      },
      {
        displayName: 'Security Notice',
        name: 'securityNotice',
        type: 'notice',
        default: 'Reepl signs every webhook delivery. The trigger verifies the signature when the subscription secret is available.',
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl('default');
        const eventType = getEventType(this);
        const response = await apiRequest(this, 'GET', '/external/webhooks/subscriptions');
        const subscription = (response.subscriptions || []).find((candidate) =>
          candidate.targetUrl === webhookUrl && candidate.eventTypes?.includes(eventType),
        );

        if (!subscription?.subscriptionId) {
          return false;
        }

        const stored = getStoredSubscription(this);
        stored.subscriptionId = subscription.subscriptionId;
        return true;
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl('default');
        const eventType = getEventType(this);
        const response = await apiRequest(this, 'POST', '/external/webhooks/subscriptions', {
          targetUrl: webhookUrl,
          eventTypes: [eventType],
          platform: 'n8n',
        });
        const subscription = response.subscription;

        if (!subscription?.subscriptionId) {
          return false;
        }

        const stored = getStoredSubscription(this);
        stored.subscriptionId = subscription.subscriptionId;
        if (subscription.secret) {
          stored.secret = subscription.secret;
        }
        return true;
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const stored = getStoredSubscription(this);
        const subscriptionId = stored.subscriptionId as string | undefined;

        if (!subscriptionId) {
          return true;
        }

        try {
          await apiRequest(this, 'DELETE', `/external/webhooks/subscriptions/${encodeURIComponent(subscriptionId)}`);
        } catch (error) {
          if (!isMissingSubscriptionError(error)) {
            return false;
          }
        }

        delete stored.subscriptionId;
        delete stored.secret;
        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const bodyData = this.getBodyData() as IDataObject;
    const headers = this.getHeaderData();
    const stored = this.getWorkflowStaticData('node');
    const secret = stored.secret as string | undefined;

    if (secret && !isValidSignature(
      secret,
      getHeader(headers, 'X-Reepl-Webhook-Timestamp'),
      getHeader(headers, 'X-Reepl-Webhook-Signature'),
      bodyData,
    )) {
      const response = this.getResponseObject();
      response.status(401).json({ message: 'Invalid Reepl webhook signature' });
      return { noWebhookResponse: true };
    }

    return {
      workflowData: [this.helpers.returnJsonArray(bodyData)],
    };
  }
}
