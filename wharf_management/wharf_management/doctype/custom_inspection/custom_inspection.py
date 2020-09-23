# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe import msgprint, _, scrub

class CustomInspection(Document):

    def on_submit(self):
        self.update_custom_inspection_status()

    def validate(self):
        self.update_status()

    def update_status(self):
        frappe.db.sql("""Update `tabCargo` set status='Custom Inspection' where name=%s""", (self.cargo_ref))


    def update_custom_inspection_status(self):
        frappe.db.sql("""Update `tabCargo` set yard_slot=NULL, custom_inspection_status='Closed', status="Inspection Delivered"  where name=%s""", (self.cargo_ref))


@frappe.whitelist()
def update_custom_inspection(status, docname):
    return frappe.db.sql("""Update `tabCustom Inspection` set status=%s  where name=%s""", (status, docname))