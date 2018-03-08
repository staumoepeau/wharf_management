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
            { fieldname: 'container_size', columns: 1 },
            { fieldname: 'cargo_content', columns: 1 },
            { fieldname: 'work_type', columns: 1 },
            { fieldname: 'qty', columns: 1 },
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

        if (((frm.doc.payment_status != "Paid")) && (frappe.user.has_role("Wharf Operation Cashier") || frappe.user.has_role("Wharf Operation Manager"))) {
            frm.add_custom_button(__('Create Payment'), function() {
                frappe.route_options = {
                    "booking_ref": frm.doc.name
                }
                frappe.new_doc("Wharf Payment Entry");
                frappe.set_route("Form", "Wharf Payment Entry", doc.name);
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
        if ((!frm.doc.security_status) && (frappe.user.has_role("Wharf Security Supervisor") || frappe.user.has_role("Wharf Security Officer"))) {
            frm.add_custom_button(__('Security'), function() {
                frappe.route_options = {
                    "booking_ref": frm.doc.name
                }
                frappe.new_doc("Security Check");
                frappe.set_route("Form", "Security Check", doc.name);

            }).addClass("btn-success");
        }


    },
    onload: function(frm) {
        if (frappe.user.has_role("Wharf Security Supervisor") || frappe.user.has_role("Wharf Security Officer") || frappe.user.has_role("Agent User")) {
            cur_frm.set_df_property("security_documents", "hidden", 0);

        } else {
            cur_frm.set_df_property("security_documents", "hidden", 1);
        }

        if (frappe.user.has_role("Pilot Operation Manager") || frappe.user.has_role("Pilot Operation User"){

            cur_frm.set_df_property("grt", "hidden", 0);
        
        } else{
            cur_frm.set_df_property("grt", "hidden", 1);
        }


    },

    vessel: function(frm) {
        frappe.call({
            "method": "frappe.client.get",
            args: {
                doctype: "Vessels",
                filters: { 'name': frm.doc.vessel }
            },
            callback: function(data) {
                console.log(data);
                cur_frm.set_value("vessel_type", data.message["vessel_type"])
                cur_frm.set_value("grt", data.message["vessel_gross_tonnage"])
            }
        })
    },

});

frappe.ui.form.on("Cargo Booking Manifest Table", "weight", function(frm, cdt, cdn) {
    var dc = locals[cdt][cdn];
    
    if (dc.cargo_type == "Loose Cargo" || dc.cargo_type == "Heavy Vehicles" || dc.cargo_type == "Break Bulk"){
        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Wharf Handling Fee",
                filters: {
                    cargo_type: dc.cargo_type,
                    work_type: dc.work_type
                },
            },
            callback: function(r) {
                console.log(r);
                frappe.model.set_value(dc.doctype, dc.name, "fee", r.message["fee_amount"]);
                frappe.model.set_value(dc.doctype, dc.name, "sub_total_fee", (r.message["fee_amount"] * dc.qty * dc.weight));
                calculate_total_amount(frm);
            }
        });
    } 
    if (dc.cargo_type == "Container" || dc.cargo_type == "Tank Tainers" || dc.cargo_type == "Flatrack" ||  dc.cargo_type == "Vehicles"){
        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Wharf Handling Fee",
                filters: {
                    cargo_type: dc.cargo_type,
                    container_size: dc.container_size,
                    container_content: dc.cargo_content,
                    work_type: dc.work_type
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
    if (dc.cargo_type == "Vehicles"){
        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Wharf Handling Fee",
                filters: {
                    cargo_type: dc.cargo_type,
                    work_type: dc.work_type
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

var calculate_total_amount = function(frm){

    var total_fee = 0;
    var total_weight_amount = 0;

    frm.doc.cargo_booking_manifest_table.forEach(function(d) { 
        total_fee += d.sub_total_fee;
        total_weight_amount += d.weight;
    });

   frm.set_value("total_required_amount", total_fee);
   frm.set_value("require_amount",total_fee);
   frm.set_value("total_weight_amount", total_weight_amount);
   frm.refresh_fields("total_weight_amount");
}