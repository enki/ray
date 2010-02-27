# -*- coding: utf-8 -*-

import datetime
from django.conf.urls.defaults import *
from django.conf import settings


urlpatterns = patterns('',
    url(r'^editor/$',       'ray.views.ray_editor',     name='ray-editor'),
    url(r'^layout/$',       'ray.views.ray_layout',     name='ray-layout'),
    url(r'^browse/$',       'ray.views.ray_browse',     name='ray-browse'),
    url(r'^open/$',         'ray.views.ray_open',       name='ray-open'),
    url(r'^context/$',      'ray.views.ray_context',    name='ray-context'),
    url(r'^svn/log/$',      'ray.views.ray_svn_log',    name='ray-svn-log'),
    # TODO: find a less hacking way ..
    url(r'^media/(.*)$', 'django.views.static.serve', {'document_root': '/home/h3/www/django-ray-sandbox/sandbox/templates/', 'show_indexes': True}),
) 

