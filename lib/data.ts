import type { User, Programa, Curso, Tarea, Entrega, Asistencia, ClaseVirtual, Calificacion, Aviso } from './types'

// Usuarios de ejemplo
export const usuarios: User[] = [
  {
    id: 'admin-1',
    nombre: 'Director Académico',
    email: 'admin@iud.edu.mx',
    rol: 'admin',
    telefono: '618-123-4567',
    estado: 'activo',
    fechaIngreso: '2020-01-15'
  },
  {
    id: 'maestro-1',
    nombre: 'Dra. Mariana López',
    email: 'mariana.lopez@iud.edu.mx',
    rol: 'maestro',
    telefono: '618-234-5678',
    estado: 'activo',
    fechaIngreso: '2021-08-01'
  },
  {
    id: 'maestro-2',
    nombre: 'Mtro. Ricardo Salas',
    email: 'ricardo.salas@iud.edu.mx',
    rol: 'maestro',
    telefono: '618-345-6789',
    estado: 'activo',
    fechaIngreso: '2022-01-15'
  },
  {
    id: 'maestro-3',
    nombre: 'Lic. Fernanda Castillo',
    email: 'fernanda.castillo@iud.edu.mx',
    rol: 'maestro',
    telefono: '618-456-7890',
    estado: 'activo',
    fechaIngreso: '2022-08-01'
  },
  {
    id: 'alumno-1',
    nombre: 'Ana Martínez',
    email: 'ana.martinez@iud.edu.mx',
    rol: 'alumno',
    matricula: 'IUD-2024-001',
    programaId: 'lic-derecho',
    telefono: '618-111-2222',
    estado: 'activo',
    fechaIngreso: '2024-01-15'
  },
  {
    id: 'alumno-2',
    nombre: 'Luis Herrera',
    email: 'luis.herrera@iud.edu.mx',
    rol: 'alumno',
    matricula: 'IUD-2024-002',
    programaId: 'lic-psicologia',
    telefono: '618-222-3333',
    estado: 'activo',
    fechaIngreso: '2024-01-15'
  },
  {
    id: 'alumno-3',
    nombre: 'Sofía Ramírez',
    email: 'sofia.ramirez@iud.edu.mx',
    rol: 'alumno',
    matricula: 'IUD-2024-003',
    programaId: 'lic-pedagogia',
    telefono: '618-333-4444',
    estado: 'activo',
    fechaIngreso: '2024-02-01'
  },
  {
    id: 'alumno-4',
    nombre: 'Carlos Torres',
    email: 'carlos.torres@iud.edu.mx',
    rol: 'alumno',
    matricula: 'IUD-2023-045',
    programaId: 'prep',
    telefono: '618-444-5555',
    estado: 'activo',
    fechaIngreso: '2023-08-15'
  }
]

