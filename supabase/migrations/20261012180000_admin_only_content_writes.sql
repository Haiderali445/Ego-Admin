-- Keep existing public SELECT policies unchanged. Restrict content mutations
-- to the designated Supabase Auth user, even if an older permissive write
-- policy exists on one of these tables.
DO $$
DECLARE
  admin_uid CONSTANT uuid := '977f7ecd-8ff3-4160-867b-60651379f797';
  target_table text;
  target_tables text[] := ARRAY[
    'profile',
    'profile_typewriter_titles',
    'profile_interests',
    'about_focus',
    'projects',
    'project_tools',
    'project_images',
    'project_contributors',
    'experience',
    'experience_tech',
    'education',
    'skills',
    'skill_categories',
    'skill_category_items',
    'services',
    'service_full_tech_stack',
    'service_implementation_steps',
    'solutions',
    'solution_tech',
    'testimonials',
    'pricing',
    'site_config',
    'terminal_config',
    'terminal_protected_commands',
    'terminal_section_map'
  ];
BEGIN
  FOREACH target_table IN ARRAY target_tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', target_table);

    EXECUTE format('DROP POLICY IF EXISTS ego_admin_insert_allow ON public.%I', target_table);
    EXECUTE format('DROP POLICY IF EXISTS ego_admin_insert_guard ON public.%I', target_table);
    EXECUTE format('DROP POLICY IF EXISTS ego_admin_update_allow ON public.%I', target_table);
    EXECUTE format('DROP POLICY IF EXISTS ego_admin_update_guard ON public.%I', target_table);
    EXECUTE format('DROP POLICY IF EXISTS ego_admin_delete_allow ON public.%I', target_table);
    EXECUTE format('DROP POLICY IF EXISTS ego_admin_delete_guard ON public.%I', target_table);

    EXECUTE format(
      'CREATE POLICY ego_admin_insert_allow ON public.%I AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = %L::uuid)',
      target_table,
      admin_uid
    );
    EXECUTE format(
      'CREATE POLICY ego_admin_insert_guard ON public.%I AS RESTRICTIVE FOR INSERT TO public WITH CHECK (auth.uid() = %L::uuid)',
      target_table,
      admin_uid
    );

    EXECUTE format(
      'CREATE POLICY ego_admin_update_allow ON public.%I AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = %L::uuid) WITH CHECK (auth.uid() = %L::uuid)',
      target_table,
      admin_uid,
      admin_uid
    );
    EXECUTE format(
      'CREATE POLICY ego_admin_update_guard ON public.%I AS RESTRICTIVE FOR UPDATE TO public USING (auth.uid() = %L::uuid) WITH CHECK (auth.uid() = %L::uuid)',
      target_table,
      admin_uid,
      admin_uid
    );

    EXECUTE format(
      'CREATE POLICY ego_admin_delete_allow ON public.%I AS PERMISSIVE FOR DELETE TO authenticated USING (auth.uid() = %L::uuid)',
      target_table,
      admin_uid
    );
    EXECUTE format(
      'CREATE POLICY ego_admin_delete_guard ON public.%I AS RESTRICTIVE FOR DELETE TO public USING (auth.uid() = %L::uuid)',
      target_table,
      admin_uid
    );
  END LOOP;
END;
$$;