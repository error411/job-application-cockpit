select job_id, follow_up_1_due
from applications
where follow_up_1_due is not null
limit 5;