// Programas académicos con MARKETING, PLANES DE ESTUDIO E IMÁGENES ÚNICAS Y LLAMATIVAS
export const programas: Programa[] = [
  {
    id: 'prep',
    nombre: 'Preparatoria en 2 años',
    tipo: 'preparatoria',
    descripcion: 'Programa flexible para terminar tus estudios de nivel medio superior en menor tiempo, con clases virtuales y acompañamiento.',
    duracion: '2 años',
    imagen: 'https://incareersjobs.com/wp-content/uploads/2020/09/Consejos-para-tener-%C3%A9xito-en-la-preparatoria-UNAM.jpg',
    porQueEstudiar: 'El tiempo es tu recurso más valioso. Nuestro modelo intensivo de 2 años está diseñado para jóvenes y adultos que buscan avanzar rápidamente sin sacrificar la calidad educativa. Obtendrás un certificado con validez oficial SEP que te abrirá las puertas a cualquier universidad pública o privada del país, o bien, a mejores oportunidades laborales inmediatas.',
    campoLaboral: [
      'Ingreso directo a cualquier institución de Educación Superior (Universidades).',
      'Puestos administrativos de nivel técnico.',
      'Oposiciones para sector público y fuerzas armadas.',
      'Mejores oportunidades de ascenso en tu trabajo actual.'
    ],
    perfilEgreso: [
      'Habilidades sólidas en comprensión lectora, redacción y pensamiento lógico-matemático.',
      'Manejo fluido de herramientas digitales y paquetería de oficina.',
      'Bases firmes de inglés para comunicación elemental.',
      'Competencias de autoestudio y gestión del tiempo.'
    ],
    preguntasFrecuentes: [
      { pregunta: '¿El certificado es válido para entrar a la universidad?', respuesta: 'Sí. Al concluir y cumplir los requisitos académicos obtienes un certificado del nivel medio superior válido para ingresar a universidades públicas y privadas de México.' },
      { pregunta: '¿Hay límite de edad para inscribirme?', respuesta: 'No hay límite de edad. Contamos con estudiantes desde los 15 años hasta adultos que deciden retomar sus estudios. La plataforma es amigable para todos.' }
    ],
    planEstudios: [
      { semestre: '1° Semestre', materias: ['Matemáticas I', 'Química I', 'Ética y Valores I', 'Taller de Lectura y Redacción I', 'Lengua Adicional al Español I', 'Informática I'] },
      { semestre: '2° Semestre', materias: ['Matemáticas II', 'Química II', 'Ética y Valores II', 'Taller de Lectura y Redacción II', 'Lengua Adicional al Español II', 'Informática II'] },
      { semestre: '3° Semestre', materias: ['Matemáticas III', 'Biología I', 'Física I', 'Historia de México I', 'Literatura I', 'Orientación Educativa'] },
      { semestre: '4° Semestre', materias: ['Matemáticas IV', 'Biología II', 'Física II', 'Historia de México II', 'Literatura II', 'Proyecto Emprendedor'] }
    ]
  },
  {
    id: 'lic-derecho',
    nombre: 'Licenciatura en Derecho',
    tipo: 'licenciatura',
    descripcion: 'Formación integral en ciencias jurídicas con enfoque práctico y ético para el ejercicio profesional.',
    duracion: '3 años',
    imagen: 'https://images.unsplash.com/photo-1589391886645-d51941baf7fb?q=80&w=2070&auto=format&fit=crop',
    porQueEstudiar: 'El sistema jurídico requiere profesionales capaces de adaptarse a las nuevas reformas (penales, laborales, digitales). Estudiar Derecho con nosotros significa aprender a argumentar, negociar y litigar mediante el estudio de casos prácticos reales, alejándonos de la memorización tradicional para enfocarnos en la estrategia legal.',
    campoLaboral: [
      'Despachos jurídicos y consultoría corporativa.',
      'Poder Judicial (Juzgados, Tribunales, Suprema Corte).',
      'Notarías y corredurías públicas.',
      'Departamentos legales de empresas transnacionales y PyMES.',
      'Administración pública en sus tres niveles de gobierno.'
    ],
    perfilEgreso: [
      'Dominio de la argumentación jurídica y juicios orales.',
      'Habilidad para la resolución alternativa de controversias (mediación y arbitraje).',
      'Elaboración de contratos, demandas, amparos y recursos legales.',
      'Sólida ética profesional para la defensa de los derechos humanos.'
    ],
    preguntasFrecuentes: [
      { pregunta: '¿El plan de estudios está actualizado con los juicios orales?', respuesta: 'Sí, nuestro mapa curricular está totalmente actualizado con el Sistema Penal Acusatorio, las reformas en materia laboral y el nuevo Código Nacional de Procedimientos Civiles y Familiares.' },
      { pregunta: '¿Puedo litigar con el título que obtengo?', respuesta: 'Totalmente. Al graduarte tramitas tu Cédula Profesional Federal, la cual te faculta para litigar y ejercer en cualquier parte del territorio nacional.' }
    ],
    planEstudios: [
      { semestre: '1° Semestre', materias: ['Introducción al Estudio del Derecho', 'Derecho Romano', 'Sociología Jurídica', 'Metodología de la Investigación', 'Teoría del Estado'] },
      { semestre: '2° Semestre', materias: ['Derecho Civil I (Personas y Familia)', 'Teoría General del Proceso', 'Derecho Constitucional', 'Economía Política', 'Historia del Derecho Mexicano'] },
      { semestre: '3° Semestre', materias: ['Derecho Civil II (Bienes y Derechos Reales)', 'Derecho Penal I', 'Derechos Humanos', 'Derecho Administrativo I', 'Comunicación Jurídica'] },
      { semestre: '4° Semestre', materias: ['Derecho Civil III (Obligaciones)', 'Derecho Penal II', 'Derecho Laboral', 'Derecho Mercantil I', 'Derecho Internacional Público'] },
      { semestre: '5° Semestre', materias: ['Derecho Civil IV (Contratos)', 'Derecho Procesal Civil', 'Derecho Procesal Penal', 'Derecho Agrario', 'Medios Alternos de Solución de Controversias'] },
      { semestre: '6° Semestre', materias: ['Derecho Procesal Laboral', 'Derecho Mercantil II', 'Derecho Fiscal', 'Filosofía del Derecho', 'Práctica Forense Civil'] },
      { semestre: '7° Semestre', materias: ['Juicio de Amparo I', 'Derecho Internacional Privado', 'Medicina Forense', 'Derecho Corporativo', 'Práctica Forense Penal'] },
      { semestre: '8° Semestre', materias: ['Juicio de Amparo II', 'Ética Profesional', 'Seminario de Tesis', 'Práctica Forense de Amparo', 'Derecho Aduanero'] }
    ]
  },
  {
    id: 'lic-psicologia',
    nombre: 'Licenciatura en Psicología',
    tipo: 'licenciatura',
    descripcion: 'Desarrollo de competencias para comprender y mejorar el bienestar psicológico individual y colectivo.',
    duracion: '4 años',
    imagen: 'https://ufhec.edu.do/wp-content/uploads/2021/08/Maestria-en-Gestion-y-Liderazgo-Pedagogico.jpg',
    porQueEstudiar: 'El cuidado de la salud mental vive un momento histórico de demanda global. Como psicólogo, tendrás el poder de transformar vidas, familias y organizaciones. Nuestro programa te da una visión integral que abarca desde la clínica y la neurociencia hasta el comportamiento organizacional, dándote un abanico inmenso de opciones laborales.',
    campoLaboral: [
      'Práctica clínica privada (Consultorio).',
      'Recursos Humanos y Desarrollo Organizacional en empresas.',
      'Instituciones de salud pública, hospitales y clínicas.',
      'Centros educativos y orientación vocacional.',
      'Psicología forense y acompañamiento a víctimas.'
    ],
    perfilEgreso: [
      'Capacidad para aplicar, calificar e interpretar pruebas psicométricas y proyectivas.',
      'Habilidades de entrevista clínica, diagnóstico e intervención psicoterapéutica.',
      'Gestión del talento humano, reclutamiento y clima laboral.',
      'Diseño de estrategias de intervención educativa e inclusión.'
    ],
    preguntasFrecuentes: [
      { pregunta: '¿La carrera es enfocada solo a ser terapeuta?', respuesta: 'No. Aunque la base clínica es muy fuerte, llevarás materias de psicología organizacional, educativa y social, para que tú decidas en qué área especializarte al egresar.' },
      { pregunta: '¿Se realizan prácticas supervisadas?', respuesta: 'Sí, en tus últimos semestres realizarás prácticas documentadas donde aplicarás pruebas y entrevistas bajo la supervisión de docentes experimentados.' }
    ],
    planEstudios: [
      { semestre: '1° Semestre', materias: ['Bases Biológicas de la Conducta', 'Historia de la Psicología', 'Introducción a la Psicología', 'Estadística I', 'Desarrollo de Habilidades del Pensamiento'] },
      { semestre: '2° Semestre', materias: ['Neuroanatomía', 'Psicología de la Infancia', 'Teorías de la Personalidad', 'Estadística II', 'Epistemología'] },
      { semestre: '3° Semestre', materias: ['Psicofisiología', 'Psicología de la Adolescencia', 'Psicología Social', 'Entrevista Psicológica', 'Teoría de la Medida'] },
      { semestre: '4° Semestre', materias: ['Psicología del Aprendizaje', 'Psicología de la Adultez y Senectud', 'Dinámica de Grupos', 'Pruebas Psicológicas I (Inteligencia)', 'Psicopatología I'] },
      { semestre: '5° Semestre', materias: ['Psicología Educativa', 'Psicología Organizacional', 'Pruebas Psicológicas II (Personalidad)', 'Psicopatología II', 'Metodología de la Investigación'] },
      { semestre: '6° Semestre', materias: ['Intervención Educativa', 'Reclutamiento y Selección', 'Psicología Clínica', 'Orientación Vocacional', 'Diseño de Proyectos de Investigación'] },
      { semestre: '7° Semestre', materias: ['Educación Especial', 'Desarrollo Organizacional', 'Modelos Psicoterapéuticos', 'Ética Profesional', 'Prácticas Supervisadas I'] },
      { semestre: '8° Semestre', materias: ['Seminario de Titulación', 'Temas Selectos de Psicología', 'Intervención en Crisis', 'Prácticas Supervisadas II', 'Emprendimiento en Salud'] }
    ]
  },
  {
    id: 'lic-pedagogia',
    nombre: 'Licenciatura en Pedagogía',
    tipo: 'licenciatura',
    descripcion: 'Formación de profesionales en educación con herramientas innovadoras para la enseñanza.',
    duracion: '3 años',
    imagen: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2069&auto=format&fit=crop',
    porQueEstudiar: 'La educación está evolucionando más rápido que nunca con la llegada de las plataformas virtuales y la IA. Un pedagogo moderno no solo da clases; diseña sistemas de aprendizaje. Estudiando con nosotros te convertirás en un experto en metodologías activas, diseño curricular y tecnologías educativas, siendo indispensable en colegios y corporativos.',
    campoLaboral: [
      'Dirección y coordinación académica en escuelas y universidades.',
      'Diseño instruccional para plataformas de e-learning.',
      'Departamentos de capacitación y adiestramiento en empresas.',
      'Orientación educativa y tutoría psicopedagógica.',
      'Consultoría independiente para el diseño de planes de estudio.'
    ],
    perfilEgreso: [
      'Creación de planes y programas de estudio con validez oficial.',
      'Evaluación de instituciones educativas y docencia.',
      'Implementación de estrategias didácticas inclusivas y tecnológicas.',
      'Detección y canalización de problemas de aprendizaje.'
    ],
    preguntasFrecuentes: [
      { pregunta: '¿Pedagogía es lo mismo que ser maestro de preescolar o primaria?', respuesta: 'No, es mucho más amplio. Aunque puedes ser docente, el pedagogo es el experto que "enseña a enseñar". Estarás capacitado para dirigir escuelas, capacitar adultos en empresas o crear cursos virtuales.' },
      { pregunta: '¿Me enseñarán a usar tecnología educativa?', respuesta: 'Totalmente. Nuestro programa incluye materias como Tecnologías de la Información en Educación y Diseño de Entornos Virtuales, habilidades vitales hoy en día.' }
    ],
    planEstudios: [
      { semestre: '1° Semestre', materias: ['Introducción a la Pedagogía', 'Historia de la Educación en México', 'Filosofía de la Educación', 'Psicología General', 'Expresión Oral y Escrita'] },
      { semestre: '2° Semestre', materias: ['Sociología de la Educación', 'Historia General de la Educación', 'Teorías del Desarrollo', 'Didáctica General', 'Estadística Aplicada a la Educación'] },
      { semestre: '3° Semestre', materias: ['Psicología Educativa', 'Epistemología', 'Didáctica Especial', 'Política Educativa', 'Planeación Didáctica'] },
      { semestre: '4° Semestre', materias: ['Legislación Educativa', 'Diseño de Material Didáctico', 'Evaluación del Aprendizaje', 'Tecnologías de la Información en Educación', 'Educación Inclusiva'] },
      { semestre: '5° Semestre', materias: ['Diseño Curricular', 'Orientación Educativa', 'Educación de Adultos', 'Metodología de la Investigación Educativa', 'Ludoterapia'] },
      { semestre: '6° Semestre', materias: ['Evaluación Curricular', 'Capacitación y Desarrollo de Personal', 'Educación a Distancia', 'Seminario de Investigación I', 'Prácticas Pedagógicas I'] },
      { semestre: '7° Semestre', materias: ['Administración Educativa', 'Intervención Psicopedagógica', 'Diseño de Entornos Virtuales', 'Seminario de Investigación II', 'Prácticas Pedagógicas II'] },
      { semestre: '8° Semestre', materias: ['Gestión Institucional', 'Ética del Pedagogo', 'Innovación Educativa', 'Seminario de Tesis', 'Prácticas Pedagógicas III'] }
    ]
  },
  {
    id: 'lic-criminologia',
    nombre: 'Licenciatura en Criminología',
    tipo: 'licenciatura',
    descripcion: 'Estudio científico del delito, el delincuente y la víctima con enfoque en prevención y seguridad.',
    duracion: '3 años',
    imagen: 'https://utel.edu.mx/_next/image?url=https:%2F%2Fcmsutel.s3.amazonaws.com%2FLic_En_Criminologia_y_Cirminalistica_fea0de6be9.jpg&w=3840&q=75',
    porQueEstudiar: 'México y el mundo enfrentan retos de seguridad sin precedentes. Estudiar Criminología te convierte en una pieza clave para entender la mente criminal, prevenir delitos y diseñar políticas públicas. Nuestra metodología te preparará no solo para entender el crimen, sino para resolverlo y prevenirlo.',
    campoLaboral: [
      'Fiscalías, Procuradurías y Ministerios Públicos.',
      'Centros de Readaptación Social (Sistema Penitenciario).',
      'Seguridad corporativa y prevención de fraudes en sector privado.',
      'Peritaje independiente y consultoría criminológica.',
      'Instituciones de prevención del delito y victimología.'
    ],
    perfilEgreso: [
      'Dominio de técnicas de perfilación criminal y análisis de conducta.',
      'Capacidad para diseñar y evaluar programas de prevención del delito.',
      'Manejo de metodologías de investigación científica.',
      'Habilidades en atención a víctimas.'
    ],
    preguntasFrecuentes: [
      { pregunta: '¿Cuál es la diferencia entre Criminología y Criminalística?', respuesta: 'La Criminología estudia el "porqué" del delito. La Criminalística estudia el "cómo" (recolección de pruebas en la escena). Nuestro plan aborda bases de ambas.' },
      { pregunta: '¿Necesito conocimientos previos en derecho?', respuesta: 'No. El plan incluye materias introductorias al derecho penal desde el inicio.' }
    ],
    planEstudios: [
      { semestre: '1° Semestre', materias: ['Introducción a la Criminología', 'Bases Biológicas de la Conducta', 'Sociología Criminal', 'Metodología de la Investigación', 'Introducción al Derecho'] },
      { semestre: '2° Semestre', materias: ['Teorías Criminológicas', 'Psicología Criminal', 'Derecho Penal General', 'Estadística Criminal', 'Derechos Humanos'] },
      { semestre: '3° Semestre', materias: ['Criminología Clínica', 'Victimología', 'Derecho Penal Especial', 'Criminalística de Campo', 'Entrevista e Interrogatorio'] },
      { semestre: '4° Semestre', materias: ['Penología y Sistemas Penitenciarios', 'Medicina Legal', 'Prevención del Delito', 'Fotografía Forense', 'Políticas Públicas de Seguridad'] },
      { semestre: '5° Semestre', materias: ['Delincuencia Juvenil', 'Psicopatología Criminal', 'Dactiloscopia', 'Derecho Procesal Penal', 'Seguridad Pública y Privada'] },
      { semestre: '6° Semestre', materias: ['Delincuencia Organizada', 'Toxicología Forense', 'Balística Forense', 'Criminología Corporativa', 'Modelos de Prevención'] },
      { semestre: '7° Semestre', materias: ['Perfilación Criminal', 'Genética Forense', 'Documentoscopia', 'Prácticas Criminológicas I', 'Ética Profesional'] },
      { semestre: '8° Semestre', materias: ['Cibercriminalidad', 'Análisis de Riesgos', 'Auditoría de Seguridad', 'Prácticas Criminológicas II', 'Seminario de Tesis'] }
    ]
  },
  {
    id: 'mae-educacion',
    nombre: 'Maestría en Educación',
    tipo: 'maestria',
    descripcion: 'Posgrado orientado a la innovación educativa y el liderazgo en instituciones de enseñanza.',
    duracion: '1 año',
    imagen: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop',
    porQueEstudiar: 'Lleva tu carrera docente al siguiente nivel. Esta maestría está diseñada para profesores, directivos y profesionistas que desean asumir puestos de liderazgo (coordinaciones, direcciones) o aspiran a escalar en el escalafón magisterial incrementando sus ingresos económicos.',
    campoLaboral: [
      'Dirección general y coordinación académica de colegios.',
      'Evaluación y acreditación de programas educativos.',
      'Docencia a nivel licenciatura y posgrado.',
      'Liderazgo en proyectos de innovación tecnológica escolar.'
    ],
    perfilEgreso: [
      'Competencias directivas y gestión de talento docente.',
      'Diseño e implementación de modelos educativos de vanguardia.',
      'Creación de políticas de calidad educativa institucional.'
    ],
    preguntasFrecuentes: [
      { pregunta: '¿Debo ser maestro o licenciado en pedagogía para entrar?', respuesta: 'No necesariamente. Si tienes una licenciatura en otra área pero te dedicas a la docencia o capacitación, esta maestría te brindará las credenciales y herramientas pedagógicas formales.' }
    ],
    planEstudios: [
      { semestre: '1° Semestre', materias: ['Filosofía Contemporánea de la Educación', 'Tendencias Educativas Actuales', 'Metodología de la Investigación Educativa I', 'Tecnologías Aplicadas a la Educación'] },
      { semestre: '2° Semestre', materias: ['Modelos de Diseño Instruccional', 'Evaluación Educativa Avanzada', 'Metodología de la Investigación Educativa II', 'Liderazgo y Gestión Educativa'] },
      { semestre: '3° Semestre', materias: ['Innovación y Creatividad Educativa', 'Políticas Educativas y Calidad', 'Seminario de Titulación I', 'Diseño Curricular por Competencias'] },
      { semestre: '4° Semestre', materias: ['Educación Inclusiva y Diversidad', 'Habilidades Directivas en Educación', 'Seminario de Titulación II', 'Evaluación Institucional'] }
    ]
  },
  {
    id: 'mae-psicopedagogia',
    nombre: 'Maestría en Psicopedagogía',
    tipo: 'maestria',
    descripcion: 'Especialización en la intervención psicopedagógica para mejorar procesos de aprendizaje.',
    duracion: '1 año',
    imagen: 'https://www.anahuac.mx/sites/default/files/gbb-uploads/Licenciatura_Psicopedagogia_Introduccion-zgbvmw.jpg',
    porQueEstudiar: 'En las aulas actuales, las barreras de aprendizaje y la necesidad de inclusión son el desafío principal. Esta maestría te convierte en el especialista más buscado por colegios y padres de familia para diagnosticar, intervenir y potenciar el aprendizaje de niños y jóvenes con necesidades especiales o talentos sobresalientes.',
    campoLaboral: [
      'Gabinetes psicopedagógicos en colegios públicos y privados.',
      'Práctica de consulta privada como especialista en aprendizaje.',
      'Centros de Educación Especial e inclusión.',
      'Asesoría a padres de familia e instituciones.'
    ],
    perfilEgreso: [
      'Diagnóstico clínico-educativo de trastornos del aprendizaje (TDAH, dislexia, etc).',
      'Diseño de planes de intervención personalizados.',
      'Orientación vocacional e intervención familiar psicopedagógica.'
    ],
    preguntasFrecuentes: [
      { pregunta: '¿Esta maestría me permite dar terapia?', respuesta: 'Te capacita para dar "intervención psicopedagógica" (enfocada al aprendizaje y desarrollo escolar). No sustituye la psicoterapia clínica, pero es un servicio altamente especializado y remunerado.' }
    ],
    planEstudios: [
      { semestre: '1° Semestre', materias: ['Fundamentos Psicopedagógicos', 'Desarrollo Cognitivo y Aprendizaje', 'Investigación Psicopedagógica I', 'Neuropsicología de la Educación'] },
      { semestre: '2° Semestre', materias: ['Trastornos del Aprendizaje', 'Diagnóstico Psicopedagógico', 'Investigación Psicopedagógica II', 'Diseño de Estrategias de Intervención'] },
      { semestre: '3° Semestre', materias: ['Intervención en Trastornos del Lenguaje', 'Orientación Vocacional y Profesional', 'Seminario de Tesis I', 'Atención a la Diversidad'] },
      { semestre: '4° Semestre', materias: ['Intervención Familiar e Institucional', 'Ética en la Práctica Psicopedagógica', 'Seminario de Tesis II', 'Evaluación de Programas de Intervención'] }
    ]
  },
  {
    id: 'curso-ingles',
    nombre: 'Inglés',
    tipo: 'curso',
    // Los cursos no llevan RVOE usualmente.
    descripcion: 'Curso de inglés desde nivel básico hasta avanzado con enfoque comunicativo.',
    duracion: '6 meses',
    imagen: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop',
    porQueEstudiar: 'El inglés ya no es un "plus" en el currículum, es un requisito indispensable. Nuestro curso está diseñado para adultos que necesitan resultados rápidos: enfocándonos en la fluidez conversacional y el vocabulario de negocios, garantizando que pierdas el miedo a hablar desde la primera semana.',
    campoLaboral: [
      'Empresas transnacionales y puestos bilingües (aumento salarial del 30%).',
      'Trabajo remoto para empresas en Estados Unidos o Europa.',
      'Sector turismo, aviación y comercio internacional.'
    ],
    perfilEgreso: [
      'Fluidez para mantener conversaciones cotidianas y de negocios.',
      'Redacción profesional de correos electrónicos y reportes.',
      'Preparación sólida para presentar exámenes de certificación (TOEFL, IELTS).'
    ],
    preguntasFrecuentes: [
      { pregunta: '¿Tengo que empezar desde cero si ya sé algo?', respuesta: 'No, te aplicaremos un examen de ubicación rápido para colocarte en el nivel donde realmente aprenderás cosas nuevas.' }
    ],
    planEstudios: [
      { semestre: 'Módulo 1: Básico', materias: ['Gramática Fundamental', 'Vocabulario Cotidiano', 'Comprensión Auditiva Básica', 'Expresión Oral: Presentaciones'] },
      { semestre: 'Módulo 2: Intermedio', materias: ['Tiempos Verbales Complejos', 'Lectura de Comprensión', 'Escritura de Correos y Cartas', 'Conversación Fluida'] },
      { semestre: 'Módulo 3: Avanzado', materias: ['Inglés de Negocios', 'Preparación para Certificación TOEFL/IELTS', 'Debates y Presentaciones Ejecutivas', 'Cultura Anglosajona'] }
    ]
  },
  {
    id: 'curso-ie',
    nombre: 'Inteligencia Emocional',
    tipo: 'curso',
    descripcion: 'Desarrollo de habilidades socioemocionales para el éxito personal y profesional.',
    duracion: '3 meses',
    imagen: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=2070&auto=format&fit=crop',
    porQueEstudiar: 'Las empresas top contratan por habilidades técnicas, pero despiden por falta de habilidades emocionales. Aprende a gestionar el estrés, liderar equipos con empatía y tomar decisiones bajo presión. Este curso transformará tu forma de interactuar en tu trabajo y en tu vida personal.',
    campoLaboral: [
      'Habilidad transversal aplicable a CUALQUIER puesto laboral.',
      'Liderazgo y gerencia de equipos de alto rendimiento.',
      'Atención al cliente y resolución de crisis.'
    ],
    perfilEgreso: [
      'Técnicas probadas para la regulación del estrés y la ansiedad.',
      'Comunicación asertiva y negociación efectiva.',
      'Construcción de resiliencia frente al fracaso y los retos.'
    ],
    preguntasFrecuentes: [
      { pregunta: '¿Es un curso teórico?', respuesta: 'No, es 100% vivencial y práctico. Haremos dinámicas, estudios de casos reales y ejercicios de introspección semanales.' }
    ],
    planEstudios: [
      { semestre: 'Mes 1', materias: ['Autoconocimiento y Autoconciencia', 'Identificación de Emociones', 'Neurociencia de las Emociones'] },
      { semestre: 'Mes 2', materias: ['Autocontrol y Gestión del Estrés', 'Técnicas de Relajación', 'Resiliencia ante la Adversidad'] },
      { semestre: 'Mes 3', materias: ['Empatía y Habilidades Sociales', 'Resolución de Conflictos', 'Liderazgo Emocionalmente Inteligente'] }
    ]
  },
  {
    id: 'curso-ia',
    nombre: 'Inteligencia Artificial',
    tipo: 'curso',
    descripcion: 'Introducción práctica a la IA para aumentar tu productividad diaria.',
    duracion: '4 meses',
    imagen: 'https://tse1.mm.bing.net/th/id/OIP.tQwVQ73m7E2IOriUATWPAwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
    porQueEstudiar: 'La Inteligencia Artificial no te va a quitar el trabajo; alguien que sepa usar Inteligencia Artificial sí. Este curso intensivo te enseñará desde cero cómo usar ChatGPT, automatizaciones y generación de imágenes para hacer en minutos lo que antes te tomaba horas, multiplicando tu valor en el mercado.',
    campoLaboral: [
      'Agencias de marketing y creación de contenido.',
      'Análisis de datos e investigación corporativa.',
      'Cualquier puesto administrativo que requiera optimización de tiempos.'
    ],
    perfilEgreso: [
      'Dominio de "Prompt Engineering" (saber qué escribirle a la IA para obtener lo que quieres).',
      'Creación de textos, reportes, imágenes y presentaciones con IA.',
      'Automatización de tareas repetitivas del día a día.'
    ],
    preguntasFrecuentes: [
      { pregunta: '¿Necesito saber programar?', respuesta: 'Absolutamente no. Este curso está diseñado para usuarios comunes (abogados, administradores, contadores, creativos) que quieren usar la IA como herramienta de productividad.' }
    ],
    planEstudios: [
      { semestre: 'Módulo 1', materias: ['Historia y Conceptos Básicos de IA', 'Tipos de Inteligencia Artificial', 'Ética en el uso de IA'] },
      { semestre: 'Módulo 2', materias: ['Prompt Engineering: Comunicarse con IA', 'Herramientas de Texto (ChatGPT, Claude, Gemini)', 'Automatización de Tareas Diarias'] },
      { semestre: 'Módulo 3', materias: ['Generación de Imágenes (Midjourney, DALL-E)', 'Herramientas de Audio y Video con IA', 'IA Aplicada al Diseño'] },
      { semestre: 'Módulo 4', materias: ['IA en los Negocios', 'Análisis de Datos Básico con IA', 'Proyecto Final: Implementación de IA'] }
    ]
  }
]

