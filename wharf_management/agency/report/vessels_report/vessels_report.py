# Copyright (c) 2013, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.utils import cstr, cint, getdate
from frappe import msgprint, _
from calendar import monthrange
from frappe.utils import cstr, today, flt
#import DataTable from frappe-datatable


month_abbr = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
]

def execute(filters=None):
#    columns, data = [], []

    columns = get_columns()
    data = get_vessels_details()

    return columns, data

#, None, None, report_summary

def get_columns():
    columns = []

    columns += [
		_("Vessel Type") + ":Link/Vessel Type:120"
	]

#    month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
#    months += month

    return columns


def get_conditions(filters):
    conditions = "1=1"
    if filters.get("periodicity"): conditions += " and name = %(periodicity)s"
    return conditions

def get_vessels_details():
    data = []
    vessels = get_vessels_info()
    for vessel in vessels:
        row = [vessel.vessel_type, vessel.monthly]
        data.append(row)
    return data

def get_vessels_info():
#    conditions = get_conditions(filters)
    return frappe.db.sql("""
        SELECT vessel_type, MONTH(eta_date) as monthly, count(*)
		FROM `tabBooking Request`
        GROUP BY vessel_type, MONTH(eta_date)""");


@frappe.whitelist()
def get_eta_years():
	year_list = frappe.db.sql_list("""SELECT DISTINCT YEAR(eta_date) FROM `tabBooking Request` ORDER BY YEAR(eta_date) DESC""")
	if not year_list:
		year_list = [getdate().year]

	return "\n".join(str(year) for year in year_list)