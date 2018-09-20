// Copyright (c) 2018, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Cargo Stock Tools', {
	refresh: function(frm) {

		frm.set_query("stock_ref", function() {
			return {filters: { status: ["=", "Open"], enabled: ["=", 1]}};
		});

	},

	on_submit: function(frm){
				frappe.set_route("List", "Cargo Stock Tools");
				location.reload(true);
	},
});
