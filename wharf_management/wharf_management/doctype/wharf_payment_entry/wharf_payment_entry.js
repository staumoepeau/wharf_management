// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.provide("wharf_management.wharf_payment_entry");

frappe.ui.form.on('Wharf Payment Entry', {

    on_submit: function(frm) {
        if (frm.doc.docstatus == 1) {
            if (frm.doc.status != "Paid") {
                frm.set_value('status', "Paid");
            }
        }
    },

    refresh: function(frm) {
        if (frm.doc.discount == "YES") {
            frm.set_df_property("who_authorized_discount", "reqd", 1);
        } else if (frm.doc.discount == "NO" || frm.doc.discount == "") {
            frm.set_df_property("who_authorized_discount", "reqd", 0);
        }
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

    before_submit: function(frm) {
        if (!frm.doc.status) {
            frm.set_value("status", "Paid");
        }
        frm.save('Update');

        if (frm.doc.total_amount != frm.doc.paid_amount) {
            frappe.throw(__("Please make sure the Paid Amount is Correct "));
        }
        if (frm.doc.outstanding_amount != 0) {
            frappe.throw(__("Please make sure the Paid Amount is Correct "));
        }
    },

    validate: function(frm) {

        //    var cur_doc = frm.doc
        //    $(frm.fields_dict["barcode_image"].wrapper).html("<svg id='code128'></svg>");
        //    JsBarcode("#code128", cur_doc.name, {
        //        height: 35,
        //        fontSize: 14,
        //        textAlign: "center",
        //        lineColor: "#36414c",
        //        width: 1,
        //        margin: 0
        //    });
        //    var svg = $('#code128').parent().html();
        //   frappe.model.set_value(cur_doc.doctype, cur_doc.name, "barcode_svg", svg);

    },
    onload: function(frm) {

        if (frm.doc.reference_doctype == "Cargo") {
            wharf_management.wharf_payment_entry.setup_cargo_queries(frm);
            frm.set_df_property('delivery_code', 'hidden', 0);
            frm.set_df_property('delivery_information', 'hidden', 0);
            frm.set_df_property('custom_warrant', 'hidden', 0);
        }
        if (frm.doc.reference_doctype == "Overdue Storage") {
            wharf_management.wharf_payment_entry.setup_cargo_overdue_queries(frm);
            frm.set_df_property('delivery_code', 'hidden', 0);
            frm.set_df_property('delivery_information', 'hidden', 0);
            frm.set_df_property('custom_warrant', 'hidden', 1);
        }
        if (frm.doc.reference_doctype == "Booking Request") {
            wharf_management.wharf_payment_entry.setup_booking_queries(frm);
            frm.set_df_property('delivery_code', 'hidden', 1);
            frm.set_df_property('delivery_information', 'hidden', 1);
            frm.set_df_property('custom_warrant', 'hidden', 1);
        }
        if (frm.doc.reference_doctype == "Export") {
            wharf_management.wharf_payment_entry.setup_export_booking_queries(frm);
            frm.set_df_property('delivery_code', 'hidden', 1);
            frm.set_df_property('delivery_information', 'hidden', 1);
            frm.set_df_property('custom_warrant', 'hidden', 0);
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

    paid_amount: function(frm) {

        if (frm.doc.total_amount > frm.doc.paid_amount) {
            frm.set_value("outstanding_amount", (frm.doc.total_amount - frm.doc.paid_amount));
            frm.set_value("change_amount", 0.00)
            cur_frm.set_df_property("change_amount", "read_only", 1)
            cur_frm.set_df_property("outstanding_amount", "read_only", 1)

        }
        if (frm.doc.total_amount < frm.doc.paid_amount) {
            frm.set_value("change_amount", (frm.doc.paid_amount - frm.doc.total_amount));
            frm.set_value("outstanding_amount", 0.00);
            cur_frm.set_df_property("change_amount", "read_only", 1)
            cur_frm.set_df_property("outstanding_amount", "read_only", 1)
        }
        if (frm.doc.total_amount == frm.doc.paid_amount) {
            frm.set_value("change_amount", 0.00)
            frm.set_value("outstanding_amount", 0.00);
            cur_frm.set_df_property("change_amount", "read_only", 1)
            cur_frm.set_df_property("outstanding_amount", "read_only", 1)
        }
    },
    set_doctype_reference: function(frm) {

        if (frm.doc.docstatus == 0) {
            if (!frm.doc.reference_doctype) {
                frm.set_df_property("reference_doctype", "read_only", 0);
                frm.set_df_property("reference_doctype", "reqd", 1);
                frm.set_df_property("customer", "reqd", 1);
                frm.set_df_property("data_35", "hidden", 1);
                frm.set_df_property("custom_warrant", "read_only", 1);
            }
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
        frm.set_df_property('amount_to_paid', 'hidden', 1);
    }
    if (frm.doc.reference_doctype == "Booking Request") {
        frm.set_value("total_amount", (doc.net_total / 2));
        frm.set_df_property('amount_to_paid', 'hidden', 0);
        frm.set_value("amount_to_paid", (doc.net_total / 2));
    }
    refresh_field('net_total')
    refresh_field('amount_to_paid')
    refresh_field('total_amount')
}

var get_fees_booking = function(frm) {

    frappe.call({
        method: "wharf_management.wharf_management.doctype.wharf_payment_entry.wharf_payment_entry.get_booking_handling_fee",
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
                    console.log(item)
                    item_row.item = item.item_code,
                        item_row.description = "Cargo Handling Fees",
                        item_row.price = item.handling_fee,
                        item_row.qty = 1,
                        item_row.total = (item.handling_fee * 1)
                });

            }
        }
    });
}

var get_berthed_fees = function(frm) {
    frappe.call({
        method: "wharf_management.wharf_management.doctype.wharf_payment_entry.wharf_payment_entry.get_booking_berthed_fee",
        args: {
            "docname": frm.doc.name,
        },
        callback: function(r) {
            if (r.message) {
                $.each(r.message, function(i, item) {
                    var item_row = frm.add_child("wharf_fee_item")
                    console.log(item)

                    item_row.item = item.berthed_fee_code,
                        item_row.description = "Cargo Vessel Berthed Fees",
                        item_row.price = item.berthed_fee,
                        item_row.qty = 1,
                        item_row.total = (item.berthed_fee * 1),

                        get_net_total_fee(frm)
                    frm.save()
                });

            }
        }
    });
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
var get_wharfage_fee_overdue = function(frm) {
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
                        item_row.price = 0,
                        item_row.qty = 0,
                        item_row.total = 0
                        //                    }
                    frm.refresh()
                    get_net_total_fee(frm)
                    frm.save()
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

var get_export_storage_fee = function(frm) {

    frappe.call({
        method: "wharf_management.wharf_management.doctype.wharf_payment_entry.wharf_payment_entry.get_export_storage_fees",
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
                    console.log(item)
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
var get_export_wharfage_fee = function(frm) {
    frappe.call({
        method: "wharf_management.wharf_management.doctype.wharf_payment_entry.wharf_payment_entry.get_export_wharfage_fees",
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
                    frm.refresh()
                    get_net_total_fee(frm)
                    frm.save()
                });
            }
        }
    });
}

$.extend(wharf_management.wharf_payment_entry, {

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
    setup_cargo_overdue_queries: function(frm) {
        frm.fields_dict['cargo_references_table'].grid.get_field("reference_doctype").get_query = function(doc, cdt, cdn) {
            return {
                filters: [
                    ['Cargo', 'docstatus', '=', 1],
                    ['Cargo', 'status', 'in', ['Paid']],
                    ['Cargo', 'consignee', '=', frm.doc.customer],
                    ['Cargo', 'storage_overdue', '=', 1],
                ]
            }
        }
    },
    setup_booking_queries: function(frm) {
        frm.fields_dict['booking_request_table'].grid.get_field("booking_reference_doctype").get_query = function(doc, cdt, cdn) {
            return {
                filters: [
                    ['Booking Request', 'docstatus', '=', 1],
                    ['Booking Request', 'status', '=', 'Pending'],
                    ['Booking Request', 'agents', '=', frm.doc.customer],
                ]
            }
        }
    },
    setup_export_booking_queries: function(frm) {
        frm.fields_dict['export_cargo_references_table'].grid.get_field("export_reference_doctype").get_query = function(doc, cdt, cdn) {
            return {
                filters: [
                    ['Export', 'docstatus', '=', 1],
                    ['Export', 'status', 'in', ['Yard']],
                    ['Export', 'customer', '=', frm.doc.customer],
                ]
            }
        }
    }

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


frappe.ui.form.on("Payment Method", {
    mode_of_payment: function(frm, cdt, cdn) {
        var d = frappe.get_doc(cdt, cdn);
        const row = locals[cdt][cdn];

        frm.fields_dict["payment_method"].grid.toggle_reqd("name_on_the_cheque", row.mode_of_payment == "Cheque")
        frm.fields_dict["payment_method"].grid.toggle_reqd("cheque_no", row.mode_of_payment == "Cheque")
        frm.fields_dict["payment_method"].grid.toggle_reqd("account_no", row.mode_of_payment == "Cheque")
        frm.fields_dict["payment_method"].grid.toggle_reqd("cheque_date", row.mode_of_payment == "Cheque")
        frm.fields_dict["payment_method"].grid.toggle_reqd("bank", row.mode_of_payment == "Cheque")
            //var current_row = frm.fields_dict["payment_method"].grid.grid_rows_by_docname[row.name]; 
            //current_row.toggle_reqd("name_on_the_cheque", (row.mode_of_payment == "Cheque"));
            //current_row.toggle_reqd("cheque_no", (row.mode_of_payment == "Cheque"));
            //current_row.toggle_reqd("account_no", (row.mode_of_payment == "Cheque"));
            //current_row.toggle_reqd("cheque_date", (row.mode_of_payment == "Cheque"));
            //current_row.toggle_reqd("bank", (row.mode_of_payment == "Cheque"));
            //        if (d.mode_of_payment = "Cheque") {
            //            frappe.meta.get_docfield(this.doctype, "name_on_the_cheque", this.frm.doc.name).reqd
            //            frappe.model.set_df_property(d.doctype, d.name, 'name_on_the_cheque', 'reqd', 1);
            //        }

    },
    amount: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn];
        frappe.model.set_value(d.doctype, d.name, "total_amount", d.amount);
        var total_amount = 0;
        frm.doc.payment_method.forEach(function(i) { total_amount += i.amount; });
        frm.set_value("paid_amount", total_amount);
    }
});

frappe.ui.form.on("Booking Request References", "booking_reference_doctype", function(frm, cdt, cdn) {
    var d = locals[cdt][cdn];
    frappe.call({
        "method": "frappe.client.get",
        args: {
            doctype: "Wharf Fees",
            filters: {
                wharf_fee_category: "BERTHED Fee",
                vessel_type: d.vessel_type,
            }
        },
        callback: function(data) {
            //            console.log(data)

            frappe.model.set_value(d.doctype, d.name, "grt_fee", data.message["fee_amount"]);
            //            frappe.model.set_value(d.doctype, d.name, "item_code", data.message["name"]);

        }
    })

});

frappe.ui.form.on("Cargo References", {
    reference_doctype: function(frm, cdt, cdn) {
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

                    //                console.log(eta)
                    frappe.model.set_value(d.doctype, d.name, "storage_days", r.message);
                    //frappe.model.set_value(d.doctype, d.name, "charged_storage_days", (r.message - d.free_storage_days));
                    //               frm.save()
                    let charged_days = flt(d.storage_days - d.free_storage_days);
                    alert(charged_days)

                    if (charged_days > 0) {

                        frappe.model.set_value(d.doctype, d.name, "charged_storage_days", charged_days);

                        if (cargo_a.includes(d.cargo_type)) {
                            frappe.model.set_value(d.doctype, d.name, "storage_fee", charged_days * d.storage_fee_price);
                        }
                        if (cargo_b.includes(d.cargo_type)) {
                            if (d.net_weight > d.volume) {
                                frappe.model.set_value(d.doctype, d.name, "storage_fee", charged_days * d.net_weight * d.storage_fee_price);
                            }
                            if (d.net_weight < d.volume) {
                                frappe.model.set_value(d.doctype, d.name, "storage_fee", charged_days * d.volume * d.storage_fee_price);
                            }
                        }
                        if (d.cargo_type == "Vehicles") {
                            frappe.model.set_value(d.doctype, d.name, "storage_fee", charged_days * d.storage_fee_price);
                        }
                        //                    frappe.model.set_value(d.doctype, d.name, "storage_fee", sdays * d.storage_fee_price);
                    }
                    if (storage_days <= 0) {
                        //                    console.log(sdays)
                        frappe.model.set_value(d.doctype, d.name, "charged_storage_days", 0);
                        frappe.model.set_value(d.doctype, d.name, "storage_fee", 0 * d.storage_fee_price);
                    }
                }
            })
        } else if (!d.reference_doctype) {
            frappe.msgprint("Please select a Cargo")
        }
    }
});

