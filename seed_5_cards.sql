-- Inserir 5 novas Cartas (Casos Clínicos) no banco de dados
INSERT INTO public.questions (blue_text, yellow_question, yellow_options, yellow_correct_index, red_text, red_options, red_correct_index)
VALUES 
(
  'Jovem de 22 anos trazido pelo SAMU após acidente de moto, confuso, abertura ocular à dor e sons incompreensíveis. Escala de Glasgow 7.',
  'Qual a conduta inicial mais adequada na sala de trauma?',
  '["A) Realizar tomografia de crânio imediata", "B) Intubação orotraqueal (IOT) e proteção da via aérea", "C) Administrar analgésicos fortes", "D) Aguardar familiares para colher anamnese"]'::jsonb,
  1,
  'O paciente apresenta assimetria pupilar (pupila direita dilatada).',
  '["A) Observar evolução por mais 2 horas", "B) Administrar Manitol e hiperventilação leve", "C) Aplicar colírio miótico", "D) Diminuir hidratação endovenosa"]'::jsonb,
  1
),
(
  'Paciente de 65 anos, diabético crônico, chega com fraqueza muscular severa, formigamento e ECG mostrando ondas T apiculadas.',
  'Qual é o diagnóstico mais provável e a primeira medicação para estabilização da membrana?',
  '["A) Hipocalemia - Repor Potássio IV", "B) Hipercalemia - Gluconato de Cálcio IV", "C) Infarto Agudo - Trombolítico", "D) Hiperglicemia - Insulina Subcutânea"]'::jsonb,
  1,
  'Apesar da medicação inicial, o paciente evolui com alargamento perigoso do complexo QRS.',
  '["A) Iniciar Solução Polarizante (Insulina regular + Glicose)", "B) Administrar Amiodarona", "C) Reverter com choque elétrico sincronizado", "D) Apenas aumentar hidratação"]'::jsonb,
  0
),
(
  'Criança de 4 anos dá entrada com febre alta (39,5°C), rigidez de nuca, vômitos em jato e manchas petequiais pelo corpo.',
  'Qual o diagnóstico suspeito e a conduta empírica imediata?',
  '["A) Dengue - Hidratação oral intensa", "B) Meningite Meningocócica - Antibioticoterapia imediata (Ceftriaxona)", "C) Varicela - Aciclovir e isolamento", "D) Resfriado comum - Antitérmico"]'::jsonb,
  1,
  'Durante a avaliação, a criança rebaixa o nível de consciência e apresenta crise convulsiva tônico-clônica.',
  '["A) Realizar punção lombar imediatamente durante a crise", "B) Administrar Diazepam IV, lateralizar e garantir via aérea", "C) Chamar neurologista antes de qualquer ação", "D) Administrar dipirona para febre"]'::jsonb,
  1
),
(
  'Mulher de 28 anos, gestante de 34 semanas, chega ao pronto-socorro com PA 160/110 mmHg, cefaleia intensa e escotomas cintilantes.',
  'Qual a conduta medicamentosa prioritária para prevenção de convulsões (Eclâmpsia)?',
  '["A) Sulfato de Magnésio (Ataque e Manutenção)", "B) Fenitoína IV", "C) Diazepam comprimido", "D) Nifedipina sublingual"]'::jsonb,
  0,
  'De forma abrupta, a paciente evolui com crise convulsiva tônico-clônica na sua frente.',
  '["A) Realizar cesárea de emergência na própria maca", "B) Proteger via aérea, lateralizar, O2 e manter Sulfato de Magnésio", "C) Administrar sedação profunda imediata com Propofol", "D) Trocar rapidamente para Fenobarbital"]'::jsonb,
  1
),
(
  'Homem de 50 anos, etilista crônico, dá entrada vomitando sangue vivo em grande quantidade (hematêmese volumosa).',
  'Qual a principal suspeita diagnóstica e conduta clínica inicial?',
  '["A) Úlcera duodenal - Administrar Omeprazol oral", "B) Sangramento Varicoso - Expansão volêmica cautelosa, IBP e Terlipressina", "C) Gastrite Leve - Orientar dieta líquida", "D) Síndrome de Mallory-Weiss - Alta com antiemético"]'::jsonb,
  1,
  'O paciente fica agudamente hipotenso (PA 70/40 mmHg), taquicárdico e pálido.',
  '["A) Encaminhar para endoscopia na manhã seguinte", "B) Transfusão (Hemácias/Plasma) e passar Balão de Sengstaken-Blakemore (se não houver EDA imediata)", "C) Aumentar dose do protetor gástrico", "D) Realizar cirurgia bariátrica de urgência"]'::jsonb,
  1
);
