--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it



--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: notification_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notification_type AS ENUM (
    'event',
    'reminder',
    'system'
);



--
-- Name: status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status AS ENUM (
    'In Progress',
    'On Hold',
    'Resolved'
);



--
-- Name: status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_enum AS ENUM (
    'in progress',
    'on hold',
    'resolved'
);



--
-- Name: status_enum_new; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_enum_new AS ENUM (
    'In Progress',
    'On Hold',
    'Resolved'
);



SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alma_school_app_id; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alma_school_app_id (
    id integer NOT NULL,
    school_app_id character varying(100) NOT NULL
);



--
-- Name: alma_school_app_id_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.alma_school_app_id_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: alma_school_app_id_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.alma_school_app_id_id_seq OWNED BY public.alma_school_app_id.id;


--
-- Name: alma_students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alma_students (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    alma_student_id character varying(255) NOT NULL,
    application_id character varying(100) NOT NULL,
    full_name character varying(500) NOT NULL,
    first_name character varying(255) NOT NULL,
    middle_name character varying(255),
    last_name character varying(255) NOT NULL,
    preferred_name character varying(255),
    gender character varying(100),
    cohort character varying(255),
    nationality character varying(255),
    enrollment_date date,
    is_active boolean DEFAULT true NOT NULL,
    last_synced_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    building_name text,
    school_id integer
);



--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    log_type character varying(20) NOT NULL,
    action_code character varying(50) NOT NULL,
    user_id integer NOT NULL,
    case_id integer,
    target_user_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT audit_logs_log_type_check CHECK (((log_type)::text = ANY ((ARRAY['case'::character varying, 'user'::character varying, 'auth'::character varying])::text[])))
);



--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: buildings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.buildings (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    school_id integer,
    alma_app_school_id integer
);



--
-- Name: buildings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.buildings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: buildings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.buildings_id_seq OWNED BY public.buildings.id;


--
-- Name: case_case_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.case_case_type (
    case_id integer NOT NULL,
    case_type_id integer NOT NULL
);



--
-- Name: case_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.case_files (
    id integer NOT NULL,
    case_id integer,
    filename character varying(150),
    file_type character varying(150),
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    file_url text
);



--
-- Name: case_files_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.case_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: case_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.case_files_id_seq OWNED BY public.case_files.id;


--
-- Name: case_shares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.case_shares (
    id integer NOT NULL,
    case_id integer,
    shared_with_user_id integer,
    shared_by_user_id integer,
    shared_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- Name: case_shares_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.case_shares_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: case_shares_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.case_shares_id_seq OWNED BY public.case_shares.id;


--
-- Name: case_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.case_status_history (
    id integer NOT NULL,
    case_id integer NOT NULL,
    changed_by integer NOT NULL,
    old_status character varying(50),
    new_status character varying(50) NOT NULL,
    changed_date date DEFAULT CURRENT_DATE NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT now()
);



--
-- Name: case_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.case_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: case_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.case_status_history_id_seq OWNED BY public.case_status_history.id;


--
-- Name: case_subcategories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.case_subcategories (
    case_id integer NOT NULL,
    subcategory_id integer NOT NULL
);



--
-- Name: case_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.case_type (
    id integer NOT NULL,
    name character varying(150)
);



--
-- Name: case_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.case_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: case_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.case_type_id_seq OWNED BY public.case_type.id;


--
-- Name: cases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cases (
    id integer NOT NULL,
    reason text NOT NULL,
    status public.status_enum,
    category_id integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    nickname character varying(50) NOT NULL,
    cohort integer NOT NULL,
    nationality_id integer,
    entry_date date,
    created_by integer,
    building_id integer,
    school_id integer,
    sex_id integer,
    severity_id integer,
    student_id integer,
    case_type_id integer,
    CONSTRAINT cases_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('in progress'::character varying)::text, ('resolved'::character varying)::text, ('on hold'::character varying)::text])))
);



--
-- Name: cases_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: cases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cases_id_seq OWNED BY public.cases.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    case_type_id integer,
    is_active boolean DEFAULT true NOT NULL
);



--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: cohorts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cohorts (
    id integer NOT NULL,
    school_id integer,
    building_id integer,
    name character varying(50) NOT NULL,
    grade_level character varying(50) NOT NULL,
    alma_tag character varying(255)
);



--
-- Name: cohorts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cohorts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: cohorts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cohorts_id_seq OWNED BY public.cohorts.id;


