// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Booking Request', {

    setup: function(frm) {
        frm.get_field('ship_requirements_link').grid.editable_fields = [
            { fieldname: 'ship_requirements', columns: 2 },
            { fieldname: 'ship_requirements_yes_no', columns: 2 },
            { fieldname: 'ship_requirements_specify', columns: 2 }
        ];

        frm.get_field('cargo_booking_manifest_table').grid.editable_fields = [
            { fieldname: 'cargo_type', columns: 1 },
            { fieldname: 'cargo_content', columns: 1 },
            { fieldname: 'dis_charging', columns: 1 },
            { fieldname: 'loading', columns: 1 },
            { fieldname: 'total_weight', columns: 1 }
        ];

        frm.get_field('forklift_table').grid.editable_fields = [
            { fieldname: 'forklift_require', columns: 1 },
            { fieldname: 'forklift_qty', columns: 1 }
        ];

    },


    refresh: function(frm) {


        if (!frm.doc.__islocal) {
            cur_frm.set_df_property("agents", "read_only", 1);
            cur_frm.set_df_property("voyage_no", "read_only", 1);
            cur_frm.set_df_property("vessel", "read_only", 1);
            cur_frm.set_df_property("vessel_type", "read_only", 1);

        }

        if (frm.doc.payment_status != "Paid" && (frappe.user.has_role("Wharf Operation Cashier") || frappe.user.has_role("Wharf Operation Manager"))) {
            frm.add_custom_button(__('Create Payment'), function() {
                frappe.route_options = {
                    "booking_ref": frm.doc.name
                }
                frappe.new_doc("Wharf Payment Entry");
                frappe.set_route("Form", "Wharf Payment Entry", doc.name);
                //create_payment(frm);
            });

        }
        var Current_User = user
        if (Current_User == frm.doc.owner) {
            frm.add_custom_button(__('Amend ETA'), function() {
                //   create_payment(frm);
                frappe.route_options = {
                    "booking_ref": frm.doc.name
                }
                frappe.new_doc("ETA Changes");
                frappe.set_route("Form", "ETA Changes", doc.name);

            });
        }

    },
    agents: function(frm) {
        var Current_User = user


    },
    onload: function(frm) {

        //    if (!frm.doc.__islocal){
        //        frappe.call({
        //            "method": "frappe.client.get",
        //            args: {
        //                doctype: "Agents",
        //                filters: {'agent_user': Current_User }
        //   name: frm.doc.name
        //            },
        //            callback: function(data) {                
        //                cur_frm.set_value("agents", data.message["name"]);
        //            }
        //        })
        //    }    

    },

});

frappe.ui.form.on("Cargo Booking Manifest Table", "weight", function(frm, cdt, cdn) {
    var d = locals[cdt][cdn];
    frappe.model.set_value(d.doctype, d.name, "total_weight", flt(d.weight));

    var total_weight_amount = 0;
    var totalamount = 0;
    frm.doc.cargo_booking_manifest_table.forEach(function(d) { flt(total_weight_amount += flt(d.weight)); });

    frm.set_value("total_weight_amount", total_weight_amount);

});

var create_payment = function(frm) {
    frappe.call({
        "method": "frappe.client.get",
        args: {
            doctype: "Payment Entry",
            filters: { 'payment_ref': frm.doc.name }
            //   name: frm.doc.name
        },
        callback: function(data) {
            frappe.route_options = { "payment_ref": frm.doc.name }
            frappe.new_doc("Payment Entry");
            frappe.set_route("Form", "Payment Entry", doc.name);
        }
    })
}