define(function(require) {
	// Create an Angular module for this plugin
	var module = require('ui/modules').get('dailyPurchaseTableKibanaPlugin');
    
    Array.prototype.diff = function(a) {
        return this.filter(function(i) {return a.indexOf(i) < 0;});
    };
    
	// Add a controller to this module
	module.controller('dailyPurchaseTableController', function($scope, $sce, Private) {
        console.log('Set up dailyPurchaseTableController');
        
        var setModel = function($scope, Private, cb) {
            var SearchSource = Private(require('ui/courier/data_source/search_source'));
            var searchSource = new SearchSource();
            searchSource.size(500);
            searchSource.index($scope.vis.indexPattern);
            searchSource.onResults().then(function onResults(resp) {
                debugger;
                var dataSet = resp.hits.hits.map(function(hit) {
                    return { vdp_count: hit._source.vdp_count, vdp_date: hit._source.vdp_date, vdp_device_type: hit._source.vdp_device_type };
                });
                cb(dataSet);
            });
        }

        var modelToHtml = function(recs) {
            var device_types = Object.keys(_.groupBy(recs, function(recs) { return recs.vdp_device_type; })).sort();
            // Fill and sort the dates
            var dates_data = _.groupBy(recs, function(recs) { return recs.vdp_date; });
            for (var key in dates_data) {
                var date_value = dates_data[key];
                var date_device_types = date_value.map(function(item){
                    return item.vdp_device_type;
                });
                var diff = device_types.diff(date_device_types);
                for (var i = 0; i < diff.length; i++) {
                    dates_data[key].push({"vdp_count":0,"vdp_date":key,"vdp_device_type":diff[i]});
                }
                dates_data[key].sort(function(a,b){
                    return (a.vdp_device_type > b.vdp_device_type) ? 1 : ((b.vdp_device_type > a.vdp_device_type) ? -1 : 0);
                });
            }
            var dates_value = Object.keys(dates_data).sort(function(a,b){
                return new Date(a) - new Date(b);
            });

            // declare the rows
            var row_title = ["<td>Date</td>"];
            var row_total = ["<td>Total</td>"];
            var rows_device = device_types.map(function(item) {
                return ["<td>" + item + "</td>"];
            });
            // Fill the rows
            dates_value.forEach(function(item) {
                row_title.push("<th>" + item + "</th>");
                var total = dates_data[item].reduce(function add(a, b) {
                    var value0 = (typeof a === "number") ? a : a.vdp_count;
                    var value1 = (typeof b === "number") ? b : b.vdp_count;
                    return value0 + value1;
                });

                for (var i = 0; i < dates_data[item].length; i++) {
                    rows_device[i].push("<td>" + dates_data[item][i].vdp_count + "</td>");
                }
                row_total.push("<td>" + total + "</td>");
            })
            var rows_devices = []
            rows_device.forEach(function(item) {
                rows_devices.push("<tr>" + item.join('') + "</tr>");
            });
            result =  "<table><tr>" + row_title.join('') + "</tr><tr>" + row_total.join('') + "</tr>" + rows_devices.join('') + "</table>"
            return result;
        }
        
        setModel($scope, Private, function(data) {
            $scope.model = $sce.trustAsHtml(modelToHtml(data));
        });
	});
});