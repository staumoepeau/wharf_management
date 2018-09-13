// Copyright (c) 2018, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Cargo Warehouse Security', {
	refresh: function(frm) {

	},

	on_submit: function(frm){
        frm.reload_doc()
        frappe.set_route("List", "Cargo Warehouse")
    },

	onload: function(frm) {


		frappe.call({
            "method": "frappe.client.get",
            args: {
        			doctype: "Cargo Warehouse",
                    name: frm.doc.cargo_warehouse_ref,
                    filters: {
                    		'docstatus': 1
                    		},
                },
                callback: function(data) {
                	cur_frm.set_value("customer", data.message["consignee"]);
					cur_frm.set_value("cargo_type", data.message["cargo_type"]);
						if (frm.doc.cargo_type == "Vehicles"){
							cur_frm.set_df_property("delivery_details", "hidden", 1);
						}
						if (frm.doc.cargo_type != "Vehicles"){
							cur_frm.set_df_property("delivery_details", "hidden", 0);
						}
					cur_frm.set_value("cargo_description", data.message["cargo_description"]);
					cur_frm.set_value("chasis_no", data.message["chasis_no"]);
					cur_frm.set_value("qty", data.message["qty"]);
					cur_frm.set_value("warrant_no", data.message["warrant_no"]);

					cur_frm.set_df_property("customer", "read_only", 1);
					cur_frm.set_df_property("qty", "read_only", 1);
					cur_frm.set_df_property("chasis_no", "read_only", 1);
					cur_frm.set_df_property("cargo_warehouse_ref", "read_only", 1);
					cur_frm.set_df_property("cargo_type", "read_only", 1);
                    cur_frm.set_df_property("cargo_description", "read_only", 1);
//                    cur_frm.set_df_property("custom_code", "read_only", 1);
//					cur_frm.set_df_property("custom_warrant", "read_only", 1);
                	cur_frm.set_df_property("warrant_no", "hidden", 1);

                }
            })
    }
});
