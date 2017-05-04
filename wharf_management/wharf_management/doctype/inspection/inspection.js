// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Inspection', {
	refresh: function(frm) {

	},
	onload: function(frm) {

		frappe.call({
			"method": "frappe.client.get",
						args: {
							doctype: "Cargo",
							name: frm.doc.container_no,
							filters: {
								'docstatus' : 1
							},
						},
						callback: function (data) {
								cur_frm.set_value("voyage_no", data.message["voyage_no"]);
								cur_frm.set_value("vessel", data.message["vessel"]);
//								cur_frm.set_value("vessel_arrival_date", data.message["vessel_arrival_date"]);
								cur_frm.set_value("bol", data.message["bol"]);
//								if (frm.docstatus != 1){
//									cur_frm.set_value("container_arrival_date", get_today());
	//							}

								cur_frm.set_df_property("voyage_no", "read_only", 1);
								cur_frm.set_df_property("vessel", "read_only", 1);
								cur_frm.set_df_property("vessel_arrival_date", "read_only", 1);
								cur_frm.set_df_property("bol", "read_only", 1);
								cur_frm.set_df_property("container_no", "read_only", 1);
								cur_frm.set_df_property("container_arrival_date", "read_only", 1);

							}
			})

	}

});
