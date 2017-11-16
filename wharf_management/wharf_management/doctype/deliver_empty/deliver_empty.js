// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Deliver Empty', {
	

    setup: function(frm) {
        frm.get_field('wharf_fee_item').grid.editable_fields = [
            { fieldname: 'item', columns: 2 },
            { fieldname: 'description', columns: 2 },
            { fieldname: 'price', columns: 2 },
            { fieldname: 'qty', columns: 2 },
            { fieldname: 'total', columns: 2 }
        ];
    },

    onload: function(frm) {

        frappe.call({
            "method": "frappe.client.get",
            args: {
                doctype: "Cargo",
                name: frm.doc.cargo_ref,
                filters: {
                    'docstatus': 1
                },
            },
            callback: function(data) {
                cur_frm.set_value("cargo_ref", data.message["name"]);
                cur_frm.set_value("container_no", data.message["container_no"]);
                cur_frm.set_value("voyage_no", data.message["voyage_no"]);
                cur_frm.set_value("vessel", data.message["vessel"]);
                cur_frm.set_value("eta_date", data.message["eta_date"]);
                cur_frm.set_value("cargo_type", data.message["cargo_type"]);
                cur_frm.set_value("work_type", data.message["work_type"]);
                cur_frm.set_value("secondary_work_type", data.message["secondary_work_type"]);
                cur_frm.set_value("agents", data.message["agents"]);
                cur_frm.set_value("weight", data.message["net_weight"]);
                cur_frm.set_value("volume", data.message["volume"]);
                cur_frm.set_value("chasis_no", data.message["chasis_no"]);

                cur_frm.set_value("yard_slot", data.message["yard_slot"]);
                cur_frm.set_value("consignee", data.message["consignee"]);
                cur_frm.set_value("container_type", data.message["container_type"]);

                cur_frm.set_value("container_size", data.message["container_size"]);
                cur_frm.set_value("container_content", data.message["container_content"]);

                cur_frm.set_df_property("naming_series", "hidden", 1);
                cur_frm.set_df_property("voyage_no", "read_only", 1);
                cur_frm.set_df_property("vessel", "read_only", 1);
                cur_frm.set_df_property("eta_date", "read_only", 1);
                cur_frm.set_df_property("cargo_type", "read_only", 1);

                cur_frm.set_df_property("work_type", "read_only", 1);
                cur_frm.set_df_property("secondary_work_type", "read_only", 1);
                cur_frm.set_df_property("container_no", "read_only", 1);
                cur_frm.set_df_property("agents", "read_only", 1);
                cur_frm.set_df_property("yard_slot", "read_only", 1);
                cur_frm.set_df_property("consignee", "read_only", 1);
                cur_frm.set_df_property("container_type", "read_only", 1);
                cur_frm.set_df_property("container_size", "read_only", 1);
                cur_frm.set_df_property("container_content", "read_only", 1);
                cur_frm.set_df_property("free_storage_days", "read_only", 1);
                cur_frm.set_df_property("weight", "read_only", 1);
                cur_frm.set_df_property("volume", "read_only", 1);
                cur_frm.set_df_property("chasis_no", "read_only", 1);

            }
        })
    },


    refresh: function(frm) {

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
});
