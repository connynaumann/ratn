-- Trigger-Funktionen dürfen nicht über die REST-API aufrufbar sein
revoke execute on function public.enforce_allowed_email() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.check_dependency_source() from public, anon, authenticated;
revoke execute on function public.delete_dependencies_of_source() from public, anon, authenticated;

-- allowed_email: kein Zugriff über die API (nur Dashboard / Service-Rolle)
revoke all on table public.allowed_email from anon, authenticated;
