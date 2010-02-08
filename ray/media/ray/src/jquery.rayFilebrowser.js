$.widget('ui.rayFilebrowser', $.extend($.ui.rayBase, {
    _init: function() {
        var ui = this;
        ui.dom = {
            button: {
                toggle: ui._button('ray-button-undo',  'Toggle', 'carat-1-s', 'all'),
            },
            toolbar: $('<div id="ray-toolbar" class="ui-widget-header ui-helper-reset ui-helper-clearfix" />'),
            pathinfo: $('<span class="ui-ray-pathinfo" />'),
            filebrowser: $('<div id="ray-filebrowser" class="ui-helper-reset ui-helper-clearfix">'),
            panes: $('<div id="ray-filebrowser-panes" class="ui-helper-reset ui-helper-clearfix">'),
        };

        ui.dom.toolbar.append(ui.dom.pathinfo);
        
        ui._buttonSet('ray-browser-options', [
            ui.dom.button.toggle.bind('click.rayFilebrowser', function(){
                if ($('#ray-filebrowser-panes').is(':visible')) {
                    ui.close();
                }
                else {
                    ui.browse('');
                }
                ui.element.trigger($.Event({type:'redraw'}));
            }),
        ]).appendTo(ui.dom.toolbar);
        
        $('.ray-filebrowser-pane ul li a').live('click', function(e){
            var url = $(this).attr('href');
            $(this).addClass('opened').parent().siblings().find('a').removeClass('opened');
            var next = $(this).parents('.ray-filebrowser-pane').next('.ray-filebrowser-pane');
            if (next.get(0)) {
                next.nextAll().remove();
                next.remove();
            }
            if ($(this).hasClass('file')) {
                ui.openFile(url);
            }
            else {
                ui.browse(url);
            }
            ui.dom.pathinfo.text(url.replace('?path=', ''));
            e.preventDefault();
            return false;
        });
        $('.ray-filebrowser-pane ul li a').live('dblclick', function(e){
            $(this).trigger('click');
            ui.close();
        });
        ui.openFile('?path=blog/base_posts.html');
        ui.dom.filebrowser.append(ui.dom.toolbar, ui.dom.panes);
        ui.element.append(ui.dom.filebrowser);
        ui.browse('');
    },

    height: function(h) {
        var ui = this;
        if (h) {
        
        }
        else {
            ui.dom.filebrowser.height();
        }
    },
    
    browse: function(path) {
        var ui   = this;
        var base = '/ray/browse/';
        var pane = $('<div class="ray-filebrowser-pane" />').appendTo(ui.dom.panes);
        var list = $('<ul />').appendTo(pane);
        var url  = base + path;
        $.getJSON(url, function(rs, status){
            if (status == 'success') {
                ui.open();
                pane.data('rs', rs);

                $.each(rs.dirs, function(i, obj) {
                    var p = /\?path=/.test(path) && path + obj + '/' || '?path=' + obj +'/';

                    var li = $('<li />').appendTo(list);
                    $('<a class="dir" href="'+ p +'">'+ obj +'</a>').appendTo(li);
                });
                $.each(rs.files, function(i, obj) {
                    var p = /\?path=/.test(path) && path + obj || '?path=' + obj;
                    var li = $('<li />').appendTo(list);
                    $('<a class="file" href="'+ p +'">'+ obj +'</a>').appendTo(li);
                });
                var h = 0;
                $.each($('.ray-filebrowser-pane'),function(){
                    var nh = $(this).height();
                    if (h < nh) { h = nh; }
                });
                $('.ray-filebrowser-pane').height(h);
               
//                $('#ray-filebrowser:hidden').height(window.innerHeight * 1.61803399 - window.innerHeight).show();

                ui.element.trigger($.Event({type:'redraw'}));
 
            }
        });
    },
    
    openFile: function(path) {
        var ui   = this;
        var base = '/ray/open/';
        var url  = base + path;
        $.getJSON(url, function(rs, status){
            if (status == 'success') {
                //ui.ws.rayWorkspace('e', );
                ui.element.trigger($.Event({
                    type: 'fileOpened',
                    data: {
                        path: path.replace('?path=', ''),
                        syntax: 'html',
                        content: rs.content,
                    }
                }));
            }
        });
    },

    open: function() {
        var ui = this;
        ui.dom.filebrowser.height(parseInt(window.innerHeight - ((window.innerHeight * 1.61803399) - window.innerHeight)));
        ui.dom.panes.height(parseInt(window.innerHeight - ((window.innerHeight * 1.61803399) - window.innerHeight)) - 25);
        ui.dom.panes.show();
    },

    close: function() {
        var ui = this;
        ui.dom.filebrowser.height(25);
        ui.dom.panes.hide().empty();
    },
}));
 
$.ui.rayFilebrowser.getter = {
    getter: 'height',
};