// Cursos activos
export const cursos: Curso[] = [
  {
    id: 'curso-1',
    nombre: 'Introducción al Derecho',
    programaId: 'lic-derecho',
    profesorId: 'maestro-1',
    descripcion: 'Fundamentos del sistema jurídico mexicano y principios generales del derecho.',
    fechaInicio: '2024-01-15',
    fechaFin: '2024-06-15',
    estado: 'activo',
    progreso: 65
  },
  {
    id: 'curso-2',
    nombre: 'Psicología General',
    programaId: 'lic-psicologia',
    profesorId: 'maestro-2',
    descripcion: 'Estudio de los procesos mentales básicos y el comportamiento humano.',
    fechaInicio: '2024-01-15',
    fechaFin: '2024-06-15',
    estado: 'activo',
    progreso: 70
  },
  {
    id: 'curso-3',
    nombre: 'Pedagogía Contemporánea',
    programaId: 'lic-pedagogia',
    profesorId: 'maestro-3',
    descripcion: 'Teorías y metodologías educativas del siglo XXI.',
    fechaInicio: '2024-02-01',
    fechaFin: '2024-07-01',
    estado: 'activo',
    progreso: 55
  },
  {
    id: 'curso-4',
    nombre: 'Criminología Aplicada',
    programaId: 'lic-criminologia',
    profesorId: 'maestro-1',
    descripcion: 'Aplicación de teorías criminológicas a casos reales.',
    fechaInicio: '2024-02-15',
    fechaFin: '2024-07-15',
    estado: 'activo',
    progreso: 45
  },
  {
    id: 'curso-5',
    nombre: 'Inglés Básico',
    programaId: 'curso-ingles',
    profesorId: 'maestro-3',
    descripcion: 'Fundamentos del idioma inglés para comunicación básica.',
    fechaInicio: '2024-03-01',
    fechaFin: '2024-08-31',
    estado: 'activo',
    progreso: 35
  },
  {
    id: 'curso-6',
    nombre: 'Inteligencia Artificial para Principiantes',
    programaId: 'curso-ia',
    profesorId: 'maestro-2',
    descripcion: 'Introducción práctica a la IA y machine learning.',
    fechaInicio: '2024-03-15',
    fechaFin: '2024-07-15',
    estado: 'activo',
    progreso: 25
  }
]

