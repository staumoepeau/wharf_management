# Copyright (c) 2013, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.utils import cstr

def execute(filters=None):
	columns, data = [], []
	columns=get_columns()
	data=get_fees_data(filters, columns)
	return columns, data


def get_columns():
    	return [
		_("Posting Date") + ":Date:140",
		_("Fees") + ":Data:220",
		_("Description") + ":Data:380",
		_("Price") + ":Currency:150",
		_("Qty") + ":Data:100",
		_("Discount") + ":Currency:150",
		_("Total") + ":Currency:150"
	]


def get_fees_data(filters, column):
	data = []

	fees_details = get_fees_details(filters)

	for fees in fees_details:
		row = [fees.creation, fees.item, fees.description, fees.price, fees.qty, fees.discount, fees.total]
		data.append(row)
	return data

def get_conditions(filters):
    conditions = "1=1"

    if filters.get("from_date"): conditions += " and creation>=%(from_date)s"
    if filters.get("to_date"): conditions += " and creation<=%(to_date)s"
	
    return conditions

def get_fees_details(filters):
	conditions = get_conditions(filters)

	return frappe.db.sql(""" 
		SELECT creation, item, description, sum(price) as price, sum(qty) as qty, 
		sum(discount) as discount, sum(total) as total
			FROM `tabWharf Fee Item` 
			WHERE parenttype = "Wharf Payment Entry"
			AND docstatus = 1
			AND {conditions}
			GROUP BY item
		""".format(conditions=conditions), filters, as_dict=1)