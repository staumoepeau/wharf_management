// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Gate1', {
	refresh: function(frm) {
		if (frm.doc.custom_code = "DDL"){
			cur.frm.set_value("delivery_code", "DIRECT DILEVERY")
		}else if (frm.doc.custom_code = "DDLW"){
			cur.frm.set_value("delivery_code", "DIRECT DILEVERY WAREHOUSE")
		}else if (frm.doc.custom_code = "IDL"){
			cur.frm.set_value("delivery_code", "INSPECTION DILEVERY")
		}else if (frm.doc.custom_code = "IDLW"){
			cur.frm.set_value("delivery_code", "INSPECTION DILEVERY WAREHOUSE")
		}

	},
	
	onload: function(frm) {
		
		frappe.call({
			"method": "frappe.client.get",
						args: {
							doctype: "Cargo",
							name: frm.doc.booking_ref,
							filters: {
								'docstatus' : 1
							},	
						},
						callback: function (data) {
								cur_frm.set_value("customer", data.message["consignee"]);
								cur_frm.set_value("container_no", data.message["container_no"]);
								cur_frm.set_value("custom_warrant", data.message["custom_warrant"]);
								cur_frm.set_value("custom_code", data.message["custom_code"]);
								
								cur_frm.set_df_property("container_no", "read_only", 1);
								cur_frm.set_df_property("customer", "read_only", 1);
								
							}								
			})
				
	}
});
