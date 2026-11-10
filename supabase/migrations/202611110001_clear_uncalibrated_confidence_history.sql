-- Historical heuristic scores are not calibrated probabilities. Preserve the
-- forensic cases and findings while removing misleading confidence values.
update public.forensic_cases
set confidence_score = null
where confidence_score is not null;
