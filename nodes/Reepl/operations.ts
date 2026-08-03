export type ReeplOperation = {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  group: string;
  description: string;
};

export const REEPL_OPERATIONS: ReeplOperation[] = [
  { id: 'getCurrentUser', name: 'Get Current User', method: 'GET', path: '/external/me', group: 'User', description: 'Returns the authenticated user profile.' },
  { id: 'listDrafts', name: 'List Drafts', method: 'GET', path: '/external/drafts', group: 'Drafts', description: 'Lists drafts with optional pagination.' },
  { id: 'createDraft', name: 'Create Draft', method: 'POST', path: '/external/drafts', group: 'Drafts', description: 'Creates a new draft.' },
  { id: 'getDraft', name: 'Get Draft', method: 'GET', path: '/external/drafts/{draftId}', group: 'Drafts', description: 'Gets one draft.' },
  { id: 'updateDraft', name: 'Update Draft', method: 'PUT', path: '/external/drafts/{draftId}', group: 'Drafts', description: 'Updates a draft.' },
  { id: 'deleteDraft', name: 'Delete Draft', method: 'DELETE', path: '/external/drafts/{draftId}', group: 'Drafts', description: 'Deletes a draft.' },
  { id: 'listPosts', name: 'List Posts', method: 'GET', path: '/external/posts', group: 'Posts', description: 'Lists posts with optional filters.' },
  { id: 'publishPost', name: 'Publish Post', method: 'POST', path: '/external/posts/publish', group: 'Posts', description: 'Publishes a post immediately.' },
  { id: 'schedulePost', name: 'Schedule Post', method: 'POST', path: '/external/posts/schedule', group: 'Posts', description: 'Schedules a post for later.' },
  { id: 'updatePost', name: 'Update Post', method: 'PUT', path: '/external/posts/{postId}', group: 'Posts', description: 'Updates a scheduled post.' },
  { id: 'deletePost', name: 'Delete Post', method: 'DELETE', path: '/external/posts/{postId}', group: 'Posts', description: 'Deletes a scheduled post.' },
  { id: 'publishPostNow', name: 'Publish Post Now', method: 'POST', path: '/external/posts/{postId}/publish-now', group: 'Posts', description: 'Immediately publishes a scheduled post.' },
  { id: 'addComment', name: 'Add Comment', method: 'POST', path: '/external/posts/{postId}/comments', group: 'Posts', description: 'Adds a comment to a post.' },
  { id: 'checkVirality', name: 'Check Virality', method: 'POST', path: '/external/tools/virality', group: 'Tools', description: 'Analyzes content virality.' },
  { id: 'createCarousel', name: 'Create Carousel', method: 'POST', path: '/external/carousel', group: 'Carousel', description: 'Creates a carousel draft.' },
  { id: 'getCarousel', name: 'Get Carousel', method: 'GET', path: '/external/carousel/{draftId}', group: 'Carousel', description: 'Gets one carousel draft.' },
  { id: 'updateCarousel', name: 'Update Carousel', method: 'PUT', path: '/external/carousel/{draftId}', group: 'Carousel', description: 'Updates a carousel draft.' },
  { id: 'deleteCarousel', name: 'Delete Carousel', method: 'DELETE', path: '/external/carousel/{draftId}', group: 'Carousel', description: 'Deletes a carousel draft.' },
  { id: 'listWebhookSubscriptions', name: 'List Webhook Subscriptions', method: 'GET', path: '/external/webhooks/subscriptions', group: 'Webhooks', description: 'Lists webhook subscriptions.' },
  { id: 'createWebhookSubscription', name: 'Create Webhook Subscription', method: 'POST', path: '/external/webhooks/subscriptions', group: 'Webhooks', description: 'Creates a webhook subscription.' },
  { id: 'getWebhookSubscription', name: 'Get Webhook Subscription', method: 'GET', path: '/external/webhooks/subscriptions/{subscriptionId}', group: 'Webhooks', description: 'Gets one webhook subscription.' },
  { id: 'updateWebhookSubscription', name: 'Update Webhook Subscription', method: 'PUT', path: '/external/webhooks/subscriptions/{subscriptionId}', group: 'Webhooks', description: 'Updates a webhook subscription.' },
  { id: 'deleteWebhookSubscription', name: 'Delete Webhook Subscription', method: 'DELETE', path: '/external/webhooks/subscriptions/{subscriptionId}', group: 'Webhooks', description: 'Deletes a webhook subscription.' },
  { id: 'testWebhook', name: 'Send Test Webhook', method: 'POST', path: '/external/webhooks/test', group: 'Webhooks', description: 'Sends a signed test webhook.' }
];

export const REEPL_OPERATION_MAP = Object.fromEntries(
  REEPL_OPERATIONS.map((operation) => [operation.id, operation])
);
