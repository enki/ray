$.widget('ui.rayFilebrowser', $.extend($.ui.rayBase, {
    _init: function() {
        var ui = this;
        
        ui_opened = false;

        ui.dom = {
            layout:    $('<div id="ui-ray-filebrowser-layout">'),
            leftpane:   $('<div class="ui-layout-west" />'),
            centerpane: $('<div class="ui-layout-center" />'),
//            button: {
//                toggle: ui._button('ray-button-toggle',  'Toggle', 'carat-1-s', 'left'),
//                popup:  ui._button('ray-button-popup',   'Open in new window', 'newwin', 'right'),
//            },
            //toolbar: $('<div id="ray-toolbar" class="ui-widget-header ui-helper-reset ui-helper-clearfix" />'),
//          pathinfo: $('<span class="ui-ray-pathinfo" />'),
            filebrowser: $('<div id="ui-ray-filebrowser" class="ui-helper-reset ui-helper-clearfix">'),
            panes: $('<div class="ui-ray-filebrowser-panes" class="ui-helper-reset ui-helper-clearfix">'), 
        };

//      ui.dom.toolbar.append(ui.dom.pathinfo);
//      
//      ui._buttonSet('ray-browser-options', [
//          ui.dom.button.toggle.bind('click.rayFilebrowser', function(){
//              if ($('#ray-filebrowser-panes').is(':visible')) {
//                  $('#ray-button-toggle .ui-icon-carat-1-s')
//                      .removeClass('ui-icon-carat-1-s').addClass('ui-icon-carat-1-n');
//                  ui.close();
//              }
//              else {
//                  $('#ray-button-toggle .ui-icon-carat-1-n')
//                      .removeClass('ui-icon-carat-1-n').addClass('ui-icon-carat-1-s');
//                  ui.browse('');
//              }
//              ui._trigger('redraw');
//          }),
//          ui.dom.button.popup.bind('click.rayFilebrowser', function(){
//              ui._log('Todo: .. popup mode :|');
//          }),
//      ]).appendTo(ui.dom.toolbar);
        
        ui.element.bind('redraw.rayFilebrowser', function(e){
            ui.redraw();
        });

        ui.element.bind('dirSelected.rayFilebrowser', function(e){
            ui.browse(e.originalEvent.data.path);
        });

        ui.element.bind('dirOpened.rayFilebrowser', function(e){
            var rs, li, pane, list, path;

            rs   = e.originalEvent.data.content;
            if (rs && rs.path) {
                pane = $('<div class="ui-ray-filebrowser-pane" />').appendTo(ui.dom.panes);
                list = $('<ul class="ui-helper-reset" />').appendTo(pane);
                path = rs.path;

                ui.open();

                // Start by listing directory
                $.each(rs.dirs, function(i, obj) {
                    ui._create_link('dir', rs.base_path, obj+'/', obj).appendTo(list);
                });

                // Then list files
                $.each(rs.files, function(i, obj) {
                    ui._create_link('file', rs.base_path, obj, obj).appendTo(list);
                });

                ui._trigger('redraw');
            }
        });

        $('.ui-ray-filebrowser-pane ul li a')
            .live('click', function(e){
              var link = $(this);
              var next = $(this).parents('.ui-ray-filebrowser-pane').next('.ui-ray-filebrowser-pane');
              
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
        ui.dom.centerpane.append(ui.dom.filebrowser);
        var w = window.innerWidth;
        ui.element.rayWorkspace('layout', 'south', [ui.dom.centerpane, ui.dom.leftpane], {
            applyDefaultStyles: true,
            west: {
                size: w * 1.28 - w, // golden ratio is a bit too much here :|
            }
        });
        ui.browse('');
    },

    browse: function(path) {
        var ui = this;
        //ui.dom.pathinfo.text(path.replace('?path=', ''));
        ui._trigger('dirOpen', { path: path });
    },
    
    openFile: function(path) {
        var ui   = this;
    },

    redraw: function() {
        var ui = this;
        var h = ui.dom.filebrowser.parent().height();
        ui.dom.panes.height(h).find('.ui-ray-filebrowser-pane').height(h);
//        if (ui._opened) {
        //ui._set_height(ui.dom.filebrowser.parent().height() + 20)
        //ui.dom.filebrowser.height(h);
       // ui.dom.panes.height(h - 27).find('.ray-filebrowser-pane').height(h - 26);
//        }
    },


    contextMenu: function() {
        return [
            {label: 'Edit', className: 'edit' },
    //        {separator: true},
            {label: 'Copy', className: 'copy' },
            {label: 'Cut', className: 'cut'},
            {label: 'Paste', className: 'paste'},
        ];             
    },

    open: function() {
        var ui = this;
        if (!ui._opened) {
            ui._opened = true;
            ui.dom.filebrowser.find('> div:not(#ray-toolbar)').show();
        }
    },

    _create_link: function (type, path, target, label) {
        var ui = this;
        var p  = (path + target).replace(/\/\/+/, '/'); // Yeah.. well it works :)
        if (type == 'file') {
            type = type + ' '+ ui._get_file_extension(target);
        }
        return $('<li><a class="'+ type +'" href="?path='+ path + target + '">'+ label +'</a></li>');
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
/* Offer contextual menu support for the file browser
 * (right click menu)
 * */

//$.plugin('ui.rayFilebrowser.contextMenu', $.extend($.ui.rayBase, {
//    _init: function() {
//        var ui = this;
//        
//
//       	$('<ul id="ui-rayFilebrowser-contextMenu" class="contextMenu" />').hide().appendTo('body');
////          <li class="edit"><a href="#edit">Edit</a></li><li class="cut separator"><a href="#cut">Cut</a></li><li class="copy"><a href="#copy">Copy</a></li><li class="paste"><a href="#paste">Paste</a></li><li class="delete"><a href="#delete">Delete</a></li><li class="quit separator"><a href="#quit">Quit</a></li></ul>');
//        ui.element.bind('dirOpened.rayFilebrowser_contextMenu', function(e){
//            $('a.file, a.dir').parents('li').contextMenu({
//                menu: 'ui-rayFilebrowser-contextMenu'
//            },
//                function(action, el, pos) {
//                alert(
//                    'Action: ' + action + '\n\n' +
//                    'Element ID: ' + el + '\n\n' + 
//                    'X: ' + pos.x + '  Y: ' + pos.y + ' (relative to element)\n\n' + 
//                    'X: ' + pos.docX + '  Y: ' + pos.docY+ ' (relative to document)'
//                    );
//            });
//        });
//        /*
//        */
//    },
//    _menu_item: function() {
//        var link = $('<a />').text(label);
//        return $('<li />').append(link);
//    },
//}));
//
///* Gives basic contextual information on selected 
// * file or directory
// * */
//
//$.plugin('ui.rayFilebrowser.context', $.extend($.ui.rayBase, {
//    _init: function() {
//        var ui = this;
//        ui.dom = ui.options.widget.dom;
//        ui.dom.contextTabs = $('<div id="ui-ray-filebrowser-context-tabs"><ul /></div>');
//        ui.dom.context = $('<div class="ui-ray-filebrowser-context" />')
//                            .appendTo(ui.dom.leftpane).append(ui.dom.contextTabs).tabs({
//                                load: function (e, data){
//                                    data.path = ui._path;
//                                    ui._trigger('contextLoaded', data);
//                                }
//                            });
//        
//        ui.element.bind('fileSelected.rayFilebrowser_context, dirSelected.rayFilebrowser_context', function(e){
//            ui.context(e.originalEvent.data.path.replace('?path=', ''));
//        });
//        
//        ui.element.bind('redraw.rayFilebrowser_context', function(e){
//            ui.redraw();
//        });
//
//        // TODO: fix dirty hack
//        setTimeout(function(){
//            ui.context($('a.dir, a.file').attr('href').replace('?path=', ''));
//        }, 200);
//    },
//    context: function (p, tab) {
//        var ui  = this;
//        var url = '/ray/context/?path=';
//        if (ui.dom.context.tabs('length') > 0) {
//            ui.dom.context.tabs('url', tab || 0, url + p).tabs('load', tab || 0);
//        }
//        else {
//            ui.dom.context.tabs('add', url + p, 'General', tab || 0);
//        }
//        ui._path = p;
//    },
//    redraw: function () {
//        var ui = this;
//
//        //ui.dom.context.width(ui.dom.context.parent().width() - 1);
//
////        var pw = 0;
////        var panes = ui.dom.panes.find('.ui-ray-filebrowser-pane');
//
//
////        panes.each(function(){ pw = pw + $(this).width(); });
////      ui.dom.panes.width(pw + panes.length);
////      ui.dom.context
////              .css({
////                  marginLeft: pw,
////                  width: ui.dom.filebrowser.width() - (pw + panes.length) - 18,
////                  height:  ui.dom.filebrowser.height() - 40
////              });
//
////        ui.dom.context.find('.ui-tabs-panel ').height(50);
//
////        ui.dom.filebrowser.find('.ui-rayFilebrowser-context .ui-tabs-panel')
////                .height(ui.dom.filebrowser.height() - 40);
//    }
//}));

