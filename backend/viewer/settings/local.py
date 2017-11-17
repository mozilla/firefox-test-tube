from .base import *


MIDDLEWARE.append('viewer.middleware.dev_cors_middleware')
REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES'] = (
    'rest_framework.permissions.AllowAny',
)
