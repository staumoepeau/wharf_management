// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Booking Request', {

    onload: function(frm) {

        frm.set_query("user", function(doc) {
            return {
                filters: {
                    'user': frappe.session.user
                }
            };
        });
    },

    user: function(frm) {

        frappe.call({
            "method": "frappe.client.get",
            args: {
                doctype: "Agent User",
                filters: { user: frm.doc.user }
            },
            callback: function(data) {
                if (frappe.session.user == data.message["user"]) {
                    cur_frm.set_value("agents", data.message["agent"])
                }
            }
        })

    },

    eta_date: function(frm) {
        if (frm.doc.etd_date) {
            calculate_working_hours(frm)
        }
    },

    etd_date: function(frm) {

        calculate_working_hours(frm)
        calculate_berthed_half_amount(frm)

    },

    vessel_type: function(frm) {
        if (frm.doc.etd_date) {
            calculate_berthed_half_amount(frm)
        }
    },

    berthed_half_amount: function(frm) {
        calculate_berthed_half_amount(frm)
    },

    refresh: function(frm) {

        if (((frm.doc.payment_status != "Closed")) && (frm.doc.status != "Paid") &&
            (frappe.user.has_role("Wharf Operation Cashier") || frappe.user.has_role("Wharf Operation Manager"))) {
            frm.add_custom_button(__('Payment'), function() {

                frappe.route_options = {
                    "payment_type": "Receive",
                    "customer": frm.doc.agents,
                    "reference_doctype": "Booking Request"
                }

                frappe.set_route("Form", "Wharf Payment Entry", "new-wharf-payment-entry-1");
            }).addClass("btn-success");
        }
        var Current_User = user
        if ((Current_User == frm.doc.owner) && (frappe.user.has_role("Agent User"))) {
            frm.add_custom_button(__('Amend ETA'), function() {
                frappe.route_options = {
                    "booking_ref": frm.doc.name
                }
                frappe.new_doc("ETA Changes");
                frappe.set_route("Form", "ETA Changes", doc.name);

            }).addClass("btn-success");
        }
        if ((frm.doc.security_status == "Pending") && (frappe.user.has_role("Wharf Security Supervisor") || frappe.user.has_role("Wharf Security Officer"))) {
            frm.add_custom_button(__('Security'), function() {
                frappe.route_options = {
                    "booking_ref": frm.doc.name,
                    "voyage_no": frm.doc.voyage_no,
                    "vessel": frm.doc.vessel,
                    "agent": frm.doc.agents,
                    "agent_user": frm.doc.user
                }
                frappe.set_route("Form", "Security Check", "new-security-check-1");
            }).addClass("btn-primary");
        }
        if ((frm.doc.status == "Paid") && (frappe.user.has_role("Pilot Operation Manager"))) {
            frm.add_custom_button(__('Port Master'), function() {
                frappe.route_options = {
                    "booking_ref": frm.doc.name,
                    "voyage_no": frm.doc.voyage_no,
                    "vessel": frm.doc.vessel,
                    "agent": frm.doc.agents,
                    "agent_user": frm.doc.user
                }
                frappe.set_route("Form", "Port Master", "new-port-master-1");
            }).addClass("btn-primary");
        }


    },
});


frappe.ui.form.on("Cargo Booking Manifest Table", "weight", function(frm, cdt, cdn) {
    var dc = locals[cdt][cdn];
    var cargo_b = ["Heavy Vehicles", "Break Bulk", "Loose Cargo"];
    if (cargo_b.includes(dc.cargo_type)) {
        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Wharf Fees",
                filters: {
                    wharf_fee_category: "Handling Fee",
                    cargo_type: dc.cargo_type,
                    //                    work_type: dc.work_type
                },
            },
            callback: function(r) {
                console.log(r);
                frappe.model.set_value(dc.doctype, dc.name, "fee", r.message["fee_amount"]);
                frappe.model.set_value(dc.doctype, dc.name, "sub_total_fee", (r.message["fee_amount"] * dc.weight));
                calculate_total_amount(frm);
            }
        });
    }
    var cargo_c = ["Container", "Tank Tainers"];
    if (cargo_c.includes(dc.cargo_type)) {
        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Wharf Fees",
                filters: {
                    wharf_fee_category: "Handling Fee",
                    cargo_type: dc.cargo_type,
                    container_size: dc.container_size,
                    container_content: dc.cargo_content,
                    //                    work_type: dc.work_type
                },
            },
            callback: function(r) {
                console.log(r);
                frappe.model.set_value(dc.doctype, dc.name, "fee", r.message["fee_amount"]);
                frappe.model.set_value(dc.doctype, dc.name, "sub_total_fee", (r.message["fee_amount"] * dc.qty));
                calculate_total_amount(frm);
            }
        });
    }

    if (dc.cargo_type == "Flatrack") {
        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Wharf Fees",
                filters: {
                    wharf_fee_category: "Handling Fee",
                    cargo_type: dc.cargo_type,
                    container_size: dc.container_size,
                    container_content: dc.cargo_content,
                    //                    work_type: dc.work_type
                },
            },
            callback: function(r) {
                console.log(r);
                frappe.model.set_value(dc.doctype, dc.name, "fee", r.message["fee_amount"]);
                frappe.model.set_value(dc.doctype, dc.name, "sub_total_fee", (r.message["fee_amount"] * dc.qty));
                calculate_total_amount(frm);
            }
        });
    }


    if (dc.cargo_type == "Vehicles") {
        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Wharf Fees",
                filters: {
                    wharf_fee_category: "Handling Fee",
                    cargo_type: dc.cargo_type,
                    //                    work_type: dc.work_type
                },
            },
            callback: function(r) {
                console.log(r);
                frappe.model.set_value(dc.doctype, dc.name, "fee", r.message["fee_amount"]);
                frappe.model.set_value(dc.doctype, dc.name, "sub_total_fee", (r.message["fee_amount"] * dc.qty));
                calculate_total_amount(frm);
            }
        });
    }

});

var calculate_total_amount = function(frm) {

    var total_fee = 0;
    var total_weight_amount = 0;

    frm.doc.cargo_booking_manifest_table.forEach(function(d) {
        total_fee += d.sub_total_fee;
        total_weight_amount += d.weight;
    });

    frm.set_value("total_required_amount", total_fee);
    frm.set_value("require_amount", total_fee);
    frm.set_value("total_weight_amount", total_weight_amount);
    frm.refresh_fields("total_weight_amount");
    calculate_berthed_half_amount(frm)
}

var calculate_working_hours = function(frm) {

    var total_hours = frappe.datetime.get_hour_diff(frm.doc.etd_date, frm.doc.eta_date)
    frm.set_value("working_hours", total_hours)
    frm.refresh_fields("working_hours")
}

var calculate_berthed_half_amount = function(frm) {

    frappe.call({
        method: "frappe.client.get",
        args: {
            doctype: "Wharf Fees",
            filters: {
                wharf_fee_category: "BERTHED Fee",
                vessel_type: frm.doc.vessel_type,
            },
        },
        callback: function(r) {
            console.log(r);
            frm.set_value("grt_fee", r.message["fee_amount"]);
            frm.set_value("berthed_half_amount", ((frm.doc.working_hours * frm.doc.grt) * r.message["fee_amount"]))

        }
    });
    if (frm.doc.require_amount) {
        frm.set_value("total_amount", (frm.doc.berthed_half_amount + frm.doc.require_amount) / 2)
    }

}