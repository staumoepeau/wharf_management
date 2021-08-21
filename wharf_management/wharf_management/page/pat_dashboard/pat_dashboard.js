frappe.pages['pat-dashboard'].on_page_load = function(wrapper) {
	new PATPage(wrapper);
}

PATPage = Class.extend({
	init : function(wrapper){
	this.page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'PAT Dashboard',
		single_column: true
		});
		this.make();
	},
	
	make: function(){
		let me = $(this);
		let body = `<h1>Hello, World</h1>`;

		$(frappe.render_template(body, this.page)).appendTo(this.page.main)

	}
})