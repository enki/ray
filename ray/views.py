from django.shortcuts import render_to_response


EDITABLE_TEMPLATE_DIR = '/home/h3/www/django-ray-sandbox/sandbox/templates/'
EDITOR_IGNORE    = ['.svn',]
# 'props', 'text-base', 'prop-base'

import os, json
from django.http import HttpResponse


def json_serve(i):
    return HttpResponse(json.dumps(i))

def walk(top_dir, ignore=[]):
    for dirpath, dirnames, filenames in os.walk(top_dir):
        dirnames[:] = [dn for dn in dirnames if dn not in ignore]
        yield dirpath, dirnames, filenames

def ray_open(request):
    if 'path' in request.GET:
        path = os.path.join(EDITABLE_TEMPLATE_DIR, request.GET['path'])
        print path
        fd = open(path, 'r')
        buf = fd.read()
        fd.close()
        out = {
            'path': path,
            'content': buf,
        }
    return json_serve(out)

def ray_browse(request):

    if 'path' in request.GET:
        path = os.path.join(EDITABLE_TEMPLATE_DIR, request.GET['path'])
    else:
        path = EDITABLE_TEMPLATE_DIR

    out = {
        'path':  path,
        'dirs':  [f for f in os.listdir(path) if os.path.isdir(os.path.join(path, f)) and f not in EDITOR_IGNORE],
        'files': [f for f in os.listdir(path) if os.path.isfile(os.path.join(path, f)) and f not in EDITOR_IGNORE],
    }

    
    return json_serve(out)

#   for p, d, f in walk(path, EDITOR_IGNORE):
#       print "-------------------------"
#       print "%s" % p
#       print "%s" % d
#       print "%s" % f
#       print "-------------------------"

#       if p == EDITABLE_TEMPLATE_DIR:
#           for file in f:
#               out.append({'path': os.path.join(p, file).replace(EDITABLE_TEMPLATE_DIR, ''), 'basename': file, 'type': 'file'})
#       else:
#           out.append({'path': p.replace(EDITABLE_TEMPLATE_DIR, ''), 'basename': os.path.basename(p), 'subdirs': d, 'files': f, 'type': (os.path.isdir(p) and 'dir' or 'file')})



#       if os.path.isdir(p) and os.path.basename(p) not in EDITOR_IGNORE:
#           dirs = []
#           for x in d:
#               if x not in EDITOR_IGNORE:
#                   dirs.append(x)
#           out.append({'path': p, 'subdirs': dirs, 'files': f, 'type': 'dir'})
#       elif os.path.isfile(p) and os.path.basename(p) not in EDITOR_IGNORE_FILES:
#           out.append({'path': p, 'subdirs': d, 'files': f, 'type': 'file'})



#   for dirname, dirnames, filenames in os.walk(path):
#       for subdirname in dirnames:
#           if subdirname not in EDITOR_IGNORE_DIRS:
#               out.append({'node': subdirname, 'dir': dirname, 'path': os.path.join(dirname, subdirname)})
#       for filename in filenames:
#           print " - %s" % filename
#           if filename not in EDITOR_IGNORE_FILES:
#               out.append({'node': filename, 'dir': dirname})
    
    


def ray_editor(request):
    return render_to_response('ray/editor.html')
