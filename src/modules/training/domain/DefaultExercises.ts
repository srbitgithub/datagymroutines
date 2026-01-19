import { Exercise } from "./Exercise";

export const DEFAULT_EXERCISES_DATA: Omit<Exercise, 'id' | 'createdAt'>[] = [
    // Pecho
    { name: "Press de Banca (Barra)", muscleGroup: "Pecho", description: "Ejercicio básico de empuje para pectoral." },
    { name: "Press Superior (Mancuernas)", muscleGroup: "Pecho", description: "Enfocado en la parte superior del pectoral." },
    { name: "Aperturas con Mancuernas", muscleGroup: "Pecho", description: "Ejercicio de aislamiento para pectoral." },

    // Espalda
    { name: "Dominadas", muscleGroup: "Espalda", description: "Ejercicio de tracción vertical." },
    { name: "Jalón al Pecho", muscleGroup: "Espalda", description: "Tracción vertical asistida." },
    { name: "Remo con Barra", muscleGroup: "Espalda", description: "Ejercicio de tracción horizontal para densidad." },
    { name: "Remo en Polea Baja", muscleGroup: "Espalda", description: "Tracción horizontal con cables." },

    // Pierna
    { name: "Sentadilla Libre", muscleGroup: "Piernas", description: "Ejercicio rey para el tren inferior." },
    { name: "Prensa de Piernas", muscleGroup: "Piernas", description: "Empuje de piernas en máquina." },
    { name: "Extensión de Cuádriceps", muscleGroup: "Piernas", description: "Aislamiento de cuádriceps." },
    { name: "Curl Femoral", muscleGroup: "Piernas", description: "Aislamiento de isquiotibiales." },
    { name: "Peso Muerto Rumano", muscleGroup: "Piernas", description: "Enfocado en cadena posterior." },

    // Hombro
    { name: "Press Militar (Barra)", muscleGroup: "Hombros", description: "Empuje vertical para deltoides." },
    { name: "Elevaciones Laterales", muscleGroup: "Hombros", description: "Aislamiento del deltoides lateral." },
    { name: "Press Arnold", muscleGroup: "Hombros", description: "Variante de press de hombros." },

    // Brazos
    { name: "Curl de Bíceps (Barra EZ)", muscleGroup: "Brazos", description: "Flexión de codo para bíceps." },
    { name: "Curl de Bíceps (Mancuernas)", muscleGroup: "Brazos", description: "Aislamiento de bíceps alterno." },
    { name: "Press Francés", muscleGroup: "Brazos", description: "Extensión de codo para tríceps." },
    { name: "Extensión de Tríceps en Polea", muscleGroup: "Brazos", description: "Aislamiento de tríceps con cable." },

    // Core
    { name: "Plancha Abdominal", muscleGroup: "Core", description: "Isométrico para zona media." },
    { name: "Crunch Abdominal", muscleGroup: "Core", description: "Flexión de tronco." },

    // Glúteos
    { name: "Hip Thrust", muscleGroup: "Glúteos", description: "Ejercicio fundamental para hipertrofia de glúteos." },
    { name: "Puente de Glúteo", muscleGroup: "Glúteos", description: "Extensión de cadera en suelo." },
    { name: "Patada de Glúteo (Polea)", muscleGroup: "Glúteos", description: "Extensión de cadera aislada." },
    { name: "Abducción de Cadera (Máquina)", muscleGroup: "Glúteos", description: "Enfocado en glúteo medio y menor." }
];