frappe.ui.form.on("Export Cargo Reference", "export_reference_doctype", function(frm, cdt, cdn) {
    var d = locals[cdt][cdn];
    var cargo_a = ["Container", "Tank Tainers", "Flatrack", "Split Ports"];

    if (d.export_reference_doctype) {

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
                    //                    console.log(data)

                    frappe.model.set_value(d.doctype, d.name, "free_storage_days", data.message["grace_days"]);
                    frappe.model.set_value(d.doctype, d.name, "storage_fee_price", data.message["fee_amount"]);
                    frappe.model.set_value(d.doctype, d.name, "item_code", data.message["name"]);


                }
            })

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
                        //                        console.log(d.litre)
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
                    frappe.model.set_value(d.doctype, d.name, "free_storage_days", data.message["grace_days"]);
                    frappe.model.set_value(d.doctype, d.name, "storage_fee_price", data.message["fee_amount"]);
                    frappe.model.set_value(d.doctype, d.name, "item_code", data.message["name"]);
                }
            })
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
                    frappe.model.set_value(d.doctype, d.name, "free_storage_days", data.message["grace_days"]);
                    frappe.model.set_value(d.doctype, d.name, "storage_fee_price", data.message["fee_amount"]);
                    frappe.model.set_value(d.doctype, d.name, "item_code", data.message["name"]);

                }
            })
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
        }

        frappe.call({
            method: "wharf_management.wharf_management.doctype.wharf_payment_entry.wharf_payment_entry.get_storage_days",
            args: {
                "eta_date": d.export_main_gate_date,
                "posting_date": frm.doc.posting_date
            },
            callback: function(r) {
                frappe.model.set_value(d.doctype, d.name, "storage_days", r.message);
                let sdays = flt(d.storage_days - d.free_storage_days);


                alert(sdays)

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
    } else if (!d.export_reference_doctype) {
        frappe.msgprint("Please select a Cargo")
    }
});