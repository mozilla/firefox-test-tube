from .base import *  # noqa


MIDDLEWARE.append('viewer.middleware.dev_cors_middleware')  # noqa
REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES'] = (  # noqa
    'rest_framework.permissions.AllowAny',
)
