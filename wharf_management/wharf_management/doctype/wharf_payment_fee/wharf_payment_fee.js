// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Wharf Payment Fee', {
	
	onload: function(frm) {
		
		frappe.call({
			"method": "frappe.client.get",
			args: {
				doctype: "Cargo",
				name: frm.doc.cargo_ref,
				filters: {
						'docstatus' : 1
						},
			},
			callback: function (data) {
				cur_frm.set_value("cargo_ref", data.message["name"]);
				cur_frm.set_value("container_no", data.message["container_no"]);
				cur_frm.set_value("voyage_no", data.message["voyage_no"]);
				cur_frm.set_value("vessel", data.message["vessel"]);
				cur_frm.set_value("eta_date", data.message["eta_date"]);
				cur_frm.set_value("cargo_type", data.message["cargo_type"]);
				cur_frm.set_value("work_type", data.message["work_type"]);
				
				cur_frm.set_value("yard_slot", data.message["yard_slot"]);
				cur_frm.set_value("consignee", data.message["consignee"]);
				cur_frm.set_value("container_type", data.message["container_type"]);
				if (frm.doc.cargo_type == "Container"){
					frm.set_value("free_storage_days", 10);
				} else if (frm.doc.cargo_type != "Container"){
					frm.set_value("free_storage_days", 5);
				}
				cur_frm.set_value("container_size", data.message["container_size"]);
				cur_frm.set_value("container_content", data.message["container_content"]);

				cur_frm.set_df_property("voyage_no", "read_only", 1);
				cur_frm.set_df_property("vessel", "read_only", 1);
				cur_frm.set_df_property("eta_date", "read_only", 1);
				cur_frm.set_df_property("cargo_type", "read_only", 1);
				cur_frm.set_df_property("container_no", "read_only", 1);
							
				cur_frm.set_df_property("yard_slot", "read_only", 1);
				cur_frm.set_df_property("consignee", "read_only", 1);
				cur_frm.set_df_property("container_type", "read_only", 1);
				cur_frm.set_df_property("container_size", "read_only", 1);
				cur_frm.set_df_property("container_content", "read_only", 1);
				cur_frm.set_df_property("free_storage_days", "read_only", 1);
			}
		})

	},
	
	
	refresh: function(frm) {
		
	},
	posting_date: function(frm){
		frappe.call({
			method: "get_working_days",
			doc: frm.doc,
			callback: function(r) {
				frm.set_value("storage_days", r.message);
					if (frm.doc.free_storage_days < frm.doc.storage_days){
						var sdays = flt(frm.doc.storage_days - frm.doc.free_storage_days);
						frm.set_value("storage_days_charged", sdays);
					} else if (frm.doc.free_storage_days >= frm.doc.storage_days){
						var sdays = 0.00;
						frm.set_value("storage_days_charged", sdays);
//						frm.refresh_fields("storage_days_charged");
					}
				//frm.trigger("calculate_fees")
			}

		})

	},
	
	custom_code: function(frm) {
		if (frm.doc.custom_code == "DDL"){
			frm.set_value("delivery_code", "DIRECT DELIVERY")
		} else if (frm.doc.custom_code == "DDLW"){
			frm.set_value("delivery_code", "DIRECT DELIVERY WAREHOUSE")
		} else if (frm.doc.custom_code == "IDL"){
			frm.set_value("delivery_code", "INSPECTION DELIVERY")
		} else if (frm.doc.custom_code == "IDLW"){
			frm.set_value("delivery_code", "INSPECTION DELIVERY WAREHOUSE")
		}
	},
	
	devanning: function(frm){
		if (frm.doc.devanning == "Yes"){
			
		}
	}

	calculate_fees: function(frm){

		frappe.call({
			method: "get_storage_fee",
			doc: frm.doc,
			callback: function(s) {
				console.log(s.message)
				var sfee = flt((s.message) * frm.doc.storage_days_charged);
					frm.set_value("storage_fee", sfee);
				}
			});
		frappe.call({
			method: "get_wharfage_fee",
			doc: frm.doc,
			callback: function(w) {
				var wfee = flt((w.message));
				frm.set_value("wharf_fee", wfee);
			}
		});
		
		

	},

	

});
