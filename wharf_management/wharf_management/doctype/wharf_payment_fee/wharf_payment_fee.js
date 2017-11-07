// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt
//{% include 'erpnext/selling/sales_common.js' %};

frappe.ui.form.on('Wharf Payment Fee', {


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

    custom_code: function(frm) {
        if (frm.doc.custom_code == "DDL") {
            frm.set_value("delivery_code", "DIRECT DELIVERY")
        } else if (frm.doc.custom_code == "DDLW") {
            frm.set_value("delivery_code", "DIRECT DELIVERY WAREHOUSE")
        } else if (frm.doc.custom_code == "IDL") {
            frm.set_value("delivery_code", "INSPECTION DELIVERY")
        } else if (frm.doc.custom_code == "IDLW") {
            frm.set_value("delivery_code", "INSPECTION DELIVERY WAREHOUSE")
        }
        if (frm.doc.bulk_payment == "Yes") {
            cur_frm.set_value("bulk_payment_code", frm.doc.custom_warrant)
                //frm.set_value("custom_warrant", 0)
            frm.set_value("custom_warrant", frm.doc.bulk_payment_code + "-" + frm.doc.bulk_item)


            frm.refresh_fields("custom_warrant");
        }
    },

    //    calculate_fees: function(frm) {
    //
    //        frappe.call({
    //            method: "get_storage_fee",
    //            doc: frm.doc,
    //            callback: function(s) {
    //                console.log(s.message)
    //                var sfee = flt((s.message) * frm.doc.storage_days_charged);
    //                frm.set_value("storage_fee", sfee);
    //            }
    //        });
    //        frappe.call({
    //            method: "get_wharfage_fee",
    //            doc: frm.doc,
    //            callback: function(w) {
    //                var wfee = flt((w.message));
    //                frm.set_value("wharf_fee", wfee);
    //           }
    //        });
    //  },
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
    discount: function(frm) {
        if (frm.doc.discount == "No") {
            frm.set_value("total_amount", frm.doc.total_fee + frm.doc.tax_amount);
        } else if (frm.doc.discount == "Yes") {
            frm.set_value("total_amount", (frm.doc.total_fee + frm.doc.tax_amount) - frm.doc.discount_amount);
        }
    },
    discount_amount: function(frm) {
        frm.set_value("total_amount", (frm.doc.total_fee + frm.doc.tax_amount) - frm.doc.discount_amount);
    },

    //tax: function(frm) {
    //    frm.set_value("tax_account", "CT - PAT");
    //    if (frm.doc.tax == "Yes") {
    //        frappe.call({
    //            "method": "frappe.client.get",
    //            args: {
    //                doctype: "Sales Taxes and Charges",
    //                filters: {
    //                    parent: frm.doc.tax_account
    //                }
    //            },
    //            callback: function(data) {
    //                cur_frm.set_value("tax_rate", data.message["rate"]);
    //                cur_frm.set_value("tax_amount", (((data.message["rate"]) / 100) * frm.doc.total_fee));
    //                cur_frm.set_df_property("tax_rate", "read_only", 1);
    //                cur_frm.set_df_property("tax_account", "read_only", 1);
    //                cur_frm.set_df_property("tax_amount", "read_only", 1);
    //            }
    //       })
    //    } else if (frm.doc.tax == "No") {
    //        cur_frm.set_value("tax_rate", 0);
    //        cur_frm.set_value("tax_amount", 0);
    //        frm.refresh_fields("discount");
    //    }
    //},
    //    custom_warrant: function(frm) {
    //        if (frm.doc.bulk_payment == "Yes") {
    //            cur_frm.set_value("bulk_payment_code", frm.doc.custom_warrant)
    //        }
    //    },

});


frappe.ui.form.on("Wharf Fee Item", "total", function(frm, cdt, cdn) {
    var d = locals[cdt][cdn];
    frappe.model.set_value(d.doctype, d.name, "total_fee", d.total);

    var total_fees = 0;
    frm.doc.wharf_fee_item.forEach(function(d) { total_fees += d.total; });

    frm.set_value("total_fee", total_fees);

});

frappe.ui.form.on("Wharf Fee Item", "item", function(frm, cdt, cdn) {
    var d = locals[cdt][cdn];
    frappe.call({
        "method": "frappe.client.get",
        args: {
            doctype: "Item",
            filters: {
                'name': d.item
            },
        },
        callback: function(data) {
            frappe.model.set_value(d.doctype, d.name, "price", data.message["standard_rate"]);
            frappe.model.set_value(d.doctype, d.name, "description", data.message["description"]);
        }
    })
});

frappe.ui.form.on("Wharf Fee Item", "qty", function(frm, cdt, cdn) {
    var d = locals[cdt][cdn];

    frm.doc.wharf_fee_item.forEach(function(d) {
        flt(total += flt(d.price * d.qty))

        frm.set_value("total", total);
    })
});