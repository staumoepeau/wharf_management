// Copyright (c) 2018, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Cargo Stock Tool', {

	refresh: function(frm) {
		frm.disable_save();
		frm.page.clear_indicator();
	},


	stock_date: function(frm){
		frm.doc.show_submit = false;

		
	}
});