// Tareas
export const tareas: Tarea[] = [
  {
    id: 'tarea-1',
    cursoId: 'curso-1',
    titulo: 'Ensayo sobre el Sistema Jurídico Mexicano',
    descripcion: 'Elaborar un ensayo de 3-5 páginas sobre los fundamentos del sistema jurídico mexicano.',
    fechaLimite: '2024-05-20',
    puntosTotales: 100,
    tipoEntrega: 'archivo',
    formatosPermitidos: ['pdf', 'docx'],
    tamanoMaximoMB: 20,
    estado: 'pendiente'
  },
  {
    id: 'tarea-2',
    cursoId: 'curso-2',
    titulo: 'Análisis de Caso Clínico',
    descripcion: 'Analizar el caso clínico proporcionado aplicando las teorías vistas en clase.',
    fechaLimite: '2024-05-25',
    puntosTotales: 100,
    tipoEntrega: 'ambos',
    formatosPermitidos: ['pdf', 'docx', 'pptx'],
    tamanoMaximoMB: 20,
    estado: 'pendiente'
  },
  {
    id: 'tarea-3',
    cursoId: 'curso-3',
    titulo: 'Propuesta Didáctica',
    descripcion: 'Diseñar una propuesta didáctica innovadora para educación básica.',
    fechaLimite: '2024-05-18',
    puntosTotales: 100,
    tipoEntrega: 'archivo',
    formatosPermitidos: ['pdf', 'docx', 'pptx'],
    tamanoMaximoMB: 50,
    estado: 'entregada'
  },
  {
    id: 'tarea-4',
    cursoId: 'curso-1',
    titulo: 'Cuestionario de Repaso',
    descripcion: 'Responder el cuestionario de repaso del tema 5.',
    fechaLimite: '2024-05-10',
    puntosTotales: 50,
    tipoEntrega: 'texto',
    formatosPermitidos: [],
    tamanoMaximoMB: 0,
    estado: 'calificada'
  }
]

