// Copyright (c) 2016, Sione Taumoepeau and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Check Container"] = {
    filters: [{
            fieldname: "cargo_ref",
            label: __("Cargo"),
            fieldtype: "Link",
            options: "Cargo",
            reqd: 1,
            ingore_permissions: 1,
            filters: { "status": "yard" },

        },


    ],

    onload: function() {}
};