define(function(require) {
	require('plugins/dailyPurchaseTablePlugin/dailyPurchaseTable.css');
    require('plugins/dailyPurchaseTablePlugin/dailyPurchaseTableController');
	function dailyPurchaseTableProvider(Private) {
		var TemplateVisType = Private(require('ui/template_vis_type/TemplateVisType'));
		return new TemplateVisType({
			name: 'dailyPurchaseTable',
			title: 'Daily purchase table',
			description: 'A daily purchase table.',
			requiresSearch: true,
			template: require('plugins/dailyPurchaseTablePlugin/dailyPurchaseTable.html'),
		});
	}
	require('ui/registry/vis_types').register(dailyPurchaseTableProvider);
	return dailyPurchaseTableProvider;
});