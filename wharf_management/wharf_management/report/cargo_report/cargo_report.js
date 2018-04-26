// Copyright (c) 2016, Sione Taumoepeau and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Cargo Report"] = {
	"filters": [
//		{
//			"fieldname":"from_date",
//			"label": __("From Date"),
//			"fieldtype": "Date",
//			"default": frappe.datetime.get_today(),
//			"reqd": 1,
//			"width": "80"
//		},
//		{
//			"fieldname":"to_date",
//			"label": __("To Date"),
//			"fieldtype": "Date",
//			"reqd": 1,
//			"default": frappe.datetime.get_today()
//		},
		{
			"fieldname":"company",
			"label": __("Company"),
			"fieldtype": "Link",
			"options": "Company",
			"default": frappe.defaults.get_user_default("Company")
		},
//		{
//			"fieldname":"voyage_no",
//			"label": __("Voyage No"),
//			"fieldtype": "Data",
//			"options": "voyage_no"
//		},
		{
			"fieldname":"name",
			"label": __("Booking Refrence"),
			"fieldtype": "Link",
			"reqd": 1,
			"options": "Booking Request"
		},
//		{
//			"fieldname":"from_fiscal_year",
//			"label": __("Start Year"),
//			"fieldtype": "Link",
//			"options": "Fiscal Year",
//			"default": frappe.defaults.get_user_default("fiscal_year"),
//			"reqd": 1
//		},
//		{
//			"fieldname":"to_fiscal_year",
//			"label": __("End Year"),
//			"fieldtype": "Link",
//			"options": "Fiscal Year",
//			"default": frappe.defaults.get_user_default("fiscal_year"),
//			"reqd": 1
//		},
//		{
//			"fieldname": "periodicity",
//			"label": __("Periodicity"),
//			"fieldtype": "Select",
//			"options": [
//				{ "value": "Monthly", "label": __("Monthly") },
//				{ "value": "Quarterly", "label": __("Quarterly") },
//				{ "value": "Half-Yearly", "label": __("Half-Yearly") },
//				{ "value": "Yearly", "label": __("Yearly") }
//			],
//			"default": "Monthly",
//			"reqd": 1
//		}

	]
}
