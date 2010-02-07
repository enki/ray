$.widget('ui.rayMirrorEditor', $.extend($.ui.rayBase, {

    settitle: function(i) {
        var ui = this;
        var tt = i || ui.dom.titlebar.text();
        if (ui._modified) {
            tt = tt + ' [+]';
        }
        else {
            tt = tt.replace(' [+]', '');
        }
        ui.dom.titlebar.text(tt);
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
        var ext = ui.options.file.path.match(/\w+$/);
        if (ext[0] && ui.options.magic[ext[0].toLowerCase()]) {
            return ui.setparser(ui.options.magic[ext[0]].parser);
        }
        return ui.setparser('DummyParser');
    },

    _init: function() {
        var ui = this;
        ui._modified = false;
        ui.options   = $.extend($.ui.rayMirrorEditor.defaults, ui.options); // What the ?!
        ui.textarea  = $('<textarea style="width:100%;" class="ui-ray-editor-buffer" />')
        var wrapper  = $('<div />').appendTo(ui.options.parent);

        wrapper.append(ui.textarea);

        ui.dom = {
            button:   {},
            toolbar:    $('<div class="ui-widget-header ui-helper-reset ui-helper-clearfix ui-ray-buffer-toolbar" />'),
            cursorinfo: $('<span class="ui-ray-buffer-cursorinfo" />'),
            titlebar:   $('<div class="ui-ray-buffer-titlebar" />'),
            settings:   $('<div class="ui-ray-buffer-settings" />'),
            parserswitcher: $('<select />'),
        };


        $('.ui-ray-toggle-linenumbers').live('change',  function(){ ui.togglelinenumbers(); }).attr('checked', ui.options.linenumbers);
        $('.ui-ray-toggle-linewrap').live('change',     function(){ ui.togglelinewrap(); }).attr('checked', ui.options.textWrapping);
        $('.ui-ray-toggle-spellcheck').live('change',   function(){ ui.togglespellcheck(); }).attr('checked', ui.options.disableSpellcheck);

        ui._build_buttons(ui.dom.toolbar);

        ui.options.cursorActivity = function() {
            ui.element.trigger($.Event({type:'cursorActivity'}));
            ui._updateCursorInfo();
        };
        ui.options.onChange = function() {
           ui.options.parent.trigger($.Event({type:'changed'}));
        };
        ui.options.parent.one('changed.rayMirrorEditor', function(){
            ui._modified = true;
            ui.settitle();
        });
        

        ui.dom.toolbar.insertBefore(ui.textarea);
        ui.dom.titlebar.insertBefore(ui.dom.toolbar);
        ui.dom.cursorinfo.insertBefore(ui.dom.titlebar);
        ui.dom.settings.html(ui.options.settings.join(''))
            .hide().insertAfter(ui.dom.toolbar);

        ui.options.initCallback = function(editor) {
            ui._guess_parser();
        };

        ui.editor = CodeMirror.replace(ui.textarea.get(0));
        ui.mirror = new CodeMirror(ui.editor, ui.options);
        
        var s = ui.dom.parserswitcher.appendTo(ui.dom.toolbar)
                    .bind('change', function(){ 
                          //$(':selected', this).data('magic').parser
                          ui.setparser($(':selected', this).data('magic').parser);
                        });

        s.wrap('<label class="ui-ray-syntax-selector">Syntax: </label>');

        for (var x in ui.options.magic) {
            $('<option>').data('magic', ui.options.magic[x])
                .val(x).text(ui.options.magic[x].label)
                .appendTo(s);
        }

        ui.element.trigger($.Event({type:'redraw'}));
        return ui.textarea;
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
        autoMatchParens: false,
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
            "../contrib/diff/js/parsediff.js",
        ],
        stylesheet: [
            "css/xmlcolors.css", 
            "css/csscolors.css", 
            "css/jscolors.css", 
            "contrib/sql/css/sqlcolors.css", 
            "contrib/php/css/phpcolors.css", 
            "contrib/python/css/pythoncolors.css", 
            "contrib/diff/css/diffcolors.css", 
        ],
        buttons: [
            ['editing-options', {label: 'Undo', icon: 'arrowreturn-1-w', callback: 'undo'}, {label: 'Redo', icon: 'arrowreturn-1-e', callback: 'redo'}],
            ['buffer-actions',  
                {label: 'Re-indent', icon: 'signal', callback: 'reindent'},
                {label: 'Go to line', icon: 'seek-end', callback: 'gotoline'}, 
                {label: 'Settings', icon: 'gear', callback: 'togglesettings'},
//                {label: 'Syntax', icon: 'gear', callback: 'setsyntax', choices: []},
            ],
        ],
        magic: {
            'dummy': { label: 'No Syntax', parser: 'DummyParser' },
            'html': { label: 'HTML/CSS/JS', parser: 'HTMLMixedParser' },
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
        settings: [
            '<ul class="ui-ray-form">',
                '<li><input type="checkbox" checked="checked" class="ui-ray-toggle-linenumbers" /> Line numbers</li>',
                '<li><input type="checkbox" checked="checked" class="ui-ray-toggle-linewrap" /> Line wrap (does not play well with line numbers ..)</li>',
                '<li><input type="checkbox" checked="checked" class="ui-ray-toggle-spellcheck" /> Disable spell checking (Mozilla Firefox 2+ only)</li>',
            '</ul>',
        ],
//      
//      activeTokens: function(spanNode, tokenObject, editor){
//                        console.log(spanNode, tokenObject, editor);
//                
//                }
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
