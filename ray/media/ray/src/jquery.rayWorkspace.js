var test = false;
$.widget('ui.rayWorkspace', {

    load: function (ws, content) {
        var ui = this;
        if ($.isArray(content)) {
            $.each(content, function (){
                ui.dom[ws].append(this);
            });
        }
        else {
            ui.dom[ws].html(content);
        }
    },

    exec: function(cmd, arg) {
        var ui = this;
        console.log(cmd, arg, ui.instance[cmd](arg))
        ui.instance[cmd](arg);
    },

    layout: function () {
        if (arguments.length > 1) {
            var pane = this.dom[arguments[0]];
            $.each(arguments[1], function (){
                pane.append(this);
            });
            pane.layout(arguments[2] || {});
        }
    },

    _init: function() {
        var ui = this;
        ui.dom = {
//            workspace: $($.ui.rayWorkspace.defaults.layouts[0].template.join('')).prependTo('body'),
            center: $('<div class="ui-layout-center" />').appendTo('body'),
            north:  $('<div class="ui-layout-north" />').appendTo('body'),
            south:  $('<div class="ui-layout-south" />').appendTo('body'),
            east:   $('<div class="ui-layout-east" />').appendTo('body'),
            west:   $('<div class="ui-layout-west" />').appendTo('body'),
        };
        var h = window.innerHeight;
        ui.instance = ui.element.layout({
            defaults: {
                fxName: "none",
            },
            south:{
                initClosed: false,
                size: h - ((h * 1.61803399) - h),
            },
            center: {
                initClosed: false,
                
            },
            north: {
                initClosed: true,
//                initHidden: true,
                resizable: false,
                closable: true, 
                size:56,
                spacing_open: 0
            },
            west: {
                initClosed: true,
            },
            east: {
                initClosed: true,
            }
        });
        test = ui.instance;

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


