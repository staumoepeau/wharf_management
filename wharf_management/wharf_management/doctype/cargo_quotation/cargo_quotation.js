// Copyright (c) 2021, Sione Taumoepeau and contributors
// For license information, please see license.txt
frappe.provide("wharf_management.cargo_quotation");

frappe.ui.form.on('Cargo Quotation', {
	refresh: function(frm) {
		if (frm.doc.docstatus == 0) {
            if (!frm.doc.posting_date) {
                frm.set_value('posting_date', frappe.datetime.nowdate());
            }
            if (!frm.doc.posting_time) {
                frm.set_value('posting_time', frappe.datetime.now_time());
            }
            set_posting_date_time(frm)
        }

	},

	onload: function(frm) {

        if (frm.doc.reference_doctype == "Cargo") {
            wharf_management.cargo_quotation.setup_cargo_queries(frm);
        }

        if (!frappe.user.has_role("Cargo Operation Manager")) {
            cur_frm.set_df_property("set_posting_time", "hidden", 1);
        } else if (frappe.user.has_role("Cargo Operation Manager")) {
            cur_frm.set_df_property("set_posting_time", "hidden", 0);
        }
    },

	insert_fees_button: function(frm) {
        if (frm.doc.reference_doctype == "Cargo") {
            get_storage_fee(frm)
            get_wharfage_fee(frm)

        }
        if (frm.doc.reference_doctype == "Overdue Storage") {
            get_storage_fee(frm)
            get_wharfage_fee_overdue(frm)
        }
        if (frm.doc.reference_doctype == "Booking Request") {
            get_fees_booking(frm)
            get_berthed_fees(frm)
        }
        if (frm.doc.reference_doctype == "Export") {
            get_export_storage_fee(frm)
            get_export_wharfage_fee(frm)
        }
	},

	set_posting_time: function(frm) {
        set_posting_date_time(frm)
	}
	
});


var set_posting_date_time = function(frm) {
    if (frm.doc.docstatus == 0 && frm.doc.set_posting_time) {
        frm.set_df_property('posting_date', 'read_only', 0);
        frm.set_df_property('posting_time', 'read_only', 0);
    } else {
        frm.set_df_property('posting_date', 'read_only', 1);
        frm.set_df_property('posting_time', 'read_only', 1);
    }
}



var get_net_total_fee = function(frm) {
    var doc = frm.doc;

    doc.net_total = 0.0
    if (doc.wharf_fee_item) {
        $.each(doc.wharf_fee_item, function(index, data) {
            doc.net_total += data.total
        })
    }

    if (frm.doc.reference_doctype == "Cargo" || frm.doc.reference_doctype == "Export") {
        frm.set_value("total_amount", doc.net_total);
    }
    
    refresh_field('net_total')
    refresh_field('total_amount')
}

var get_storage_fee = function(frm) {
    frappe.call({
        method: "wharf_management.wharf_management.doctype.wharf_payment_entry.wharf_payment_entry.get_storage_fees",
        args: {
            "docname": frm.doc.name,
        },
        callback: function(r) {
            if (r.message) {
                if (frm.doc.wharf_fee_item) {
                    frm.set_value("wharf_fee_item", [])
                }
                $.each(r.message, function(i, item) {
                    var item_row = frm.add_child("wharf_fee_item")
                        //                    console.log(item)
                    item_row.item = item.item_code,
                        item_row.description = item.description,
                        item_row.price = item.price,
                        item_row.qty = item.qty,
                        item_row.total = item.total

                });

            }
        }
    });
}

var get_wharfage_fee = function(frm) {
    frappe.call({
        method: "wharf_management.wharf_management.doctype.wharf_payment_entry.wharf_payment_entry.get_wharfage_fees",
        args: {
            "docname": frm.doc.name,
        },
        callback: function(r) {
            if (r.message) {
                $.each(r.message, function(i, item) {
                    var item_row = frm.add_child("wharf_fee_item")
                    console.log(item)
                    item_row.item = item.wharfage_item_code,
                        item_row.description = item.description,
                        item_row.price = item.price,
                        item_row.qty = item.qty,
                        item_row.total = item.total
                        //                    }
                    frm.refresh()
                    get_net_total_fee(frm)
                    frm.save()
                });
            }
        }
    });
}

