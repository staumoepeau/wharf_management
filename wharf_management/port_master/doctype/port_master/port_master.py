# -*- coding: utf-8 -*-
# Copyright (c) 2020, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe import msgprint, _, scrub

class PortMaster(Document):

    def on_submit(self):
        self.check_status()

    def validate(self):
        self.update_booking_request()


    def update_booking_request(self):
        frappe.db.sql("""Update `tabBooking Request` set status="Approved", port_master_status=%s, port_master_comments=%s where name=%s""", (self.port_master_status, self.port_master_comments, self.booking_ref))


    def check_status(self):
        if not self.port_master_status:
            msgprint(_("Status is Manadory").format(self.port_master_status), raise_exception=1)
