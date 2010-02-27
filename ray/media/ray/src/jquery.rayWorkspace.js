$.widget('ui.rayWorkspace', {
    _init: function() {
        var ui = this;
        ui.dom = {
            primary:   $('<div>head</div>'),
            secondary: $('<div>body</div>'),
        };

        ui.dom.primary.height(100).appendTo('body');
        ui.dom.secondary.height(100).appendTo('body')

        var h = window.innerHeight;
        var w = window.innerWidth;
        $('body').splitter({
            type: 'h',
            minBottom: 150,
            resizeToWidth: true,
        })
        /*
        ui.instance = ui.dom.body.layout({
            defaults: {
                fxName: "none",
            },
            north: {
                size: '50%'
            },
            south:{
                size: '50%'
                //size: h - ((h * 1.61803399) - h),
            }
//          north: {
//              resizable: false,
//              closable: true, 
//              size:56,
//              spacing_open: 0
//          }
        });
        */
        
     },

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

    get: function(k) {
         try {
             return this.instance[k];
         }
         catch (e) {
             return false;
         };
    },

    getPane: function(ws) {
        try {
            return this.dom[ws];
        }
        catch (e) {
            return false;
        }
    },

    exec: function(cmd, arg) {
        var ui = this;
        return ui.instance[cmd](arg);
    },

    layout: function () {
        if (arguments.length > 1) {
            var pane = this.dom[arguments[0]];
            $.each(arguments[1], function (){
                pane.append(this);
            });
            pane.layout(arguments[2] || {});
        }
    }

});


$.extend($.ui.rayWorkspace, {
    getter: 'getWorkspace exec',
    defaults: {
        layouts: [],
    },
});

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


