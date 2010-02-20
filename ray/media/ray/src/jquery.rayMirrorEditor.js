var rayBufferManager = function() {
    var bm  = this;
    bm._inc = 0;
    bm._buffers = {};

    return {

        // Focus a specified buffer takes a buffer object as argument
        focus: function(b) {
            var buffer = this.get(b);
            this.invoke(function(i, b){
                b.has_focus = (b.id === buffer.id) && true || false;
            });
        },

        // Invoke a callback method on all buffers
        invoke: function (method) {
            return $.each(bm._buffers, method);
        },

        // Returns all buffers
        all: function () {
            return bm._buffers;
        },

        // Creates a new buffer, takes file argument
        create: function (f) {
            var i = bm._inc = bm._inc + 1;
            bm._buffers[i] = {
                id: i, file: f, modified: false,
                originalContent: f.content
            };
            return bm._buffers[i];
        },

        // Takes a files argument and return its associated buffer, if none exist
        // it creates it and returns the created buffer
        getOrCreate: function (f) {
            var buffer = this.getByPath(f.path);
            if (!buffer) {
                buffer = this.create(f);
                buffer.created = true;
            }
            else {
                buffer.created = false;
            }
            this.focus(buffer);
            return buffer;
        },

        // Takes either a file or a id and returns the buffer associated with it
        get: function (b) {
            return b.path && this.getByPath(b.file.path) || this.getById(b);
        },

        // Returns a buffer that matches a given id
        getById: function(id) {
            try {
                return bm._buffers[id];
            }
            catch (e) {
                return false;
            };
        },

        // Returns a buffer that matches a given path 
        getByPath: function (p) {
            var out = false;
            $.each(bm._buffers, function(i, v){
                if (v.file.path == p) { out = v; }
            });
            return out;
        },

        // Returns the buffer that is currently focused.
        getFocused: function() {
            return this.getByProperty('has_focus', true);
        },

        // Find a buffer that has a given property that matches a given value
        getByProperty: function (p, v) {
            var out = false;
            $.each(bm._buffers, function(i, v){
                if (p === v) { return out = v; }
            });
            return out;
        }
    };
};