// Entregas
export const entregas: Entrega[] = [
  {
    id: 'entrega-1',
    tareaId: 'tarea-3',
    alumnoId: 'alumno-3',
    fechaEntrega: '2024-05-17',
    archivo: 'propuesta_didactica_sofia.pdf',
    estado: 'calificada',
    calificacion: 95,
    comentarios: 'Excelente trabajo, muy creativa la propuesta.'
  },
  {
    id: 'entrega-2',
    tareaId: 'tarea-4',
    alumnoId: 'alumno-1',
    fechaEntrega: '2024-05-09',
    texto: 'Respuestas del cuestionario...',
    estado: 'calificada',
    calificacion: 45,
    comentarios: 'Bien, pero revisa la pregunta 3.'
  }
]

// Asistencias
export const asistencias: Asistencia[] = [
  { id: 'asis-1', cursoId: 'curso-1', alumnoId: 'alumno-1', fecha: '2024-05-13', estado: 'presente' },
  { id: 'asis-2', cursoId: 'curso-1', alumnoId: 'alumno-1', fecha: '2024-05-14', estado: 'presente' },
  { id: 'asis-3', cursoId: 'curso-1', alumnoId: 'alumno-1', fecha: '2024-05-15', estado: 'retardo' },
  { id: 'asis-4', cursoId: 'curso-2', alumnoId: 'alumno-2', fecha: '2024-05-13', estado: 'presente' },
  { id: 'asis-5', cursoId: 'curso-2', alumnoId: 'alumno-2', fecha: '2024-05-14', estado: 'falta' },
  { id: 'asis-6', cursoId: 'curso-2', alumnoId: 'alumno-2', fecha: '2024-05-15', estado: 'justificado' },
  { id: 'asis-7', cursoId: 'curso-3', alumnoId: 'alumno-3', fecha: '2024-05-13', estado: 'presente' },
  { id: 'asis-8', cursoId: 'curso-3', alumnoId: 'alumno-3', fecha: '2024-05-14', estado: 'presente' },
  { id: 'asis-9', cursoId: 'curso-3', alumnoId: 'alumno-3', fecha: '2024-05-15', estado: 'presente' }
]