$.extend(wharf_management.cargo_quotation, {

    setup_cargo_queries: function(frm) {
        frm.fields_dict['cargo_references_table'].grid.get_field("reference_doctype").get_query = function(doc, cdt, cdn) {
            return {
                filters: [
                    ['Cargo', 'docstatus', '=', 1],
                    ['Cargo', 'status', 'in', ['Yard', 'Inspection Delivered', 'Split Ports']],
                    ['Cargo', 'consignee', '=', frm.doc.customer],
                ]
            }
        }
    },
});

frappe.ui.form.on("Wharf Fee Item", {
    qty: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn];

        frappe.model.set_value(d.doctype, d.name, "total", d.price * d.qty);

        var total = 0;
        frm.doc.wharf_fee_item.forEach(function(d) { total += d.total; });

        frm.set_value("net_total", total);
        frm.set_value("total_amount", total);
        cur_frm.refresh();
    },

    discount: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn];

        frappe.model.set_value(d.doctype, d.name, "total", (d.price * d.qty) - d.discount);
        frappe.model.set_value(d.doctype, d.name, "discount_percent", (d.discount / (d.price * d.qty) * 100));

        var total = 0;
        frm.doc.wharf_fee_item.forEach(function(d) { total += d.total; });

        frm.set_value("net_total", total);
        frm.set_value("total_amount", total);
        cur_frm.refresh();
    },
    discount_percent: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn];

        frappe.model.set_value(d.doctype, d.name, "total", (d.price * d.qty) - ((d.price * d.qty) * (d.discount_percent / 100)));
        frappe.model.set_value(d.doctype, d.name, "discount", ((d.price * d.qty) * (d.discount_percent / 100)));
        var total = 0;
        frm.doc.wharf_fee_item.forEach(function(d) { total += d.total; });
        frm.set_value("net_total", total);
        frm.set_value("total_amount", total);
        cur_frm.refresh();
    },


    total: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn];
        frappe.model.set_value(d.doctype, d.name, "net_total", d.total);
        var total_fees = 0;
        frm.doc.wharf_fee_item.forEach(function(i) { total_fees += i.total; });
        frm.set_value("net_total", total_fees);
        frm.set_value("total_amount", total);
    },

    wharf_fee_item_remove: function(frm, cdt, cdn) {
        var total = 0;
        frm.doc.wharf_fee_item.forEach(function(d) { total += d.total; });

        frm.set_value("net_total", total);
        frm.set_value("total_amount", total);
        frm.refresh();
    }

});

//frm.fields_dict.child_table_name.grid.toggle_reqd("child_table_fieldname", condition)


