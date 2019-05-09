from django.urls import path

from .api import views as api_views


urlpatterns = [
    # API v2
    path('v2/enrollment/', api_views.enrollment, name='v2-enrollment'),
]
