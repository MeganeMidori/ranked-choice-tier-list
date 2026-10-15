-- Up Migration
-- The form asks for a maid name and a full name, so the single name column becomes maid_name.
alter table votes rename column name to maid_name;
-- The default fills in any rows that existed before this migration. New rows always set it.
alter table votes add column full_name text not null default '';
alter table votes alter column full_name drop default;
alter table votes add column additional_comments text not null default '';

-- Down Migration
alter table votes drop column additional_comments;
alter table votes drop column full_name;
alter table votes rename column maid_name to name;
