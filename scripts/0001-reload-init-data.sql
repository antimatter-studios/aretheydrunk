SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict 5945e2XW5FIgyKvl6iVQ1m4ZDH0zv7ay3zZXteiD7BlvfudTeWjLew88FEIiw6Z

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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

-- Clean existing rows to avoid duplicate key violations on re-run
DELETE FROM auth.sessions;
DELETE FROM auth.mfa_amr_claims;
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.identities;
DELETE FROM auth.users;
DELETE FROM auth.flow_state;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at") VALUES
	('33e0d943-f3a7-4464-a7a9-889ed0048e06', 'a05f7844-f4a7-4c54-9e43-1d28b89219a0', '42952740-e433-478a-82eb-cb3a63425a66', 's256', 'r2amsXYqqx8P9-0afUZcxjymz1xQcKvb6addemk270w', 'email', '', '', '2026-01-17 13:41:05.455928+00', '2026-01-17 13:41:05.455928+00', 'email/signup', NULL),
	('61248f6c-826d-445c-b14b-bf443a875b76', 'a05f7844-f4a7-4c54-9e43-1d28b89219a0', '8f94053c-7e50-40cd-9470-e664b16f09e4', 's256', 'btvDub6hwSfTT9j6n6JmMXVWjMjY-FX-8fdO3XCKqnY', 'email', '', '', '2026-01-17 13:51:17.998184+00', '2026-01-17 13:51:17.998184+00', 'email/signup', NULL),
	('34d9523b-f756-4a23-8329-58c527acc168', 'a05f7844-f4a7-4c54-9e43-1d28b89219a0', 'd21e4dab-2b33-4635-b941-f0dbce430b70', 's256', '7IqZ86_aPFpTPgBToicJ1JYgT-BVCo_qNBJx4137l5s', 'email', '', '', '2026-01-17 14:02:43.284218+00', '2026-01-17 14:03:02.690998+00', 'email/signup', '2026-01-17 14:03:02.690959+00'),
	('cb855533-7fb6-4f99-ae8e-2ac4f9aa0ad5', 'bc685ff6-05a6-4b28-a219-bde962a101e0', '59798d83-a391-437f-ac08-909db3760e3f', 's256', '5dMdsFScASUJpoEq5_GE5hu_sZrlKMtglEIOpi_Zn24', 'email', '', '', '2026-01-17 15:11:31.223215+00', '2026-01-17 15:12:20.13992+00', 'email/signup', '2026-01-17 15:12:20.139865+00'),
	('f8995fc7-2716-492d-8364-95e8fb68a2b4', '4048971d-cbf2-46d4-be0a-6f5e84751496', '4e53f900-8638-4dca-a80e-0ad8f9a379df', 's256', 'lMKzQd1eRCwFT6f1pYoOur7y7MY1ACM8WrktHPzrv5E', 'email', '', '', '2026-01-17 21:01:45.646351+00', '2026-01-17 21:01:45.646351+00', 'email/signup', NULL);


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'ad531e5c-0924-429f-8934-748ba5b1485b', 'authenticated', 'authenticated', 'rashmi.adhikari81@gmail.com', '$2a$10$j94I1fssAuYrhSvj7VzMme6K23OifCnCdE4pOFWjv/r37Fpw/OUx.', '2026-01-17 22:48:56.182072+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-01-17 23:21:34.890266+00', '{"provider": "email", "providers": ["email"]}', '{"full_name": "Rashmi", "email_verified": true}', NULL, '2026-01-17 22:48:56.160941+00', '2026-01-17 23:21:34.896293+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4048971d-cbf2-46d4-be0a-6f5e84751496', 'authenticated', 'authenticated', 'chris.thomas@semdatex.com', '$2a$10$5/SLvfCNbmE/v79eNforjOlDOny4iHBw5H4v89MhPfljA2Vtj9Hxy', '2026-01-17 21:19:54.91666+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-01-17 22:22:06.523228+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "4048971d-cbf2-46d4-be0a-6f5e84751496", "email": "chris.thomas@semdatex.com", "full_name": "Señor Semdatex", "invite_code": "7ef5a58bb6f735d28a50506d84e71878", "email_verified": true, "phone_verified": false}', NULL, '2026-01-17 21:01:45.600737+00', '2026-01-17 22:22:06.527029+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', 'authenticated', 'authenticated', 'chris.alex.thomas@gmail.com', '$2a$10$cy2J87Zkp6xkbxvhLlx/bOgbiDWRkvq/Buv9Tn2gHlpVZH3Wo1jga', '2026-01-17 15:48:33.31511+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-01-18 18:43:13.189275+00', '{"provider": "email", "providers": ["email"]}', '{"full_name": "Chris Thomas", "team_name": "Antimatter Studios", "confirm_code": "b0d40de275bd4d568b4527b3505002f7e339d38b12df4c48b16dc244e7826e03", "email_verified": true}', NULL, '2026-01-17 15:48:33.306256+00', '2026-01-18 18:43:13.192044+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', '{"sub": "acfa4e28-dd0d-4cee-91bb-d5bc9e343db1", "email": "chris.alex.thomas@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-01-17 15:48:33.313505+00', '2026-01-17 15:48:33.313569+00', '2026-01-17 15:48:33.313569+00', '2ceaaaee-cd23-4963-b720-0f2d83f49d6c'),
	('4048971d-cbf2-46d4-be0a-6f5e84751496', '4048971d-cbf2-46d4-be0a-6f5e84751496', '{"sub": "4048971d-cbf2-46d4-be0a-6f5e84751496", "email": "chris.thomas@semdatex.com", "full_name": "Señor Semdatex", "invite_code": "7ef5a58bb6f735d28a50506d84e71878", "email_verified": false, "phone_verified": false}', 'email', '2026-01-17 21:01:45.638075+00', '2026-01-17 21:01:45.638141+00', '2026-01-17 21:01:45.638141+00', '673ab808-6880-4708-bdde-dc3a78ee9f4e'),
	('ad531e5c-0924-429f-8934-748ba5b1485b', 'ad531e5c-0924-429f-8934-748ba5b1485b', '{"sub": "ad531e5c-0924-429f-8934-748ba5b1485b", "email": "rashmi.adhikari81@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-01-17 22:48:56.180035+00', '2026-01-17 22:48:56.1801+00', '2026-01-17 22:48:56.1801+00', 'ea60531b-cfff-4d81-ad65-08b59e833bbb');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('85e462f4-9a9a-4e28-b823-c17c4090e745', 'ad531e5c-0924-429f-8934-748ba5b1485b', '2026-01-17 22:50:15.493854+00', '2026-01-17 22:50:15.493854+00', NULL, 'aal1', NULL, NULL, 'node', '44.213.67.190', NULL, NULL, NULL, NULL, NULL),
	('68976141-5e7a-4c34-bfec-7bf53a03937e', 'ad531e5c-0924-429f-8934-748ba5b1485b', '2026-01-17 23:21:34.890385+00', '2026-01-17 23:21:34.890385+00', NULL, 'aal1', NULL, NULL, 'node', '98.84.173.228', NULL, NULL, NULL, NULL, NULL),
	('1acf8c38-4841-4c52-b9de-b7d6013d0a84', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', '2026-01-18 17:06:35.547852+00', '2026-01-18 18:20:49.494383+00', NULL, 'aal1', NULL, '2026-01-18 18:20:49.493022', 'node', '45.86.202.177', NULL, NULL, NULL, NULL, NULL),
	('4b2b4e9a-c04f-473b-81be-4b43b61bb4b0', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', '2026-01-18 18:27:55.129434+00', '2026-01-18 18:27:55.129434+00', NULL, 'aal1', NULL, NULL, 'node', '45.86.202.165', NULL, NULL, NULL, NULL, NULL),
	('846a2e10-54ca-4da8-9064-d5559d8c0f26', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', '2026-01-18 18:29:54.829556+00', '2026-01-18 18:29:54.829556+00', NULL, 'aal1', NULL, NULL, 'node', '45.86.202.183', NULL, NULL, NULL, NULL, NULL),
	('d5f4cb36-1da5-45a8-aa8d-9e0b44006250', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', '2026-01-18 18:31:32.879458+00', '2026-01-18 18:31:32.879458+00', NULL, 'aal1', NULL, NULL, 'node', '45.86.202.187', NULL, NULL, NULL, NULL, NULL),
	('e5ebd964-ed2a-4ffe-8164-0b537dcf32a4', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', '2026-01-18 18:38:06.189986+00', '2026-01-18 18:38:06.189986+00', NULL, 'aal1', NULL, NULL, 'node', '45.86.202.195', NULL, NULL, NULL, NULL, NULL),
	('3c4454e0-06b7-4953-bc7b-2401ee0b69cb', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', '2026-01-18 18:38:35.264986+00', '2026-01-18 18:38:35.264986+00', NULL, 'aal1', NULL, NULL, 'node', '45.86.202.158', NULL, NULL, NULL, NULL, NULL),
	('fec74a21-0696-4015-9577-76ad3f3d95af', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', '2026-01-18 18:39:51.169891+00', '2026-01-18 18:39:51.169891+00', NULL, 'aal1', NULL, NULL, 'node', '45.86.202.158', NULL, NULL, NULL, NULL, NULL),
	('ee4e6bd6-d269-4280-913c-1c61bf40d3f4', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', '2026-01-18 18:41:27.613409+00', '2026-01-18 18:41:27.613409+00', NULL, 'aal1', NULL, NULL, 'node', '45.86.202.224', NULL, NULL, NULL, NULL, NULL),
	('42f37ff6-b09c-45cc-9719-bdfc87c8e340', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', '2026-01-18 18:42:19.629939+00', '2026-01-18 18:42:19.629939+00', NULL, 'aal1', NULL, NULL, 'node', '45.86.202.156', NULL, NULL, NULL, NULL, NULL),
	('c326f4c4-a8a4-4704-ae64-b6981ffb13be', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', '2026-01-18 18:43:13.189377+00', '2026-01-18 18:43:13.189377+00', NULL, 'aal1', NULL, NULL, 'node', '45.86.202.156', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('85e462f4-9a9a-4e28-b823-c17c4090e745', '2026-01-17 22:50:15.497709+00', '2026-01-17 22:50:15.497709+00', 'password', 'bfb1f506-2c96-40a7-8836-5a3f00acd658'),
	('68976141-5e7a-4c34-bfec-7bf53a03937e', '2026-01-17 23:21:34.896923+00', '2026-01-17 23:21:34.896923+00', 'password', '1b71ec9a-7405-4dc3-a390-537b354d9f70'),
	('1acf8c38-4841-4c52-b9de-b7d6013d0a84', '2026-01-18 17:06:35.55191+00', '2026-01-18 17:06:35.55191+00', 'password', '2c786a9a-5ac9-469f-93d8-83ddb51724b0'),
	('4b2b4e9a-c04f-473b-81be-4b43b61bb4b0', '2026-01-18 18:27:55.148499+00', '2026-01-18 18:27:55.148499+00', 'password', 'dc8fef90-3a08-4bc9-aa3b-dbbe0e18f044'),
	('846a2e10-54ca-4da8-9064-d5559d8c0f26', '2026-01-18 18:29:54.840414+00', '2026-01-18 18:29:54.840414+00', 'password', '47e60470-cea8-4075-a061-f7b5dce82864'),
	('d5f4cb36-1da5-45a8-aa8d-9e0b44006250', '2026-01-18 18:31:32.927882+00', '2026-01-18 18:31:32.927882+00', 'password', '4de9675b-447f-4483-af56-6cb6b815bae0'),
	('e5ebd964-ed2a-4ffe-8164-0b537dcf32a4', '2026-01-18 18:38:06.20939+00', '2026-01-18 18:38:06.20939+00', 'password', '76687b35-7dc8-4947-a161-534bed61213a'),
	('3c4454e0-06b7-4953-bc7b-2401ee0b69cb', '2026-01-18 18:38:35.267537+00', '2026-01-18 18:38:35.267537+00', 'password', 'd5cb488c-a0e6-4be4-b971-f07de66aa05b'),
	('fec74a21-0696-4015-9577-76ad3f3d95af', '2026-01-18 18:39:51.172376+00', '2026-01-18 18:39:51.172376+00', 'password', '7a279c99-66fd-465f-9e0c-f2e053d3b2b2'),
	('ee4e6bd6-d269-4280-913c-1c61bf40d3f4', '2026-01-18 18:41:27.649658+00', '2026-01-18 18:41:27.649658+00', 'password', 'd5b2f431-31df-4816-8625-475489fa798b'),
	('42f37ff6-b09c-45cc-9719-bdfc87c8e340', '2026-01-18 18:42:19.632581+00', '2026-01-18 18:42:19.632581+00', 'password', '2d1cfe9a-4749-49b8-a35e-e52cc4076a25'),
	('c326f4c4-a8a4-4704-ae64-b6981ffb13be', '2026-01-18 18:43:13.192351+00', '2026-01-18 18:43:13.192351+00', 'password', 'e72180b9-b1d0-430e-bb59-68a814e5c68b');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 101, '4vylfqy5wteg', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', true, '2026-01-18 17:06:35.549789+00', '2026-01-18 18:20:49.454469+00', NULL, '1acf8c38-4841-4c52-b9de-b7d6013d0a84'),
	('00000000-0000-0000-0000-000000000000', 102, 'bbbdte74kcfn', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', false, '2026-01-18 18:20:49.471859+00', '2026-01-18 18:20:49.471859+00', '4vylfqy5wteg', '1acf8c38-4841-4c52-b9de-b7d6013d0a84'),
	('00000000-0000-0000-0000-000000000000', 103, 'ygfaymadpszs', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', false, '2026-01-18 18:27:55.142108+00', '2026-01-18 18:27:55.142108+00', NULL, '4b2b4e9a-c04f-473b-81be-4b43b61bb4b0'),
	('00000000-0000-0000-0000-000000000000', 104, 'owtlmfyrwj34', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', false, '2026-01-18 18:29:54.834058+00', '2026-01-18 18:29:54.834058+00', NULL, '846a2e10-54ca-4da8-9064-d5559d8c0f26'),
	('00000000-0000-0000-0000-000000000000', 105, 'afyhuo3jj5kk', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', false, '2026-01-18 18:31:32.906226+00', '2026-01-18 18:31:32.906226+00', NULL, 'd5f4cb36-1da5-45a8-aa8d-9e0b44006250'),
	('00000000-0000-0000-0000-000000000000', 106, 'm7fgrzikjpju', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', false, '2026-01-18 18:38:06.204599+00', '2026-01-18 18:38:06.204599+00', NULL, 'e5ebd964-ed2a-4ffe-8164-0b537dcf32a4'),
	('00000000-0000-0000-0000-000000000000', 107, '4xfechvsuosm', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', false, '2026-01-18 18:38:35.266198+00', '2026-01-18 18:38:35.266198+00', NULL, '3c4454e0-06b7-4953-bc7b-2401ee0b69cb'),
	('00000000-0000-0000-0000-000000000000', 108, 'yvxrg6adhlet', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', false, '2026-01-18 18:39:51.170983+00', '2026-01-18 18:39:51.170983+00', NULL, 'fec74a21-0696-4015-9577-76ad3f3d95af'),
	('00000000-0000-0000-0000-000000000000', 109, 'xi7oaponixn5', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', false, '2026-01-18 18:41:27.634491+00', '2026-01-18 18:41:27.634491+00', NULL, 'ee4e6bd6-d269-4280-913c-1c61bf40d3f4'),
	('00000000-0000-0000-0000-000000000000', 110, 'rrkjm7xhxxss', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', false, '2026-01-18 18:42:19.631273+00', '2026-01-18 18:42:19.631273+00', NULL, '42f37ff6-b09c-45cc-9719-bdfc87c8e340'),
	('00000000-0000-0000-0000-000000000000', 111, 'ly773xjfvjoj', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', false, '2026-01-18 18:43:13.191094+00', '2026-01-18 18:43:13.191094+00', NULL, 'c326f4c4-a8a4-4704-ae64-b6981ffb13be'),
	('00000000-0000-0000-0000-000000000000', 81, 'uv5z3lb7i6kj', 'ad531e5c-0924-429f-8934-748ba5b1485b', false, '2026-01-17 22:50:15.495548+00', '2026-01-17 22:50:15.495548+00', NULL, '85e462f4-9a9a-4e28-b823-c17c4090e745'),
	('00000000-0000-0000-0000-000000000000', 83, 'ifbwyxubijgx', 'ad531e5c-0924-429f-8934-748ba5b1485b', false, '2026-01-17 23:21:34.893435+00', '2026-01-17 23:21:34.893435+00', NULL, '68976141-5e7a-4c34-bfec-7bf53a03937e');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: capabilities; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."capabilities" ("id", "name", "description", "created_at", "updated_at") VALUES
	('6836c879-9daa-4608-80b7-7a73e018a9ca', 'super_admin', 'Global platform administration bypass', '2026-01-18 15:39:17.365192+00', '2026-01-18 15:39:17.365192+00'),
	('f1360a90-de21-4106-a1fc-9420a0c298e1', 'team_member', 'Baseline team permissions for a specific team', '2026-01-18 15:39:17.365192+00', '2026-01-18 15:39:17.365192+00'),
	('9d8159b1-0d02-4ca8-a7e0-6f63eff897d7', 'team_admin', 'Administrative permissions for a specific team', '2026-01-18 15:39:17.365192+00', '2026-01-18 15:39:17.365192+00');


--
-- Data for Name: team; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."team" ("id", "name", "slug", "created_at", "updated_at") VALUES
	('e6cbfcb5-b764-4fb6-9db4-38e41bae0183', 'Antimatter Studios', 'antimatter-studios-d94j23', '2026-01-18 16:07:12.621725+00', '2026-01-18 16:07:12.621725+00'),
	('e40df0ea-f13f-49d7-9892-f67804f24e86', 'Semdatex', 'semdatex-k3jf84', '2026-01-18 16:07:41.887175+00', '2026-01-18 16:07:41.887175+00');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "auth_id", "email", "full_name", "display_name", "avatar_url", "confirm_code", "email_confirmed_at", "created_at", "updated_at") VALUES
	('4a68827b-644a-4b48-a5e8-8e5b87024ff4', 'ad531e5c-0924-429f-8934-748ba5b1485b', 'rashmi.adhikari81@gmail.com', 'Rashmi', NULL, NULL, NULL, '2026-01-17 22:48:56.182072+00', '2026-01-18 15:53:44.9878+00', '2026-01-18 15:53:44.9878+00'),
	('56801716-3871-41db-a3bc-79866783aae1', '4048971d-cbf2-46d4-be0a-6f5e84751496', 'chris.thomas@semdatex.com', 'Señor Semdatex', NULL, NULL, NULL, '2026-01-17 21:19:54.91666+00', '2026-01-18 15:53:44.9878+00', '2026-01-18 15:53:44.9878+00'),
	('1ae81af0-0714-4434-8296-085b2c35613e', 'acfa4e28-dd0d-4cee-91bb-d5bc9e343db1', 'chris.alex.thomas@gmail.com', 'Chris Thomas', NULL, NULL, NULL, '2026-01-17 15:48:33.31511+00', '2026-01-18 15:53:44.9878+00', '2026-01-18 15:53:44.9878+00');


--
-- Data for Name: party; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."party" ("id", "team_id", "created_by", "name", "slug", "is_active", "created_at", "updated_at", "is_public") VALUES
	('c19fc9eb-f773-42e5-98b8-ab1325085c17', 'e6cbfcb5-b764-4fb6-9db4-38e41bae0183', '1ae81af0-0714-4434-8296-085b2c35613e', 'Summer Party 2025', 'summer-party-2025-f5bfc6', true, '2026-01-18 17:38:04.526552+00', '2026-01-18 17:38:04.526552+00', false);


--
-- Data for Name: party_attendees; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."party_attendees" ("id", "party_id", "user_id", "display_name", "drunk_votes", "sober_votes", "is_guest", "created_at") VALUES
	('6ef5a75e-1812-43ad-bb4e-91811395b557', 'c19fc9eb-f773-42e5-98b8-ab1325085c17', '1ae81af0-0714-4434-8296-085b2c35613e', NULL, 0, 0, false, '2026-01-18 17:57:48.33483+00');


--
-- Data for Name: party_join_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: team_memberships; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."team_memberships" ("id", "team_id", "user_id", "status", "email", "invite_code", "invited_by", "invited_at", "accepted_at", "joined_at", "left_at", "metadata", "created_at", "updated_at") VALUES
	('f9e3f375-bb8e-45d1-b13b-00f27ef83073', 'e40df0ea-f13f-49d7-9892-f67804f24e86', '1ae81af0-0714-4434-8296-085b2c35613e', 'active', NULL, NULL, NULL, NULL, '2026-01-18 16:20:31.850069+00', '2026-01-18 16:20:31.850069+00', NULL, NULL, '2026-01-18 16:20:31.850069+00', '2026-01-18 16:20:31.850069+00'),
	('d6f4740e-2333-4281-8b5e-aec50014999c', 'e40df0ea-f13f-49d7-9892-f67804f24e86', '56801716-3871-41db-a3bc-79866783aae1', 'active', NULL, NULL, NULL, NULL, '2026-01-18 16:22:03.503056+00', '2026-01-18 16:22:03.503056+00', NULL, NULL, '2026-01-18 16:22:03.503056+00', '2026-01-18 16:22:03.503056+00'),
	('6de75dd3-9fce-4a49-948d-95dda76cee0d', 'e6cbfcb5-b764-4fb6-9db4-38e41bae0183', '1ae81af0-0714-4434-8296-085b2c35613e', 'active', NULL, NULL, NULL, NULL, '2026-01-18 17:21:13.333083+00', '2026-01-18 17:21:13.333083+00', NULL, NULL, '2026-01-18 17:21:13.333083+00', '2026-01-18 17:21:13.333083+00'),
	('0433d062-b294-409d-9e9b-991ea4df3983', 'e6cbfcb5-b764-4fb6-9db4-38e41bae0183', '4a68827b-644a-4b48-a5e8-8e5b87024ff4', 'active', NULL, NULL, NULL, NULL, '2026-01-18 16:23:01.935532+00', '2026-01-18 16:23:01.935532+00', NULL, NULL, '2026-01-18 16:23:01.935532+00', '2026-01-18 16:23:01.935532+00');


--
-- Data for Name: user_capabilities; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_capabilities" ("id", "user_id", "capability_id", "scope_type", "scope_id", "expires_at", "granted_by", "created_at", "updated_at") VALUES
	('5c448777-09d7-46e6-9607-1178c3dda684', '1ae81af0-0714-4434-8296-085b2c35613e', '9d8159b1-0d02-4ca8-a7e0-6f63eff897d7', 'team', 'e40df0ea-f13f-49d7-9892-f67804f24e86', NULL, NULL, '2026-01-18 16:20:31.850069+00', '2026-01-18 16:20:31.850069+00'),
	('bebd7ed3-6cd0-4ece-b02d-de8dec0b525c', '4a68827b-644a-4b48-a5e8-8e5b87024ff4', 'f1360a90-de21-4106-a1fc-9420a0c298e1', 'team', 'e6cbfcb5-b764-4fb6-9db4-38e41bae0183', NULL, NULL, '2026-01-18 16:23:01.935532+00', '2026-01-18 16:23:01.935532+00'),
	('9ff43770-11d1-4652-a762-26fba79bf4d0', '56801716-3871-41db-a3bc-79866783aae1', 'f1360a90-de21-4106-a1fc-9420a0c298e1', 'team', 'e40df0ea-f13f-49d7-9892-f67804f24e86', NULL, NULL, '2026-01-18 16:26:02.478199+00', '2026-01-18 16:26:02.478199+00'),
	('97330ac4-2325-46d1-b196-8ecb2a7c8f53', '1ae81af0-0714-4434-8296-085b2c35613e', '9d8159b1-0d02-4ca8-a7e0-6f63eff897d7', 'team', 'e6cbfcb5-b764-4fb6-9db4-38e41bae0183', NULL, NULL, '2026-01-18 17:21:13.333083+00', '2026-01-18 17:21:13.333083+00');


--
-- Data for Name: votes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 111, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict 5945e2XW5FIgyKvl6iVQ1m4ZDH0zv7ay3zZXteiD7BlvfudTeWjLew88FEIiw6Z

RESET ALL;
