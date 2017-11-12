// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Bulk Payment', {


    setup: function(frm) {
        frm.get_field('bulk_cargo_table').grid.editable_fields = [
            { fieldname: 'cargo_refrence', columns: 1 },
            { fieldname: 'container_no', columns: 1 },
            { fieldname: 'cargo_type', columns: 1 },
            { fieldname: 'chasis_no', columns: 1 },
            { fieldname: 'bol', columns: 1 }
        ];

        frm.get_field('bulk_fees_items').grid.editable_fields = [
            { fieldname: 'item', columns: 2 },
            { fieldname: 'description', columns: 2 },
            { fieldname: 'price', columns: 2 },
            { fieldname: 'qty', columns: 2 },
            { fieldname: 'total', columns: 2 }
        ];
    },
    onload: function(frm) {
        cur_frm.set_df_property("naming_series", "hidden", 1);

    },
    refresh: function(frm) {

        cur_frm.add_fetch('booking_ref', 'voyage_no', 'voyage_no');
        cur_frm.add_fetch('booking_ref', 'vessel', 'vessel');
        cur_frm.add_fetch('booking_ref', 'agents', 'agents');
        cur_frm.add_fetch('booking_ref', 'eta_date', 'eta_date');
        cur_frm.add_fetch('booking_ref', 'labour_requirements', 'labour_requirements');
        //cur_frm.add_fetch('booking_ref','gear_requirements','gear_requirements');
        //	cur_frm.add_fetch('booking_ref','crew_transport','crew_transport');


    },
    insert_containers_button: function(frm) {
        return frappe.call({
            method: "insert_containers",
            doc: frm.doc,
            callback: function(r) {
                frm.refresh_field("bulk_cargo_table");
                frm.refresh_fields();
            }
        });
    },
    insert_bulk_fees_button: function(frm) {
        return frappe.call({
            method: "insert_bulk_fees",
            doc: frm.doc,
            callback: function(r) {
                frm.refresh_field("bulk_fees_item");
                frm.refresh_fields();
            }
        });
    },
    discount: function(frm) {
        if (frm.doc.discount == "No") {
            frm.set_value("total_amount", frm.doc.total_fee);
        } else if (frm.doc.discount == "Yes") {
            frm.set_value("total_amount", frm.doc.total_fee - frm.doc.discount_amount);
        }
    },
    discount_amount: function(frm) {
        frm.set_value("total_amount", frm.doc.total_fee - frm.doc.discount_amount);
    }

});

frappe.ui.form.on("Bulk Fees Items", "total", function(frm, cdt, cdn) {
    var d = locals[cdt][cdn];
    frappe.model.set_value(d.doctype, d.name, "total_fee", d.total);

    var total_fees = 0;
    frm.doc.bulk_fees_items.forEach(function(d) { total_fees += d.total; });

    frm.set_value("total_fee", total_fees);

});


frappe.ui.form.on("Bulk Cargo Table", "cargo_refrence", function(frm, cdt, cdn) {
    var d = locals[cdt][cdn];
    frappe.call({
        "method": "frappe.client.get",
        args: {
            doctype: "Cargo",
            filters: {
                'cargo_ref': d.cargo_ref
            },
        },
        callback: function(data) {
            frappe.model.set_value(d.doctype, d.name, "container_no", data.message["container_no"]);
            frappe.model.set_value(d.doctype, d.name, "cargo_type", data.message["cargo_type"]);
            frappe.model.set_value(d.doctype, d.name, "work_type", data.message["work_type"]);
            frappe.model.set_value(d.doctype, d.name, "container_content", data.message["container_content"]);
            frappe.model.set_value(d.doctype, d.name, "bol", data.message["bol"]);
            frappe.model.set_value(d.doctype, d.name, "status", data.message["status"]);
            frappe.model.set_value(d.doctype, d.name, "voyage_no", data.message["voyage_no"]);
            frappe.model.set_value(d.doctype, d.name, "cargo_ref", data.message["cargo_ref"]);
            frappe.model.set_value(d.doctype, d.name, "custom_code", data.message["cargo_ref"]);
            frappe.model.set_value(d.doctype, d.name, "chasis_no", data.message["chasis_no"]);


        }
    })
});