--
-- Name: media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media (
    id integer NOT NULL,
    case_id integer,
    file_url text NOT NULL,
    file_type character varying(20),
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- Name: media_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;


--
-- Name: medical_record; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_record (
    id integer NOT NULL,
    student_id integer,
    case_type_id integer,
    created_by integer,
    school_id integer,
    building_id integer,
    overview text,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);



--
-- Name: medical_record_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medical_record_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: medical_record_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medical_record_id_seq OWNED BY public.medical_record.id;


--
-- Name: mr_acad_support; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mr_acad_support (
    id integer NOT NULL,
    mr_id integer,
    description text
);



--
-- Name: mr_acad_support_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mr_acad_support_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: mr_acad_support_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mr_acad_support_id_seq OWNED BY public.mr_acad_support.id;


--
-- Name: mr_concerns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mr_concerns (
    id integer NOT NULL,
    mr_id integer,
    description text
);



--
-- Name: mr_concerns_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mr_concerns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: mr_concerns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mr_concerns_id_seq OWNED BY public.mr_concerns.id;


--
-- Name: mr_emotional_support; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mr_emotional_support (
    id integer NOT NULL,
    mr_id integer,
    description text
);



--
-- Name: mr_emotional_support_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mr_emotional_support_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: mr_emotional_support_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mr_emotional_support_id_seq OWNED BY public.mr_emotional_support.id;


--
-- Name: mr_follow_up; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mr_follow_up (
    id integer NOT NULL,
    mr_id integer,
    description text
);



--
-- Name: mr_follow_up_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mr_follow_up_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: mr_follow_up_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mr_follow_up_id_seq OWNED BY public.mr_follow_up.id;


--
-- Name: mr_long_term_goals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mr_long_term_goals (
    id integer NOT NULL,
    mr_id integer,
    description text
);



--
-- Name: mr_long_term_goals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mr_long_term_goals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: mr_long_term_goals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mr_long_term_goals_id_seq OWNED BY public.mr_long_term_goals.id;


--
-- Name: mr_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mr_metrics (
    id integer NOT NULL,
    mr_id integer,
    description text
);



--
-- Name: mr_metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mr_metrics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: mr_metrics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mr_metrics_id_seq OWNED BY public.mr_metrics.id;


--
-- Name: mr_parental_involvement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mr_parental_involvement (
    id integer NOT NULL,
    mr_id integer,
    description text
);



--
-- Name: mr_parental_involvement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mr_parental_involvement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: mr_parental_involvement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mr_parental_involvement_id_seq OWNED BY public.mr_parental_involvement.id;


--
-- Name: mr_peer_interaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mr_peer_interaction (
    id integer NOT NULL,
    mr_id integer,
    description text
);



--
-- Name: mr_peer_interaction_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mr_peer_interaction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: mr_peer_interaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mr_peer_interaction_id_seq OWNED BY public.mr_peer_interaction.id;


--
-- Name: mr_short_term_goals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mr_short_term_goals (
    id integer NOT NULL,
    mr_id integer,
    description text
);



--
-- Name: mr_short_term_goals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mr_short_term_goals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: mr_short_term_goals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mr_short_term_goals_id_seq OWNED BY public.mr_short_term_goals.id;


--
-- Name: mr_skill_dev; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mr_skill_dev (
    id integer NOT NULL,
    mr_id integer,
    description text
);



--
-- Name: mr_skill_dev_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mr_skill_dev_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: mr_skill_dev_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mr_skill_dev_id_seq OWNED BY public.mr_skill_dev.id;


--
-- Name: nationalities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nationalities (
    id integer NOT NULL,
    name character varying(150) NOT NULL
);



--
-- Name: nationalities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nationalities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: nationalities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nationalities_id_seq OWNED BY public.nationalities.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    message text NOT NULL,
    receiver_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_read boolean DEFAULT false,
    created_by_id integer,
    case_id integer,
    case_share_id integer,
    session_note_id integer,
    treatment_plan_id integer,
    type public.notification_type DEFAULT 'event'::public.notification_type NOT NULL
);



--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: school_domains; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.school_domains (
    id integer NOT NULL,
    domain character varying(255) NOT NULL,
    school_id integer NOT NULL
);



--
-- Name: school_domains_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.school_domains_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: school_domains_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.school_domains_id_seq OWNED BY public.school_domains.id;


--
-- Name: schools; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schools (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    abbreviation character varying(4),
    address text
);



--
-- Name: schools_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.schools_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: schools_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.schools_id_seq OWNED BY public.schools.id;


--
-- Name: session_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session_notes (
    id integer NOT NULL,
    student_id integer,
    case_type_id integer,
    created_by integer,
    school_id integer,
    building_id integer,
    overview text,
    observation_notes text,
    follow_up_date date,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);



--
-- Name: session_notes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.session_notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: session_notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.session_notes_id_seq OWNED BY public.session_notes.id;


--
-- Name: severity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.severity (
    id integer NOT NULL,
    name character varying(150)
);



--
-- Name: severity_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.severity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: severity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.severity_id_seq OWNED BY public.severity.id;


--
-- Name: sex; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sex (
    id integer NOT NULL,
    label character varying(50) NOT NULL
);



--
-- Name: sex_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sex_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: sex_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sex_id_seq OWNED BY public.sex.id;


--
-- Name: sn_actions_taken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sn_actions_taken (
    id integer NOT NULL,
    sn_id integer,
    description text
);



--
-- Name: sn_actions_taken_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sn_actions_taken_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: sn_actions_taken_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sn_actions_taken_id_seq OWNED BY public.sn_actions_taken.id;


--
-- Name: sn_future_actions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sn_future_actions (
    id integer NOT NULL,
    sn_id integer,
    description text
);



--
-- Name: sn_future_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sn_future_actions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: sn_future_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sn_future_actions_id_seq OWNED BY public.sn_future_actions.id;


--
-- Name: sn_outcome; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sn_outcome (
    id integer NOT NULL,
    sn_id integer,
    description text
);



--
-- Name: sn_outcome_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sn_outcome_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: sn_outcome_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sn_outcome_id_seq OWNED BY public.sn_outcome.id;


--
-- Name: sn_people_present; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sn_people_present (
    id integer NOT NULL,
    sn_id integer,
    name character varying(100),
    role integer
);



--
-- Name: sn_people_present_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sn_people_present_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: sn_people_present_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sn_people_present_id_seq OWNED BY public.sn_people_present.id;


--
-- Name: sn_role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sn_role (
    id integer NOT NULL,
    name character varying(50)
);



--
-- Name: sn_role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sn_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: sn_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sn_role_id_seq OWNED BY public.sn_role.id;


--
-- Name: sn_shares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sn_shares (
    id integer NOT NULL,
    sn_id integer,
    shared_with_user_id integer,
    shared_by_user_id integer,
    shared_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- Name: sn_shares_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sn_shares_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: sn_shares_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sn_shares_id_seq OWNED BY public.sn_shares.id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    id integer NOT NULL,
    school_id integer,
    building_id integer,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    nickname character varying(50) NOT NULL,
    cohort integer NOT NULL,
    nationality_id integer,
    entry_date date
);



--
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


