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
            "fieldname": "company",
            "label": __("Company"),
            "fieldtype": "Link",
            "options": "Company",
            "default": frappe.defaults.get_user_default("Company")
        },
        //		{
        //			"fieldname":"status",
        //			"label": __("Status"),
        //			"fieldtype": "Select",
        //			"options": ["IN", "OUT"]
        //		},

    ]
}