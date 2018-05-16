<div>
<h2>Booking Ref : {{ doc.name }}</h2>
</div>
<p>This is a Notification for a Booking Requested by {{ frappe.db.get_value("User", doc.owner, "full_name") }}
</p>
<p>Booking Details:
<ul>
<li>Voyage No : {{ doc.voyage_no }}</li>
<li>ETA: {{ doc.eta_date }} - {{ doc.eta_time }}</li>
<li>Vessel: {{ doc.vessel }}</li>
<li>Vessel Type: {{ doc.vessel_type }}</li>
<li>STATUS: {{ doc.status }}</li>
</ul>
<br>
<p>
Your Booking is Pending Approval from the Port Master. You will be notify again if the status of your Booking change.
<hr>
<p style="font-size: 85%">
Thank you for using Ports Authority Tonga - Port Management System
</p>