// Clases virtuales
export const clasesVirtuales: ClaseVirtual[] = [
  {
    id: 'clase-1',
    cursoId: 'curso-1',
    titulo: 'Sesión 15: Derecho Constitucional',
    fecha: '2024-05-20',
    horaInicio: '18:00',
    horaFin: '20:00',
    linkExterno: 'https://meet.google.com/abc-defg-hij',
    descripcion: 'Revisión de los artículos constitucionales más relevantes.'
  },
  {
    id: 'clase-2',
    cursoId: 'curso-2',
    titulo: 'Sesión 16: Terapia Cognitiva',
    fecha: '2024-05-21',
    horaInicio: '19:00',
    horaFin: '21:00',
    linkExterno: 'https://meet.google.com/klm-nopq-rst',
    descripcion: 'Introducción a las técnicas de terapia cognitivo-conductual.'
  },
  {
    id: 'clase-3',
    cursoId: 'curso-3',
    titulo: 'Sesión 12: Metodologías Activas',
    fecha: '2024-05-22',
    horaInicio: '17:00',
    horaFin: '19:00',
    linkExterno: 'https://zoom.us/j/123456789',
    descripcion: 'Aprendizaje basado en proyectos y gamificación.'
  }
]

// Calificaciones
export const calificaciones: Calificacion[] = [
  { id: 'cal-1', alumnoId: 'alumno-1', cursoId: 'curso-1', tareaId: 'tarea-4', calificacion: 90, fecha: '2024-05-10' },
  { id: 'cal-2', alumnoId: 'alumno-3', cursoId: 'curso-3', tareaId: 'tarea-3', calificacion: 95, comentarios: 'Excelente trabajo', fecha: '2024-05-18' },
  { id: 'cal-3', alumnoId: 'alumno-2', cursoId: 'curso-2', tareaId: 'tarea-2', calificacion: 85, fecha: '2024-05-15' }
]

