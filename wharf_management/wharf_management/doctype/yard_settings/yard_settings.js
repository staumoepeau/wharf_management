// Copyright (c) 2019, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Yard Settings', {
    refresh: function(frm) {

    },

    yard_section: function(frm) {

        get_yard_slot(frm);
        //        msgprint("Yard Section")
    },

    yard_slot_number: function(frm) {

        get_yard_slot(frm);
    },

    yard_row: function(frm) {

        get_yard_slot(frm);
    }


});

var get_yard_slot = function(frm) {

    if (!frm.doc.yard_slot_number) {
        frm.doc.yard_slot_number = 0
    }

    var yardslot = frm.doc.yard_section.concat(frm.doc.yard_row, frm.doc.yard_height, frm.doc.yard_slot_number)

    frm.set_value("yard_slot", yardslot)

    //    console.log(frm.doc.yard_section.concat(frm.doc.yard_slot_number))

    if (frm.doc.yard_row == 01) {
        var yardsub = "1"
    }
    else if (frm.doc.yard_row == 02) {
        var yardsub = "2"
    }
    else if (frm.doc.yard_row == 03) {
        var yardsub = "3"
    }
    else if (frm.doc.yard_row == 04) {
        var yardsub = "4"
    }
    else if (frm.doc.yard_row == 05) {
        var yardsub = "5"
    }

    frm.set_value("yard_sub_section", frm.doc.yard_section.concat(yardsub))

}