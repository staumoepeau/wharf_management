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
    if "System Manager" in frappe.get_roles() or "Wharf Operation Cashier" in frappe.get_roles() or "Wharf Security Manager" in frappe.get_roles() or "Pilot Operation Manager" in frappe.get_roles() :
        return None
    else:
        return """(`tabBooking Request`.agents = '{user_data}')""" .format(user_data=frappe.db.get_value('Agent User', {'user': user}, 'agent'))

@frappe.whitelist(allow_guest=True)
def has_permission(doc, user):
    agent_owner = frappe.db.get_value('Agent User', {'user':frappe.session.user}, 'agent')
    
    if doc.agents == agent_owner:
        return True