// Avisos
export const avisos: Aviso[] = [
  {
    id: 'aviso-1',
    titulo: 'Inscripciones abiertas para el ciclo 2024-2025',
    contenido: 'Ya están abiertas las inscripciones para el próximo ciclo escolar. Aprovecha los descuentos por pronto pago.',
    fecha: '2024-05-10',
    tipo: 'general'
  },
  {
    id: 'aviso-2',
    cursoId: 'curso-1',
    titulo: 'Cambio de horario de clase',
    contenido: 'La clase del viernes 24 de mayo se recorre a las 19:00 hrs.',
    fecha: '2024-05-15',
    tipo: 'curso'
  },
  {
    id: 'aviso-3',
    titulo: 'Mantenimiento de plataforma',
    contenido: 'El domingo 26 de mayo habrá mantenimiento programado de 2:00 a 6:00 AM.',
    fecha: '2024-05-18',
    tipo: 'urgente'
  }
]

// Funciones helper
export function getUsuarioById(id: string) {
  return usuarios.find(u => u.id === id)
}

export function getCursoById(id: string) {
  return cursos.find(c => c.id === id)
}

export function getProgramaById(id: string) {
  return programas.find(p => p.id === id)
}

export function getCursosByProfesor(profesorId: string) {
  return cursos.filter(c => c.profesorId === profesorId)
}

export function getTareasByCurso(cursoId: string) {
  return tareas.filter(t => t.cursoId === cursoId)
}

export function getClasesByCurso(cursoId: string) {
  return clasesVirtuales.filter(c => c.cursoId === cursoId)
}

export function getAsistenciasByAlumno(alumnoId: string) {
  return asistencias.filter(a => a.alumnoId === alumnoId)
}

export function getCalificacionesByAlumno(alumnoId: string) {
  return calificaciones.filter(c => c.alumnoId === alumnoId)
}

export function getEntregasByAlumno(alumnoId: string) {
  return entregas.filter(e => e.alumnoId === alumnoId)
}

export function getProfesorByCurso(cursoId: string) {
  const curso = getCursoById(cursoId)
  if (!curso) return null
  return getUsuarioById(curso.profesorId)
}
