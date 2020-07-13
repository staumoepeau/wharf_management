frappe.pages['cargo_inspection'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __('Cargo Inspection'),
		single_column: true
	});

	new erpnext.CargoInspection(wrapper);
	frappe.breadcrumbs.add("Cargo");
};
