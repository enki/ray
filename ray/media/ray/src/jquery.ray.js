/* Django Ray Editor
 *
 * For the moment this is a general purpose editor for django
 * aimed at easing live template/static file edition.
 * 
 * */

$.ui.rayBase = {

    _button: function(id, label, icon, corner) {
        return $('<button id="'+ id +'" class="ui-button ui-widget ui-state-default ui-button-icon-only ui-corner-'+ (corner || 'all') +'" role="button" title="'+ label +'">'+
                    '<span class="ui-button-icon-primary ui-icon ui-icon-'+ icon +'"></span><span class="ui-button-text">'+ label +'</span>'+
                '</button>').button();
     },
             
    //<button class="{button:{icons:{primary:'ui-icon-gear',secondary:'ui-icon-triangle-1-s'}}} ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icons" role="button"><span class="ui-button-icon-primary ui-icon ui-icon-gear"></span><span class="ui-button-text">Button with two icons</span><span class="ui-button-icon-secondary ui-icon ui-icon-triangle-1-s"></span></button>
    
    _buttonSet: function(id, buttons) {
        var bs = $('<span id="'+ id +'" class="ui-button-set" />');
        if (buttons) {
            $.each(buttons, function(i, btn) {
                btn.appendTo(bs);
            });
        }
        return bs.buttonset();
    },

    _build_buttons: function(appendTo) {
        var ui = this;

        var button = function(label, icon, corners, callback) {
            return ui._button('ray-button-'+ callback, label, icon, corners)
                        .bind('click.rayEditor', function(e) {
                            ui[callback].apply(ui, [e]); });
        };

        $.each(ui.options.buttons, function(){
            // button set
            if ($.isArray(this) && typeof(this[0]) == 'string') {
                var set   = [];
                var label = 'ray-window-'+ this[0];
                $.each(this, function(i, b){
                    if (i > 0) {
                        set.push(button(b.label, b.icon, 'none', b.callback));
                    }
                });
                ui._buttonSet(label, set).appendTo(appendTo);
            }
            // single button
            else if (this.callback) {
                button(this.label, this.icon, 'none', this.callback).appendTo(appendTo);
            }
        });
    },
};


$.widget('ui.ray', {
    _init: function() {

        var ui = this;
        // Initialte all plugins
        ui._plugins_call(function(ns, plugin, lazy) {
            if (!lazy  && ui.element[plugin]) {
                ui[ns] = ui.element[plugin]();
            }
        });

        ui.element.bind('fileOpened', function(e){
            ui.ws.rayWorkspace('e', e.originalEvent.data);
        });
        ui.element.bind('redraw', function(e){
            ui.redraw();
        });

        $(window).resize(ui.redraw);
    },

    redraw: function() {
        var ui = this;
        var h = this.notfirstdraw && 58 || 30;
        $('.CodeMirror-wrapping').height(document.documentElement.clientHeight - $('#ray-filebrowser').height() - h);
        this.notfirstdraw = true;
    },

    _plugins_call: function(method) {
        var ui = this;
        for (var i in $.ui.ray.defaults.plugins) {
            var p = $.ui.ray.defaults.plugins[i].split(':');
            method(p[0], p[1], p[2] && true || false);
        }
    },

    destroy: function() {
        ui.element.rayWorkspace('destroy').rayFilebrowser('destroy');
        $.widget.prototype.destroy.apply(this, arguments);
    }
});

$.ui.ray.defaults = {
    // List of plugins (ex: "ns:rayPluginName<:lazy>", where ns refers to the namespace)
    // Lazy means that the plugin is not initialized upon initial load.
    plugins: ['ed:rayMirrorEditor:lazy', 'ws:rayWorkspace', 'fb:rayFilebrowser'],

};

$(function(){
    $('body').ray();
});
