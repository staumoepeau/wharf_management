// Copyright (c) 2018, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Cargo Stock', {
	refresh: function(frm) {
		cur_frm.add_fetch('container_type', 'size', 'container_size');
        cur_frm.add_fetch('container_type', 'pat_code', 'pat_code');

	},

	on_submit: function(frm){
				frappe.set_route("List", "Cargo Stock");
				location.reload(true);
	},

	onload: function(frm) {

		frappe.call({
			"method": "frappe.client.get",
			args: {
				doctype: "Cargo Stock Refrence",
				filters: {
					"status": "Open",
				}
			},
			callback: function(data) {
				cur_frm.set_value("cargo_stock_ref", data.message["name"]);
				cur_frm.set_df_property("cargo_stock_ref", "read_only", 1);
			}
		})



	}

});
