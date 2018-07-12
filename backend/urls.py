from django.urls import include, path, re_path

from .admin import admin_site
from .api import views as api_views
from .views import IndexView


urlpatterns = [
    # API v2
    path('v2/experiments/',
         api_views.experiments, name='v2-experiments'),
    path('v2/experiments/<slug:exp_slug>/',
         api_views.experiment_by_slug, name='v2-experiment-by-slug'),
    path('v2/experiments/<slug:exp_slug>/populations/',
         api_views.experiment_populations, name='v2-experiment-populations'),
    path('v2/experiments/<slug:exp_slug>/enrolls/',
         api_views.experiment_enrolls, name='v2-experiment-enrolls'),
    path('v2/experiments/<int:exp_id>/metrics/<int:metric_id>/',
         api_views.metric_by_id, name='v2-metric-by-id'),
    path('v2/enrollment/', api_views.enrollment, name='v2-enrollment'),

    # Auth0
    path('accounts/', include('mozilla_django_oidc.urls')),

    # Admin
    path('admin/', admin_site.urls),

    # Send everything else to React
    re_path(r'.*', IndexView.as_view(), name='index'),
]
