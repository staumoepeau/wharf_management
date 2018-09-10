// Copyright (c) 2018, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Empty Deliver Payment', {
	refresh: function(frm) {

	},

	onload: function(frm){
		
		frappe.call({
			"method": "frappe.client.get",
			args: {
				doctype: "Export",
				name: frm.doc.cargo_ref,
				filters: {
					'docstatus' : 1
//					'container_no' : frm.doc.container_no
				},
			},
			callback: function(data) {
				cur_frm.set_value("gate_in_date", data.message["main_gate_start"]);
				cur_frm.set_value("container_no", data.message["container_no"]);
				cur_frm.set_value("cargo_type", data.message["cargo_type"]);
				cur_frm.set_value("container_type", data.message["container_type"]);
				cur_frm.set_value("container_content", data.message["container_content"]);
				cur_frm.set_value("container_size", data.message["container_size"]);
				cur_frm.set_value("agents", data.message["agents"]);
				cur_frm.set_value("yard_slot", data.message["yard_slot"]);


				cur_frm.set_df_property("agents", "read_only", 1);
				cur_frm.set_df_property("yard_slot", "read_only", 1);
				cur_frm.set_df_property("container_no", "read_only", 1);
				cur_frm.set_df_property("gate_in_date", "read_only", 1);
				cur_frm.set_df_property("cargo_type", "read_only", 1);
				cur_frm.set_df_property("container_type", "read_only", 1);
				cur_frm.set_df_property("container_content", "read_only", 1);
				cur_frm.set_df_property("container_size", "read_only", 1);
			}
		})
	},

	posting_date: function(frm) {

		frappe.call({
			method: "get_working_days",
			doc: frm.doc,
			callback: function(r) {
				frm.set_value("storage_days", r.message);
			}

		})

		if (frm.doc.cargo_type == "Container") {
			frappe.call({
				"method": "frappe.client.get",
				args: {
					doctype: "Storage Fee",
					filters: {
						cargo_type: frm.doc.cargo_type,
						container_size: frm.doc.container_size,
						container_content: frm.doc.container_content
					}
				},
				callback: function(data) {
					cur_frm.set_value("free_storage_days", data.message["grace_days"]);
				}
			})
		} else if (frm.doc.cargo_type != "Container") {
			frappe.call({
				"method": "frappe.client.get",
				args: {
					doctype: "Storage Fee",
					filters: {
						cargo_type: frm.doc.cargo_type,
					}
				},
				callback: function(data) {
					cur_frm.set_value("free_storage_days", data.message["grace_days"]);
				}
			})
		}
},

	free_storage_days: function(frm) {

		if (frm.doc.free_storage_days < frm.doc.storage_days) {
			var sdays = flt(frm.doc.storage_days - frm.doc.free_storage_days);
			frm.set_value("storage_days_charged", sdays);
		} else if (frm.doc.free_storage_days >= frm.doc.storage_days) {
			frm.set_value("storage_days_charged", 0);
			frm.refresh_fields("storage_days_charged");
			
		}

	},
	
	insert_fees_button: function(frm) {
		return frappe.call({
			method: "insert_fees",
			doc: frm.doc,
			callback: function(fees) {
				frm.refresh_fields();
				console.log(fees);
				}
				

			});
		
	},

	payment_method: function(frm){

		if (frm.doc.payment_method == "No Payment Needed"){
			cur_frm.set_df_property("paid_amount", "read_only", 1)
			cur_frm.set_df_property("change_amount", "read_only", 1)
            cur_frm.set_df_property("outstanding_amount", "read_only", 1)
		}
		if (frm.doc.payment_method != "No Payment Needed") {
			cur_frm.set_df_property("paid_amount", "read_only", 0)
			cur_frm.set_df_property("change_amount", "read_only", 0)
            cur_frm.set_df_property("outstanding_amount", "read_only", 0)

		}

	},

	paid_amount: function(frm){

        if (frm.doc.total_amount > frm.doc.paid_amount){
            frm.set_value("outstanding_amount", (frm.doc.total_amount - frm.doc.paid_amount));
            frm.set_value("change_amount", 0.00)
            cur_frm.set_df_property("change_amount", "read_only", 1)
            cur_frm.set_df_property("outstanding_amount", "read_only", 1)

        } 
        if (frm.doc.total_amount < frm.doc.paid_amount){
            frm.set_value("change_amount", (frm.doc.paid_amount - frm.doc.total_amount));
            frm.set_value("outstanding_amount", 0.00);
            cur_frm.set_df_property("change_amount", "read_only", 1)
            cur_frm.set_df_property("outstanding_amount", "read_only", 1)
        }
        if (frm.doc.total_amount == frm.doc.paid_amount){
            frm.set_value("change_amount", 0.00)
            frm.set_value("outstanding_amount", 0.00);
            cur_frm.set_df_property("change_amount", "read_only", 1)
            cur_frm.set_df_property("outstanding_amount", "read_only", 1)
		}
    },


});

frappe.ui.form.on("Wharf Fee Item", "qty", function(frm, cdt, cdn){
	var d = locals[cdt][cdn];
	frappe.model.set_value(d.doctype, d.name, "total", d.price * d.qty);
  
	var totalamount = 0;
	frm.doc.wharf_fee_item.forEach(function(d) { totalamount += d.total; });
  
	frm.set_value("total_amount", totalamount);
  
  });