export const API_PREFIX = '/api/v1'
export const OPENAPI_PATH = '/openapi.json'
export const API_DOCS_PATH = '/docs'

export const OPENAPI_DOCUMENT = {
  openapi: '3.1.0',
  info: {
    title: 'Store Check API',
    version: '0.1.0',
    description:
      'Multi-tenant API for organizations, locations, inventory and store operations.',
  },
  tags: [
    {
      name: 'System',
      description: 'Service availability and operational endpoints.',
    },
    {
      name: 'Invitations',
      description: 'Invitation-only registration and membership provisioning.',
    },
    {
      name: 'Users',
      description: 'User profile management and platform user administration.',
    },
  ],
} as const
