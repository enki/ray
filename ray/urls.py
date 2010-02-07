# -*- coding: utf-8 -*-

import datetime
from django.conf.urls.defaults import *
from django.conf import settings


urlpatterns = patterns('',
    url(r'^editor/$',       'ray.views.ray_editor', name='ray-editor'),
    url(r'^browse/$',       'ray.views.ray_browse', name='ray-browse'),
    url(r'^open/$',         'ray.views.ray_open', name='ray-open'),
) 


