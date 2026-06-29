# CareerOS seed files

Seed files in this directory are editable data fixtures. They are intentionally
separate from schema migrations so career profile content can evolve without
changing database structure.

To use `careeros_dan_walter.sql`, replace the placeholder `user_id` near the top
of the file with the target `auth.users.id`, then run it after the CareerOS
migration has been applied.
