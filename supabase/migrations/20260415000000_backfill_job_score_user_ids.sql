update public.job_scores as score
set user_id = job.user_id
from public.jobs as job
where score.job_id = job.id
  and score.user_id is null
  and job.user_id is not null;
