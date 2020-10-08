# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import msgprint, _, scrub
from frappe import throw, _
from frappe.model.document import Document
from frappe.utils import formatdate
from datetime import datetime
from wharf_management.wharf_management.utils import get_create_cargo, create_preadvise_history

class Yard(Document):

    def validate(self):
        self.update_yard_slot()
        self.update_export_status()
        self.validate_yard_slot()

    def on_submit(self):
        self.update_yard_timestamp()
        self.create_cargo_list_items()
        create_preadvise_history(self.cargo_ref)
        frappe.db.delete('Pre Advice', {'name': self.cargo_ref })
#        self.update_preadvise()


    def validate_yard_slot(self):
        if not self.yard_slot:
            msgprint(_("Yard Slot is Manadory").format(self.yard_slot), raise_exception=1)

    def update_yard_slot(self):
        if self.status != 'Export':
            frappe.db.sql("""Update `tabPre Advice` set yard_slot=%s, yard_status="Closed", status='Transfer' where name=%s""", (self.yard_slot, self.cargo_ref))

    def update_export_status(self):
        if self.status == 'Export':
            frappe.db.sql("""Update `tabPre Advice` set export_status="Yard", yard_slot=%s, gate1_status="Open", gate2_status="Open", payment_status="Open", yard_status="Open", inspection_status="Open" where name=%s""", (self.yard_slot, self.cargo_ref))

    def update_yard_timestamp(self):
        if not self.yard_time_stamp:
            self.yard_time_stamp = self.modified
            self.status = "Yard"

    def create_cargo_list_items(self):
        get_create_cargo("Pre Advice", self.cargo_ref, self.work_type, self.secondary_work_type, self.cargo_type)
        
