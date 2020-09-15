// Copyright (c) 2016, Sione Taumoepeau and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Check Cargo"] = {
    filters: [{
        fieldname: "cargo_ref",
        label: __("Cargo"),
        fieldtype: "Link",
        options: "Cargo",
        reqd: 1,
        filters: { "status": "yard" }
    }, ],

    onload: function() {
        //        var me = this;
        page.add_inner_button(__("Set Test"));

        add_chart_buttons_to_toolbar(hide);

        //        frappe.query_report._get_filters_html_for_print = frappe.query_report.filters;

        //        frappe.query_report.get_filters_html_for_print = print_settings => {
        //            const me = frappe.query_report,
        //                encode = svg => 'data:image/svg+xml;base64,' + btoa((new XMLSerializer()).serializeToString(svg));
        //            let filters = me._get_filters_html_for_print();

        //            if (me.report_summary && me.report_summary.svg) {
        //                filters += `<hr><img alt="${__('Report Summary')}" src="${encode(me.report_summary.svg)}" />`;
        //            }

        //            return filters;

        //        };
    },
};