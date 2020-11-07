// Copyright (c) 2020, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Export Yard Settings', {
    // refresh: function(frm) {

    // }
    yard_section: function(frm) {

        get_yard_slot(frm);
        //        msgprint("Yard Section")
    },

    yard_slot_number: function(frm) {

        get_yard_slot(frm);
    }

});

var get_yard_slot = function(frm) {

    if (!frm.doc.yard_slot_number) {
        frm.doc.yard_slot_number = 0
    }

    var yardslot = frm.doc.yard_section.concat(frm.doc.yard_slot_number)

    frm.set_value("yard_slot", yardslot)

    console.log(frm.doc.yard_section.concat(frm.doc.yard_slot_number))

    if (frm.doc.yard_slot_number.startsWith("10")) {
        var yardsub = "1"
    }
    if (frm.doc.yard_slot_number.startsWith("20")) {
        var yardsub = "2"
    }
    if (frm.doc.yard_slot_number.startsWith("30")) {
        var yardsub = "3"
    }
    if (frm.doc.yard_slot_number.startsWith("40")) {
        var yardsub = "4"
    }
    if (frm.doc.yard_slot_number.startsWith("50")) {
        var yardsub = "5"
    }

    frm.set_value("yard_sub_section", frm.doc.yard_section.concat(yardsub))

}