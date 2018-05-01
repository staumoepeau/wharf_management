// Copyright (c) 2016, Sione Taumoepeau and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Cargo Report Details"] = {
	"filters": [

				{
					"fieldname":"company",
					"label": __("Company"),
					"fieldtype": "Link",
					"options": "Company",
					"default": frappe.defaults.get_user_default("Company")
				},
				{
					"fieldname":"name",
					"label": __("Booking Refrence"),
					"fieldtype": "Link",
					"reqd": 1,
					"options": "Booking Request"
				},
			
			]
	}