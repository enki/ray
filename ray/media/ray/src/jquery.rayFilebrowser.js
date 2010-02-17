$.widget('ui.rayFilebrowser', $.extend($.ui.rayBase, {
    _init: function() {
        var ui = this;
        
        ui_opened = false;

        ui.dom = {
            button: {
                toggle: ui._button('ray-button-toggle',  'Toggle', 'carat-1-s', 'left'),
                popup:  ui._button('ray-button-popup',   'Open in new window', 'newwin', 'right'),
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
                    $('#ray-button-toggle .ui-icon-carat-1-s')
                        .removeClass('ui-icon-carat-1-s').addClass('ui-icon-carat-1-n');
                    ui.close();
                }
                else {
                    $('#ray-button-toggle .ui-icon-carat-1-n')
                        .removeClass('ui-icon-carat-1-n').addClass('ui-icon-carat-1-s');
                    ui.browse('');
                }
                ui._trigger('redraw');
            }),
            ui.dom.button.popup.bind('click.rayFilebrowser', function(){
                ui._log('Todo: .. popup mode :|');
            }),
        ]).appendTo(ui.dom.toolbar);
        
        ui.element.bind('redraw.rayFilebrowser', function(e){
            ui.redraw();
        });

        ui.element.bind('dirSelected.rayFilebrowser', function(e){
            ui.browse(e.originalEvent.data.path);
        });

        
        ui.element.bind('dirOpened.rayFilebrowser', function(e){
            var rs, li, pane, list, path;

            rs   = e.originalEvent.data.content;
            pane = $('<div class="ray-filebrowser-pane" />').appendTo(ui.dom.panes);
            list = $('<ul />').appendTo(pane);
            path = rs.path;

            ui.open();
            
            // Start by listing directory
            $.each(rs.dirs, function(i, obj) {
                li = $('<li />').appendTo(list);
                $('<a class="dir" href="?path='+ rs.base_path + obj + '/">'+ obj +'</a>').appendTo(li);
            });

            // Then list files
            $.each(rs.files, function(i, obj) {
                li = $('<li />').appendTo(list);
                $('<a class="file" href="'+ rs.base_path + obj +'">'+ obj +'</a>')
                    .addClass(ui._get_file_extension(obj))
                    .appendTo(li);
            });

            ui._trigger('redraw');
        });

        $('.ray-filebrowser-pane ul li a')
            .live('click', function(e){
                var link = $(this);
                var next = $(this).parents('.ray-filebrowser-pane').next('.ray-filebrowser-pane');
                
                next.nextAll().remove().end().remove();
                link.addClass('selected').parent().siblings().find('a').removeClass('selected');

                // Directory
                if (link.hasClass('dir')) {
                    link.parent().siblings().find('a.dir').removeClass('opened');
                    link.addClass('opened');
                    ui._trigger('dirSelected', {path: link.attr('href')});
                }

                // File
                else {
                    ui._trigger('fileSelected', {path: link.attr('href')});
                    ui._trigger('redraw');
                }

                e.preventDefault();
                return false;
            })
            .live('dblclick', function(e){
                var url = $(this).attr('href');
                
                if ($(this).hasClass('file')) {
                    $(this).addClass('opened');
                    ui._trigger($.Event({
                        type: 'fileOpen',
                        data: { path: url.replace('?path=', '') }
                    }));
                }
                else {
                    $(this).trigger('click');
                }
                e.preventDefault();
                return false;
            })
            .live('mouseover', function(e){
                $(this).parent().addClass('ui-state-highlight');
            })
            .live('mouseleave', function(e){
                $(this).parent().removeClass('ui-state-highlight');
            });

        ui.dom.filebrowser.append(ui.dom.toolbar, ui.dom.panes);
        ui.element.append(ui.dom.filebrowser);
        ui._plugin_init();
        ui.browse('');
    },

    height: function(h) {
        var ui = this;
        if (h) {
            ui.dom.filebrowser.height(h);
            ui._trigger('redraw');
        }
        else {
            ui.dom.filebrowser.height();
        }
    },
    
    browse: function(path) {
        var ui = this;
        ui.dom.pathinfo.text(path.replace('?path=', ''));
        ui._trigger('dirOpen', { path: path });
    },
    
    openFile: function(path) {
        var ui   = this;
    },

    redraw: function() {
        var ui = this;
        if (ui._opened) {
            ui._set_height(parseInt(
                window.innerHeight - // let the ratio be golden..
                ((window.innerHeight * 1.61803399) - window.innerHeight)
            ));
        }
    },

    open: function() {
        var ui = this;
        if (!ui._opened) {
            ui._opened = true;
            ui.dom.filebrowser.find('> div:not(#ray-toolbar)').show();
        }
    },

    close: function() {
        var ui = this;
        
        if (ui._opened) {
            ui._opened = false;
            ui.dom.filebrowser.find('> div:not(#ray-toolbar)').hide();
            ui.dom.panes.empty();
            ui._set_height(25);
        }
        
    },

    _set_height: function (h, speed) {
        var ui = this;
        ui.dom.filebrowser.stop().animate({height: h}, speed || 100, function(){
            if (h > 25) {
                ui.dom.panes.height(h - 27).find('.ray-filebrowser-pane').height(h - 26);
            }
        });
    }
           
}));
 
