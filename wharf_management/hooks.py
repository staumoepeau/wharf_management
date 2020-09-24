# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from . import __version__ as app_version

app_name = "wharf_management"
app_title = "Wharf Management"
app_publisher = "Sione Taumoepeau"
app_description = "App to Manage Wharf Operations"
app_icon = "octicon octicon-gear"
app_color = "blue"
app_email = "sione.taumoepeau@gmail.com"
app_license = "MIT"


fixtures = ["Custom Field", "Custom Script", "Print Format"]

error_report_email = "support@tongaports.to"

#app_include_js = "assets/js/wharf_management.js"
#app_include_js = "/assets/wharf_management/js/bootstrap.min.js"



#app_include_css = ["assets/css/wharf_management.css"]
app_include_css = "/assets/wharf_management/js/lib/pivottable/pivot.min.css"
# app_include_js = "/assets/pivot_table/js/pivot_table.js"
app_include_js = [
    "/assets/wharf_management/js/lib/pivottable/pivot.min.js",
    "/assets/wharf_management/js/lib/jquery-ui.min.js",
	"/assets/wharf_management/js/pivot_table.min.js",
    "/assets/wharf_management/js/query_report_pivot_table.js"
]


# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/wharf_management/css/wharf_management.css"
#app_include_js = "/assets/wharf_management/js/wharf_management.js

# include js, css files in header of web template
# web_include_css = "/assets/wharf_management/css/wharf_management.css"
#web_include_js = "/assets/js/wharf_management.js"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Website user home page (by function)
# get_website_user_home_page = "wharf_management.utils.get_home_page"

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "wharf_management.install.before_install"
# after_install = "wharf_management.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

notification_config = "wharf_management.notifications.get_notification_config"



# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

permission_query_conditions = {
 	"Booking Request": "wharf_management.agency.doctype.booking_request.booking_request.get_permission_query_conditions",
}

has_permission = {
 	"Booking Request": "wharf_management.agency.doctype.booking_request.booking_request.has_permission",
}

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
#	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"wharf_management.tasks.all"
# 	],
# 	"daily": [
# 		"wharf_management.tasks.daily"
# 	],
# 	"hourly": [
# 		"wharf_management.tasks.hourly"
# 	],
# 	"weekly": [
# 		"wharf_management.tasks.weekly"
# 	]
# 	"monthly": [
# 		"wharf_management.tasks.monthly"
# 	]
# }

default_mail_footer = """<div style="text-align: center;">
	<a href="http://www.tongaports.to?source=via_email_footer" target="_blank" style="color: #8d99a6;">
		Sent via Ports Authority Tonga - PMS
	</a>
</div>"""

# Testing
# -------

# before_tests = "wharf_management.install.before_tests"

# Overriding Whitelisted Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "wharf_management.event.get_events"
# }

