/* Django Ray Editor
 * */

/* Creates a plugins, which is basically a widget
 * loosely binded to a parent widget
 */

$.plugin = function(namespace, instance) {
    var s  = namespace.split('.');
    var ns = s[0];
    var widget = s[1];
    var plugin = s[2];

    // Create the child widget
    if (ns && widget && plugin) {
        jQuery[ns][widget].plugins.push(plugin);
        $.widget(ns +'.'+ widget +'_'+ plugin, instance);
    }
}

$.ui.rayBase = {

    /* Initialiaze all plugins. This can be confusing at first
     * since it's almost recursive .. ray has plugins like rayFilebrowser,
     * rayWorkspace and such .. but plugins themselves can have plugins
     * that also need initialization. Get it ? :)
     * */
    plugin_init: function (widgetName) {
        var ui = this;
        var widget, plugin, wn, wdg, opt;
        wn = widgetName || ui.widgetName;
        widget = jQuery[ui.namespace][wn];
        for (var x in widget.plugins) {
            plugin = widget.plugins[x];
            opt = $.extend((this.options[plugin] || {}), {widget: this});
            wdg = (wn != 'ray') && this.widgetName +'_'+ plugin || plugin.split(':')[0];
            $(ui.element)[wdg](opt);
            $(ui.element)[wdg]('plugin_init');
        }
    },

    /* Works like $.each but apply the callback method
     * to for each plugin with it as context.
     * */
    _plugins_call: function (method) {
        var ui = this;
        var widget, p;
        widget = jQuery[ui.namespace][ui.widgetName];
        for (var x in widget.plugins) {
            p = widget.plugins[x].split(':');
            method(p[0], p[1] && true || false);
        }
    },


    /* Create a button widget
     * */
    _button: function (id, label, icon, corner) {
        return $('<button id="'+ id +'" class="ui-button ui-widget ui-state-default ui-button-icon-only ui-corner-'+ (corner || 'all') +'" role="button" title="'+ label +'">'+
                    '<span class="ui-button-icon-primary ui-icon ui-icon-'+ icon +'"></span><span class="ui-button-text">'+ label +'</span>'+
                '</button>').button();
     },
             
    //<button class="{button:{icons:{primary:'ui-icon-gear',secondary:'ui-icon-triangle-1-s'}}} ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icons" role="button"><span class="ui-button-icon-primary ui-icon ui-icon-gear"></span><span class="ui-button-text">Button with two icons</span><span class="ui-button-icon-secondary ui-icon ui-icon-triangle-1-s"></span></button>
    
    /* Create a button set
     * */
    _buttonSet: function (id, buttons) {
        var bs = $('<span id="'+ id +'" class="ui-button-set" />');
        if (buttons) {
            $.each(buttons, function (i, btn) {
                btn.appendTo(bs);
            });
        }
        return bs.buttonset();
    },

    /* Automatically build buttons according
     * the the widget's option specifications
     * */
    _build_buttons: function (appendTo) {
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
                $.each(this, function (i, b){
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

    // Return a file extension (ex: "js")
    _get_file_extension: function (s) {
        var tokens = s.split('.');
        return tokens[tokens.length-1] || false;
    },

    _trigger: function(eventName, data) {      
        var ui = this;

        if (ui.element.ray('option', 'debug')) {
            ui._log(eventName, data || false);
        }
        if (data) {
            ui.element.trigger($.Event({type: eventName, data: data}));
        }
        else {
            ui.element.trigger(eventName);
        }
    },

    _log: function() {}
                    
};

if ( typeof console !== 'undefined' && typeof console.log !== 'undefined') {
    $.ui.rayBase._log = function () {
        try { console.log.apply(window, arguments); }
        // Chrome will shit its pants ..
        catch (e) {
            var out = [];
            for (var x in arguments) { out.push(arguments[x]); }
            console.log(out.join(', '));
        }
    };
}

$.widget('ui.ray', $.extend($.ui.rayBase, {
    
    // Allow each plugins to specify which file type they support
    // and how to handle them
    _file_types: {},

    _init: function () {
        var ui = this;
        
        ui.options = $.extend($.ui.ray.defaults, ui.options);

        // Bind core events
        ui.element
            .bind('fileOpen.ray', function(e){ ui.file_open(e.originalEvent.data); })
            .bind('dirOpen.ray',  function(e){ ui.dir_list(e.originalEvent.data); })
            .bind('redraw.ray',  function(e){ ui.redraw(); });

        // Initialte all plugins
        ui.plugin_init();

        $(window).resize(function(e){
            ui._trigger('redraw');
        });
    },


    /* Request a directory listing to the backend and
     * triger 'dirOpened' event with result as event.data
     * */

    dir_list: function(dir) {
        var ui   = this;
        var base = '/ray/browse/';
        var url  = base + dir.path;

        if (!ui._loading_dir_list) { // prevent double clicks front fucking up things
            ui._loading_dir_list = true;
            $.getJSON(url, function(rs, status){
                ui._loading_dir_list = false;
                if (status == 'success') {
                    ui._trigger('dirOpened', { content: rs, path: dir.path, url: url });
                }
            });
        }
    },

    /* Request a file content to the backend and trigger a 
     * 'contentLoaded' event with result as event.data
     * */
    file_open: function(file) {
        var ui   = this;
        var base = 'open/?path=';
        var url  = ui.options.base_url + base + file.path;
        $.getJSON(url, function(rs, status){
            if (status == 'success') {
                ui._trigger('contentLoaded', { path: file.path, content: rs.content });
            }
        });
    },

    /* Associate a file type with its handler. The method
     * accept an object of the following format:
     * {extension: 'js',            // File extension
     *  type: 'rayWidgetName',      // Widget handler (ex: rayFilebrowser)
     *  label: "JavaScript",        // File type label
     *  callback: 'method_name'}    // Callback method (within the widget)
     * */
    // 
    set_mime_type: function (i) {
        this._file_types[i.extension] = i;
    },

    redraw: function() {
        var ui = this;
        var h = this.notfirstdraw && 58 || 30;
        $('.CodeMirror-wrapping').height(document.documentElement.clientHeight - $('#ray-filebrowser').height() - h);
        this.notfirstdraw = true;
    },

    destroy: function () {
        ui.element.rayWorkspace('destroy').rayFilebrowser('destroy');
        $.widget.prototype.destroy.apply(this, arguments);
    }
}));


$.extend($.ui.ray, {
    defaults: {
        base_url: '/ray/',
        debug:    false,
    },
    // List of plugins (ex: "ns:rayPluginName<:lazy>", where ns refers to the namespace)
    // Lazy means that the plugin is not initialized upon initial load.
    // ORDER DOES MATTER
    plugins: ['rayWorkspace', ]//'rayFilebrowser', 'rayMirrorEditor'],//, 'rayPixlr'],
});

$(function(){
    $('body').ray();
});
