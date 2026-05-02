
-- Enable realtime for tables not yet added
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_requests; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.donations; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Blood group match notification trigger
CREATE OR REPLACE FUNCTION public.notify_matching_donors()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, message)
  SELECT p.user_id, 'blood_match',
    '🩸 Urgent: ' || NEW.blood_group || ' blood needed at ' || NEW.hospital || '. Can you help?'
  FROM public.profiles p
  WHERE p.blood_group = NEW.blood_group
    AND p.is_available = true
    AND p.user_id != NEW.posted_by;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_blood_request_created ON public.blood_requests;
CREATE TRIGGER on_blood_request_created
  AFTER INSERT ON public.blood_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_matching_donors();

-- Notify requester when someone responds
CREATE OR REPLACE FUNCTION public.notify_requester_on_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_id uuid;
  responder_name text;
  req_blood text;
BEGIN
  SELECT posted_by, blood_group INTO requester_id, req_blood FROM public.blood_requests WHERE id = NEW.request_id;
  SELECT name INTO responder_name FROM public.profiles WHERE user_id = NEW.user_id;
  INSERT INTO public.notifications (user_id, type, message)
  VALUES (requester_id, 'response_alert', COALESCE(responder_name, 'A donor') || ' responded to your ' || req_blood || ' blood request!');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_responder_created ON public.responders;
CREATE TRIGGER on_responder_created
  AFTER INSERT ON public.responders
  FOR EACH ROW EXECUTE FUNCTION public.notify_requester_on_response();

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
