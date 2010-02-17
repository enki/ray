$.widget('ui.rayPixlr', $.extend($.ui.rayBase, {
    _init: function() {
        var ui = this;
        
        ui.options = $.extend($.ui.rayPixlr.defaults, ui.options);

        if (!ui._not_first_run) {
            ui._not_first_run = true;
            //$.each(ui.options.magic, function (i, m){
                //ui.element.ray('set_mime_type', {extension: i, type: this.widgetName, label: m.label, callback: 'file_test'});
            //});
            ui.element.bind('contextLoaded.rayPixlr', function(e){
                var d = e.originalEvent.data;
                var supported = ui.options.magic[ui._get_file_extension(d.path)];
                console.log(supported, d.path);
                if (supported) {
                    ui._preview('/ray/media/'+ d.path);
                }
                e.preventDefault();
                return false;
            });
        }
        else {
        }
    },

    _preview: function (path) {
        var link = $('<a>').bind('click', function(){
            var ui = this;
            $('.ui-ray-workspace-window:active').removeClass('active');
            var d = $('<div class="ui-ray-workspace-window active" />')
                        .width($('body').width())
                        .height($('body').height() - $('#ray-filebrowser').height() + 60)
                        .appendTo('.ui-ray-workspace');
            pixlr.overlay.show(d.get(0), {image:'http://developer.pixlr.com/_image/example1.jpg', title:'Example image 1'});                   
        }).insertBefore('.ui-ray-details');
                                 
        $('<img style="float:right;z-index:1000;border:1px solid #ccc;" />').attr({
            height: $('#ray-filebrowser-panes').height() - 40,
            src: path,
            border:0,
        }).appendTo(link);
    
              
              
    }
}));

$.extend($.ui.rayPixlr, {
    getter: '',     
    defaults: {
        magic: {
            'jpg':  { label: 'JPEG Image (image/jpeg)' },
            'jpeg': { label: 'JPEG Image (image/jpeg)' },
            'png':  { label: 'PNG image (image/png)' },
            'gif':  { label: 'GIF image (image/gif)' },
        }
    }         
});