--
-- Name: subcategories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subcategories (
    id integer NOT NULL,
    category_id integer,
    name character varying(150) NOT NULL,
    case_type_id integer,
    is_active boolean DEFAULT true NOT NULL
);



--
-- Name: subcategories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subcategories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: subcategories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subcategories_id_seq OWNED BY public.subcategories.id;


--
-- Name: sync_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sync_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    status character varying(20) DEFAULT 'in_progress'::character varying NOT NULL,
    error_message text,
    records_updated integer,
    records_added integer,
    records_deactivated integer,
    triggered_by character varying(255),
    CONSTRAINT sync_logs_status_check CHECK (((status)::text = ANY (ARRAY[('in_progress'::character varying)::text, ('success'::character varying)::text, ('failed'::character varying)::text])))
);



--
-- Name: tp_acad_support; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tp_acad_support (
    id integer NOT NULL,
    tp_id integer,
    description text
);



--
-- Name: tp_acad_support_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tp_acad_support_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: tp_acad_support_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tp_acad_support_id_seq OWNED BY public.tp_acad_support.id;


--
-- Name: tp_concerns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tp_concerns (
    id integer NOT NULL,
    tp_id integer,
    description text
);



--
-- Name: tp_concerns_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tp_concerns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: tp_concerns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tp_concerns_id_seq OWNED BY public.tp_concerns.id;


--
-- Name: tp_emotional_support; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tp_emotional_support (
    id integer NOT NULL,
    tp_id integer,
    description text
);



--
-- Name: tp_emotional_support_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tp_emotional_support_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: tp_emotional_support_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tp_emotional_support_id_seq OWNED BY public.tp_emotional_support.id;


--
-- Name: tp_follow_up; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tp_follow_up (
    id integer NOT NULL,
    tp_id integer,
    description text
);



--
-- Name: tp_follow_up_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tp_follow_up_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: tp_follow_up_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tp_follow_up_id_seq OWNED BY public.tp_follow_up.id;


--
-- Name: tp_long_term_goals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tp_long_term_goals (
    id integer NOT NULL,
    tp_id integer,
    description text
);



--
-- Name: tp_long_term_goals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tp_long_term_goals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: tp_long_term_goals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tp_long_term_goals_id_seq OWNED BY public.tp_long_term_goals.id;


--
-- Name: tp_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tp_metrics (
    id integer NOT NULL,
    tp_id integer,
    description text
);



--
-- Name: tp_metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tp_metrics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: tp_metrics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tp_metrics_id_seq OWNED BY public.tp_metrics.id;


--
-- Name: tp_parental_involvement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tp_parental_involvement (
    id integer NOT NULL,
    tp_id integer,
    description text
);



--
-- Name: tp_parental_involvement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tp_parental_involvement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: tp_parental_involvement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tp_parental_involvement_id_seq OWNED BY public.tp_parental_involvement.id;


--
-- Name: tp_peer_interaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tp_peer_interaction (
    id integer NOT NULL,
    tp_id integer,
    description text
);



--
-- Name: tp_peer_interaction_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tp_peer_interaction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: tp_peer_interaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tp_peer_interaction_id_seq OWNED BY public.tp_peer_interaction.id;


--
-- Name: tp_shares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tp_shares (
    id integer NOT NULL,
    tp_id integer,
    shared_with_user_id integer,
    shared_by_user_id integer,
    shared_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- Name: tp_shares_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tp_shares_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: tp_shares_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tp_shares_id_seq OWNED BY public.tp_shares.id;


--
-- Name: tp_short_term_goals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tp_short_term_goals (
    id integer NOT NULL,
    tp_id integer,
    description text
);



--
-- Name: tp_short_term_goals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tp_short_term_goals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: tp_short_term_goals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tp_short_term_goals_id_seq OWNED BY public.tp_short_term_goals.id;


--
-- Name: tp_skill_dev; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tp_skill_dev (
    id integer NOT NULL,
    tp_id integer,
    description text
);



--
-- Name: tp_skill_dev_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tp_skill_dev_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: tp_skill_dev_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tp_skill_dev_id_seq OWNED BY public.tp_skill_dev.id;


--
-- Name: treatment_plan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.treatment_plan (
    id integer NOT NULL,
    student_id integer,
    case_type_id integer,
    created_by integer,
    school_id integer,
    building_id integer,
    student_overview text,
    notes text,
    created_at timestamp without time zone DEFAULT now()
);



--
-- Name: treatment_plan_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.treatment_plan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: treatment_plan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.treatment_plan_id_seq OWNED BY public.treatment_plan.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash text,
    role character varying(50),
    school_id integer,
    building_id integer,
    access_level integer,
    is_active boolean DEFAULT true,
    google_id character varying(255),
    failed_login_attempts integer DEFAULT 0,
    locked_until timestamp without time zone,
    CONSTRAINT users_access_level_check CHECK ((access_level = ANY (ARRAY[0, 1, 2, 3, 4]))),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('guidance counselor'::character varying)::text, ('child protection officer'::character varying)::text, ('ehs director'::character varying)::text, ('admin'::character varying)::text, ('teacher'::character varying)::text])))
);



