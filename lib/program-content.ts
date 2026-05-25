export const programBenefits: Record<string, string> = {
  prep: 'Termina la preparatoria en menos tiempo y abre paso a universidad o mejores oportunidades laborales.',
  'lic-derecho': 'Prepárate para ejercer en áreas jurídicas, corporativas y de servicio público con bases prácticas.',
  'lic-psicologia': 'Forma competencias para acompañar procesos de bienestar, evaluación e intervención psicológica.',
  'lic-pedagogia': 'Diseña experiencias de aprendizaje, coordina proyectos educativos y mejora procesos de enseñanza.',
  'lic-criminologia': 'Analiza el delito, la prevención y la seguridad con enfoque científico y social.',
  'mae-educacion': 'Fortalece tu perfil docente o directivo para liderar innovación y gestión educativa.',
  'mae-psicopedagogia': 'Especialízate en diagnóstico, orientación e intervención para mejorar procesos de aprendizaje.',
}

export const homeTestimonials = [
  {
    name: 'Mariana R.',
    profile: 'Trabaja y estudia Derecho',
    text: 'Trabajo por las tardes y necesitaba una opción que pudiera seguir. Revisar el RVOE antes de inscribirme me dio confianza.',
  },
  {
    name: 'José Luis M.',
    profile: 'Retomó la preparatoria',
    text: 'Había dejado la prepa pendiente. Me explicaron documentos, tiempos y costos con claridad, y eso me ayudó a decidir.',
  },
  {
    name: 'Andrea C.',
    profile: 'Maestría en Educación',
    text: 'Buscaba una maestría flexible porque ya doy clases. La modalidad virtual y el seguimiento fueron lo que más me convenció.',
  },
  {
    name: 'Sofía H.',
    profile: 'Licenciatura flexible',
    text: 'No quería una escuela que solo me vendiera rápido. Me gustó que me compartieran el plan de estudios y el número de RVOE.',
  },
]

export type ProgramFaq = {
  question: string
  answer: string
}

export const programSpecificFaqs: Record<string, ProgramFaq[]> = {
  prep: [
    {
      question: '¿La preparatoria en 2 años me sirve para entrar a universidad?',
      answer:
        'Sí. Al concluir y cumplir los requisitos académicos, obtienes un certificado del nivel medio superior con validez oficial para continuar estudios universitarios.',
    },
    {
      question: '¿Puedo estudiar la prepa si trabajo o tengo familia?',
      answer:
        'Sí. La modalidad virtual está pensada para avanzar con horarios flexibles y acompañamiento, sin tener que trasladarte diariamente a un plantel.',
    },
    {
      question: '¿Qué pasa si dejé la prepa hace varios años?',
      answer:
        'Puedes retomar tus estudios. Admisiones revisa tu documentación y te orienta sobre el proceso para integrarte al grupo correspondiente.',
    },
  ],
  'lic-derecho': [
    {
      question: '¿La Licenciatura en Derecho cuenta con RVOE?',
      answer:
        'Sí. La página muestra el número de RVOE del programa para que puedas consultarlo antes de iniciar tu inscripción.',
    },
    {
      question: '¿Qué perfil necesito para estudiar Derecho?',
      answer:
        'Es recomendable tener interés por la lectura, la argumentación, la solución de conflictos y el análisis de normas, contratos y casos.',
    },
    {
      question: '¿Puedo estudiar Derecho en modalidad virtual si trabajo?',
      answer:
        'Sí. El plan está pensado para personas que necesitan organizar su avance académico alrededor de sus responsabilidades laborales.',
    },
  ],
  'lic-psicologia': [
    {
      question: '¿La Licenciatura en Psicología tiene validez oficial?',
      answer:
        'Sí. El programa muestra su RVOE para que puedas verificar la validez oficial antes de solicitar tu inscripción.',
    },
    {
      question: '¿Qué aprenderé en Psicología?',
      answer:
        'Revisarás bases del comportamiento humano, evaluación, intervención, desarrollo, investigación y herramientas para acompañar procesos de bienestar.',
    },
    {
      question: '¿La modalidad virtual incluye seguimiento académico?',
      answer:
        'Sí. Tendrás acompañamiento durante tu proceso y orientación para avanzar de forma ordenada en tus materias.',
    },
  ],
  'lic-pedagogia': [
    {
      question: '¿A quién le conviene estudiar Pedagogía?',
      answer:
        'A personas interesadas en educación, capacitación, diseño curricular, orientación, docencia, gestión educativa y mejora de procesos de aprendizaje.',
    },
    {
      question: '¿La Licenciatura en Pedagogía tiene RVOE?',
      answer:
        'Sí. El número de RVOE se muestra en la ficha del programa para que puedas consultarlo con transparencia.',
    },
    {
      question: '¿Puedo estudiar Pedagogía si ya trabajo en una escuela?',
      answer:
        'Sí. La modalidad virtual permite avanzar sin dejar tus responsabilidades actuales y fortalecer tu perfil educativo.',
    },
  ],
  'lic-criminologia': [
    {
      question: '¿Qué temas se estudian en Criminología?',
      answer:
        'El programa aborda análisis del delito, prevención, seguridad, investigación, contexto social y herramientas para comprender conductas antisociales.',
    },
    {
      question: '¿Criminología cuenta con RVOE?',
      answer:
        'Sí. Puedes revisar el número de RVOE visible en la página del programa antes de pedir informes.',
    },
    {
      question: '¿Dónde puede trabajar un egresado de Criminología?',
      answer:
        'Puede desarrollarse en instituciones de seguridad, prevención, análisis de riesgos, reinserción social, investigación y consultoría especializada.',
    },
  ],
  'mae-educacion': [
    {
      question: '¿La Maestría en Educación es para docentes en activo?',
      answer:
        'Sí. Es una opción adecuada para docentes, coordinadores, directivos y profesionales interesados en mejorar procesos educativos.',
    },
    {
      question: '¿La maestría tiene RVOE?',
      answer:
        'Sí. El número de RVOE está visible en la página del programa para consulta y verificación.',
    },
    {
      question: '¿Puedo cursarla con horarios flexibles?',
      answer:
        'Sí. La modalidad virtual está pensada para profesionales que necesitan estudiar sin pausar su trabajo.',
    },
  ],
  'mae-psicopedagogia': [
    {
      question: '¿Qué diferencia tiene Psicopedagogía frente a Educación?',
      answer:
        'Psicopedagogía se enfoca más en diagnóstico, orientación e intervención de procesos de aprendizaje, mientras Educación aborda gestión y práctica educativa en sentido amplio.',
    },
    {
      question: '¿La Maestría en Psicopedagogía tiene validez oficial?',
      answer:
        'Sí. La página muestra el RVOE del programa para que puedas consultarlo antes de inscribirte.',
    },
    {
      question: '¿Qué perfil profesional aprovecha mejor esta maestría?',
      answer:
        'Docentes, orientadores, psicólogos educativos, pedagogos y profesionales que acompañan necesidades de aprendizaje.',
    },
  ],
}

