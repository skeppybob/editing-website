/*
# Create video edit requests table

1. New Tables
- `video_edit_requests` stores visitor-submitted editing requests.
- `id` uniquely identifies each request.
- `title` is the required request title.
- `format` records whether the request is for a short, video, or other content.
- `notes` stores optional creative direction.
- `status` tracks whether the request is new, in progress, or complete.
- `created_at` records when the request was submitted.

2. Security
- Row Level Security is enabled.
- This is a single-tenant, no-sign-in request board, so anonymous visitors can submit and view shared requests.
- Separate public policies cover select, insert, update, and delete operations.

3. Important Notes
- No user accounts or personal ownership fields are introduced.
- Requests are intentionally shared so the editor can see the incoming queue from the same page.
*/

CREATE TABLE IF NOT EXISTS public.video_edit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  format text NOT NULL DEFAULT 'Video' CHECK (format IN ('Video', 'Short', 'Reel', 'Other')),
  notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 1000),
  status text NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'In progress', 'Complete')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.video_edit_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view video edit requests" ON public.video_edit_requests;
CREATE POLICY "Public can view video edit requests"
  ON public.video_edit_requests FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can submit video edit requests" ON public.video_edit_requests;
CREATE POLICY "Public can submit video edit requests"
  ON public.video_edit_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update video edit requests" ON public.video_edit_requests;
CREATE POLICY "Public can update video edit requests"
  ON public.video_edit_requests FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete video edit requests" ON public.video_edit_requests;
CREATE POLICY "Public can delete video edit requests"
  ON public.video_edit_requests FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS video_edit_requests_created_at_idx
  ON public.video_edit_requests (created_at DESC);