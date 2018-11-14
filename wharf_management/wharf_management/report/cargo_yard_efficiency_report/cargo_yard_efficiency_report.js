// Copyright (c) 2018, Sione Taumoepeau and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Cargo Yard Efficiency Report"] = {
	"filters": [
		{
			"fieldname":"company",
			"label": __("Company"),
			"fieldtype": "Link",
			"options": "Company",
			"default": frappe.defaults.get_user_default("Company")
		},
		{
			"fieldname":"booking_ref",
			"label": __("Booking Ref #"),
			"fieldtype": "Data",
			"reqd": 1,
			
		},

	]
}
