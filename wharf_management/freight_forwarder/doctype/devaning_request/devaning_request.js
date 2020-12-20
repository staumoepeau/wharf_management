// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt
frappe.provide("wharf_management.devaning_request")
frappe.ui.form.on('Devaning Request', {

	onload: function(frm){
		wharf_management.devaning_request.setup_devaning_queries(frm);
	},

	refresh: function(frm) {

	},

//	container_no: function(frm){
//		frappe.call({
//			method: "validate_container_no",
//			doc: frm.doc,
//			callback: function(d) {
//				console.log(d)
//				cur_frm.refresh();
//			}
//		})
//	}

});

$.extend(wharf_management.devaning_request,{
	setup_devaning_queries: function(frm) {
		frm.fields_dict["cargo_ref"].get_query = function(doc) {
			return {
				filters:[
					['Cargo', 'docstatus', '=', 1],
					['Cargo', 'status', "in", ["Paid"]],
					['Cargo', 'consignee', "=", frm.doc.agents]
				]
			}
		}

	}
});