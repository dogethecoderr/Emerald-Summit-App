-- Add volunteer and attendee to the user_role enum
ALTER TYPE public.user_role ADD VALUE 'volunteer';
ALTER TYPE public.user_role ADD VALUE 'attendee';

-- Update the users_insert_own policy to allow volunteer and attendee roles
DROP POLICY "users_insert_own" ON public.users;

CREATE POLICY "users_insert_own"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid()
    AND role IN (
      'participant'::public.user_role,
      'ambassador'::public.user_role,
      'expert'::public.user_role,
      'visitor'::public.user_role,
      'volunteer'::public.user_role,
      'attendee'::public.user_role
    )
  );
