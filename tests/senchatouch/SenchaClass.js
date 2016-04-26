Ext.define('comapny.acme.data.proxy.BufferedProxy', {

    extend: 'Ext.data.proxy.Memory',
    inject:[
        'itemsManager'
    ],
    config: {
        something: undefined,
        filters: []
    },

    constructor: function(config) {
        this.callParent(arguments);
        this.isBufferedProxy = true;
    },

    read: function (operation, callback, scope) {
        
    }

});
