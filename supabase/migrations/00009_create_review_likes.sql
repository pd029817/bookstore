-- Review likes
CREATE TABLE public.review_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, review_id)
);

CREATE INDEX idx_review_likes_review ON public.review_likes(review_id);

-- Auto-update review likes_count
CREATE OR REPLACE FUNCTION public.update_review_likes_count()
RETURNS TRIGGER AS $$
DECLARE
  target_review_id UUID;
BEGIN
  target_review_id := COALESCE(NEW.review_id, OLD.review_id);

  UPDATE public.reviews
  SET likes_count = (SELECT COUNT(*) FROM public.review_likes WHERE review_id = target_review_id)
  WHERE id = target_review_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_likes_count_on_like
  AFTER INSERT OR DELETE ON public.review_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_review_likes_count();
