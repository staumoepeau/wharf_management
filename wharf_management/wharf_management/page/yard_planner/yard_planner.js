frappe.pages['yard-planner'].on_page_load = function(wrapper) {
	var page =	frappe.ui.make_app_page({
		parent: wrapper,
		title: __('Yard Planner'),
		single_column: true
	});

	this.page.set_primary_action(__("Refresh"), function() { return frappe.ui.toolbar.clear_cache(); }, "icon-refresh")
			
	$(frappe.render_template("yard_planner_top", this)).appendTo(this.page.body);
	page.content = $(page.body).find('.yard-planner');

	frappe.call({
		method: "wharf_management.wharf_management.page.yard_planner.yard_planner.get_items",
		callback: function(r) {
//			items = r.message

			$(frappe.render_template('yard_planner', {items:r.message || []})).appendTo(page.content);
			page.content = $(page.body).find('.yard-planner-main');
//			console.log(r.message)



		}
	});
}
