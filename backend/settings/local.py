from .base import *  # noqa


MIDDLEWARE.append('backend.middleware.dev_cors_middleware')  # noqa
# Uncomment the following to disable Auth0 on the Django Rest Framework API endpoints.
#REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES'] = ('rest_framework.permissions.AllowAny',) # noqa
