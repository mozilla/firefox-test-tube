from django.conf.urls import url

from .admin import admin_site
from .api import views as api_views
from .views import IndexView


urlpatterns = [
    # API v2
    url(r'^v2/experiments/$', api_views.experiments,
        name='v2-experiments'),
    url(r'^v2/experiments/(?P<exp_id>\d+)/$', api_views.experiment_by_id,
        name='v2-experiment-by-id'),
    url(r'^v2/experiments/(?P<exp_id>\d+)/metrics/(?P<metric_id>\d+)/$',
        api_views.metric_by_id, name='v2-metric-by-id'),

    # TODO: Auth

    # Admin
    # url(r'^admin/login/$', auth_views.login_view),
    url(r'^admin/', admin_site.urls),

    # The root index view for React.
    url(r'^$', IndexView.as_view(), name='index'),
]