export const generalFaqs = [
  {
    question: '¿El certificado tiene validez oficial?',
    answer:
      'Sí. Los programas académicos mostrados con RVOE cuentan con reconocimiento de validez oficial. En cada programa verás el número de RVOE correspondiente para consultarlo.',
  },
  {
    question: '¿Qué es el RVOE?',
    answer:
      'Es el Reconocimiento de Validez Oficial de Estudios. Indica que un plan y programa de estudios fue incorporado al Sistema Educativo Nacional por una autoridad educativa.',
  },
  {
    question: '¿Puedo estudiar si trabajo?',
    answer:
      'Sí. El modelo está pensado para personas con empleo, familia u otros compromisos, con clases virtuales, horarios flexibles y seguimiento académico.',
  },
  {
    question: '¿Las clases son en vivo o grabadas?',
    answer:
      'El acompañamiento combina sesiones virtuales, materiales de estudio y seguimiento. Un asesor puede confirmarte el esquema exacto del programa que te interesa.',
  },
  {
    question: '¿Qué documentos necesito?',
    answer:
      'Generalmente se solicita acta de nacimiento, CURP, identificación, comprobante de domicilio y certificado del nivel anterior. Admisiones te confirma la lista según el programa.',
  },
  {
    question: '¿Cuándo inicia el próximo grupo?',
    answer:
      'Hay grupos de nuevo ingreso de forma periódica. Lo ideal es solicitar informes para revisar cupo, fecha de inicio y promoción vigente.',
  },
  {
    question: '¿Cuánto cuesta?',
    answer:
      'La promoción actual mantiene inscripción gratis y mensualidad desde $600 MXN, sujeta a programa, vigencia y disponibilidad de lugares.',
  },
  {
    question: '¿Cómo me inscribo?',
    answer:
      'Completa el formulario o escribe por WhatsApp. Un asesor te explica requisitos, valida tu programa de interés y te guía para abrir tu expediente.',
  },
  {
    question: '¿Me ayudan con titulación?',
    answer:
      'Sí. El equipo académico orienta sobre requisitos, opciones y tiempos de titulación conforme al programa y lineamientos vigentes.',
  },
]
