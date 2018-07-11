// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Devaning Request', {


	onload: function(frm){
		frm.set_query("cargo_ref", function() {
			return {
				"filters": {
					"docstatus": ["=", 1],
					"booking_ref": frm.doc.booking_ref,
					"status": ["!=", 'Outbound','Gate1', 'Gate Out']
						}
				};
			
			});

	},
	refresh: function(frm) {
		cur_frm.add_fetch('cargo_ref', 'container_no', 'container_no');
		cur_frm.add_fetch('booking_ref', 'voyage_no', 'voyage_no');

		cur_frm.add_fetch('booking_ref', 'vessel', 'vessel');
	//        cur_frm.add_fetch('booking_ref', 'eta_date', 'eta_date');
	//        cur_frm.add_fetch('booking_ref', 'etd_date', 'etd_date');
		cur_frm.add_fetch('booking_ref', 'pol', 'pol');
		cur_frm.add_fetch('booking_ref', 'pod', 'pod');
		cur_frm.add_fetch('booking_ref', 'final_dest_port', 'final_dest_port');

	},
	container_no: function(frm){
		frappe.call({
			method: "validate_container_no",
			doc: frm.doc,
			callback: function(d) {
				console.log(d)
				cur_frm.refresh();
			}
		})
	}
});
