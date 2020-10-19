# -*- coding: utf-8 -*-
# Copyright (c) 2020, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, erpnext, json
from frappe import msgprint, _, scrub
from frappe.model.document import Document
from frappe.utils import cstr, formatdate, cint, getdate, date_diff, add_days, now

class ExportBooking(Document):

    def on_submit(self):
        self.create_export_cargo()

    def create_export_cargo(self):

        export_list = frappe.db.sql("""SELECT `tabExport Booking`.name, `tabExport Booking`.agents, `tabExport Booking`.booking_date, `tabExport Booking`.booking_time, 
                        `tabExport Cargo Table`.cargo_type, `tabExport Cargo Table`.container_no, `tabExport Cargo Table`.container_size,`tabExport Cargo Table`.iso, 
                        `tabExport Cargo Table`.container_content, `tabExport Cargo Table`.weight, `tabExport Cargo Table`.volume, `tabExport Cargo Table`.seal_1, 
                        `tabExport Cargo Table`.seal_2, `tabExport Cargo Table`.cargo_description, `tabExport Cargo Table`.chasis_no, `tabExport Cargo Table`.mark
                        FROM `tabExport Booking`, `tabExport Cargo Table`
                        WHERE `tabExport Booking`.name = `tabExport Cargo Table`.parent """, as_dict=1)

        for d in export_list:
            doc = frappe.new_doc("Export")
            doc.update({
                "docstatus": 1,
                "agents" : d.agents,
                "posting_date" : d.booking_date,
                "posting_time" : d.booking_time,
                "cargo_type" : d.cargo_type,
                "container_size" : d.container_size,
                "container_no" : d.container_no,
                "container_content" : d.container_content,
                "weight" : d.weight,
                "volume" : d. volume,
                "seal_1" : d.seal_1,
                "seal_2" : d.seal_2,
                "cargo_description" : d.cargo_description,
                "chasis_no" : d.chasis_no,
                "mark" : d.mark,
            })
            doc.insert()
#            doc.submit()