--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: alma_school_app_id id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alma_school_app_id ALTER COLUMN id SET DEFAULT nextval('public.alma_school_app_id_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: buildings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buildings ALTER COLUMN id SET DEFAULT nextval('public.buildings_id_seq'::regclass);


--
-- Name: case_files id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_files ALTER COLUMN id SET DEFAULT nextval('public.case_files_id_seq'::regclass);


--
-- Name: case_shares id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_shares ALTER COLUMN id SET DEFAULT nextval('public.case_shares_id_seq'::regclass);


--
-- Name: case_status_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_status_history ALTER COLUMN id SET DEFAULT nextval('public.case_status_history_id_seq'::regclass);


--
-- Name: case_type id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_type ALTER COLUMN id SET DEFAULT nextval('public.case_type_id_seq'::regclass);


--
-- Name: cases id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cases ALTER COLUMN id SET DEFAULT nextval('public.cases_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: cohorts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cohorts ALTER COLUMN id SET DEFAULT nextval('public.cohorts_id_seq'::regclass);


--
-- Name: media id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);


--
-- Name: medical_record id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_record ALTER COLUMN id SET DEFAULT nextval('public.medical_record_id_seq'::regclass);


--
-- Name: mr_acad_support id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_acad_support ALTER COLUMN id SET DEFAULT nextval('public.mr_acad_support_id_seq'::regclass);


--
-- Name: mr_concerns id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_concerns ALTER COLUMN id SET DEFAULT nextval('public.mr_concerns_id_seq'::regclass);


--
-- Name: mr_emotional_support id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_emotional_support ALTER COLUMN id SET DEFAULT nextval('public.mr_emotional_support_id_seq'::regclass);


--
-- Name: mr_follow_up id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_follow_up ALTER COLUMN id SET DEFAULT nextval('public.mr_follow_up_id_seq'::regclass);


--
-- Name: mr_long_term_goals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_long_term_goals ALTER COLUMN id SET DEFAULT nextval('public.mr_long_term_goals_id_seq'::regclass);


--
-- Name: mr_metrics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_metrics ALTER COLUMN id SET DEFAULT nextval('public.mr_metrics_id_seq'::regclass);


--
-- Name: mr_parental_involvement id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_parental_involvement ALTER COLUMN id SET DEFAULT nextval('public.mr_parental_involvement_id_seq'::regclass);


--
-- Name: mr_peer_interaction id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_peer_interaction ALTER COLUMN id SET DEFAULT nextval('public.mr_peer_interaction_id_seq'::regclass);


--
-- Name: mr_short_term_goals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_short_term_goals ALTER COLUMN id SET DEFAULT nextval('public.mr_short_term_goals_id_seq'::regclass);


--
-- Name: mr_skill_dev id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_skill_dev ALTER COLUMN id SET DEFAULT nextval('public.mr_skill_dev_id_seq'::regclass);


--
-- Name: nationalities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nationalities ALTER COLUMN id SET DEFAULT nextval('public.nationalities_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: school_domains id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_domains ALTER COLUMN id SET DEFAULT nextval('public.school_domains_id_seq'::regclass);


--
-- Name: schools id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schools ALTER COLUMN id SET DEFAULT nextval('public.schools_id_seq'::regclass);


--
-- Name: session_notes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_notes ALTER COLUMN id SET DEFAULT nextval('public.session_notes_id_seq'::regclass);


--
-- Name: severity id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.severity ALTER COLUMN id SET DEFAULT nextval('public.severity_id_seq'::regclass);


--
-- Name: sex id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sex ALTER COLUMN id SET DEFAULT nextval('public.sex_id_seq'::regclass);


--
-- Name: sn_actions_taken id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sn_actions_taken ALTER COLUMN id SET DEFAULT nextval('public.sn_actions_taken_id_seq'::regclass);


--
-- Name: sn_future_actions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sn_future_actions ALTER COLUMN id SET DEFAULT nextval('public.sn_future_actions_id_seq'::regclass);


--
-- Name: sn_outcome id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sn_outcome ALTER COLUMN id SET DEFAULT nextval('public.sn_outcome_id_seq'::regclass);


--
-- Name: sn_people_present id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sn_people_present ALTER COLUMN id SET DEFAULT nextval('public.sn_people_present_id_seq'::regclass);


--
-- Name: sn_role id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sn_role ALTER COLUMN id SET DEFAULT nextval('public.sn_role_id_seq'::regclass);


--
-- Name: sn_shares id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sn_shares ALTER COLUMN id SET DEFAULT nextval('public.sn_shares_id_seq'::regclass);


--
-- Name: students id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- Name: subcategories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subcategories ALTER COLUMN id SET DEFAULT nextval('public.subcategories_id_seq'::regclass);


--
-- Name: tp_acad_support id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_acad_support ALTER COLUMN id SET DEFAULT nextval('public.tp_acad_support_id_seq'::regclass);


--
-- Name: tp_concerns id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_concerns ALTER COLUMN id SET DEFAULT nextval('public.tp_concerns_id_seq'::regclass);


--
-- Name: tp_emotional_support id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_emotional_support ALTER COLUMN id SET DEFAULT nextval('public.tp_emotional_support_id_seq'::regclass);


--
-- Name: tp_follow_up id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_follow_up ALTER COLUMN id SET DEFAULT nextval('public.tp_follow_up_id_seq'::regclass);


--
-- Name: tp_long_term_goals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_long_term_goals ALTER COLUMN id SET DEFAULT nextval('public.tp_long_term_goals_id_seq'::regclass);


--
-- Name: tp_metrics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_metrics ALTER COLUMN id SET DEFAULT nextval('public.tp_metrics_id_seq'::regclass);


--
-- Name: tp_parental_involvement id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_parental_involvement ALTER COLUMN id SET DEFAULT nextval('public.tp_parental_involvement_id_seq'::regclass);


--
-- Name: tp_peer_interaction id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_peer_interaction ALTER COLUMN id SET DEFAULT nextval('public.tp_peer_interaction_id_seq'::regclass);


--
-- Name: tp_shares id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_shares ALTER COLUMN id SET DEFAULT nextval('public.tp_shares_id_seq'::regclass);


--
-- Name: tp_short_term_goals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_short_term_goals ALTER COLUMN id SET DEFAULT nextval('public.tp_short_term_goals_id_seq'::regclass);


--
-- Name: tp_skill_dev id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_skill_dev ALTER COLUMN id SET DEFAULT nextval('public.tp_skill_dev_id_seq'::regclass);


--
-- Name: treatment_plan id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatment_plan ALTER COLUMN id SET DEFAULT nextval('public.treatment_plan_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: alma_school_app_id alma_school_app_id_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alma_school_app_id
    ADD CONSTRAINT alma_school_app_id_pkey PRIMARY KEY (id);


--
-- Name: alma_students alma_students_alma_student_id_application_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alma_students
    ADD CONSTRAINT alma_students_alma_student_id_application_id_key UNIQUE (alma_student_id, application_id);


--
-- Name: alma_students alma_students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alma_students
    ADD CONSTRAINT alma_students_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: buildings buildings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buildings
    ADD CONSTRAINT buildings_pkey PRIMARY KEY (id);


--
-- Name: case_case_type case_case_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_case_type
    ADD CONSTRAINT case_case_type_pkey PRIMARY KEY (case_id, case_type_id);


--
-- Name: case_files case_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_files
    ADD CONSTRAINT case_files_pkey PRIMARY KEY (id);


--
-- Name: case_shares case_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_shares
    ADD CONSTRAINT case_shares_pkey PRIMARY KEY (id);


--
-- Name: case_status_history case_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_status_history
    ADD CONSTRAINT case_status_history_pkey PRIMARY KEY (id);


--
-- Name: case_subcategories case_subcategories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_subcategories
    ADD CONSTRAINT case_subcategories_pkey PRIMARY KEY (case_id, subcategory_id);


--
-- Name: case_type case_type_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_type
    ADD CONSTRAINT case_type_name_key UNIQUE (name);


--
-- Name: case_type case_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_type
    ADD CONSTRAINT case_type_pkey PRIMARY KEY (id);


--
-- Name: cases cases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: cohorts cohorts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cohorts
    ADD CONSTRAINT cohorts_pkey PRIMARY KEY (id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: medical_record medical_record_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_record
    ADD CONSTRAINT medical_record_pkey PRIMARY KEY (id);


--
-- Name: mr_acad_support mr_acad_support_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_acad_support
    ADD CONSTRAINT mr_acad_support_pkey PRIMARY KEY (id);


--
-- Name: mr_concerns mr_concerns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_concerns
    ADD CONSTRAINT mr_concerns_pkey PRIMARY KEY (id);


--
-- Name: mr_emotional_support mr_emotional_support_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_emotional_support
    ADD CONSTRAINT mr_emotional_support_pkey PRIMARY KEY (id);


--
-- Name: mr_follow_up mr_follow_up_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_follow_up
    ADD CONSTRAINT mr_follow_up_pkey PRIMARY KEY (id);


--
-- Name: mr_long_term_goals mr_long_term_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_long_term_goals
    ADD CONSTRAINT mr_long_term_goals_pkey PRIMARY KEY (id);


--
-- Name: mr_metrics mr_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_metrics
    ADD CONSTRAINT mr_metrics_pkey PRIMARY KEY (id);


--
-- Name: mr_parental_involvement mr_parental_involvement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_parental_involvement
    ADD CONSTRAINT mr_parental_involvement_pkey PRIMARY KEY (id);


--
-- Name: mr_peer_interaction mr_peer_interaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_peer_interaction
    ADD CONSTRAINT mr_peer_interaction_pkey PRIMARY KEY (id);


--
-- Name: mr_short_term_goals mr_short_term_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_short_term_goals
    ADD CONSTRAINT mr_short_term_goals_pkey PRIMARY KEY (id);


--
-- Name: mr_skill_dev mr_skill_dev_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_skill_dev
    ADD CONSTRAINT mr_skill_dev_pkey PRIMARY KEY (id);


--
-- Name: nationalities nationalities_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nationalities
    ADD CONSTRAINT nationalities_name_key UNIQUE (name);


--
-- Name: nationalities nationalities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nationalities
    ADD CONSTRAINT nationalities_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: school_domains school_domains_domain_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_domains
    ADD CONSTRAINT school_domains_domain_key UNIQUE (domain);


--
-- Name: school_domains school_domains_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_domains
    ADD CONSTRAINT school_domains_pkey PRIMARY KEY (id);


--
-- Name: schools schools_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_name_key UNIQUE (name);


--
-- Name: schools schools_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_pkey PRIMARY KEY (id);


--
-- Name: session_notes session_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_notes
    ADD CONSTRAINT session_notes_pkey PRIMARY KEY (id);


--
-- Name: severity severity_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.severity
    ADD CONSTRAINT severity_name_key UNIQUE (name);


--
-- Name: severity severity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.severity
    ADD CONSTRAINT severity_pkey PRIMARY KEY (id);


--
-- Name: sex sex_label_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sex
    ADD CONSTRAINT sex_label_key UNIQUE (label);


--
-- Name: sex sex_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sex
    ADD CONSTRAINT sex_pkey PRIMARY KEY (id);


--
-- Name: sn_actions_taken sn_actions_taken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sn_actions_taken
    ADD CONSTRAINT sn_actions_taken_pkey PRIMARY KEY (id);


--
-- Name: sn_future_actions sn_future_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sn_future_actions
    ADD CONSTRAINT sn_future_actions_pkey PRIMARY KEY (id);


--
-- Name: sn_outcome sn_outcome_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sn_outcome
    ADD CONSTRAINT sn_outcome_pkey PRIMARY KEY (id);


--
-- Name: sn_people_present sn_people_present_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sn_people_present
    ADD CONSTRAINT sn_people_present_pkey PRIMARY KEY (id);


--
-- Name: sn_role sn_role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sn_role
    ADD CONSTRAINT sn_role_pkey PRIMARY KEY (id);


--
-- Name: sn_shares sn_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sn_shares
    ADD CONSTRAINT sn_shares_pkey PRIMARY KEY (id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: subcategories subcategories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subcategories
    ADD CONSTRAINT subcategories_pkey PRIMARY KEY (id);


--
-- Name: sync_logs sync_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sync_logs
    ADD CONSTRAINT sync_logs_pkey PRIMARY KEY (id);


--
-- Name: tp_acad_support tp_acad_support_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_acad_support
    ADD CONSTRAINT tp_acad_support_pkey PRIMARY KEY (id);


--
-- Name: tp_concerns tp_concerns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_concerns
    ADD CONSTRAINT tp_concerns_pkey PRIMARY KEY (id);


--
-- Name: tp_emotional_support tp_emotional_support_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_emotional_support
    ADD CONSTRAINT tp_emotional_support_pkey PRIMARY KEY (id);


--
-- Name: tp_follow_up tp_follow_up_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_follow_up
    ADD CONSTRAINT tp_follow_up_pkey PRIMARY KEY (id);


--
-- Name: tp_long_term_goals tp_long_term_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_long_term_goals
    ADD CONSTRAINT tp_long_term_goals_pkey PRIMARY KEY (id);


--
-- Name: tp_metrics tp_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_metrics
    ADD CONSTRAINT tp_metrics_pkey PRIMARY KEY (id);


--
-- Name: tp_parental_involvement tp_parental_involvement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_parental_involvement
    ADD CONSTRAINT tp_parental_involvement_pkey PRIMARY KEY (id);


--
-- Name: tp_peer_interaction tp_peer_interaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_peer_interaction
    ADD CONSTRAINT tp_peer_interaction_pkey PRIMARY KEY (id);


--
-- Name: tp_shares tp_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_shares
    ADD CONSTRAINT tp_shares_pkey PRIMARY KEY (id);


--
-- Name: tp_short_term_goals tp_short_term_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_short_term_goals
    ADD CONSTRAINT tp_short_term_goals_pkey PRIMARY KEY (id);


--
-- Name: tp_skill_dev tp_skill_dev_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_skill_dev
    ADD CONSTRAINT tp_skill_dev_pkey PRIMARY KEY (id);


--
-- Name: treatment_plan treatment_plan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatment_plan
    ADD CONSTRAINT treatment_plan_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_alma_students_app_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alma_students_app_id ON public.alma_students USING btree (application_id);


--
-- Name: idx_alma_students_cohort; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alma_students_cohort ON public.alma_students USING btree (cohort);


--
-- Name: idx_alma_students_first_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alma_students_first_name ON public.alma_students USING btree (first_name);


--
-- Name: idx_alma_students_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alma_students_is_active ON public.alma_students USING btree (is_active);


--
-- Name: idx_alma_students_last_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alma_students_last_name ON public.alma_students USING btree (last_name);


--
-- Name: idx_alma_students_school_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alma_students_school_id ON public.alma_students USING btree (school_id);


--
-- Name: idx_case_status_history_case_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_case_status_history_case_id ON public.case_status_history USING btree (case_id);


--
-- Name: idx_categories_case_type_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_categories_case_type_id ON public.categories USING btree (case_type_id);


--
-- Name: idx_subcategories_case_type_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subcategories_case_type_id ON public.subcategories USING btree (case_type_id);


--
-- Name: idx_sync_logs_started_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sync_logs_started_at ON public.sync_logs USING btree (started_at DESC);


--
-- Name: idx_sync_logs_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sync_logs_status ON public.sync_logs USING btree (status);


--
-- Name: alma_students alma_students_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alma_students
    ADD CONSTRAINT alma_students_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: audit_logs audit_logs_target_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES public.users(id);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: buildings buildings_alma_app_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buildings
    ADD CONSTRAINT buildings_alma_app_school_id_fkey FOREIGN KEY (alma_app_school_id) REFERENCES public.alma_school_app_id(id);


--
-- Name: buildings buildings_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buildings
    ADD CONSTRAINT buildings_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: case_case_type case_case_type_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_case_type
    ADD CONSTRAINT case_case_type_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;


--
-- Name: case_case_type case_case_type_case_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_case_type
    ADD CONSTRAINT case_case_type_case_type_id_fkey FOREIGN KEY (case_type_id) REFERENCES public.case_type(id) ON DELETE CASCADE;


--
-- Name: case_files case_files_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_files
    ADD CONSTRAINT case_files_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id);


--
-- Name: case_shares case_shares_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_shares
    ADD CONSTRAINT case_shares_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;


--
-- Name: case_shares case_shares_shared_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_shares
    ADD CONSTRAINT case_shares_shared_by_user_id_fkey FOREIGN KEY (shared_by_user_id) REFERENCES public.users(id);


--
-- Name: case_shares case_shares_shared_with_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_shares
    ADD CONSTRAINT case_shares_shared_with_user_id_fkey FOREIGN KEY (shared_with_user_id) REFERENCES public.users(id);


--
-- Name: case_status_history case_status_history_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_status_history
    ADD CONSTRAINT case_status_history_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;


--
-- Name: case_status_history case_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_status_history
    ADD CONSTRAINT case_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id);


--
-- Name: case_subcategories case_subcategories_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_subcategories
    ADD CONSTRAINT case_subcategories_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;


--
-- Name: case_subcategories case_subcategories_subcategory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_subcategories
    ADD CONSTRAINT case_subcategories_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES public.subcategories(id) ON DELETE CASCADE;


--
-- Name: cases cases_building_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_building_id_fkey FOREIGN KEY (building_id) REFERENCES public.buildings(id);


--
-- Name: cases cases_case_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_case_type_id_fkey FOREIGN KEY (case_type_id) REFERENCES public.case_type(id);


--
-- Name: cases cases_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: cases cases_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: cases cases_nationality_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_nationality_id_fkey FOREIGN KEY (nationality_id) REFERENCES public.nationalities(id);


--
-- Name: cases cases_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: cases cases_severity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_severity_id_fkey FOREIGN KEY (severity_id) REFERENCES public.severity(id);


--
-- Name: cases cases_sex_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_sex_id_fkey FOREIGN KEY (sex_id) REFERENCES public.sex(id);


--
-- Name: categories categories_case_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_case_type_id_fkey FOREIGN KEY (case_type_id) REFERENCES public.case_type(id);


--
-- Name: cohorts cohorts_building_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cohorts
    ADD CONSTRAINT cohorts_building_id_fkey FOREIGN KEY (building_id) REFERENCES public.buildings(id);


--
-- Name: cohorts cohorts_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cohorts
    ADD CONSTRAINT cohorts_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: cases fk_student_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT fk_student_id FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: media media_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;


--
-- Name: medical_record medical_record_building_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_record
    ADD CONSTRAINT medical_record_building_id_fkey FOREIGN KEY (building_id) REFERENCES public.buildings(id);


--
-- Name: medical_record medical_record_case_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_record
    ADD CONSTRAINT medical_record_case_type_id_fkey FOREIGN KEY (case_type_id) REFERENCES public.case_type(id);


--
-- Name: medical_record medical_record_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_record
    ADD CONSTRAINT medical_record_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: medical_record medical_record_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_record
    ADD CONSTRAINT medical_record_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: medical_record medical_record_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_record
    ADD CONSTRAINT medical_record_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: mr_acad_support mr_acad_support_mr_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_acad_support
    ADD CONSTRAINT mr_acad_support_mr_id_fkey FOREIGN KEY (mr_id) REFERENCES public.medical_record(id) ON DELETE CASCADE;


--
-- Name: mr_concerns mr_concerns_mr_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_concerns
    ADD CONSTRAINT mr_concerns_mr_id_fkey FOREIGN KEY (mr_id) REFERENCES public.medical_record(id) ON DELETE CASCADE;


--
-- Name: mr_emotional_support mr_emotional_support_mr_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_emotional_support
    ADD CONSTRAINT mr_emotional_support_mr_id_fkey FOREIGN KEY (mr_id) REFERENCES public.medical_record(id) ON DELETE CASCADE;


--
-- Name: mr_follow_up mr_follow_up_mr_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_follow_up
    ADD CONSTRAINT mr_follow_up_mr_id_fkey FOREIGN KEY (mr_id) REFERENCES public.medical_record(id) ON DELETE CASCADE;


--
-- Name: mr_long_term_goals mr_long_term_goals_mr_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_long_term_goals
    ADD CONSTRAINT mr_long_term_goals_mr_id_fkey FOREIGN KEY (mr_id) REFERENCES public.medical_record(id) ON DELETE CASCADE;


--
-- Name: mr_metrics mr_metrics_mr_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_metrics
    ADD CONSTRAINT mr_metrics_mr_id_fkey FOREIGN KEY (mr_id) REFERENCES public.medical_record(id) ON DELETE CASCADE;


--
-- Name: mr_parental_involvement mr_parental_involvement_mr_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_parental_involvement
    ADD CONSTRAINT mr_parental_involvement_mr_id_fkey FOREIGN KEY (mr_id) REFERENCES public.medical_record(id) ON DELETE CASCADE;


--
-- Name: mr_peer_interaction mr_peer_interaction_mr_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_peer_interaction
    ADD CONSTRAINT mr_peer_interaction_mr_id_fkey FOREIGN KEY (mr_id) REFERENCES public.medical_record(id) ON DELETE CASCADE;


--
-- Name: mr_short_term_goals mr_short_term_goals_mr_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_short_term_goals
    ADD CONSTRAINT mr_short_term_goals_mr_id_fkey FOREIGN KEY (mr_id) REFERENCES public.medical_record(id) ON DELETE CASCADE;


--
-- Name: mr_skill_dev mr_skill_dev_mr_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mr_skill_dev
    ADD CONSTRAINT mr_skill_dev_mr_id_fkey FOREIGN KEY (mr_id) REFERENCES public.medical_record(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id);


--
-- Name: notifications notifications_case_share_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_case_share_id_fkey FOREIGN KEY (case_share_id) REFERENCES public.case_shares(id);


--
-- Name: notifications notifications_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_session_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_session_note_id_fkey FOREIGN KEY (session_note_id) REFERENCES public.session_notes(id);


--
-- Name: notifications notifications_treatment_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_treatment_plan_id_fkey FOREIGN KEY (treatment_plan_id) REFERENCES public.treatment_plan(id);


--
-- Name: school_domains school_domains_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_domains
    ADD CONSTRAINT school_domains_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: session_notes session_notes_building_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_notes
    ADD CONSTRAINT session_notes_building_id_fkey FOREIGN KEY (building_id) REFERENCES public.buildings(id);


--
-- Name: session_notes session_notes_case_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_notes
    ADD CONSTRAINT session_notes_case_type_id_fkey FOREIGN KEY (case_type_id) REFERENCES public.case_type(id);


--
-- Name: session_notes session_notes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_notes
    ADD CONSTRAINT session_notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: session_notes session_notes_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_notes
    ADD CONSTRAINT session_notes_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: session_notes session_notes_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_notes
    ADD CONSTRAINT session_notes_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: sn_actions_taken sn_actions_taken_sn_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sn_actions_taken
    ADD CONSTRAINT sn_actions_taken_sn_id_fkey FOREIGN KEY (sn_id) REFERENCES public.session_notes(id) ON DELETE CASCADE;


--
-- Name: sn_future_actions sn_future_actions_sn_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sn_future_actions
    ADD CONSTRAINT sn_future_actions_sn_id_fkey FOREIGN KEY (sn_id) REFERENCES public.session_notes(id) ON DELETE CASCADE;


--
-- Name: sn_outcome sn_outcome_sn_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sn_outcome
    ADD CONSTRAINT sn_outcome_sn_id_fkey FOREIGN KEY (sn_id) REFERENCES public.session_notes(id) ON DELETE CASCADE;


--
-- Name: sn_people_present sn_people_present_role_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sn_people_present
    ADD CONSTRAINT sn_people_present_role_fkey FOREIGN KEY (role) REFERENCES public.sn_role(id);


--
-- Name: sn_people_present sn_people_present_sn_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sn_people_present
    ADD CONSTRAINT sn_people_present_sn_id_fkey FOREIGN KEY (sn_id) REFERENCES public.session_notes(id) ON DELETE CASCADE;


--
-- Name: sn_shares sn_shares_shared_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sn_shares
    ADD CONSTRAINT sn_shares_shared_by_user_id_fkey FOREIGN KEY (shared_by_user_id) REFERENCES public.users(id);


--
-- Name: sn_shares sn_shares_shared_with_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sn_shares
    ADD CONSTRAINT sn_shares_shared_with_user_id_fkey FOREIGN KEY (shared_with_user_id) REFERENCES public.users(id);


--
-- Name: sn_shares sn_shares_sn_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sn_shares
    ADD CONSTRAINT sn_shares_sn_id_fkey FOREIGN KEY (sn_id) REFERENCES public.session_notes(id);


--
-- Name: students students_building_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_building_id_fkey FOREIGN KEY (building_id) REFERENCES public.buildings(id);


--
-- Name: students students_nationality_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_nationality_id_fkey FOREIGN KEY (nationality_id) REFERENCES public.nationalities(id);


--
-- Name: students students_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: subcategories subcategories_case_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subcategories
    ADD CONSTRAINT subcategories_case_type_id_fkey FOREIGN KEY (case_type_id) REFERENCES public.case_type(id);


--
-- Name: subcategories subcategories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subcategories
    ADD CONSTRAINT subcategories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: tp_acad_support tp_acad_support_tp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_acad_support
    ADD CONSTRAINT tp_acad_support_tp_id_fkey FOREIGN KEY (tp_id) REFERENCES public.treatment_plan(id);


--
-- Name: tp_concerns tp_concerns_tp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_concerns
    ADD CONSTRAINT tp_concerns_tp_id_fkey FOREIGN KEY (tp_id) REFERENCES public.treatment_plan(id);


--
-- Name: tp_emotional_support tp_emotional_support_tp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_emotional_support
    ADD CONSTRAINT tp_emotional_support_tp_id_fkey FOREIGN KEY (tp_id) REFERENCES public.treatment_plan(id);


--
-- Name: tp_follow_up tp_follow_up_tp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_follow_up
    ADD CONSTRAINT tp_follow_up_tp_id_fkey FOREIGN KEY (tp_id) REFERENCES public.treatment_plan(id);


--
-- Name: tp_long_term_goals tp_long_term_goals_tp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_long_term_goals
    ADD CONSTRAINT tp_long_term_goals_tp_id_fkey FOREIGN KEY (tp_id) REFERENCES public.treatment_plan(id);


--
-- Name: tp_metrics tp_metrics_tp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_metrics
    ADD CONSTRAINT tp_metrics_tp_id_fkey FOREIGN KEY (tp_id) REFERENCES public.treatment_plan(id);


--
-- Name: tp_parental_involvement tp_parental_involvement_tp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_parental_involvement
    ADD CONSTRAINT tp_parental_involvement_tp_id_fkey FOREIGN KEY (tp_id) REFERENCES public.treatment_plan(id);


--
-- Name: tp_peer_interaction tp_peer_interaction_tp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_peer_interaction
    ADD CONSTRAINT tp_peer_interaction_tp_id_fkey FOREIGN KEY (tp_id) REFERENCES public.treatment_plan(id);


--
-- Name: tp_shares tp_shares_shared_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_shares
    ADD CONSTRAINT tp_shares_shared_by_user_id_fkey FOREIGN KEY (shared_by_user_id) REFERENCES public.users(id);


--
-- Name: tp_shares tp_shares_shared_with_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_shares
    ADD CONSTRAINT tp_shares_shared_with_user_id_fkey FOREIGN KEY (shared_with_user_id) REFERENCES public.users(id);


--
-- Name: tp_shares tp_shares_tp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_shares
    ADD CONSTRAINT tp_shares_tp_id_fkey FOREIGN KEY (tp_id) REFERENCES public.treatment_plan(id);


--
-- Name: tp_short_term_goals tp_short_term_goals_tp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_short_term_goals
    ADD CONSTRAINT tp_short_term_goals_tp_id_fkey FOREIGN KEY (tp_id) REFERENCES public.treatment_plan(id);


--
-- Name: tp_skill_dev tp_skill_dev_tp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tp_skill_dev
    ADD CONSTRAINT tp_skill_dev_tp_id_fkey FOREIGN KEY (tp_id) REFERENCES public.treatment_plan(id);


--
-- Name: treatment_plan treatment_plan_building_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatment_plan
    ADD CONSTRAINT treatment_plan_building_id_fkey FOREIGN KEY (building_id) REFERENCES public.buildings(id);


--
-- Name: treatment_plan treatment_plan_case_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatment_plan
    ADD CONSTRAINT treatment_plan_case_type_id_fkey FOREIGN KEY (case_type_id) REFERENCES public.case_type(id);


--
-- Name: treatment_plan treatment_plan_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatment_plan
    ADD CONSTRAINT treatment_plan_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: treatment_plan treatment_plan_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatment_plan
    ADD CONSTRAINT treatment_plan_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: treatment_plan treatment_plan_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatment_plan
    ADD CONSTRAINT treatment_plan_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: users users_building_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_building_id_fkey FOREIGN KEY (building_id) REFERENCES public.buildings(id);


--
-- Name: users users_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--



--
-- PostgreSQL database dump complete
--

