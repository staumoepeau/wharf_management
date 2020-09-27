// Copyright (c) 2016, Sione Taumoepeau and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Cargo Reconciliation Report"] = {
    "filters": [{
            "fieldname": "stock_date",
            "label": __("Stock Date"),
            "fieldtype": "Date",
            "default": frappe.datetime.get_today(),
            "reqd": 1,
            "width": "80"
        },
        {
            "fieldname": "stock_count",
            "label": __("Stock Count"),
            "fieldtype": "Select",
            "options": [" ", "Yes", "No"],
            "reqd": 1,
            "width": "40"
        },
        {
            "fieldname": "company",
            "label": __("Company"),
            "fieldtype": "Link",
            "options": "Company",
            "default": frappe.defaults.get_user_default("Company")
        },
    ]
}