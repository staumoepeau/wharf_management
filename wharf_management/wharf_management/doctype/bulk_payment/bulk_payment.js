// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Bulk Payment', {
    setup: function(frm) {
        frm.get_field('bulk_cargo_table').grid.editable_fields = [
            { fieldname: 'cargo_refrence', columns: 1 },
            { fieldname: 'container_no', columns: 1 },
            { fieldname: 'cargo_type', columns: 1 },
            { fieldname: 'work_type', columns: 1 },
            { fieldname: 'container_content', columns: 1 }
        ];
    },
    refresh: function(frm) {

        cur_frm.add_fetch('booking_ref', 'voyage_no', 'voyage_no');
        cur_frm.add_fetch('booking_ref', 'vessel', 'vessel');
        cur_frm.add_fetch('booking_ref', 'agents', 'agents');
        cur_frm.add_fetch('booking_ref', 'eta_date', 'eta_date');
        //	cur_frm.add_fetch('booking_ref','labour_requirements','labour_requirements');
        //	cur_frm.add_fetch('booking_ref','gear_requirements','gear_requirements');
        //	cur_frm.add_fetch('booking_ref','crew_transport','crew_transport');


    }
});

frappe.ui.form.on("Bulk Cargo Table", "cargo_refrence", function(frm, cdt, cdn){
	var d = locals[cdt][cdn];
	frappe.call({
			"method": "frappe.client.get",
			args: {
                doctype: "Cargo",
                filters: {
                        'booking_ref': d.booking_ref
								},
				},
				callback: function (data) {
					frappe.model.set_value(d.doctype, d.name, "container_no",  data.message["container_no"]);
                    frappe.model.set_value(d.doctype, d.name, "cargo_type",  data.message["cargo_type"]);
                    frappe.model.set_value(d.doctype, d.name, "work_type",  data.message["work_type"]);
                    frappe.model.set_value(d.doctype, d.name, "container_content",  data.message["container_content"]);
                    frappe.model.set_value(d.doctype, d.name, "bol",  data.message["bol"]);
                    frappe.model.set_value(d.doctype, d.name, "status",  data.message["status"]);
                    frappe.model.set_value(d.doctype, d.name, "voyage_no",  data.message["voyage_no"]);
                    frappe.model.set_value(d.doctype, d.name, "booking_ref",  data.message["booking_ref"]);
				}
		})
});