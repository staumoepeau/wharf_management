// Copyright (c) 2020, Sione Taumoepeau and contributors
// For license information, please see license.txt
frappe.provide("wharf_management.enquire_cargo_fees");
frappe.ui.form.on('Enquire Cargo Fees', {



    refresh: function(frm) {
        frm.disable_save();
        frm.page.hide_actions_menu();

        frm.page.set_primary_action(__("Save"), function() {
            //frm.add_custom_button(__("Save"), function() {

            frm.save()
            frm.set_value("check", 1)
        });

        frm.page.add_action_icon(__("fa fa-print text-success"), function() {

            //        frm.add_custom_button(__("Print"), function() {
            var w = window.open("/printview?doctype=Enquire%20Cargo%20Fees&name=" + cur_frm.doc.name + "&trigger_print=1&format=Enquire%20Cargo%20Fees&no_letterhead=0&_lang=es");

            if (!w) {
                frappe.msgprint(__("Please enable pop-ups"));
                return;
            }
        });

        frm.page.set_secondary_action(__("Refresh"), function() {
            //        frm.add_custom_button(__("Refresh"), function() {
            //            alert("Hello")
            location.reload(true);
            frappe.model.clear_table(frm.doc, "wharf_fee_item_check");
            frappe.model.clear_table(frm.doc, "cargo_references_table_check");
            frappe.call({
                method: "wharf_management.wharf_management.doctype.enquire_cargo_fees.enquire_cargo_fees.clear_table",

                callback: function(r) {
                    //                    alert(r.message);
                },

            });
            frm.reload_doc()
            frm.update()
                //            frm.refresh();
        });


        if (frappe.user.has_role("System Manager")) {
            frm.page.sidebar.show(); // this removes the sidebar
            $(".timeline").show()
            frm.page.wrapper.find(".layout-main-section-wrapper").addClass("col-md-10");
        } else {
            frm.page.sidebar.hide(); // this removes the sidebar
            $(".timeline").hide()
            frm.page.wrapper.find(".layout-main-section-wrapper").removeClass("col-md-10"); // this removes class "col-md-10" from content block, which sets width to 83%
        }

    },
    today_date: function(frm) {

        frm.refresh();
        frappe.model.clear_table(frm.doc, "wharf_fee_item_check");
        frappe.model.clear_table(frm.doc, "cargo_references_table_check");
        frm.set_value("total_fee_to_paid", " ");
    },

    user: function(frm) {
        if (!frappe.user.has_role("System Manager")) {
            frappe.call({
                "method": "frappe.client.get",
                args: {
                    doctype: "Agent User",
                    filters: { user: frm.doc.user }
                },
                callback: function(data) {

                    if (frappe.session.user == data.message["user"]) {
                        frm.set_value("agents", data.message["agent"])
                    }
                }
            })
        } else if (frappe.user.has_role("System Manager") || frappe.user.has_role("Wharf Operation Cashier")) {
            cur_frm.set_value("agents", " ")
        }
    },

    onload: function(frm) {
        frm.set_value("check", 0)

        wharf_management.enquire_cargo_fees.setup_cargo_queries(frm);

        frm.set_query("user", function(doc) {
            return {
                filters: {
                    'user': frappe.session.user
                }
            };
        });

        //        frm.set_value('today_date', frappe.datetime.nowdate());
        frm.set_value("user", frappe.session.user);
        frappe.model.clear_table(frm.doc, "wharf_fee_item_check");
        frappe.model.clear_table(frm.doc, "cargo_references_table_check");
        frm.set_value("total_fee_to_paid", " ");
    },

    update_fees: function(frm) {
        get_storage_fee(frm)
        get_wharfage_fee(frm)
    }
});

