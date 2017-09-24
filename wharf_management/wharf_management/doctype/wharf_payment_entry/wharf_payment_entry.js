// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Wharf Payment Entry', {
	refresh: function(frm) {
		
	},
	setup: function(frm) {
		frm.set_query("paid_from", function() {
			var party_account_type = frm.doc.party_type=="Customer" ? "Receivable" : "Payable";
			var account_types = in_list(["Pay", "Internal Transfer"], frm.doc.payment_type) ?
				["Bank", "Cash"] : party_account_type;

			return {
				filters: {
					"account_type": ["in", account_types],
					"is_group": 0,
					"company": frm.doc.company
				}
			}
		});

		frm.set_query("party_type", function() {
			return{
				"filters": {
					"name": ["in",["Customer","Supplier", "Employee"]],
				}
			}
		});

		frm.set_query("paid_to", function() {
			var party_account_type = frm.doc.party_type=="Customer" ? "Receivable" : "Payable";
			var account_types = in_list(["Receive", "Internal Transfer"], frm.doc.payment_type) ?
				["Bank", "Cash"] : party_account_type;

			return {
				filters: {
					"account_type": ["in", account_types],
					"is_group": 0,
					"company": frm.doc.company
				}
			}
		});
	},
	onload: function(frm) {		
		frappe.call({
			"method": "frappe.client.get",
				args: {
				doctype: "Booking Request",
					name: frm.doc.booking_ref,
					filters: {
						'docstatus': 1
					},
				},
				callback: function(data) {
					cur_frm.set_value("party_type", "Customer");
					cur_frm.set_value("party_name", data.message["agents"]);
					cur_frm.set_value("party", data.message["agents"]);
					cur_frm.set_value("paid_amount", data.message["require_amount"]);
					cur_frm.set_value("paid_from", "Debtors - PAT");

					cur_frm.set_df_property("booking_ref", "read_only", 1);
					cur_frm.set_df_property("paid_from", "read_only", 1);
					cur_frm.set_df_property("payment_type", "read_only", 1);
					cur_frm.set_df_property("party_type", "read_only", 1);
					cur_frm.set_df_property("party_name", "hidden", 1);
					cur_frm.set_df_property("party", "read_only", 1);
					cur_frm.set_df_property("paid_amount", "read_only", 1);
					cur_frm.set_df_property("transaction_references", "hidden", 1);

					}
		})		
	},
	mode_of_payment: function(frm) {

		if (frm.doc.mode_of_payment == "Cash"){
			cur_frm.set_value("paid_to", "Cash - PAT");		
			cur_frm.set_df_property("paid_to", "read_only", 1);
			cur_frm.set_df_property("transaction_references", "hidden", 1);
		} else if (frm.doc.mode_of_payment == "Cheque"){
			cur_frm.set_value("paid_to", "BSP Tonga Limited - PAT");
			cur_frm.set_df_property("paid_to", "read_only", 1);
			cur_frm.set_df_property("transaction_references", "hidden", 0);

		}
	},
});
