// Copyright (c) 2016, Sione Taumoepeau and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Vessels Report"] = {
    "filters": [

        {
            "fieldname": "periodicity",
            "label": __("Periodicity"),
            "fieldtype": "Select",
            "options": [
                { "value": "Monthly", "label": __("Monthly") },
                { "value": "Quarterly", "label": __("Quarterly") },
                { "value": "Half-Yearly", "label": __("Half-Yearly") },
                { "value": "Yearly", "label": __("Yearly") }
            ],
            "default": "Yearly",
            "reqd": 1
        },
        //		{
        //            "fieldname": "month",
        //            "label": __("Month"),
        //            "fieldtype": "Select",
        //            "reqd": 1,
        //            "options": [
        //                { "value": 1, "label": __("Jan") },
        //                { "value": 2, "label": __("Feb") },
        //                { "value": 3, "label": __("Mar") },
        //                { "value": 4, "label": __("Apr") },
        //                { "value": 5, "label": __("May") },
        //                { "value": 6, "label": __("June") },
        //                { "value": 7, "label": __("July") },
        //                { "value": 8, "label": __("Aug") },
        //                { "value": 9, "label": __("Sep") },
        //                { "value": 10, "label": __("Oct") },
        //                { "value": 11, "label": __("Nov") },
        //                { "value": 12, "label": __("Dec") },
        //            ],
        //            "default": frappe.datetime.str_to_obj(frappe.datetime.get_today()).getMonth() + 1
        //        },
        {
            "fieldname": "year",
            "label": __("Year"),
            "fieldtype": "Select",
            "reqd": 1
        }
    ],
    "onload": function() {
        return frappe.call({
            method: "wharf_management.agency.report.vessels_report.vessels_report.get_eta_years",
            callback: function(r) {
                var year_filter = frappe.query_report.get_filter('year');
                year_filter.df.options = r.message;
                year_filter.df.default = r.message.split("\n")[0];
                year_filter.refresh();
                year_filter.set_input(year_filter.df.default);
            }
        });
    }
};