import os
import time
import json

from django.http import HttpResponse
from django.shortcuts import render_to_response

import settings

def prettySize(size):
    '''
    Returns a string formatted human-readable size from an initial size in bits.
    '''
    suffixes = [("B",2**10), ("K",2**20), ("M",2**30), ("G",2**40), ("T",2**50)]
    for suf, lim in suffixes:
        if size > lim:
            continue
        else:
            return round(size/float(lim/2**10),2).__str__()+suf

def json_serve(i):
    '''
    Returns a json formatted dictionary as an HttpResponse
    '''
    return HttpResponse(json.dumps(i))

def walk(top_dir, ignore=[]):
    '''
    TODO: document
    '''
    for dirpath, dirnames, filenames in os.walk(top_dir):
        dirnames[:] = [dn for dn in dirnames if dn not in ignore]
        yield dirpath, dirnames, filenames

def ray_svn_log(request):
    '''
    TODO: document
    '''
    return render_to_response('ray/context/svn-log.html')

def ray_context(request):
    '''
    TODO: document
    '''
    if 'path' in request.GET:
        path = os.path.join(settings.EDITABLE_TEMPLATE_DIR, request.GET['path'])
        info = os.stat(path)
        out = {
            'path': path,
            'file': {
                'filename': os.path.basename(path) or os.path.dirname(path),
                'size':  prettySize(info.st_size),
                'mtime': time.ctime(info.st_mtime),
                'ctime': time.ctime(info.st_ctime),
                'atime': time.ctime(info.st_atime),
            }
        }
    return render_to_response('ray/context/fileinfos.html', out)

def ray_open(request):
    '''
    TODO: document
    '''
    if 'path' in request.GET:
        path = os.path.join(settings.EDITABLE_TEMPLATE_DIR, request.GET['path'])
        fd = open(path, 'r')
        buf = fd.read()
        fd.close()
        out = {
            'path': path,
            'content': buf,
        }
    return json_serve(out)

def ray_browse(request):
    '''
    TODO: document
    '''
    if 'path' in request.GET:
        base_path = request.GET['path']
        path = os.path.join(settings.EDITABLE_TEMPLATE_DIR, request.GET['path'])
    else:
        base_path = ''
        path = settings.EDITABLE_TEMPLATE_DIR

    out = {
        'path':  path,
        'base_path': base_path,
        'dirs':  [f for f in os.listdir(path) if os.path.isdir(os.path.join(path, f))  and f not in settings.EDITOR_IGNORE],
        'files': [f for f in os.listdir(path) if os.path.isfile(os.path.join(path, f)) and f not in settings.EDITOR_IGNORE],
    }

    
    return json_serve(out)

#   for p, d, f in walk(path, settings.EDITOR_IGNORE):
#       print "-------------------------"
#       print "%s" % p
#       print "%s" % d
#       print "%s" % f
#       print "-------------------------"

#       if p == settings.EDITABLE_TEMPLATE_DIR:
#           for file in f:
#               out.append({'path': os.path.join(p, file).replace(settings.EDITABLE_TEMPLATE_DIR, ''), 'basename': file, 'type': 'file'})
#       else:
#           out.append({'path': p.replace(settings.EDITABLE_TEMPLATE_DIR, ''), 'basename': os.path.basename(p), 'subdirs': d, 'files': f, 'type': (os.path.isdir(p) and 'dir' or 'file')})



#       if os.path.isdir(p) and os.path.basename(p) not in settings.EDITOR_IGNORE:
#           dirs = []
#           for x in d:
#               if x not in settings.EDITOR_IGNORE:
#                   dirs.append(x)
#           out.append({'path': p, 'subdirs': dirs, 'files': f, 'type': 'dir'})
#       elif os.path.isfile(p) and os.path.basename(p) not in settings.EDITOR_IGNORE_FILES:
#           out.append({'path': p, 'subdirs': d, 'files': f, 'type': 'file'})



#   for dirname, dirnames, filenames in os.walk(path):
#       for subdirname in dirnames:
#           if subdirname not in settings.EDITOR_IGNORE_DIRS:
#               out.append({'node': subdirname, 'dir': dirname, 'path': os.path.join(dirname, subdirname)})
#       for filename in filenames:
#           print " - %s" % filename
#           if filename not in settings.EDITOR_IGNORE_FILES:
#               out.append({'node': filename, 'dir': dirname})

def ray_editor(request):
    '''
    TODO: document
    '''
    return render_to_response('ray/editor.html')
