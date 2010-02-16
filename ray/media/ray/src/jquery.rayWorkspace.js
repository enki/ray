$.widget('ui.rayWorkspace', {
    _buffinc: 0,
    _buffers: [],
    _init: function() {
        var ui = this;
        ui.dom = {
            workspace: $($.ui.rayWorkspace.defaults.layouts[0].template.join('')).prependTo('body'),
        };

        ui.element.bind('contentLoaded', function (e){
            ui.e(e.originalEvent.data)
        });
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
    _buffers_apply: function(callback) {
        var ui = this;
        var buf, rs  = false;
        for (var i in ui._buffers) {
            buf = ui._buffers[i];
            rs  = callback.apply(this, [buf]);
            if (rs) {
                return rs;
            }
        }
        return false;
    },
    _get_buffer_by_id: function(id) {
        return this._buffers_apply(function(buffer) {
            if (buffer.id == id) {
                return buffer;
            }
        });
    },
    _get_buffer_by_file_property: function(k, v) {
        return this._buffers_apply(function(buffer) {
            if (buffer.file && buffer.file[k] == v) {
                return buffer;
            }
        });
    },
    // New buffer from file
    e: function(file) {
           // CHECKING IF FILE IS OPEN SHOULD BE OUTSIDE
        var ui = this;
        var rs = ui._get_buffer_by_file_property('path', file.path);
        var win = $('.ui-ray-workspace-window.active');
        // Do not load the same file twice
        if (!rs) {
            var bf  = { id: ui._buffinc, file: file, originalContent: file.content, modified: false };

            if (win.data('buffer')) {
                var nb = win.data('buffer'); // new buffer
                var ob = ui._get_buffer_by_id(win.data('buffer').id); // old buffer
                var history = nb.editor.rayMirrorEditor('exec', 'historySize');
                if (history.redo !== 0 || history.undo !==0) {
                    ob.file.content = nb.editor.rayMirrorEditor('exec', 'getCode');
                    ob.modified = true;
                }
            }
            ui._buffers.push(bf);
            win.data('buffer', bf);
            ui._buffinc++;
        }
        else {
            var bf = rs;
        }
        win.empty();
        bf.editor = ui.element.rayMirrorEditor({
            content: file.content || '',
            parent: win,
            file: file
        });
        var title = (bf && bf.modified) && file.path +' [+]' || file.path;
        bf.editor.rayMirrorEditor('settitle', title);
        bf.editor.rayMirrorEditor('setbufferlist', ui._buffers);

        win.one('changed.rayWorkspace', function(){
            bf.modified = true;
        });
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
});


$.ui.rayWorkspace.defaults = {
    layouts: [],
};

$.ui.rayWorkspace.defaults.layouts.push({
    title: 'One full screen pane',
    icon:  'split-none.png',
    template: [
        '<div class="ui-ray-workspace">',
            '<div class="ui-ray-workspace-window active"></div>',
        '</div>',
    ]
});
$.ui.rayWorkspace.defaults.layouts.push({
    title: 'Two panes splitted horizontally',
    template: [
        '<div class="ui-ray-workspace">',
            '<div class="ui-layout-west ui-ray-workspace-window active">West</div>',
            '<div class="ui-layout-east ui-ray-workspace-window">East</div>',
        '</div>',
    ]
});
$.ui.rayWorkspace.defaults.layouts.push({
    title: 'Two panes splitted vertically',
    template: [
        '<div class="ui-ray-workspace">',
            '<div class="ui-layout-north ui-ray-workspace-window active">North</div>',
            '<div class="ui-layout-south ui-ray-workspace-window">South</div>',
        '</div>',
    ]
});
$.ui.rayWorkspace.defaults.layouts.push({
    title: 'Four panes quadrant',
    template: [
        '<div class="ui-ray-workspace">',
            '<div class="ui-layout-north ui-ray-workspace-window active">North</div>',
            '<div class="ui-layout-east ui-ray-workspace-window">East</div>',
            '<div class="ui-layout-south ui-ray-workspace-window">South</div>',
            '<div class="ui-layout-west ui-ray-workspace-window">West</div>',
        '</div>',
    ]
});


