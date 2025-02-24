/*
  # Initial Schema Setup for Event Management System

  1. New Tables
    - `profiles`
      - Stores user profile information
      - Links to Supabase auth.users
      - Includes role and preferences
    
    - `events`
      - Stores event information
      - Includes all event details and settings
      - Supports recurring events
    
    - `registrations`
      - Manages event registrations
      - Handles waitlist functionality
      - Tracks registration status
    
    - `notifications`
      - Stores notification templates and logs
      - Manages notification preferences
      - Tracks delivery status

  2. Security
    - Enable RLS on all tables
    - Set up policies for different user roles
    - Ensure data isolation between users

  3. Functions
    - Add registration handling
    - Manage waitlist functionality
    - Handle notification scheduling
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'organizer', 'attendee');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled');
CREATE TYPE registration_status AS ENUM ('confirmed', 'waitlisted', 'cancelled');
CREATE TYPE notification_type AS ENUM ('reminder', 'update', 'cancellation', 'confirmation', 'waitlist_update');

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  full_name text,
  role user_role DEFAULT 'attendee',
  avatar_url text,
  notification_preferences jsonb DEFAULT '{"email": true, "push": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id),
  title text NOT NULL,
  description text,
  location text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  capacity integer NOT NULL,
  image_url text,
  status event_status DEFAULT 'draft',
  is_recurring boolean DEFAULT false,
  recurring_pattern jsonb,
  prerequisites text[],
  materials_needed text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_capacity CHECK (capacity > 0),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create registrations table
CREATE TABLE registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  status registration_status DEFAULT 'confirmed',
  registration_code text UNIQUE NOT NULL,
  waitlist_position integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(event_id, user_id)
);

-- Create notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  scheduled_for timestamptz,
  sent_at timestamptz,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Events policies
CREATE POLICY "Anyone can view published events"
  ON events FOR SELECT
  TO authenticated
  USING (status = 'published');

CREATE POLICY "Organizers can manage their events"
  ON events FOR ALL
  TO authenticated
  USING (
    creator_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Registrations policies
CREATE POLICY "Users can view their registrations"
  ON registrations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can register for events"
  ON registrations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can cancel their registrations"
  ON registrations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Functions
CREATE OR REPLACE FUNCTION handle_registration()
RETURNS TRIGGER AS $$
DECLARE
  current_registrations integer;
  event_capacity integer;
BEGIN
  -- Get current registration count and event capacity
  SELECT COUNT(*), e.capacity
  INTO current_registrations, event_capacity
  FROM registrations r
  JOIN events e ON e.id = r.event_id
  WHERE r.event_id = NEW.event_id
  AND r.status = 'confirmed'
  GROUP BY e.capacity;

  -- Set registration status based on capacity
  IF current_registrations >= event_capacity THEN
    NEW.status = 'waitlisted';
    NEW.waitlist_position = current_registrations - event_capacity + 1;
  END IF;

  -- Generate unique registration code
  NEW.registration_code = encode(gen_random_bytes(6), 'hex');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_registration_insert
  BEFORE INSERT ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION handle_registration();

-- Create indexes for better performance
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_registrations_event_user ON registrations(event_id, user_id);
CREATE INDEX idx_notifications_user_scheduled ON notifications(user_id, scheduled_for);