$.widget('ui.rayMirrorEditor', $.extend($.ui.rayBase, {
    _init: function() {
        var ui = this;
        var m, x, wrapper;
        ui._modified = false;
        ui.buffers = new rayBufferManager();
        ui.options   = $.extend($.ui.rayMirrorEditor.defaults, ui.options); // What the ?!
        
        if (ui._not_first_run) {
            ui.dom = {
                button:   {},
                toolbar:    $('<div class="ui-widget-header ui-helper-reset ui-helper-clearfix ui-ray-buffer-toolbar" />'),
                cursorinfo: $('<span class="ui-ray-buffer-cursorinfo" />'),
                titlebar:   $('<div class="ui-ray-buffer-titlebar" />'),
                parserswitcher: $('<label class="ui-ray-syntax-selector">Syntax: <select /></label>'),
                bufferswitcher: $('<label class="ui-ray-buffer-selector">Buffer: <select /></label>'),
            };

            ui._build_buttons(ui.dom.toolbar);

            ui.options.cursorActivity = function() {
                ui._trigger('cursorActivity');
                ui._updateCursorInfo();
            };

            ui.options.onChange = function() {
               ui.options.parent.trigger($.Event({type:'changed'}));
            };
            ui.options.parent.one('changed.rayMirrorEditor', function(){
                ui._modified = true;
                ui.settitle();
            });

            ui.options.initCallback = function(editor) {
                ui._guess_parser();
            };
            
            ui.element.rayWorkspace('load', 'north', [
                ui.dom.cursorinfo, ui.dom.titlebar, ui.dom.toolbar
            ]);

            ui.textarea  = $('<textarea style="width:100%;height:100px;" class="ui-ray-editor-buffer" />')
            wrapper      = ui.options.parent.append(ui.textarea).height(101);
            
            //ui.textarea.height(ui.options.parent.height()).parent().height(ui.options.parent.height());

            ui.editor = CodeMirror.replace(ui.textarea.get(0));
            ui.mirror = new CodeMirror(ui.editor, ui.options);
            
            var div = $('<div style="float:right;" />').appendTo(ui.dom.toolbar);

            var s = ui.dom.parserswitcher.appendTo(div)
                        .find('select').bind('change', function(){ 
                              ui.setparser($(':selected', this).data('magic').parser);
                            });

            var b = ui.dom.bufferswitcher.appendTo(div)
                        .find('select').bind('change', function(){ 
                            ui.element.rayWorkspace('e', $(':selected', this).data('buffer').file);
                        });

            for (x in ui.options.magic) {
                // Add Syntax item to syntax selector
                $('<option>').data('magic', ui.options.magic[x])
                    .val(x).text(ui.options.magic[x].label)
                    .appendTo(s);
            }

            ui.element.rayWorkspace('exec', 'open', 'north');

            ui._trigger('redraw');
            return ui.textarea;
        }
        else {
            ui._not_first_run = true;
            $.each(ui.options.magic, function (i, m){
                ui.element.ray('set_mime_type', {extension: i, type: this.widgetName, label: m.label, callback: 'file_open'});
            });
            ui.element.bind('contentLoaded', function (e){
                ui.e(e.originalEvent.data)
            });
        }

    },

    // New buffer from file
    e: function(file) {
        var ui  = this;
        var buf = ui.buffers.getOrCreate(file);

        ui.render(buf);

        /*
        // Do not load the same file twice
        if (!rs) {

            if (win.data('buffer')) {
                var nb = win.data('buffer'); // new buffer
                var ob = ui._get_buffer_by_id(win.data('buffer').id); // old buffer
                var history = nb.editor.rayMirrorEditor('exec', 'historySize');
                if (history.redo !== 0 || history.undo !==0) {
                    ob.file.content = nb.editor.rayMirrorEditor('exec', 'getCode');
                    ob.modified = true;
                }
            }
            win.data('buffer', bf);
        }
        */
    },
    // New buffer
    enew: function() {

//      var ui = this;
//      var w  = $('.ui-ray-workspace-window.active');
//      console.log('aaa', w);
//      if (!w.get(0)) {
//          console.log('asti');
//          w = $('<div class="ui-ray-workspace-window active" />').appendTo('.ui-ray-workspace.active');
//      }
//      ui._initializeEditor(w);
    },
    // Delete buffer
    bd: function() {},
    // Next buffer
    bn: function() {},
    // Previous buffer
    bp: function() {},
    // Write buffer
    w: function(ws) {},
    ls: function() {
        //this._buffers_apply(console.log);
    },
    render: function (buf) {
        var ui = this;
        var ws = ui.element.rayWorkspace('getWorkspace', 'center');
        
        buf.editor = ui.element.rayMirrorEditor({
            content: buf.file.content || '',
            parent: ws,
//            file: file
        });
//         buf.editor.rayMirrorEditor('setbufferlist', ui.buffers.all());
//            var title = (buf && buf.modified) && file.path +' [+]' || file.path;
//
//            buf.editor.rayMirrorEditor('settitle', title);
//            win.one('changed.rayWorkspace', function(){
//                buff.modified = true;
//            });
    },

    setbufferlist: function(buffers) {
        var ui = this;
        var select = ui.dom.bufferswitcher.find('select').empty();
        console.log(buffers)
        for (var x in buffers) {
            console.log('zzz ', buffers[x])
            var tt = buffers[x].file.path + (buffers[x].modified && ' [+]' || '');
            $('<option />').data('buffer', buffers[x])
                .val(buffers[x].file.path).appendTo(select).text(tt);
        }
    
    },

    settitle: function(i) {
        var ui = this;
        var tt = i || ui.dom.titlebar.text();
        if (ui._modified) {
            tt = tt + ' [+]';
        }
        else {
            tt = tt.replace(' [+]', '');
        }
        //ui.dom.titlebar.text(tt);

        document.title = tt;
    },

    exec: function(method, args) {
        return this.mirror[method](args);
    },

    togglespellcheck: function() {
        this.spellchecking = !this.spellchecking;
        return this.exec('setSpellcheck', this.spellchecking);
    },
    
    reindent: function(e) { 
        return this.exec('reindent'); 
    },

    undo: function(e) { 
        var ui = this;
        if (ui.exec('historySize').undo == 0) {
            ui._modified = false;
            ui.settitle();
        }
        else {
            return this.exec('undo'); 
        }
    },

    redo: function(e) { 
        return this.exec('redo'); 
    },

    gotoline: function(e) { 
        return this.exec('jumpToLine', prompt('Enter a line number'));
    },

    togglelinewrap: function() { 
        var ui = this;
        ui.options.textWrapping = !ui.options.textWrapping;
        return this.exec('setTextWrapping', ui.options.textWrapping);
    },
    togglelinenumbers: function() { 
        var ui = this;

        if (typeof(ui._lineNumbers) == 'undefined') {
            ui._lineNumbers = !ui.options.lineNumbers;
        }

        ui._lineNumbers = !ui._lineNumbers;
        if (!ui._lineNumbers) {
            this.exec('setLineNumbers', true);
        }
        else {
          //this.mirror.wrapping.removeChild(this.mirror.lineNumbers);
          //this.mirror.wrapping.style.marginLeft = '';
          //this.mirror.lineNumbers = null;
        }
    },

    togglesettings: function() {
        this.dom.settings.toggle();
    },
    
    _updateCursorInfo: function() {
        this.dom.cursorinfo.text([this.exec('currentLine'), this.exec('cursorPosition').character].join(','));
    },

    setparser: function(parser){
        var ui = this;
        $.each(ui.dom.parserswitcher.find('option'), function() {
            var magic = $(this).data('magic');
            if (magic.parser == parser) {
                $(this).attr('selected', true).siblings().attr('selected', false);
            } 
        });
        ui.exec('setParser', parser);
    },

    _guess_parser: function() {
        var ui  = this;
//        var ext = ui.options.file.path.match(/\w+$/);
        var ext = 'html';
        if (ext[0] && ui.options.magic[ext[0].toLowerCase()]) {
            return ui.setparser(ui.options.magic[ext[0]].parser);
        }
        return ui.setparser('DummyParser');
    }

}));
$.extend($.ui.rayMirrorEditor, {
    getter: 'exec',
    defaults: {
        path: "/media/codemirror/",
        indentUnit: 4,
        undoDepth: 50,
        undoDelay: 600,
        lineNumbers: false,
        textWrapping: false, // bugs line numbers
        autoMatchParens: true,
        disableSpellcheck: true,
        parserfile: [
            "parsedummy.js",
            "parsexml.js",
            "parsecss.js", 
            "tokenizejavascript.js", 
            "parsejavascript.js", 
            "parsehtmlmixed.js",
            "../contrib/sql/js/parsesql.js", 
            "../contrib/php/js/tokenizephp.js",
            "../contrib/php/js/parsephp.js",
            "../contrib/php/js/parsephphtmlmixed.js",
            "../contrib/python/js/parsepython.js",
//            "../contrib/django/js/tokenizedjango.js",
//            "../contrib/django/js/parsedjango.js",
//            "../contrib/django/js/parsedjangohtmlmixed.js",
            "../contrib/diff/js/parsediff.js",
        ],
        stylesheet: [
            /*
            "../ray/color-schemes/evening/scheme.css",
            */
            "css/xmlcolors.css", 
            "css/csscolors.css", 
            "css/jscolors.css", 
            "contrib/sql/css/sqlcolors.css", 
            "contrib/php/css/phpcolors.css", 
            "contrib/python/css/pythoncolors.css", 
            "contrib/diff/css/diffcolors.css", 
            "contrib/django/css/djangocolors.css", 
        ],
        buttons: [
            ['editing-options', 
                {label: 'Undo', icon: 'arrowreturn-1-w', callback: 'undo'}, 
                {label: 'Redo', icon: 'arrowreturn-1-e', callback: 'redo'}
            ],
            ['buffer-actions',  
                {label: 'Re-indent', icon: 'signal', callback: 'reindent'},
                {label: 'Go to line', icon: 'seek-end', callback: 'gotoline'}, 
                {label: 'Settings', icon: 'gear', callback: 'togglesettings'},
//                {label: 'Split', icon: 'split-win', callback: 'splitwin'},
//                {label: 'Syntax', icon: 'gear', callback: 'setsyntax', choices: []},
            ],
        ],
        magic: {
            'dummy': { label: 'No Syntax', parser: 'DummyParser' },
            'html': { label: 'HTML/CSS/JS', parser: 'HTMLMixedParser' },
//            'html': { label: 'Django template', parser: 'DjangoHTMLMixedParser' },
            'xhtml': { label: 'HTML/CSS/JS', parser: 'HTMLMixedParser' },
            'php':  { label: 'HTML/CSS/JS/PHP', parser: 'PHPHTMLMixedParser' },
            'js':   { label: 'JavaScript', parser: 'JSParser' },
            'py':   { label: 'Python', parser: 'PythonParser' },
            'css':  { label: 'CSS', parser: 'CSSParser' },
            'sql':  { label: 'SQL', parser: 'SqlParser' },
            'patch': { label: 'Diff', parser: 'DiffParser' },
            'diff':  { label: 'Diff', parser: 'DiffParser' },
//      'html': { label: 'HTML+Django', parserfile: ["parsexml.js", "parsecss.js", "tokenizejavascript.js", "parsejavascript.js", "parsedjango.js", "parsehtmldjango.js"], 
//                stylesheet: ["css/xmlcolors.css", "css/jscolors.css", "css/csscolors.css", "css/djangocolors.css"] },

    },
}
});

/*

MirrorFrame.prototype = {
  search: function() {
    var text = prompt("Enter search term:", "");
    if (!text) return;

    var first = true;
    do {
      var cursor = this.mirror.getSearchCursor(text, first, true);
      first = false;
      while (cursor.findNext()) {
        cursor.select();
        if (!confirm("Search again?"))
          return;
      }
    } while (confirm("End of document reached. Start over?"));
  },

  replace: function() {
    // This is a replace-all, but it is possible to implement a
    // prompting replace.
    var from = prompt("Enter search string:", ""), to;
    if (from) to = prompt("What should it be replaced with?", "");
    if (to == null) return;

    var cursor = this.mirror.getSearchCursor(from, false);
    while (cursor.findNext())
      cursor.replace(to);
  },



  macro: function() {
    var name = prompt("Name your constructor:", "");
    if (name)
      this.mirror.replaceSelection("function " + name + "() {\n  \n}\n\n" + name + ".prototype = {\n  \n};\n");
  },

  reindent: function() {
    this.mirror.();
  }
};
*/
