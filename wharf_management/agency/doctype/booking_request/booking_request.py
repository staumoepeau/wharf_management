# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.utils import add_days, cint, cstr, flt, getdate, rounded, date_diff, money_in_words
from frappe import throw, _
from frappe.model.document import Document
from dateutil.relativedelta import relativedelta
from datetime import datetime
from time import mktime



class BookingRequest(Document):
    pass
#    def on_submit(self):
#        self.check_security_status()

#    def validate(self):
#        self.calculate_half_amount()

#    def check_security_status(self):
#        if not self.security_status:
#            frappe.throw(_("Please make sure that Port Security had Review this Booking Request Documents").format(self.security_status))

#    def calculate_half_amount(self):
#        fmt = '%Y-%m-%d %H:%M:%S'
#        tstamp1 = datetime.strptime(self.etd_date, fmt)
#        tstamp2 = datetime.strptime(self.eta_date, fmt)

#        if tstamp1 > tstamp2:
#            td = tstamp1 - tstamp2
#        else:
#            td = tstamp2 - tstamp1

#        self.working_hours = int(round(td.total_seconds() / 60 / 60 ))

#        grt_tariff, handling_fee  = 0.0, 0.0

#        if self.vessel_type == "OIL TANKER":
#            grt_tariff = 0.0436
#            handling_fee = 0

#        if self.vessel_type == "LPG TANKER":
#            grt_tariff = 0.1392
#            handling_fee = 0

#        if self.vessel_type == "CRUISE":
#            grt_tariff = 0.0393
#            handling_fee = 0

#        if self.vessel_type == "Cargo":
#            grt_tariff = 0.1296
#            handling_fee = self.require_amount

#        self.berthed_half_amount = float(float(self.working_hours) * float(self.grt) * grt_tariff)
#        self.total_amount = (float(self.berthed_half_amount) + float(handling_fee))/2


#    def create_sales_invoices(self):

#        if self.mode_of_payment == "Credit":
#            paid_amount = 0
#            pos = False
#            paid = "Unpaid"
#        if self.mode_of_payment != "Credit":
#            paid_amount = self.paid_amount
#            pos = True
#            paid = "Paid"

#        doc = frappe.new_doc("Sales Invoice")
#        doc.customer = self.agents
#        doc.wharf_payment_ref = self.name
#        doc.is_pos = pos
#        doc.status = paid

#        doc.paid_amount = paid_amount
#        doc.base_paid_amount = paid_amount
#        doc.outstanding_amount = 0
#        payments = doc.append('payments', {
#        'mode_of_payment': self.mode_of_payment,
#        'amount' : paid_amount
#        })
#        if self.vessel_type == "Cargo":
#            item = doc.append('items', {
#                'item_code' : "HANDLING",
#                'item_name' : "HANDLING FEE",
#                'description' : "Handling Fee",
#                'rate' : (self.require_amount)/2,
#                'qty' : "1"
#            })
#        item = doc.append('items', {
#            'item_code' : "BERTHED",
#            'item_name' : "BERTHED FEE",
#            'description' : "Berthed Fee",
#            'rate' : (self.berthed_half_amount)/2,
#            'qty' : "1"
#        })

#        doc.save(ignore_permissions=True)
#        doc.save()
#        doc.submit()

#        frappe.db.sql("""Update `tabBooking Request` set payment_status="Paid" , workflow_state="Booking Paid" where name=%s""", (self.name))
#        frappe.clear_cache(doctype="Booking Request")

@frappe.whitelist()
def get_events(start, end, filters=None):
    """Returns events for Gantt / Calendar view rendering.

    :param start: ETA date-time.
    :param end: ETD date-time.
    :param filters: Filters (JSON).
    """

    from frappe.desk.calendar import get_event_conditions
    conditions = get_event_conditions('Booking Request', filters)

    data = frappe.db.sql("""
        SELECT
        `tabBooking Request`.name, `tabBooking Request`.eta_date,
       `tabBooking Request`.etd_date, `tabBooking Request`.status, `tabBooking Request Status`.color
       FROM
       `tabBooking Request`
       LEFT JOIN `tabBooking Request Status` ON `tabBooking Request`.status = `tabBooking Request Status`.name
       WHERE
       (`tabBooking Request`.docstatus < 2)""", as_dict=True)

    return data


@frappe.whitelist(allow_guest=True)
def get_permission_query_conditions(user):
    if not user: user = frappe.session.user
#    user_role = frappe.get_roles(frappe.session.user)
#    user_roles = frappe.get_roles()
    if "System Manager" in frappe.get_roles():
        return None
    else:
        return """(`tabBooking Request`.agents = '{user_data}')""" .format(user_data=frappe.db.get_value('Agent User', {'user': user}, 'agent'))

@frappe.whitelist(allow_guest=True)
def has_permission(doc, user):
    agent_owner = frappe.db.get_value('Agent User', {'user':frappe.session.user}, 'agent')
    
    if doc.agents == agent_owner:
        return True