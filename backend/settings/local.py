from .base import *  # noqa


MIDDLEWARE.append('backend.middleware.dev_cors_middleware')  # noqa
REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES'] = (  # noqa
    'rest_framework.permissions.AllowAny',
)
