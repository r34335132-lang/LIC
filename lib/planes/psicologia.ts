import type { PeriodoPlan, PlanEstudios } from '@/types/planes'

export const planPsicologia: PeriodoPlan[] = [
  {
    periodo: 1,
    nombre: '1° Semestre',
    materias: [
      { nombre: 'Introducción a la Psicología', clave: 'PSI101', seriacion: null, horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
      { nombre: 'Bases Biológicas de la Conducta', clave: 'PSI102', seriacion: null, horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Laboratorio virtual' },
      { nombre: 'Historia de la Psicología', clave: 'PSI103', seriacion: null, horasDocente: 32, horasIndependientes: 48, creditos: 6, instalacion: 'Aula virtual' },
      { nombre: 'Estadística I', clave: 'PSI104', seriacion: null, horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
      { nombre: 'Desarrollo de Habilidades del Pensamiento', clave: 'PSI105', seriacion: null, horasDocente: 32, horasIndependientes: 48, creditos: 6, instalacion: 'Aula virtual' },
    ],
  },
  {
    periodo: 2,
    nombre: '2° Semestre',
    materias: [
      { nombre: 'Neuroanatomía', clave: 'PSI201', seriacion: 'PSI102', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Laboratorio virtual' },
      { nombre: 'Psicología de la Infancia', clave: 'PSI202', seriacion: 'PSI101', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
      { nombre: 'Teorías de la Personalidad', clave: 'PSI203', seriacion: 'PSI101', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
      { nombre: 'Estadística II', clave: 'PSI204', seriacion: 'PSI104', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
      { nombre: 'Epistemología', clave: 'PSI205', seriacion: null, horasDocente: 32, horasIndependientes: 48, creditos: 6, instalacion: 'Aula virtual' },
    ],
  },
  {
    periodo: 3,
    nombre: '3° Semestre',
    materias: [
      { nombre: 'Psicofisiología', clave: 'PSI301', seriacion: 'PSI201', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Laboratorio virtual' },
      { nombre: 'Psicología de la Adolescencia', clave: 'PSI302', seriacion: 'PSI202', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
      { nombre: 'Psicología Social', clave: 'PSI303', seriacion: 'PSI101', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
      { nombre: 'Entrevista Psicológica', clave: 'PSI304', seriacion: 'PSI203', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
      { nombre: 'Teoría de la Medida', clave: 'PSI305', seriacion: 'PSI204', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
    ],
  },
  {
    periodo: 4,
    nombre: '4° Semestre',
    materias: [
      { nombre: 'Psicología del Aprendizaje', clave: 'PSI401', seriacion: 'PSI301', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
      { nombre: 'Psicología de la Adultez y Senectud', clave: 'PSI402', seriacion: 'PSI302', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
      { nombre: 'Dinámica de Grupos', clave: 'PSI403', seriacion: 'PSI303', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
      { nombre: 'Pruebas Psicológicas I', clave: 'PSI404', seriacion: 'PSI305', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Laboratorio virtual' },
      { nombre: 'Psicopatología I', clave: 'PSI405', seriacion: 'PSI304', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
    ],
  },
  {
    periodo: 5,
    nombre: '5° Semestre',
    materias: [
      { nombre: 'Psicología Educativa', clave: 'PSI501', seriacion: 'PSI401', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
      { nombre: 'Psicología Organizacional', clave: 'PSI502', seriacion: 'PSI403', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
      { nombre: 'Pruebas Psicológicas II', clave: 'PSI503', seriacion: 'PSI404', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Laboratorio virtual' },
      { nombre: 'Psicopatología II', clave: 'PSI504', seriacion: 'PSI405', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
      { nombre: 'Metodología de la Investigación', clave: 'PSI505', seriacion: 'PSI305', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
    ],
  },
  {
    periodo: 6,
    nombre: '6° Semestre',
    materias: [
      { nombre: 'Intervención Educativa', clave: 'PSI601', seriacion: 'PSI501', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
      { nombre: 'Reclutamiento y Selección de Personal', clave: 'PSI602', seriacion: 'PSI502', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
      { nombre: 'Psicología Clínica', clave: 'PSI603', seriacion: 'PSI504', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
      { nombre: 'Orientación Vocacional', clave: 'PSI604', seriacion: 'PSI501', horasDocente: 32, horasIndependientes: 48, creditos: 6, instalacion: 'Aula virtual' },
      { nombre: 'Diseño de Proyectos de Investigación', clave: 'PSI605', seriacion: 'PSI505', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
    ],
  },
  {
    periodo: 7,
    nombre: '7° Semestre',
    materias: [
      { nombre: 'Educación Especial', clave: 'PSI701', seriacion: 'PSI601', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
      { nombre: 'Desarrollo Organizacional', clave: 'PSI702', seriacion: 'PSI602', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
      { nombre: 'Modelos Psicoterapéuticos', clave: 'PSI703', seriacion: 'PSI603', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
      { nombre: 'Ética Profesional', clave: 'PSI704', seriacion: null, horasDocente: 32, horasIndependientes: 48, creditos: 6, instalacion: 'Aula virtual' },
      { nombre: 'Prácticas Supervisadas I', clave: 'PSI705', seriacion: 'PSI603', horasDocente: 64, horasIndependientes: 96, creditos: 10, instalacion: 'Campo clínico' },
    ],
  },
  {
    periodo: 8,
    nombre: '8° Semestre',
    materias: [
      { nombre: 'Intervención en Crisis', clave: 'PSI801', seriacion: 'PSI703', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
      { nombre: 'Temas Selectos de Psicología', clave: 'PSI802', seriacion: 'PSI505', horasDocente: 32, horasIndependientes: 48, creditos: 6, instalacion: 'Aula virtual' },
      { nombre: 'Seminario de Titulación I', clave: 'PSI803', seriacion: 'PSI605', horasDocente: 32, horasIndependientes: 96, creditos: 8, instalacion: 'Aula virtual' },
      { nombre: 'Prácticas Supervisadas II', clave: 'PSI804', seriacion: 'PSI705', horasDocente: 64, horasIndependientes: 96, creditos: 10, instalacion: 'Campo clínico' },
      { nombre: 'Emprendimiento en Salud Mental', clave: 'PSI805', seriacion: 'PSI502', horasDocente: 32, horasIndependientes: 48, creditos: 6, instalacion: 'Aula virtual' },
    ],
  },
  {
    periodo: 9,
    nombre: '9° Semestre',
    materias: [
      { nombre: 'Seminario de Titulación II', clave: 'PSI901', seriacion: 'PSI803', horasDocente: 32, horasIndependientes: 120, creditos: 10, instalacion: 'Aula virtual' },
      { nombre: 'Psicología Forense', clave: 'PSI902', seriacion: 'PSI504', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Aula virtual' },
      { nombre: 'Neuropsicología', clave: 'PSI903', seriacion: 'PSI301', horasDocente: 48, horasIndependientes: 72, creditos: 8, instalacion: 'Laboratorio virtual' },
      { nombre: 'Prácticas Supervisadas III', clave: 'PSI904', seriacion: 'PSI804', horasDocente: 64, horasIndependientes: 96, creditos: 10, instalacion: 'Campo clínico' },
    ],
  },
]

export const planPsicologiaMeta: PlanEstudios = {
  programaId: 'psicologia',
  nombre: 'Licenciatura en Psicología',
  duracionSemestres: 9,
  modalidad: 'Virtual con validez oficial SEP (RVOE)',
  periodos: planPsicologia,
}
