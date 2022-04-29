window.mac_vendor = (function(){
    if (window.mac_vendor) {
        return window.mac_vendor;
    }
    var oui_path="./oui.csv?v=1";
    var oui_cn_path="./oui_cn.json?v=1";
    var oui_p = [9, 7, 6];
    var oui;
    var oui_cn;
    var fetch_oui;
    var fetch_oui_cn;
    var queryVendor = function(mac) {
        for (var i in oui_p) {
            if (mac.length >= oui_p[i]) {
                var vendor = oui[mac.substring(0, oui_p[i])];
                if (vendor !== undefined) {
                    return vendor
                }
            }
        }
    };
    var query = function(mac) {
        if (!oui || !mac){
            return;
        }
        mac = mac.replaceAll(/[-:]/g, '');
        var vendor = queryVendor(mac);
        if (vendor === undefined) {
            return;
        }
        var vendor_cn;
        if (oui_cn) {
            vendor_cn = oui_cn[vendor];
        }
        return {vendor: vendor, vendor_cn:vendor_cn}
    };

    return (function(p){return {onready:function(cb){p.then(cb)}}})(
        new Promise(function(resolve){
            setTimeout(function(){
                fetch_oui=fetch(oui_path)
                    .then(function(res){return res.text();})
                    .then(function(data){
                        oui = data.split('\n').reduce(function(acc, line){
                            var mid = line.indexOf('\t');
                            if (mid != -1) {
                                acc[line.substring(0, mid)] = line.substring(mid+1);
                            }
                            return acc;
                        }, {});
                        // oui = data;
                    });
                fetch_oui_cn=fetch(oui_cn_path)
                    .then(function(res){return res.json();})
                    .then(function(data){
                        oui_cn = data;
                    });
                var tasks=[fetch_oui, fetch_oui_cn];
                resolve(Promise.all(tasks))
            }, 500);
        })
        .then(function(){return {query:query};})
        );
})();
// window.mac_vendor.onready(api=>api.query("AA:BB:CC"))