-- Script para añadir 40 ejercicios base adicionales a la aplicación IronMetric
-- Ejecutar en el Editor SQL (SQL Editor) del Dashboard de Supabase conectado al proyecto

-- PECHO (Chest)
insert into base_exercises (name, muscle_group) values
('{"en": "Incline Barbell Bench Press", "es": "Press de Banca Inclinado con Barra"}', '{"en": "Chest", "es": "Pecho"}'),
('{"en": "Incline Dumbbell Bench Press", "es": "Press de Banca Inclinado con Mancuernas"}', '{"en": "Chest", "es": "Pecho"}'),
('{"en": "Flat Dumbbell Bench Press", "es": "Press de Banca Plano con Mancuernas"}', '{"en": "Chest", "es": "Pecho"}'),
('{"en": "Dumbbell Flyes", "es": "Aperturas con Mancuernas"}', '{"en": "Chest", "es": "Pecho"}'),
('{"en": "Cable Crossovers", "es": "Cruces de Poleas"}', '{"en": "Chest", "es": "Pecho"}'),
('{"en": "Push Ups", "es": "Flexiones"}', '{"en": "Chest", "es": "Pecho"}'),
('{"en": "Chest Dips", "es": "Fondos en Paralelas"}', '{"en": "Chest", "es": "Pecho"}'),
('{"en": "Pec Deck Machine", "es": "Máquina Contractora (Pec Deck)"}', '{"en": "Chest", "es": "Pecho"}');

-- PIERNAS (Legs)
insert into base_exercises (name, muscle_group) values
('{"en": "Leg Press", "es": "Prensa de Piernas"}', '{"en": "Legs", "es": "Piernas"}'),
('{"en": "Leg Extensions", "es": "Extensiones de Cuádriceps"}', '{"en": "Legs", "es": "Piernas"}'),
('{"en": "Lying Leg Curls", "es": "Curl de Femoral Tumbado"}', '{"en": "Legs", "es": "Piernas"}'),
('{"en": "Seated Leg Curls", "es": "Curl de Femoral Sentado"}', '{"en": "Legs", "es": "Piernas"}'),
('{"en": "Romanian Deadlift (RDL)", "es": "Peso Muerto Rumano"}', '{"en": "Legs", "es": "Piernas"}'),
('{"en": "Bulgarian Split Squat", "es": "Zancadas Búlgaras"}', '{"en": "Legs", "es": "Piernas"}'),
('{"en": "Hip Thrust", "es": "Elevación de Cadera (Hip Thrust)"}', '{"en": "Legs", "es": "Piernas"}'),
('{"en": "Standing Calf Raises", "es": "Elevación de Gemelos de Pie"}', '{"en": "Legs", "es": "Piernas"}'),
('{"en": "Seated Calf Raises", "es": "Elevación de Gemelos Sentado"}', '{"en": "Legs", "es": "Piernas"}'),
('{"en": "Hack Squat Machine", "es": "Sentadilla Hack (Máquina)"}', '{"en": "Legs", "es": "Piernas"}'),
('{"en": "Goblet Squat", "es": "Sentadilla Goblet"}', '{"en": "Legs", "es": "Piernas"}');

-- ESPALDA (Back)
insert into base_exercises (name, muscle_group) values
('{"en": "Lat Pulldown", "es": "Jalón al Pecho"}', '{"en": "Back", "es": "Espalda"}'),
('{"en": "One-Arm Dumbbell Row", "es": "Remo con Mancuerna a Una Mano"}', '{"en": "Back", "es": "Espalda"}'),
('{"en": "Seated Cable Row", "es": "Remo en Polea Baja (Gironda)"}', '{"en": "Back", "es": "Espalda"}'),
('{"en": "T-Bar Row", "es": "Remo en Punta (T-Bar)"}', '{"en": "Back", "es": "Espalda"}'),
('{"en": "Straight-Arm Pulldown", "es": "Pullover con Polea Alta (Brazos Rectos)"}', '{"en": "Back", "es": "Espalda"}'),
('{"en": "Back Extensions", "es": "Extensiones Lumbares (Silla Romana)"}', '{"en": "Back", "es": "Espalda"}'),
('{"en": "Assisted Pull-ups", "es": "Dominadas Asistidas (Máquina)"}', '{"en": "Back", "es": "Espalda"}');

-- HOMBROS (Shoulders)
insert into base_exercises (name, muscle_group) values
('{"en": "Seated Dumbbell Press", "es": "Press Militar con Mancuernas Sentado"}', '{"en": "Shoulders", "es": "Hombros"}'),
('{"en": "Dumbbell Lateral Raises", "es": "Elevaciones Laterales con Mancuernas"}', '{"en": "Shoulders", "es": "Hombros"}'),
('{"en": "Cable Lateral Raises", "es": "Elevaciones Laterales en Polea"}', '{"en": "Shoulders", "es": "Hombros"}'),
('{"en": "Front Raises", "es": "Elevaciones Frontales"}', '{"en": "Shoulders", "es": "Hombros"}'),
('{"en": "Reverse Pec Deck Flyes", "es": "Pájaros con Mancuernas (Elevaciones Posteriores)"}', '{"en": "Shoulders", "es": "Hombros"}'),
('{"en": "Face Pull", "es": "Face Pull"}', '{"en": "Shoulders", "es": "Hombros"}');

-- BRAZOS - TRÍCEPS (Triceps)
insert into base_exercises (name, muscle_group) values
('{"en": "Triceps Rope Pushdown", "es": "Extensión de Tríceps en Polea Alta (Cuerda)"}', '{"en": "Triceps", "es": "Tríceps"}'),
('{"en": "Triceps Bar Pushdown", "es": "Extensión de Tríceps en Polea Alta (Barra)"}', '{"en": "Triceps", "es": "Tríceps"}'),
('{"en": "Dumbbell Triceps Kickback", "es": "Patada de Tríceps con Mancuerna"}', '{"en": "Triceps", "es": "Tríceps"}'),
('{"en": "Bench Dips", "es": "Fondos de Tríceps en Banco"}', '{"en": "Triceps", "es": "Tríceps"}');

-- BRAZOS - BÍCEPS (Biceps)
insert into base_exercises (name, muscle_group) values
('{"en": "Dumbbell Hammer Curls", "es": "Curl Martillo con Mancuernas"}', '{"en": "Biceps", "es": "Bíceps"}'),
('{"en": "Preacher Curls", "es": "Curl de Bíceps en Banco Scott (Predicador)"}', '{"en": "Biceps", "es": "Bíceps"}'),
('{"en": "Cable Bicep Curls", "es": "Curl de Bíceps en Polea Baja"}', '{"en": "Biceps", "es": "Bíceps"}');

-- CORE / OTROS 
insert into base_exercises (name, muscle_group) values
('{"en": "Ab Wheel Rollout", "es": "Rueda Abdominal"}', '{"en": "Core", "es": "Core"}');

-- Actualizar loggin_type para ejercicios de peso corporal según su naturaleza
update base_exercises set logging_type = 'bodyweight' where name->>'en' in ('Push Ups', 'Chest Dips', 'Bench Dips', 'Assisted Pull-ups', 'Back Extensions');