$.ui.rayFilebrowser = {
    plugins: [],
    getter: 'height',
    defaults: {
        context: {
            test: 'yay'         
        }
    }
};

$.plugin = function(namespace, instance) {
    var s  = namespace.split('.');
    var ns = s[0];
    var widget = s[1];
    var plugin = s[2];
    // Create a widget
    if (ns && widget && plugin) {
        jQuery[ns][widget].plugins.push(plugin);
        $.widget(ns +'.'+ widget +'_'+ plugin, instance);
    }
}

/* Gives basic contextual information on selected file or directory
 *
 * */


$.plugin('ui.rayFilebrowser.context', $.extend($.ui.rayBase, {
    _init: function() {
        var ui = this;
        ui.dom = ui.options.widget.dom;

        ui.dom.contextTabs = $([
            '<div id="ui-rayFilebrowser-context-tabs"><ul>',
                '<li><a href="/ray/fileinfos/?path=jquery.slugify.js" id="ui-rayFilebrowser_context-general-tab"><span>General</span></a></li>',
                '<li><a href="/ray/svn/log/?path=base.html"><span>Subversion</span></a></li>',
                '<li><a href="/ray/fileinfos/?path=jquery.gTimeField.js"><span>Change log</span></a></li>',
            '</ul></div>'].join(''));
        
        ui.dom.context = $('<div class="ui-rayFilebrowser-context" />').appendTo(ui.dom.filebrowser);
        ui.dom.context.append(ui.dom.contextTabs).tabs();

        ui.element.bind('fileSelected.rayFilebrowser_context', function(e){
            ui.dom.context.tabs('url', 0, '/ray/fileinfos/?path='+ e.originalEvent.data.path).tabs('load', 0);
        });

        ui.element.bind('redraw.rayFilebrowser_context', function(e){
            ui.redraw();
        });
    },
    redraw: function() {
        var ui = this;
        var pw = 0;
        var panes = ui.dom.panes.find('.ray-filebrowser-pane');

        panes.each(function(){ pw = pw + $(this).width(); });

        ui.dom.panes.width(pw + panes.length);
        
        ui.dom.context
                .css('margin-left', pw)
                .width(ui.dom.filebrowser.width() - (pw + panes.length) + 1)
                .height((panes.height() * 2) - 38);

        ui.dom.filebrowser.find('.ui-rayFilebrowser-context .ui-tabs-panel')
                .height((panes.height() * 2) - 38);
    }
}));