frappe.ui.form.on("Cargo References", "reference_doctype", function(frm, cdt, cdn) {
    var d = locals[cdt][cdn];
    var cargo_a = ["Container", "Tank Tainers", "Flatrack", "Split Ports"];
    if (d.storage_overdue != 1) {
        var eta = d.eta_date;
    } else if (d.storage_overdue == 1) {
        var eta = d.previous_payment_date;
    }

    if (d.reference_doctype) {

        if (cargo_a.includes(d.cargo_type)) {
            frappe.call({
                    "method": "frappe.client.get",
                    args: {
                        doctype: "Wharf Fees",
                        filters: {
                            wharf_fee_category: "Storage Fee",
                            cargo_type: d.cargo_type,
                            container_size: d.container_size,
                            container_content: d.container_content
                        }
                    },
                    callback: function(data) {
                        console.log(data)
                        if (d.storage_overdue != 1) {
                            frappe.model.set_value(d.doctype, d.name, "free_storage_days", data.message["grace_days"]);
                        } else if (d.storage_overdue == 1) {
                            frappe.model.set_value(d.doctype, d.name, "free_storage_days", 0);
                        }

                        frappe.model.set_value(d.doctype, d.name, "storage_fee_price", data.message["fee_amount"]);
                        frappe.model.set_value(d.doctype, d.name, "item_code", data.message["name"]);


                    }
                })
                //            if (d.storage_overdue != 1) {
            var cargo_c = ["Container", "Tank Tainers", "Flatrack"];
            if (cargo_c.includes(d.cargo_type)) {
                frappe.call({
                    "method": "frappe.client.get",
                    args: {
                        doctype: "Wharf Fees",
                        filters: {
                            wharf_fee_category: "Wharfage Fee",
                            cargo_type: d.cargo_type,
                            container_size: d.container_size,
                        }
                    },
                    callback: function(data) {
                        console.log(d.litre)
                        if (data.message) {
                            if (d.cargo_type == "Container" || d.cargo_type == "Flatrack") {
                                frappe.model.set_value(d.doctype, d.name, "wharfage_item_code", data.message["item_name"]);
                                frappe.model.set_value(d.doctype, d.name, "wharfage_fee_price", data.message["fee_amount"]);
                                frappe.model.set_value(d.doctype, d.name, "wharfage_fee", data.message["fee_amount"]);
                            }
                            if (d.cargo_type == "Tank Tainers") {
                                if (d.litre) {
                                    frappe.model.set_value(d.doctype, d.name, "wharfage_item_code", data.message["item_name"]);
                                    frappe.model.set_value(d.doctype, d.name, "wharfage_fee_price", data.message["fee_amount"]);
                                    frappe.model.set_value(d.doctype, d.name, "wharfage_fee", (data.message["fee_amount"] * d.litre / 1000));
                                } else if (!d.includes) {
                                    frappe.throw(__("Please check the Liter for this Tank Tainer"));
                                }
                            }
                        } else {
                            frappe.throw(__("Please check the Wharfage Fee Table for ", d.cargo_type));
                        }
                    }
                })
            }

            if (d.cargo_type == "Split Ports") {
                frappe.call({
                    "method": "frappe.client.get",
                    args: {
                        doctype: "Wharf Fees",
                        filters: {
                            wharf_fee_category: "Wharfage Fee",
                            cargo_type: d.cargo_type,
                            container_size: d.container_size,
                        }
                    },
                    callback: function(data) {
                        frappe.model.set_value(d.doctype, d.name, "wharfage_item_code", data.message["item_name"]);
                        frappe.model.set_value(d.doctype, d.name, "wharfage_fee_price", data.message["fee_amount"]);
                        if (d.net_weight > d.volume) {
                            frappe.model.set_value(d.doctype, d.name, "wharfage_fee", (data.message["fee_amount"] * d.net_weight));
                        }
                        if (d.net_weight < d.volume) {
                            frappe.model.set_value(d.doctype, d.name, "wharfage_fee", (data.message["fee_amount"] * d.volume));
                        }
                    }
                })
            }
            //           }
        }
        var cargo_b = ["Heavy Vehicles", "Break Bulk", "Loose Cargo"];
        if (cargo_b.includes(d.cargo_type)) {
            frappe.call({
                    "method": "frappe.client.get",
                    args: {
                        doctype: "Wharf Fees",
                        filters: {
                            wharf_fee_category: "Storage Fee",
                            cargo_type: d.cargo_type,
                        }
                    },
                    callback: function(data) {
                        if (d.storage_overdue != 1) {
                            frappe.model.set_value(d.doctype, d.name, "free_storage_days", data.message["grace_days"]);
                        } else if (d.storage_overdue == 1) {
                            frappe.model.set_value(d.doctype, d.name, "free_storage_days", 0);
                        }
                        frappe.model.set_value(d.doctype, d.name, "storage_fee_price", data.message["fee_amount"]);
                        frappe.model.set_value(d.doctype, d.name, "item_code", data.message["name"]);
                    }
                })
                //           if (d.storage_overdue != 1) {
            frappe.call({
                    "method": "frappe.client.get",
                    args: {
                        doctype: "Wharf Fees",
                        filters: {
                            wharf_fee_category: "Wharfage Fee",
                            cargo_type: d.cargo_type,
                        }
                    },
                    callback: function(data) {
                        frappe.model.set_value(d.doctype, d.name, "wharfage_item_code", data.message["item_name"]);
                        frappe.model.set_value(d.doctype, d.name, "wharfage_fee_price", data.message["fee_amount"]);
                        if (d.net_weight > d.volume) {
                            frappe.model.set_value(d.doctype, d.name, "wharfage_fee", (data.message["fee_amount"] * d.net_weight));
                        }
                        if (d.net_weight < d.volume) {
                            frappe.model.set_value(d.doctype, d.name, "wharfage_fee", (data.message["fee_amount"] * d.volume));
                        }
                    }
                })
                //            }
        }
        if (d.cargo_type == "Vehicles") {
            frappe.call({
                    "method": "frappe.client.get",
                    args: {
                        doctype: "Wharf Fees",
                        filters: {
                            wharf_fee_category: "Storage Fee",
                            cargo_type: d.cargo_type,
                        }
                    },
                    callback: function(data) {
                        if (d.storage_overdue != 1) {
                            frappe.model.set_value(d.doctype, d.name, "free_storage_days", data.message["grace_days"]);
                        } else if (d.storage_overdue == 1) {
                            frappe.model.set_value(d.doctype, d.name, "free_storage_days", 0);
                        }
                        frappe.model.set_value(d.doctype, d.name, "storage_fee_price", data.message["fee_amount"]);
                        frappe.model.set_value(d.doctype, d.name, "item_code", data.message["name"]);

                    }
                })
                //           if (d.storage_overdue != 1) {
            frappe.call({
                    "method": "frappe.client.get",
                    args: {
                        doctype: "Wharf Fees",
                        filters: {
                            wharf_fee_category: "Wharfage Fee",
                            cargo_type: d.cargo_type,
                        }
                    },
                    callback: function(data) {
                        frappe.model.set_value(d.doctype, d.name, "wharfage_item_code", data.message["item_name"]);
                        frappe.model.set_value(d.doctype, d.name, "wharfage_fee_price", data.message["fee_amount"]);
                        if (d.net_weight > d.volume) {
                            frappe.model.set_value(d.doctype, d.name, "wharfage_fee", (data.message["fee_amount"] * d.net_weight));
                        }
                        if (d.net_weight < d.volume) {
                            frappe.model.set_value(d.doctype, d.name, "wharfage_fee", (data.message["fee_amount"] * d.volume));
                        }
                    }
                })
                //           }
        }


        frappe.call({
            method: "wharf_management.wharf_management.doctype.wharf_payment_entry.wharf_payment_entry.get_storage_days",
            args: {
                "eta_date": eta,
                "posting_date": frm.doc.posting_date
            },
            callback: function(r) {
                console.log(eta)
                frappe.model.set_value(d.doctype, d.name, "storage_days", r.message);

                let sdays = flt(d.storage_days - d.free_storage_days);
                //                alert(sdays)
                if (sdays > 0) {

                    //                if (d.free_storage_days < d.storage_days) {
                    //                    var sdays = flt(d.storage_days - d.free_storage_days);
                    frappe.model.set_value(d.doctype, d.name, "charged_storage_days", sdays);

                    if (cargo_a.includes(d.cargo_type)) {
                        frappe.model.set_value(d.doctype, d.name, "storage_fee", sdays * d.storage_fee_price);
                    }
                    if (cargo_b.includes(d.cargo_type)) {
                        if (d.net_weight > d.volume) {
                            frappe.model.set_value(d.doctype, d.name, "storage_fee", sdays * d.net_weight * d.storage_fee_price);
                        }
                        if (d.net_weight < d.volume) {
                            frappe.model.set_value(d.doctype, d.name, "storage_fee", sdays * d.volume * d.storage_fee_price);
                        }
                    }
                    if (d.cargo_type == "Vehicles") {
                        frappe.model.set_value(d.doctype, d.name, "storage_fee", sdays * d.storage_fee_price);
                    }
                    //                    frappe.model.set_value(d.doctype, d.name, "storage_fee", sdays * d.storage_fee_price);
                }
                if (sdays <= 0) {
                    console.log(sdays)
                    frappe.model.set_value(d.doctype, d.name, "charged_storage_days", 0);
                    frappe.model.set_value(d.doctype, d.name, "storage_fee", 0 * d.storage_fee_price);
                }
            }
        })

    } else if (!d.reference_doctype) {
        msgprint("Please select a Cargo")
    }
});
