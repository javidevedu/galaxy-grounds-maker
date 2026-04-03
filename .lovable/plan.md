
## Fase 1: Estructura base y navegación
- Crear nueva sección `/pbl` con rutas para: landing, sala de chat, resultados
- Agregar "PBL English" como nueva app en la página Home (Apps Created)
- Crear tabla `pbl_activities` (título, nivel MCER, área, temas, tiempo límite, skills, created_by)
- Crear tabla `pbl_sessions` (student_name, student_id, activity_id, score, feedback, started_at, finished_at)

## Fase 2: Panel del docente (Admin)
- Formulario para crear actividades PBL (similar al de LantestAI pero adaptado)
- Configurar: nivel MCER, título, tiempo, área de conocimiento, temas gramaticales, skills
- Generar link compartible por actividad
- Vista de resultados por actividad

## Fase 3: Flujo del estudiante
- Página de inicio: ingresar nombre e ID
- Sala de chat conversacional con el agente IA
- Timer visible con el tiempo límite

## Fase 4: Agente IA conversacional
- Edge function que usa Lovable AI para el agente
- System prompt que: presenta problema contextualizado, guía con preguntas progresivas, detecta errores de gramática/vocabulario, da correcciones en tiempo real, integra reading/writing/listening
- Streaming de respuestas token por token

## Fase 5: Evaluación y retroalimentación final
- Al finalizar: puntuación en %, desglose por gramática/vocabulario/comprensión/uso en contexto
- Consejos personalizados
- Guardar resultados en la BD

## Fase 6: Gamificación
- Puntos por respuestas correctas
- Indicadores visuales de progreso
- Badges o logros
