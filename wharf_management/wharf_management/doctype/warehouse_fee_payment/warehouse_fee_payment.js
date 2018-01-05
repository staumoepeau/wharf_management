// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Warehouse Fee Payment', {


	setup: function(frm) {
        frm.get_field('wharf_fee_item').grid.editable_fields = [
            { fieldname: 'item', columns: 2 },
            { fieldname: 'description', columns: 2 },
            { fieldname: 'price', columns: 2 },
            { fieldname: 'qty', columns: 2 },
            { fieldname: 'total', columns: 2 }
        ];
    },

	refresh: function(frm) {

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
						console.log(data);
						cur_frm.set_value("container_no", data.message["container_no"]);
						cur_frm.set_value("voyage_no", data.message["voyage_no"]);
						cur_frm.set_value("vessel", data.message["vessel"]);
						cur_frm.set_value("bol", data.message["bol"]);
						cur_frm.set_value("consignee", data.message["consignee"]);
						cur_frm.set_value("mark", data.message["mark"]);
						cur_frm.set_value("cargo_type", data.message["cargo_type"]);
						cur_frm.set_value("cargo_description", data.message["cargo_description"]);
                        cur_frm.set_value("devanning_date", data.message["devanning_date"]);
                        cur_frm.set_value("weight", data.message["net_weight"]);
						cur_frm.set_value("volume", data.message["volume"]);

						cur_frm.set_df_property("voyage_no", "read_only", 1);
						cur_frm.set_df_property("cargo_type", "read_only", 1);
						cur_frm.set_df_property("consignee", "read_only", 1);
						cur_frm.set_df_property("mark", "read_only", 1);
						cur_frm.set_df_property("vessel", "read_only", 1);
						cur_frm.set_df_property("work_type", "read_only", 1);
						cur_frm.set_df_property("bol", "read_only", 1);
						cur_frm.set_df_property("container_no", "read_only", 1);
						cur_frm.set_df_property("cargo_description", "read_only", 1);
						cur_frm.set_df_property("devanning_date", "read_only", 1);
						
						cur_frm.set_df_property("storage_days", "read_only", 1);
                        cur_frm.set_df_property("free_storage_days", "read_only", 1);
                        cur_frm.set_df_property("storage_days_charged", "read_only", 1);
    
						cur_frm.set_df_property("status", "read_only", 1);
                        cur_frm.set_df_property("cargo_warehouse_ref", "read_only", 1);
                        cur_frm.set_df_property("volume", "read_only", 1);
                        cur_frm.set_df_property("weight", "read_only", 1);
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

        if (frm.doc.cargo_type == "Loose Cargo") {
            frappe.call({
                "method": "frappe.client.get",
                args: {
                    doctype: "Warehouse Storage Fee",
                    filters: {
                        cargo_type: frm.doc.cargo_type,
                    }
                },
                callback: function(data) {
                    cur_frm.set_value("free_storage_days", data.message["grace_days"]);
                }
            })
        } else if (frm.doc.cargo_type == "Vehicles") {
            frappe.call({
                "method": "frappe.client.get",
                args: {
                    doctype: "Warehouse Storage Fee",
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
    insert_fees: function(frm) {
        return frappe.call({
            method: "insert_fees",
            doc: frm.doc,
            callback: function(fees) {
                frm.refresh_fields();
                console.log(fees);
            }
        });
    },
    discount: function(frm) {
        if (frm.doc.discount == "NO") {
            frm.set_value("total", frm.doc.total_fee);
        } else if (frm.doc.discount == "YES") {
            frm.set_value("total", (frm.doc.total_fee) - frm.doc.discount_amount);
        }
    },
    discount_amount: function(frm) {
        frm.set_value("total", (frm.doc.total_fee) - frm.doc.discount_amount);
    },
});