var get_storage_fee = function(frm) {
    frappe.call({
        method: "wharf_management.wharf_management.doctype.enquire_cargo_fees.enquire_cargo_fees.get_storage_fees",
        args: {
            "docname": frm.doc.name,
        },
        callback: function(r) {
            //            alert(frm.doc.name)
            console.log(r.message)
            if (r.message) {
                if (frm.doc.wharf_fee_item_check) {
                    frm.set_value("wharf_fee_item_check", [])
                }
                $.each(r.message, function(i, item) {
                    var item_row = frm.add_child("wharf_fee_item_check")
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
var get_wharfage_fee = function(frm) {
    frappe.call({
        method: "wharf_management.wharf_management.doctype.enquire_cargo_fees.enquire_cargo_fees.get_wharfage_fees",
        args: {
            "docname": frm.doc.name,
        },
        callback: function(r) {
            if (r.message) {
                $.each(r.message, function(i, item) {
                    var item_row = frm.add_child("wharf_fee_item_check")
                    console.log(item)
                    item_row.item = item.wharfage_item_code,
                        item_row.description = item.description,
                        item_row.price = item.price,
                        item_row.qty = item.qty,
                        item_row.total = item.total
                    get_net_total_fee(frm)
                    frm.save()
                });
            }
        }
    });
}

var get_net_total_fee = function(frm) {
    var doc = frm.doc;

    doc.net_total = 0.0
    if (doc.wharf_fee_item_check) {
        $.each(doc.wharf_fee_item_check, function(index, data) {
            doc.net_total += data.total
        })
    }
    frm.set_value("total_fee_to_paid", doc.net_total);
    refresh_field('total_fee_to_paid')
}

$.extend(wharf_management.enquire_cargo_fees, {

    setup_cargo_queries: function(frm) {
        if (!frappe.user.has_role("System Manager") & !frappe.user.has_role("Wharf Operation Cashier")) {
            frm.fields_dict['cargo_references_table_check'].grid.get_field("reference_doctype").get_query = function(doc, cdt, cdn) {
                return {
                    filters: [
                        ['Cargo', 'docstatus', '=', 1],
                        ['Cargo', 'status', 'in', ['Yard', 'Inspection Delivered', 'Split Ports']],
                        ['Cargo', 'agents', '=', frm.doc.agents],
                    ]
                }
            }
        } else {
            frm.fields_dict['cargo_references_table_check'].grid.get_field("reference_doctype").get_query = function(doc, cdt, cdn) {
                return {
                    filters: [
                        ['Cargo', 'docstatus', '=', 1],
                        ['Cargo', 'status', 'in', ['Yard', 'Inspection Delivered', 'Split Ports']],
                    ]
                }
            }

        }
    }
});

frappe.ui.form.on("Cargo References Check", "reference_doctype", function(frm, cdt, cdn) {
    var d = locals[cdt][cdn];
    var cargo_a = ["Container", "Tank Tainers", "Flatrack", "Split Ports"];

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

                    frappe.model.set_value(d.doctype, d.name, "free_storage_days", data.message["grace_days"]);
                    frappe.model.set_value(d.doctype, d.name, "storage_fee_price", data.message["fee_amount"]);
                    frappe.model.set_value(d.doctype, d.name, "item_code", data.message["name"]);

                }
            })

            var cargo_c = ["Container", "Tank Tainers", "Split Ports"];
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
                        if (data.message) {
                            if (d.cargo_type == "Container" || d.cargo_type == "Split Ports") {
                                frappe.model.set_value(d.doctype, d.name, "wharfage_item_code", data.message["item_name"]);
                                frappe.model.set_value(d.doctype, d.name, "wharfage_fee_price", data.message["fee_amount"]);
                                frappe.model.set_value(d.doctype, d.name, "wharfage_fee", data.message["fee_amount"]);
                            }
                            if (d.cargo_type == "Tank Tainers") {
                                frappe.model.set_value(d.doctype, d.name, "wharfage_item_code", data.message["item_name"]);
                                frappe.model.set_value(d.doctype, d.name, "wharfage_fee_price", data.message["fee_amount"]);
                                frappe.model.set_value(d.doctype, d.name, "wharfage_fee", (data.message["fee_amount"] * d.litre / 100));
                            }
                        } else {
                            msgprint("Please check the Wharfage Fee Table for ", d.cargo_type)
                        }
                    }
                })
            }
            if (d.cargo_type == "Flatrack") {
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
                "eta_date": d.eta_date,
                "posting_date": frm.doc.today_date
            },
            callback: function(r) {
                frappe.model.set_value(d.doctype, d.name, "storage_days", r.message);

                var sdays = flt(d.storage_days - d.free_storage_days);

                if (sdays > 0) {

                    frappe.model.set_value(d.doctype, d.name, "charged_storage_days", sdays);
                    frappe.model.set_value(d.doctype, d.name, "storage_fee", sdays * d.storage_fee_price);

                } else if (sdays <= 0) {
                    frappe.model.set_value(d.doctype, d.name, "charged_storage_days", 0);
                    frappe.model.set_value(d.doctype, d.name, "storage_fee", (0 * d.storage_fee_price));

                }

            }
        })
    } else if (!d.reference_doctype) {
        msgprint("Please select a Cargo")
    }
});

frappe.ui.form.on("Wharf Fee Item Check", {
    qty: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn];

        frappe.model.set_value(d.doctype, d.name, "total", d.price * d.qty);

        var total = 0;
        frm.doc.wharf_fee_item_check.forEach(function(d) { total += d.total; });

        //        frm.set_value("net_total", total);
        frm.set_value("total_fee_to_paid", total);
        cur_frm.refresh();
    },
    total: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn];
        frappe.model.set_value(d.doctype, d.name, "net_total", d.total);
        var total_fees = 0;
        frm.doc.wharf_fee_item_check.forEach(function(i) { total_fees += i.total; });

        //        frm.set_value("net_total", total_fees);
        frm.set_value("total_fee_to_paid", total);

    },
    wharf_fee_item_check_remove: function(frm, cdt, cdn) {
        var total = 0;
        frm.doc.wharf_fee_item_check.forEach(function(d) { total += d.total; });

        //        frm.set_value("net_total", total);
        frm.set_value("total_fee_to_paid", total);
        cur_frm.refresh();
    }
});