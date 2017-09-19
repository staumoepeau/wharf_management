// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Booking Request', {
	
	setup: function(frm) {
		frm.get_field('ship_requirements_link').grid.editable_fields = [
			{fieldname: 'ship_requirements', columns: 2},
			{fieldname: 'ship_requirements_yes_no', columns: 2},
			{fieldname: 'ship_requirements_specify', columns: 2}
		];

		frm.get_field('cargo_booking_manifest_table').grid.editable_fields = [
			{fieldname: 'cargo_type', columns: 1},
			{fieldname: 'cargo_content', columns: 1},
			{fieldname: 'dis_charging', columns: 1},
			{fieldname: 'loading', columns: 1},
			{fieldname: 'total_weight', columns: 1}
		];

		frm.get_field('forklift_table').grid.editable_fields = [
			{fieldname: 'forklift_require', columns: 1},
			{fieldname: 'forklift_qty', columns: 1}
		];

	},

	refresh: function(frm) {
		
		
		if(!frm.doc.__islocal){
			cur_frm.set_df_property("agents", "read_only", 1);
			cur_frm.set_df_property("voyage_no", "read_only", 1);
			cur_frm.set_df_property("vessel", "read_only", 1);
			cur_frm.set_df_property("vessel_type", "read_only", 1);

		}
			
		if(frappe.user.has_role("Wharf Operation Cashier") || frappe.user.has_role("Wharf Operation Manager")){
			frm.add_custom_button(__('Make Payment'), function() {
			});
		}
		
	},
	
//	create_payment: function(frm){
//		frappe.call({
//			"method": "frappe.client.get",
//				args: {
//					doctype: "Payment Entry",
//					filters: {'payment_ref': frm.doc.booking_ref},
				//	name: frm.doc.booking_ref
//					},
//				callback: function (data) {
//					console.log(data);
//					var booking_refrence = (data.message["payment_ref"]);
//					if (booking_refrence = ""){
//						frappe.route_options = { "payment_ref": frm.doc.name }
//						frappe.new_doc("Payment Entry");
//						frappe.set_route("Form", "Payment Entry", doc.name);
//					} 
				//	else
				//	{
					//	msgprint("Payment already created for this transaction");
				//	}
//				}
//		})				
//	},
	
//	total_weight_amount: function(frm) {
//		var totalamount = flt(frm.doc.total_weight_amount * 0.5);
//		frm.set_value("");	
//	}
	
	
});

frappe.ui.form.on("Cargo Booking Manifest Table", "weight", function(frm, cdt, cdn){
  var d = locals[cdt][cdn];
  frappe.model.set_value(d.doctype, d.name, "total_weight", flt(d.weight));

  var total_weight_amount = 0;
  var totalamount = 0;
  frm.doc.cargo_booking_manifest_table.forEach(function(d) { flt(total_weight_amount += flt(d.weight)); });
	
  frm.set_value("total_weight_amount", total_weight_amount);

});
