-- The prototype has no calibration corpus. Keep the field for historical
-- records, but allow new reports to record NULL instead of a fabricated value.
alter table public.forensic_cases
  alter column confidence_score drop not null;
