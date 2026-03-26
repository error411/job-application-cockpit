select id, status, follow_up_1_due, follow_up_2_due
from public.applications
order by updated_at desc
limit 10;