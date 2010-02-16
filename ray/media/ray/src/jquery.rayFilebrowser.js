$.widget('ui.rayFilebrowser', $.extend($.ui.rayBase, {
    _init: function() {
        var ui = this;
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
                ui.element.trigger($.Event({type:'redraw'}));
            }),
            ui.dom.button.popup.bind('click.rayFilebrowser', function(){
                console.log('Todo: .. popup mode :|');
            }),
        ]).appendTo(ui.dom.toolbar);
        
        $('.ray-filebrowser-pane ul li a').live('click', function(e){
            var url = $(this).attr('href');
            $(this).addClass('opened').parent().siblings().find('a.dir').removeClass('opened');
            var next = $(this).parents('.ray-filebrowser-pane').next('.ray-filebrowser-pane');
            if (next.get(0)) {
                next.nextAll().remove();
                next.remove();
            }
            if ($(this).hasClass('file')) {
                ui.openFile(url);
            }
            else {
                ui.dom.pathinfo.text(url.replace('?path=', ''));
                ui.browse(url);
            }
            e.preventDefault();
            return false;
        });

        $('.ray-filebrowser-pane ul li a')
            .live('mouseover', function(e){
                $(this).parent().addClass('ui-state-highlight');
            })
            .live('mouseleave', function(e){
                $(this).parent().removeClass('ui-state-highlight');
            })
            .live('dblclick', function(e){
                $(this).trigger('click');
                ui.close();
            });



        // console.log TODO: REMOVE
//        ui.openFile('?path=blog/base_posts.html');
        $(window).bind('resize.rayFilebrowser', function(){
            ui.redraw();
        });
        ui.dom.filebrowser.append(ui.dom.toolbar, ui.dom.panes);
        ui.element.append(ui.dom.filebrowser);
        //ui._plugins_call(ui, '_init', ['test']);
        ui._plugin_init()
        ui.browse('');
    },

    height: function(h) {
        var ui = this;
        if (h) {
            ui.dom.filebrowser.height(h);
            ui.redraw();
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
                    $('<a class="file" href="'+ p +'">'+ obj +'</a>')
                        .addClass(ui._get_file_extension(p))
                        .appendTo(li);
                });
               
//                $('#ray-filebrowser:hidden').height(window.innerHeight * 1.61803399 - window.innerHeight).show();
                ui.element.trigger($.Event({
                    type: 'folderOpened',
                    data: {
                    }
                }));
                ui.redraw();
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

    redraw: function() {
        var ui = this;
        var h  = parseInt(window.innerHeight - ((window.innerHeight * 1.61803399) - window.innerHeight));
        ui.dom.filebrowser.height(h);
        ui.dom.panes.height(h - 27);
        $('.ray-filebrowser-pane').height(h - 26);
    },

    open: function() {
        var ui = this;
        ui.dom.panes.show();
    },

    close: function() {
        var ui = this;
        ui.dom.filebrowser.height(25);
        ui.dom.panes.hide().empty();
    },
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

        ui.element.bind('fileOpened.rayFilebrowser_context', function(e){
            ui.dom.contextTabs.find('a:first').attr('href', '/ray/fileinfos/?path='+ e.originalEvent.data.path).trigger('click');
            ui.redraw();
        });

        ui.element.bind('folderOpened.rayFilebrowser_context', function(e){
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

