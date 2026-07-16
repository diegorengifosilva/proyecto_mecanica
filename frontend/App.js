// React y hooks destructurados del objeto global expuesto por los scripts CDN
const { useState, useEffect, useRef } = React;

// Constante de gravedad estándar
const G = 9.81;

// Radio de ruedas ficticio para rotación (en metros)
const RADIO_RUEDA = 0.5;

const pistasCompuestas = {
  recta: {
    nombre: "Recta de Ensayos UTP",
    tramos: [
      { tipo: 'recta', longitud: 800, inclinacion: 0, nombre: "Recta de Pruebas" }
    ]
  },
  curva: {
    nombre: "Curva Peraltada Única",
    tramos: [
      { tipo: 'curva', longitud: 500, radio_curva: 80, inclinacion: 10, friccion_estatica: 0.8, direccion: 'derecha', nombre: "Curva Peraltada" }
    ]
  },
  ovalo: {
    nombre: "Super Circuito Ovalado",
    tramos: [
      { tipo: 'recta', longitud: 200, inclinacion: 0, nombre: "Recta Principal" },
      { tipo: 'curva', longitud: 150, radio_curva: 47.7, inclinacion: 12, friccion_estatica: 0.8, direccion: 'derecha', nombre: "Curva 1 (180°)" },
      { tipo: 'recta', longitud: 200, inclinacion: 0, nombre: "Recta Trasera" },
      { tipo: 'curva', longitud: 150, radio_curva: 47.7, inclinacion: 12, friccion_estatica: 0.8, direccion: 'derecha', nombre: "Curva 2 (180°)" }
    ]
  },
  serpiente: {
    nombre: "Circuito Serpiente (S-Curves)",
    tramos: [
      { tipo: 'recta', longitud: 100, inclinacion: 0, nombre: "Recta de Entrada" },
      { tipo: 'curva', longitud: 80, radio_curva: 50.9, inclinacion: 10, friccion_estatica: 0.8, direccion: 'derecha', nombre: "Curva Derecha (90°)" },
      { tipo: 'recta', longitud: 80, inclinacion: 0, nombre: "Recta Intermedia" },
      { tipo: 'curva', longitud: 80, radio_curva: 50.9, inclinacion: 10, friccion_estatica: 0.8, direccion: 'izquierda', nombre: "Curva Izquierda (90°)" },
      { tipo: 'recta', longitud: 160, inclinacion: 0, nombre: "Recta de Salida" }
    ]
  },
  autodromo: {
    nombre: "Autódromo de Ingeniería UTP",
    tramos: [
      { tipo: 'recta', longitud: 150, inclinacion: 0, nombre: "Recta de Aceleración" },
      { tipo: 'curva', longitud: 120, radio_curva: 80, inclinacion: 15, friccion_estatica: 0.85, direccion: 'derecha', nombre: "Curva Rápida Peraltada" },
      { tipo: 'recta', longitud: 100, inclinacion: 0, nombre: "Recta Intermedia" },
      { tipo: 'curva', longitud: 80, radio_curva: 40, inclinacion: 5, friccion_estatica: 0.70, direccion: 'izquierda', nombre: "Curva Cerrada" },
      { tipo: 'recta', longitud: 150, inclinacion: 0, nombre: "Recta de Frenado" }
    ]
  },
  personalizada: {
    nombre: "Pista Personalizada UTP",
    tramos: []
  }
};

function App() {
  // Pestaña activa ('simulador' o 'historial' o 'resolutor')
  const [tab, setTab] = useState('simulador');

  // Estados del Reproductor y Quiz de Autoevaluación
  const [factorVelocidad, setFactorVelocidad] = useState(1.0);
  const [quizPregunta, setQuizPregunta] = useState('');
  const [quizRespuestaCorrecta, setQuizRespuestaCorrecta] = useState(0);
  const [quizRespuestaUsuario, setQuizRespuestaUsuario] = useState('');
  const [quizVerificado, setQuizVerificado] = useState(false);
  const [quizEsCorrecto, setQuizEsCorrecto] = useState(false);
  const [quizProcedimiento, setQuizProcedimiento] = useState([]);
  const [quizParams, setQuizParams] = useState(null);

  // Estados para el visor 3D y trazado
  const [vista3d, setVista3d] = useState(false);
  const [trazadoPista, setTrazadoPista] = useState('recta');
  const [modoCamara, setModoCamara] = useState('Follow');
  const [vueloCrucero, setVueloCrucero] = useState(false);
  const modoCamaraRef = useRef('Follow');
  useEffect(() => {
    modoCamaraRef.current = modoCamara;
  }, [modoCamara]);

  // Estados del creador de pista personalizada
  const [customTramos, setCustomTramos] = useState([
    { tipo: 'recta', longitud: 150, inclinacion: 0, nombre: "Recta Inicial" },
    { tipo: 'curva', longitud: 100, radio_curva: 60, inclinacion: 10, friccion_estatica: 0.8, direccion: 'derecha', nombre: "Curva 1" }
  ]);
  const [nuevoTipoTramo, setNuevoTipoTramo] = useState('recta');
  const [nuevoLongitud, setNuevoLongitud] = useState(100);
  const [nuevoInclinacion, setNuevoInclinacion] = useState(0);
  const [nuevoRadio, setNuevoRadio] = useState(60);
  const [nuevoPeralte, setNuevoPeralte] = useState(8);
  const [nuevoDireccion, setNuevoDireccion] = useState('derecha');

  // Estado para el Resolutor de Problemas de Ingeniería UTP
  const [casoSeleccionado, setCasoSeleccionado] = useState('A');
  const [paramsA, setParamsA] = useState({
    masa: 1500,
    v_inicial: 25,
    fuerza_freno: 8000,
    inclinacion: 0,
    friccion_calzada: 0.8,
    x_freno: 100
  });
  const [paramsB, setParamsB] = useState({
    masa: 1200,
    v_inicial: -4,
    y_falla: 60,
    fuerza_freno: 16000
  });
  const [paramsC, setParamsC] = useState({
    masa: 45000,
    empuje: 90000,
    friccion_pista: 0.02,
    l_pista: 1200,
    v_despegue: 80,
    v_inicial: 0
  });
  const [paramsLibre, setParamsLibre] = useState({
    escenario: 'Automovil',
    masa: 1500,
    v_inicial: 25,
    v_final: 0,
    fuerza: 8000,
    inclinacion: 0,
    friccion: 0.8,
    tipo_movimiento: 'Frenado',
    masa_2: 1800,
    radio_curva: 80,
    friccion_estatica: 0.8
  });
  const [paramsD, setParamsD] = useState({
    masa: 15,
    masa_2: 25,
    v_inicial: 0,
    v_final: 5
  });
  const [paramsE, setParamsE] = useState({
    masa: 8000,
    inclinacion: 8,
    friccion: 0.1,
    fuerza: 20000,
    v_inicial: 0,
    v_final: 15
  });
  const [paramsF, setParamsF] = useState({
    masa: 1200,
    radio_curva: 80,
    inclinacion: 10,
    friccion_estatica: 0.8,
    friccion: 0.4,
    fuerza: 4000,
    v_inicial: 25,
    v_final: 15,
    tipo_movimiento: 'Frenado'
  });
  const [solucionResultado, setSolucionResultado] = useState(null);
  const [cargandoSolucion, setCargandoSolucion] = useState(false);
  const [modoProblemaActivo, setModoProblemaActivo] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);


  // Estado del escenario activo: 'Automovil', 'Camion', 'Motocicleta', 'Elevador', 'Avion'
  const [escenario, setEscenario] = useState('Automovil');

  // Parámetros físicos editables (sincronizados con inputs y sliders)
  const [masa, setMasa] = useState(1500); // kg
  const [fuerza, setFuerza] = useState(8000); // N
  const [vInicial, setVInicial] = useState(20); // m/s (Solo vehículos terrestres)
  const [entorno, setEntorno] = useState('Seco'); // Clima / Entorno
  const [resistenciaAire, setResistenciaAire] = useState(0.30); // Cd * A o drag coeff b
  const [sustentacionCoef, setSustentacionCoef] = useState(0.5); // Para avión
  const [alturaMax, setAlturaMax] = useState(100); // Para elevador
  const [inclinacion, setInclinacion] = useState(0); // grados, rampa/pendiente (-15 a 30)
  const [modo, setModo] = useState('Aceleracion'); // 'Aceleracion' o 'Frenado' (Solo terrestre)
  const modoRef = useRef('Aceleracion');
  modoRef.current = modo;

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo);
    const conf = escenariosConfig[escenario];
    const defVel = conf ? (conf.v_ini_def || 25) : 25;
    if (nuevoModo === 'Frenado') {
      if (parseFloat(vInicial) === 0) {
        setVInicial(defVel);
      }
    } else if (nuevoModo === 'Aceleracion') {
      if (parseFloat(vInicial) === defVel) {
        setVInicial(0);
      }
    }
  };

  const [masa2, setMasa2] = useState(1800); // kg, para escenario Atwood (polea)
  const [friccionEstatica, setFriccionEstatica] = useState(0.90); // mu_s, fricción estática
  const [perfilFuerza, setPerfilFuerza] = useState('Constante'); // 'Constante', 'Impulso', 'Rampa', 'Senoidal'
  const [mostrarTeorica, setMostrarTeorica] = useState(true); // alternar visualización de curva teórica ideal
  const [radioCurva, setRadioCurva] = useState(80); // m, radio de curva para escenario Curva
  const [frenoManual, setFrenoManual] = useState(false);
  const xAlFrenarRef = useRef(null);
  const tAlFrenarRef = useRef(null);

  // Telemetría en tiempo real de la simulación
  const [telemetria, setTelemetria] = useState({
    t: 0.0,
    x: 0.0,
    y: 0.0, // Altitud para el avión
    v_y: 0.0, // Velocidad vertical para el avión
    v: 0.0,
    a: 0.0,
    despego: false,
    sustentacion: 0.0,
    fuerzas: {
      Traccion: 0,
      Peso: 0,
      Normal: 0,
      Frenado: 0,
      Friccion: 0,
      ResistenciaAire: 0,
      FuerzaNeta: 0
    },
    explicacion: 'Listo para iniciar simulación física de Segunda Ley de Newton.',
    terminado: false
  });

  // Pasos registrados en el ensayo actual
  const [pasos, setPasos] = useState([]);

  // Historial cargado desde la Base de Datos Django
  const [historial, setHistorial] = useState([]);

  // Estado de ejecución y control de errores
  const [isRunning, setIsRunning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Punto resaltado al pasar el cursor sobre los gráficos (Hover Tooltip)
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Referencias para animación
  const requestRef = useRef();
  const lastUpdateRef = useRef();
  const canvasRef = useRef(null);
  const threeContainerRef = useRef(null);
  const threeSceneRef = useRef(null);
  const telemetriaRef = useRef(null);
  const pasosRef = useRef([]);
  const cargandoPresetRef = useRef(false);

  const obtenerPuntoEnPista = (s) => {
    if (trazadoPista === 'recta') {
      pistasCompuestas.recta.tramos[0].inclinacion = parseFloat(inclinacion);
    }
    if (trazadoPista === 'curva') {
      pistasCompuestas.curva.tramos[0].radio_curva = parseFloat(radioCurva);
      pistasCompuestas.curva.tramos[0].inclinacion = parseFloat(inclinacion);
      pistasCompuestas.curva.tramos[0].friccion_estatica = parseFloat(friccionEstatica);
    }
    if (trazadoPista === 'personalizada') {
      pistasCompuestas.personalizada.tramos = customTramos;
    }
    const preset = pistasCompuestas[trazadoPista] || pistasCompuestas.recta;

    // Calcular el minY acumulando todos los tramos primero para evitar penetración del césped (y < 0)
    let tmpY = 0;
    let minY = 0;
    let tmpHeading = 0;
    for (let i = 0; i < preset.tramos.length; i++) {
      const tramo = preset.tramos[i];
      const len = tramo.longitud;
      if (tramo.tipo === 'recta') {
        const thetaLocal = (tramo.inclinacion * Math.PI) / 180.0;
        tmpY += len * Math.sin(thetaLocal);
      } else {
        const R = tramo.radio_curva;
        const angle = len / R;
        const dirSign = tramo.direccion === 'izquierda' ? -1 : 1;
        tmpHeading += dirSign * angle;
      }
      if (tmpY < minY) {
        minY = tmpY;
      }
    }
    const yOffset = minY < 0 ? -minY : 0.0;

    let acumulado = 0;
    let posX = 0;
    let posY = 0;
    let posZ = 0;
    let heading = 0;
    
    for (let i = 0; i < preset.tramos.length; i++) {
      const tramo = preset.tramos[i];
      const len = tramo.longitud;
      
      if (s < acumulado + len) {
        const localS = s - acumulado;
        if (tramo.tipo === 'recta') {
          const thetaLocal = (tramo.inclinacion * Math.PI) / 180.0;
          posX += localS * Math.sin(heading) * Math.cos(thetaLocal);
          posY += localS * Math.sin(thetaLocal);
          posZ += localS * Math.cos(heading) * Math.cos(thetaLocal);
          return {
            x: posX,
            y: posY + yOffset,
            z: posZ,
            heading: heading,
            peralte: 0,
            nombre: tramo.nombre,
            tipo: 'recta'
          };
        } else {
          const R = tramo.radio_curva;
          const thetaPeralte = (tramo.inclinacion * Math.PI) / 180.0;
          const angle = localS / R;
          const dirSign = tramo.direccion === 'izquierda' ? -1 : 1;
          
          const centerX = posX + dirSign * R * Math.cos(heading);
          const centerZ = posZ - dirSign * R * Math.sin(heading);
          
          const finalHeading = heading + dirSign * angle;
          const finalX = centerX - dirSign * R * Math.cos(finalHeading);
          const finalZ = centerZ + dirSign * R * Math.sin(finalHeading);
          
          return {
            x: finalX,
            y: posY + yOffset,
            z: finalZ,
            heading: finalHeading,
            peralte: dirSign * thetaPeralte,
            nombre: tramo.nombre,
            tipo: 'curva'
          };
        }
      }
      
      if (tramo.tipo === 'recta') {
        const thetaLocal = (tramo.inclinacion * Math.PI) / 180.0;
        posX += len * Math.sin(heading) * Math.cos(thetaLocal);
        posY += len * Math.sin(thetaLocal);
        posZ += len * Math.cos(heading) * Math.cos(thetaLocal);
      } else {
        const R = tramo.radio_curva;
        const angle = len / R;
        const dirSign = tramo.direccion === 'izquierda' ? -1 : 1;
        
        const centerX = posX + dirSign * R * Math.cos(heading);
        const centerZ = posZ - dirSign * R * Math.sin(heading);
        
        heading += dirSign * angle;
        posX = centerX - dirSign * R * Math.cos(heading);
        posZ = centerZ + dirSign * R * Math.sin(heading);
      }
      acumulado += len;
    }
    
    // Proyectar de manera infinita sobre la tangente y pendiente final si el recorrido supera la longitud de la pista
    const deltaS = Math.max(0, s - acumulado);
    const finalHeading = heading;
    const lastTramo = preset.tramos[preset.tramos.length - 1];
    const thetaLocal = lastTramo && lastTramo.tipo === 'recta' ? (lastTramo.inclinacion * Math.PI) / 180.0 : 0.0;
    
    posX += deltaS * Math.sin(finalHeading) * Math.cos(thetaLocal);
    posY += deltaS * Math.sin(thetaLocal);
    posZ += deltaS * Math.cos(finalHeading) * Math.cos(thetaLocal);
    
    return {
      x: posX,
      y: posY + yOffset,
      z: posZ,
      heading: finalHeading,
      peralte: 0,
      nombre: "Vuelo Libre / Recorrido Extra",
      tipo: 'recta'
    };
  };

  // Valor original de la velocidad inicial al arrancar el ensayo
  const vInicialCorrida = useRef(20);

  // Nubes de fondo generadas al azar para paralaje
  const nubesRef = useRef([
    { x: 100, y: 40, w: 60, speed: 0.2 },
    { x: 320, y: 70, w: 85, speed: 0.4 },
    { x: 550, y: 30, w: 70, speed: 0.1 },
    { x: 750, y: 80, w: 90, speed: 0.3 }
  ]);

  // Diccionario local de escenarios (Configuración, Rangos, Valores por defecto)
  const escenariosConfig = {
    Automovil: {
      nombre: "Automóvil de Pasajeros",
      icono: "fa-car",
      descripcion: "Dinámica clásica de aceleración y frenado para un sedán deportivo.",
      masa_def: 1500, masa_min: 500, masa_max: 4000, masa_unidad: "kg",
      fuerza_def: 8000, fuerza_min: 0, fuerza_max: 30000, fuerza_unidad: "N",
      fuerza_label: "Fuerza del Motor / Freno",
      v_ini_def: 25, v_ini_min: 0, v_ini_max: 50,
      b_def: 0.30, b_min: 0.1, b_max: 0.8,
      b_label: "Arrastre Aire (Cd * A)",
      climas: {
        "Seco": 0.80,
        "Mojado": 0.50,
        "Hielo": 0.15
      }
    },
    Camion: {
      nombre: "Camión de Carga Pesada",
      icono: "fa-truck",
      descripcion: "Análisis de inercia y frenado crítico para un vehículo de transporte pesado.",
      masa_def: 8000, masa_min: 3000, masa_max: 25000, masa_unidad: "kg",
      fuerza_def: 25000, fuerza_min: 0, fuerza_max: 80000, fuerza_unidad: "N",
      fuerza_label: "Fuerza Motor / Frenado",
      v_ini_def: 18, v_ini_min: 0, v_ini_max: 40,
      b_def: 0.65, b_min: 0.4, b_max: 1.8,
      b_label: "Arrastre Aire (Cd * A)",
      climas: {
        "Seco": 0.70,
        "Mojado": 0.40,
        "Hielo": 0.12
      }
    },
    Motocicleta: {
      nombre: "Motocicleta Deportiva",
      icono: "fa-motorcycle",
      descripcion: "Alta relación potencia-peso. Altamente aerodinámica y ligera.",
      masa_def: 280, masa_min: 100, masa_max: 600, masa_unidad: "kg",
      fuerza_def: 4500, fuerza_min: 0, fuerza_max: 15000, fuerza_unidad: "N",
      fuerza_label: "Fuerza Motor / Frenado",
      v_ini_def: 0, v_ini_min: 0, v_ini_max: 50,
      b_def: 0.45, b_min: 0.2, b_max: 1.0,
      b_label: "Arrastre Aire (Cd * A)",
      climas: {
        "Seco": 0.85,
        "Mojado": 0.55,
        "Hielo": 0.18
      }
    },
    Elevador: {
      nombre: "Ascensor Minero o de Obra",
      icono: "fa-elevator",
      descripcion: "Dinámica vertical donde compiten la gravedad, la tensión del cable y el arrastre viscoso.",
      masa_def: 1200, masa_min: 200, masa_max: 6000, masa_unidad: "kg",
      fuerza_def: 15000, fuerza_min: 0, fuerza_max: 80000, fuerza_unidad: "N",
      fuerza_label: "Tensión del Cable (T)",
      v_ini_def: 0, v_ini_min: -10, v_ini_max: 10,
      b_def: 0.80, b_min: 0.0, b_max: 5.0,
      b_label: "Coeficiente de Arrastre (b)",
      climas: {
        "Vacío": 0.00,
        "Aire": 0.50,
        "Agua (Fluido Viscoso)": 5.00
      }
    },
    Avion: {
      nombre: "Avión Comercial (Despegue)",
      icono: "fa-plane",
      descripcion: "Física del despegue en pista. Al despegar, asciende dinámicamente según la sustentación vertical.",
      masa_def: 35000, masa_min: 10000, masa_max: 150000, masa_unidad: "kg",
      fuerza_def: 200000, fuerza_min: 20000, fuerza_max: 300000, fuerza_unidad: "N",
      fuerza_label: "Fuerza de Empuje del Turborreactor",
      v_ini_def: 0, v_ini_min: 0, v_ini_max: 20,
      b_def: 0.15, b_min: 0.05, b_max: 0.5,
      b_label: "Arrastre Aire (b)",
      sustentacion_coef_def: 0.5,
      sustentacion_coef_min: 0.1,
      sustentacion_coef_max: 2.0,
      climas: {
        "Pista Seca": 0.02,
        "Pista Mojada": 0.05,
        "Pista Nevada": 0.10
      }
    },
    Atwood: {
      nombre: "Máquina de Atwood",
      icono: "fa-circle-notch",
      descripcion: "Análisis de dos masas acopladas por una cuerda inextensible suspendida de una polea fija ideal.",
      masa_def: 15, masa_min: 1, masa_max: 100, masa_unidad: "kg",
      masa_label: "Masa Izquierda (m1)",
      masa2_def: 25, masa2_min: 1, masa2_max: 100, masa2_unidad: "kg",
      fuerza_def: 0, fuerza_min: 0, fuerza_max: 0, fuerza_unidad: "N",
      fuerza_label: "Tensión de Cuerda (T)",
      v_ini_def: 0, v_ini_min: 0, v_ini_max: 0,
      b_def: 0.05, b_min: 0.0, b_max: 1.0,
      b_label: "Arrastre del Aire (b)",
      climas: {
        "Vacío (Sin fricción)": 0.00,
        "Aire": 0.05,
        "Agua (Medio Viscoso)": 0.80
      }
    },
    Curva: {
      nombre: "Curva Peraltada",
      icono: "fa-road",
      descripcion: "Análisis dinámico de fuerza centrípeta, peralte y límites de derrape lateral en curvas de carretera.",
      masa_def: 1200, masa_min: 500, masa_max: 4000, masa_unidad: "kg",
      fuerza_def: 4000, fuerza_min: 0, fuerza_max: 20000, fuerza_unidad: "N",
      fuerza_label: "Fuerza Motor / Frenado",
      v_ini_def: 25, v_ini_min: 0, v_ini_max: 50,
      b_def: 0.30, b_min: 0.05, b_max: 1.0,
      b_label: "Arrastre Aire (Cd * A)",
      radio_curva_def: 80, radio_curva_min: 20, radio_curva_max: 300,
      radio_curva_label: "Radio Curva (R)",
      peralte_def: 10, peralte_min: 0, peralte_max: 45,
      peralte_label: "Ángulo Peralte (θ)",
      climas: {
        "Seco": 0.70,
        "Mojado": 0.40,
        "Hielo": 0.15
      }
    }
  };

  // ==========================================
  // EFECTOS DE INICIALIZACIÓN
  // ==========================================
  useEffect(() => {
    cargarHistorial();
    resetearSimulacion();
  }, []);

  useEffect(() => {
    if (cargandoPresetRef.current) return;
    const conf = escenariosConfig[escenario];
    if (conf) {
      setVInicial(conf.v_ini_def);
      setResistenciaAire(conf.b_def);
      setInclinacion(0);
      
      const climasDisponibles = Object.keys(conf.climas);
      setEntorno(climasDisponibles[0]);
      
      if (escenario === 'Avion') {
        // Inicialización aleatoria dinámica para evitar despegues en distancias fijas repetitivas
        const randomMasa = Math.round((28000 + Math.random() * 14000) / 1000) * 1000; // 28k a 42k kg
        const randomEmpuje = Math.round((170000 + Math.random() * 60000) / 10000) * 10000; // 170k a 230k N
        const randomSust = parseFloat((0.45 + Math.random() * 0.25).toFixed(2)); // 0.45 a 0.70
        setMasa(randomMasa);
        setFuerza(randomEmpuje);
        setSustentacionCoef(randomSust);
      } else {
        setMasa(conf.masa_def);
        setFuerza(conf.fuerza_def);
        setSustentacionCoef(0.5);
      }

      if (escenario === 'Elevador') {
        setAlturaMax(100);
      } else if (escenario === 'Atwood') {
        setMasa2(conf.masa2_def);
      } else if (escenario === 'Curva') {
        setRadioCurva(conf.radio_curva_def);
        setInclinacion(conf.peralte_def);
      }
      
      // Inicializar fricción estática mayor que fricción cinética
      if (conf.climas[climasDisponibles[0]] !== undefined) {
        setFriccionEstatica(Math.min(1.0, conf.climas[climasDisponibles[0]] + 0.15));
      } else {
        setFriccionEstatica(0.80);
      }
      setPerfilFuerza('Constante');
      setModo('Aceleracion');
    }
  }, [escenario]);

  useEffect(() => {
    if (cargandoPresetRef.current) return;
    const conf = escenariosConfig[escenario];
    if (conf && conf.climas && conf.climas[entorno] !== undefined) {
      setFriccionEstatica(Math.min(1.0, conf.climas[entorno] + 0.15));
    }
  }, [entorno, escenario]);

  useEffect(() => {
    resetearSimulacion();
  }, [masa, fuerza, vInicial, entorno, resistenciaAire, sustentacionCoef, alturaMax, inclinacion, modo, masa2, friccionEstatica, perfilFuerza, radioCurva, vueloCrucero]);

  // Ejecutar el bucle de animación de física en base a ticks de frames (desacoplado de pasos para optimizar rendimiento)
  useEffect(() => {
    if (isRunning) {
      lastUpdateRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animarLoop);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isRunning]);

  // Redibujar el escenario cada vez que cambien magnitudes clave
  useEffect(() => {
    dibujarEscenario();
  }, [
    telemetria.x, telemetria.y, telemetria.v, escenario, telemetria.despego, 
    inclinacion, sidebarCollapsed, radioCurva, vista3d, tab, entorno, 
    friccionEstatica, perfilFuerza, masa, fuerza, vInicial, resistenciaAire, 
    sustentacionCoef
  ]);

  // ==========================================
  // INICIALIZACIÓN Y RENDERIZADO 3D (THREE.JS)
  // ==========================================
  useEffect(() => {
    if (!vista3d || tab !== 'simulador' || !threeContainerRef.current) {
      if (threeSceneRef.current) {
        const t = threeSceneRef.current;
        t.container.innerHTML = '';
        if (t.animationFrameId) cancelAnimationFrame(t.animationFrameId);
        threeSceneRef.current = null;
      }
      return;
    }

    const container = threeContainerRef.current;
    container.innerHTML = '';

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 200;

    const eLower = (entorno || '').toLowerCase();
    let skyColorHex = 0xbae6fd; // Seco: celeste soleado
    let fogColorHex = 0xe0f2fe; // Seco: niebla clara
    let floorColorHex = 0x16a34a; // Seco: verde césped
    let roadColorHex = 0x1c1917; // Gris asfalto
    let roadRoughness = 0.85;
    let roadMetalness = 0.1;
    let gridColor1 = 0x15803d;
    let gridColor2 = 0x86efac;
    let foliageColorHex = 0x15803d;

    if (eLower.includes('mojado') || eLower.includes('agua')) {
      // Mojado / Lluvia / Tormenta
      skyColorHex = 0x64748b; // Gris tormenta
      fogColorHex = 0x94a3b8; // Niebla plomiza
      floorColorHex = 0x14532d; // Verde oscuro húmedo
      roadColorHex = 0x0c0a09; // Asfalto negro mojado
      roadRoughness = 0.15;
      roadMetalness = 0.5;
      gridColor1 = 0x14532d;
      gridColor2 = 0x4ade80;
      foliageColorHex = 0x064e3b;
    } else if (eLower.includes('hielo') || eLower.includes('nevada')) {
      // Nevado / Hielo
      skyColorHex = 0xe2e8f0; // Gris glacial
      fogColorHex = 0xf1f5f9; // Niebla de ventisca
      floorColorHex = 0xf8fafc; // Nieve blanca
      roadColorHex = 0x38bdf8; // Azul hielo cristalino
      roadRoughness = 0.05;
      roadMetalness = 0.8;
      gridColor1 = 0x94a3b8;
      gridColor2 = 0xe2e8f0;
      foliageColorHex = 0xffffff; // Nevado
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(skyColorHex);
    scene.fog = new THREE.Fog(fogColorHex, 150, 600); // Niebla lineal suave

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 15, -25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = false; // Desactivar sombras dinámicas para rendimiento óptimo
    container.appendChild(renderer.domElement);

    let controls = null;
    if (THREE.OrbitControls) {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2.05;
      controls.minDistance = 3.0;
      controls.maxDistance = 150.0;
      controls.addEventListener('start', () => {
        setModoCamara('Orbit');
      });
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55); // Aumentar luz ambiente diurna
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.95);
    dirLight.position.set(80, 120, -50);
    dirLight.castShadow = false; // Sin sombras costosas
    scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, floorColorHex, 0.25); // Hemisferio diurno adaptable
    scene.add(hemiLight);

    const gridHelper = new THREE.GridHelper(2000, 120, gridColor1, gridColor2);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Suelo de césped gigante (10000x10000m) para evitar bordes visibles en vuelo
    const floorGeom = new THREE.PlaneGeometry(10000, 10000);
    const floorMat = new THREE.MeshStandardMaterial({
      color: floorColorHex,
      roughness: 0.95,
      metalness: 0.02
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.08;
    scene.add(floor);

    // Campo de estrellas (para altitudes elevadas)
    const starsGeom = new THREE.BufferGeometry();
    const starsCount = 500;
    const starsPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount; i++) {
      starsPositions[i * 3] = (Math.random() - 0.5) * 1500;
      starsPositions[i * 3 + 1] = 100 + Math.random() * 200;
      starsPositions[i * 3 + 2] = (Math.random() - 0.5) * 1500;
    }
    starsGeom.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.9,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85
    });
    const starField = new THREE.Points(starsGeom, starsMat);
    scene.add(starField);

    // Nubes procedimentales removidas para optimizar draw calls y CPU overhead en móviles y Opera


    if (trazadoPista === 'personalizada') {
      pistasCompuestas.personalizada.tramos = customTramos;
    }
    const preset = pistasCompuestas[trazadoPista] || pistasCompuestas.recta;
    const longitudTotal = preset.tramos.reduce((acc, t) => acc + t.longitud, 0);

    const W = 7.0;

    // Distantes montañas low-poly para mejorar el horizonte del paisaje (garantizado fuera de la pista)
    if (escenario !== 'Avion') {
      const mountainGeom = new THREE.ConeGeometry(40, 75, 4);
      const mountainMat = new THREE.MeshLambertMaterial({ 
        color: 0x475569, // Gris pizarra elegante
        side: THREE.DoubleSide
      });
      for (let mIdx = 0; mIdx < 10; mIdx++) {
        const mountain = new THREE.Mesh(mountainGeom, mountainMat);
        const sPos = (mIdx / 10) * longitudTotal;
        const p = obtenerPuntoEnPista(sPos);
        
        const heading = p.heading;
        
        // Calcular vector perpendicular en el plano X-Z (normal lateral a la trayectoria)
        const perpX = Math.cos(heading);
        const perpZ = -Math.sin(heading);
        
        // Colocar a la izquierda o derecha alternando, con un offset seguro de 160 a 220 metros
        const lado = mIdx % 2 === 0 ? -1 : 1;
        const offsetPista = 160 + Math.random() * 60;
        
        const mx = p.x + lado * offsetPista * perpX;
        const mz = p.z + lado * offsetPista * perpZ;
        
        mountain.position.set(mx, 35, mz); // Altura de base ajustada a 35m
        scene.add(mountain);
      }

      // Pilares de soporte para que la pista inclinada o espiral no parezca flotando en el aire
      const distEntrePilares = 20.0;
      const numPilares = Math.floor(longitudTotal / distEntrePilares);
      const pillarMat = new THREE.MeshLambertMaterial({ color: 0x334155 }); // Gris oscuro hormigón
      for (let pIdx = 1; pIdx < numPilares; pIdx++) {
        const sPos = pIdx * distEntrePilares;
        const pt = obtenerPuntoEnPista(sPos);
        if (pt.y > 0.8) {
          const pillarHeight = pt.y + 0.08;
          const pillarGeom = new THREE.CylinderGeometry(0.7, 1.1, pillarHeight, 6);
          const pillarMesh = new THREE.Mesh(pillarGeom, pillarMat);
          pillarMesh.position.set(pt.x, (pt.y - 0.08) / 2, pt.z);
          scene.add(pillarMesh);
        }
      }

      // Generar túneles en el inicio/fin si hay inclinación (para evitar que la pista parezca flotar cortada en el aire)
      const crearPortalTunel = (pt, headingAngle, targetScene, isStart = true) => {
        const portalGroup = new THREE.Group();
        portalGroup.position.set(pt.x, pt.y, pt.z);
        portalGroup.rotation.y = headingAngle;

        // 1. Una montaña/colina rocosa gigante de fondo que cubre el portal
        const mountainGeom = new THREE.SphereGeometry(15, 8, 8);
        const mountainMat = new THREE.MeshLambertMaterial({ 
          color: 0x475569, // color de roca pizarra
          flatShading: true // Sombreado plano low-poly para que parezca roca real tallada
        });
        const mountainMesh = new THREE.Mesh(mountainGeom, mountainMat);
        // Hacer la montaña ancha y estirada lateralmente (eje X) para simular una ladera/desfiladero
        mountainMesh.scale.set(3.0, 1.5, 0.8);
        // Colocar el centro de la colina detrás del portal (z = -12 para inicio, z = 12 para fin)
        mountainMesh.position.set(0, -2.0, isStart ? -12.0 : 12.0);
        portalGroup.add(mountainMesh);

        // 2. Estructura interna del túnel (un tubo/sleeve rectangular de concreto de 10m de profundidad)
        const archMat = new THREE.MeshLambertMaterial({ color: 0x334155 }); // Gris oscuro
        const zCenter = isStart ? -5.0 : 5.0;

        // Pared izquierda del túnel
        const wallL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.0, 10.0), archMat);
        wallL.position.set(-4.0, 2.5, zCenter);
        portalGroup.add(wallL);

        // Pared derecha del túnel
        const wallR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.0, 10.0), archMat);
        wallR.position.set(4.0, 2.5, zCenter);
        portalGroup.add(wallR);

        // Techo del túnel
        const ceil = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.8, 10.0), archMat);
        ceil.position.set(0, 5.0, zCenter);
        portalGroup.add(ceil);

        // 3. Arco decorativo del portal de entrada (en z = 0)
        // Pilar izquierdo
        const pillarL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.2, 2.2), archMat);
        pillarL.position.set(-4.0, 2.6, 0);
        portalGroup.add(pillarL);

        // Pilar derecho
        const pillarR = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.2, 2.2), archMat);
        pillarR.position.set(4.0, 2.6, 0);
        portalGroup.add(pillarR);

        // Viga superior
        const beam = new THREE.Mesh(new THREE.BoxGeometry(9.2, 1.2, 2.2), archMat);
        beam.position.set(0, 5.2, 0);
        portalGroup.add(beam);

        // 4. El interior del túnel (Fondo negro que simula oscuridad al fondo del tubo)
        const backWallGeom = new THREE.PlaneGeometry(8.0, 5.0);
        const backWallMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
        const backWall = new THREE.Mesh(backWallGeom, backWallMat);
        backWall.position.set(0, 2.5, isStart ? -9.8 : 9.8);
        portalGroup.add(backWall);

        targetScene.add(portalGroup);
      };

      if (Math.abs(inclinacion) > 1.0) {
        if (inclinacion < 0) {
          // Bajada: el inicio de la pista está elevado en el aire, colocamos el túnel al inicio (x = 0)
          const ptStart = obtenerPuntoEnPista(0);
          crearPortalTunel(ptStart, obtenerPuntoEnPista(0.1).heading, scene, true);
        } else {
          // Subida: el fin de la pista está elevado en el aire, colocamos el túnel al final (x = longitudTotal)
          const ptEnd = obtenerPuntoEnPista(longitudTotal);
          crearPortalTunel(ptEnd, obtenerPuntoEnPista(longitudTotal - 0.1).heading, scene, false);
        }
      }
    }

    // Árboles removidos para acelerar la velocidad del renderizado en dispositivos móviles


    const steps = Math.ceil(longitudTotal / 2.0);
    const roadVertices = [];
    const roadUVs = [];
    const roadIndices = [];

    const centerLineVertices = [];
    const leftBorderVertices = [];
    const rightBorderVertices = [];

    for (let i = 0; i <= steps; i++) {
      const s = (i / steps) * longitudTotal;
      const p = obtenerPuntoEnPista(s);
      
      const heading = p.heading;
      const peralte = p.peralte;

      const lx = Math.cos(heading) * Math.cos(peralte);
      const ly = Math.sin(peralte);
      const lz = -Math.sin(heading) * Math.cos(peralte);

      const px_L = p.x - (W / 2) * lx;
      const py_L = p.y - (W / 2) * ly;
      const pz_L = p.z - (W / 2) * lz;

      const px_R = p.x + (W / 2) * lx;
      const py_R = p.y + (W / 2) * ly;
      const pz_R = p.z + (W / 2) * lz;

      roadVertices.push(px_L, py_L, pz_L);
      roadVertices.push(px_R, py_R, pz_R);

      const vCoord = s / 8.0;
      roadUVs.push(0, vCoord);
      roadUVs.push(1, vCoord);

      if (i < steps) {
        const idx = i * 2;
        roadIndices.push(idx, idx + 1, idx + 2);
        roadIndices.push(idx + 1, idx + 3, idx + 2);
      }

      centerLineVertices.push(new THREE.Vector3(p.x, p.y + 0.02, p.z));
      leftBorderVertices.push(new THREE.Vector3(px_L, py_L + 0.02, pz_L));
      rightBorderVertices.push(new THREE.Vector3(px_R, py_R + 0.02, pz_R));
    }

    const roadGeom = new THREE.BufferGeometry();
    roadGeom.setAttribute('position', new THREE.Float32BufferAttribute(roadVertices, 3));
    roadGeom.setAttribute('uv', new THREE.Float32BufferAttribute(roadUVs, 2));
    roadGeom.setIndex(roadIndices);
    roadGeom.computeVertexNormals();

    const roadMat = new THREE.MeshLambertMaterial({ 
      color: roadColorHex, 
      side: THREE.DoubleSide 
    });
    const roadMesh = new THREE.Mesh(roadGeom, roadMat);
    roadMesh.receiveShadow = true;
    scene.add(roadMesh);

    const centerLineGeom = new THREE.BufferGeometry().setFromPoints(centerLineVertices);
    const centerLineMat = new THREE.LineBasicMaterial({ color: 0xeab308, linewidth: 2 });
    const centerLineMesh = new THREE.Line(centerLineGeom, centerLineMat);
    scene.add(centerLineMesh);

    const leftBorderGeom = new THREE.BufferGeometry().setFromPoints(leftBorderVertices);
    const borderMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    const leftBorderMesh = new THREE.Line(leftBorderGeom, borderMat);
    scene.add(leftBorderMesh);

    const rightBorderGeom = new THREE.BufferGeometry().setFromPoints(rightBorderVertices);
    const rightBorderMesh = new THREE.Line(rightBorderGeom, borderMat);
    scene.add(rightBorderMesh);

    // --- DIBUJAR PÓRTICO DE META EN 3D ---
    if (escenario !== 'Elevador' && escenario !== 'Atwood') {
      const finalPt = obtenerPuntoEnPista(longitudTotal);
      const finalHeading = finalPt.heading;
      const finalPeralte = finalPt.peralte;

      // Normal lateral de la pista al final
      const flx = Math.cos(finalHeading) * Math.cos(finalPeralte);
      const fly = Math.sin(finalPeralte);
      const flz = -Math.sin(finalHeading) * Math.cos(finalPeralte);

      // Altura de los postes
      const posteHeight = 5.5;

      // Posición del poste izquierdo y derecho
      const offsetL = W / 2 + 0.35;
      const pl_x = finalPt.x - offsetL * flx;
      const pl_y = finalPt.y - offsetL * fly + posteHeight / 2;
      const pl_z = finalPt.z - offsetL * flz;

      const pr_x = finalPt.x + offsetL * flx;
      const pr_y = finalPt.y + offsetL * fly + posteHeight / 2;
      const pr_z = finalPt.z + offsetL * flz;

      // Poste Izquierdo (Cilindro de metal)
      const posteGeom = new THREE.CylinderGeometry(0.1, 0.1, posteHeight, 8);
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
      
      const posteL = new THREE.Mesh(posteGeom, metalMat);
      posteL.position.set(pl_x, pl_y, pl_z);
      scene.add(posteL);

      // Poste Derecho
      const posteR = new THREE.Mesh(posteGeom, metalMat);
      posteR.position.set(pr_x, pr_y, pr_z);
      scene.add(posteR);

      // Viga superior horizontal (conecta postes)
      const vigaLength = W + 0.7;
      const vigaGeom = new THREE.BoxGeometry(vigaLength, 0.3, 0.3);
      const viga = new THREE.Mesh(vigaGeom, metalMat);
      
      // Posición media de la viga
      const viga_x = (pl_x + pr_x) / 2;
      const viga_y = finalPt.y + posteHeight - 0.15;
      const viga_z = (pl_z + pr_z) / 2;
      
      viga.position.set(viga_x, viga_y, viga_z);
      viga.rotation.y = -finalHeading;
      scene.add(viga);

      // Cartel/Banner de META con textura a cuadros
      const bannerW = W * 0.8;
      const bannerH = 1.0;
      const bannerGeom = new THREE.PlaneGeometry(bannerW, bannerH);
      
      const checkerCanvas = document.createElement('canvas');
      checkerCanvas.width = 128;
      checkerCanvas.height = 32;
      const chCtx = checkerCanvas.getContext('2d');
      chCtx.fillStyle = '#ffffff';
      chCtx.fillRect(0, 0, 128, 32);
      chCtx.fillStyle = '#000000';
      for (let cRow = 0; cRow < 2; cRow++) {
        for (let cCol = 0; cCol < 8; cCol++) {
          if ((cRow + cCol) % 2 === 0) {
            chCtx.fillRect(cCol * 16, cRow * 16, 16, 16);
          }
        }
      }
      chCtx.fillStyle = '#ef4444';
      chCtx.font = 'bold 13px sans-serif';
      chCtx.textAlign = 'center';
      chCtx.textBaseline = 'middle';
      chCtx.fillText('META UTP', 64, 16);
      
      const bannerTex = new THREE.CanvasTexture(checkerCanvas);
      const bannerMat = new THREE.MeshBasicMaterial({ 
        map: bannerTex, 
        side: THREE.DoubleSide
      });
      
      const banner = new THREE.Mesh(bannerGeom, bannerMat);
      banner.position.set(viga_x, viga_y - bannerH / 2 - 0.15, viga_z);
      banner.rotation.y = -finalHeading;
      scene.add(banner);
    }

    const carGroup = new THREE.Group();
    scene.add(carGroup);

    let wheels = [];
    let propellerMesh = null;
    let landingGearLeft = null;
    let landingGearRight = null;
    let landingGearNose = null;

    if (escenario.toLowerCase() === 'avion') {
      // --- CONSTRUIR AVION PROCEDURAL ---
      // Fuselaje central (Cuerpo del avión)
      const bodyGeom = new THREE.CylinderGeometry(0.5, 0.35, 4.2, 16);
      bodyGeom.rotateX(Math.PI / 2);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.5, roughness: 0.2 });
      const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
      bodyMesh.position.y = 0.5;
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      carGroup.add(bodyMesh);

      // Cabina del piloto
      const cockpitGeom = new THREE.SphereGeometry(0.35, 16, 12);
      cockpitGeom.scale(1, 0.8, 1.8);
      const cockpitMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.05, transparent: true, opacity: 0.8 });
      const cockpit = new THREE.Mesh(cockpitGeom, cockpitMat);
      cockpit.position.set(0, 0.9, 0.4);
      carGroup.add(cockpit);

      // Alas Principales (Swept-back)
      const wingMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.5, roughness: 0.2 });
      
      const wingLeftGeom = new THREE.BoxGeometry(2.4, 0.04, 0.9);
      wingLeftGeom.rotateY(-Math.PI / 12);
      const wingLeft = new THREE.Mesh(wingLeftGeom, wingMat);
      wingLeft.position.set(-1.45, 0.5, 0.1);
      wingLeft.castShadow = true;
      carGroup.add(wingLeft);

      const wingRightGeom = new THREE.BoxGeometry(2.4, 0.04, 0.9);
      wingRightGeom.rotateY(Math.PI / 12);
      const wingRight = new THREE.Mesh(wingRightGeom, wingMat);
      wingRight.position.set(1.45, 0.5, 0.1);
      wingRight.castShadow = true;
      carGroup.add(wingRight);

      // Estabilizadores de Cola
      const tailWingLeftGeom = new THREE.BoxGeometry(0.8, 0.03, 0.45);
      tailWingLeftGeom.rotateY(-Math.PI / 10);
      const tailWingLeft = new THREE.Mesh(tailWingLeftGeom, wingMat);
      tailWingLeft.position.set(-0.6, 0.55, -1.7);
      tailWingLeft.castShadow = true;
      carGroup.add(tailWingLeft);

      const tailWingRightGeom = new THREE.BoxGeometry(0.8, 0.03, 0.45);
      tailWingRightGeom.rotateY(Math.PI / 10);
      const tailWingRight = new THREE.Mesh(tailWingRightGeom, wingMat);
      tailWingRight.position.set(0.6, 0.55, -1.7);
      tailWingRight.castShadow = true;
      carGroup.add(tailWingRight);

      // Timón de cola
      const rudderGeom = new THREE.BoxGeometry(0.04, 0.9, 0.65);
      rudderGeom.rotateX(Math.PI / 12);
      const rudder = new THREE.Mesh(rudderGeom, wingMat);
      rudder.position.set(0, 1.0, -1.7);
      rudder.castShadow = true;
      carGroup.add(rudder);

      // Hélice frontal
      const spinnerGeom = new THREE.ConeGeometry(0.3, 0.6, 12);
      spinnerGeom.rotateX(Math.PI / 2);
      const spinnerMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6 });
      const spinner = new THREE.Mesh(spinnerGeom, spinnerMat);
      spinner.position.set(0, 0.5, 2.3);
      carGroup.add(spinner);

      const bladeGeom = new THREE.BoxGeometry(0.04, 1.3, 0.08);
      propellerMesh = new THREE.Mesh(bladeGeom, new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }));
      propellerMesh.position.set(0, 0.5, 2.31);
      carGroup.add(propellerMesh);

      // Reactor trasero
      const fireGeom = new THREE.CylinderGeometry(0.2, 0.05, 0.6, 12);
      fireGeom.rotateX(Math.PI / 2);
      const fireMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.9 });
      const jetFlame = new THREE.Mesh(fireGeom, fireMat);
      jetFlame.position.set(0, 0.5, -2.15);
      carGroup.add(jetFlame);

      // Ruedas de tren de aterrizaje
      const wheelGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.2, 12);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.95 });
      const wheelRimGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.22, 6);
      const wheelRimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });

      const crearRuedaAvion = (group, x, y, z) => {
        const tire = new THREE.Mesh(wheelGeom, wheelMat);
        tire.rotation.z = Math.PI / 2;
        tire.castShadow = true;
        group.add(tire);
        
        const rim = new THREE.Mesh(wheelRimGeom, wheelRimMat);
        rim.rotation.z = Math.PI / 2;
        group.add(rim);

        group.position.set(x, y, z);
        carGroup.add(group);
        return group;
      };

      landingGearLeft = new THREE.Group();
      crearRuedaAvion(landingGearLeft, -0.7, 0.1, 0.2);

      landingGearRight = new THREE.Group();
      crearRuedaAvion(landingGearRight, 0.7, 0.1, 0.2);

      landingGearNose = new THREE.Group();
      crearRuedaAvion(landingGearNose, 0.0, 0.1, 1.4);

      wheels = [landingGearLeft, landingGearRight, landingGearNose];

    } else {
      const escL = escenario.toLowerCase();

      const wheelGeom = new THREE.CylinderGeometry(0.48, 0.48, 0.4, 16);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.95 });
      const wheelRimGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.42, 8);
      const wheelRimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });

      const crearRuedaCompleta = (x, y, z) => {
        const wheelGroup = new THREE.Group();
        const tire = new THREE.Mesh(wheelGeom, wheelMat);
        tire.rotation.z = Math.PI / 2;
        wheelGroup.add(tire);
        
        const rim = new THREE.Mesh(wheelRimGeom, wheelRimMat);
        rim.rotation.z = Math.PI / 2;
        wheelGroup.add(rim);

        wheelGroup.position.set(x, y, z);
        carGroup.add(wheelGroup);
        return wheelGroup;
      };

      let wFL, wFR, wRL, wRR;

      if (escL === 'camion') {
        // --- CONSTRUIR CAMIÓN 3D ---
        const baseGeom = new THREE.BoxGeometry(1.6, 0.3, 4.6);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.4, roughness: 0.5 });
        const baseMesh = new THREE.Mesh(baseGeom, baseMat);
        baseMesh.position.y = 0.15;
        carGroup.add(baseMesh);

        const cabinGeom = new THREE.BoxGeometry(1.5, 1.2, 1.4);
        const cabinMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.5, roughness: 0.2 });
        const cabinMesh = new THREE.Mesh(cabinGeom, cabinMat);
        cabinMesh.position.set(0, 0.9, 1.3);
        carGroup.add(cabinMesh);

        const windowGeom = new THREE.BoxGeometry(1.3, 0.5, 0.1);
        const windowMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
        const windowMesh = new THREE.Mesh(windowGeom, windowMat);
        windowMesh.position.set(0, 1.1, 2.01);
        carGroup.add(windowMesh);

        const cargoGeom = new THREE.BoxGeometry(1.6, 1.5, 2.8);
        const cargoMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.2, roughness: 0.6 });
        const cargoMesh = new THREE.Mesh(cargoGeom, cargoMat);
        cargoMesh.position.set(0, 1.05, -0.7);
        carGroup.add(cargoMesh);

        // Faros del camión
        const headlightGeom = new THREE.SphereGeometry(0.12, 8, 8);
        const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
        
        const headlightLeft = new THREE.Mesh(headlightGeom, headlightMat);
        headlightLeft.position.set(-0.65, 0.4, 2.01);
        carGroup.add(headlightLeft);

        const headlightRight = headlightLeft.clone();
        headlightRight.position.set(0.65, 0.4, 2.01);
        carGroup.add(headlightRight);

        // Crear ruedas de camión
        wFL = crearRuedaCompleta(-0.85, 0.25, 1.5);
        wFR = crearRuedaCompleta(0.85, 0.25, 1.5);
        wRL = crearRuedaCompleta(-0.85, 0.25, -1.4);
        wRR = crearRuedaCompleta(0.85, 0.25, -1.4);

      } else if (escL === 'motocicleta') {
        // --- CONSTRUIR MOTOCICLETA 3D ---
        const frameGeom = new THREE.BoxGeometry(0.3, 0.6, 2.2);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.8, roughness: 0.15 });
        const frameMesh = new THREE.Mesh(frameGeom, frameMat);
        frameMesh.position.y = 0.4;
        carGroup.add(frameMesh);

        const handlebarGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8);
        const handlebarMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
        const handlebar = new THREE.Mesh(handlebarGeom, handlebarMat);
        handlebar.rotation.z = Math.PI / 2;
        handlebar.position.set(0, 0.85, 0.7);
        carGroup.add(handlebar);

        const seatGeom = new THREE.BoxGeometry(0.32, 0.1, 0.7);
        const seatMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
        const seat = new THREE.Mesh(seatGeom, seatMat);
        seat.position.set(0, 0.65, -0.3);
        carGroup.add(seat);

        // Faro frontal
        const headlightGeom = new THREE.SphereGeometry(0.12, 8, 8);
        const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
        const headlight = new THREE.Mesh(headlightGeom, headlightMat);
        headlight.position.set(0, 0.7, 1.15);
        carGroup.add(headlight);

        // Ruedas de motocicleta (alineadas en el centro para dar el efecto de 2 ruedas)
        wFL = crearRuedaCompleta(0.0, 0.25, 1.1);
        wFR = crearRuedaCompleta(0.0, 0.25, 1.1);
        wRL = crearRuedaCompleta(0.0, 0.25, -1.1);
        wRR = crearRuedaCompleta(0.0, 0.25, -1.1);

      } else {
        // --- CONSTRUIR AUTOMOVIL CLASICO ---
        const lowerGeom = new THREE.BoxGeometry(1.6, 0.45, 3.6);
        const lowerMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.7, roughness: 0.15 });
        const lowerMesh = new THREE.Mesh(lowerGeom, lowerMat);
        lowerMesh.position.y = 0.25;
        carGroup.add(lowerMesh);

        const cabinGeom = new THREE.BoxGeometry(1.1, 0.55, 1.5);
        const cabinMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.05, transparent: true, opacity: 0.85 });
        const cabinMesh = new THREE.Mesh(cabinGeom, cabinMat);
        cabinMesh.position.set(0, 0.75, -0.15);
        carGroup.add(cabinMesh);

        const spoilerPostGeom = new THREE.BoxGeometry(0.08, 0.35, 0.08);
        const spoilerPostLeft = new THREE.Mesh(spoilerPostGeom, lowerMat);
        spoilerPostLeft.position.set(-0.55, 0.55, -1.5);
        carGroup.add(spoilerPostLeft);

        const spoilerPostRight = spoilerPostLeft.clone();
        spoilerPostRight.position.set(0.55, 0.55, -1.5);
        carGroup.add(spoilerPostRight);

        const wingGeom = new THREE.BoxGeometry(1.7, 0.04, 0.4);
        const wingMesh = new THREE.Mesh(wingGeom, lowerMat);
        wingMesh.position.set(0, 0.72, -1.5);
        carGroup.add(wingMesh);

        // Faros delanteros
        const headlightGeom = new THREE.SphereGeometry(0.12, 8, 8);
        const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
        
        const headlightLeft = new THREE.Mesh(headlightGeom, headlightMat);
        headlightLeft.position.set(-0.6, 0.25, 1.8);
        carGroup.add(headlightLeft);

        const headlightRight = headlightLeft.clone();
        headlightRight.position.set(0.6, 0.25, 1.8);
        carGroup.add(headlightRight);

        // Ruedas del coche
        wFL = crearRuedaCompleta(-0.9, 0.25, 1.1);
        wFR = crearRuedaCompleta(0.9, 0.25, 1.1);
        wRL = crearRuedaCompleta(-0.9, 0.25, -1.1);
        wRR = crearRuedaCompleta(0.9, 0.25, -1.1);
      }

      wheels = [wFL, wFR, wRL, wRR];
    }

    // Estelas de condensación para el ala izquierda y derecha del avión
    let trailLeftMesh = null;
    let trailRightMesh = null;
    let trailLeftPoints = [];
    let trailRightPoints = [];
    const trailLength = 80;

    if (escenario.toLowerCase() === 'avion') {
      // Inicializar con vectores vacíos
      const dummyVec = new THREE.Vector3(0, 0, 0);
      for (let i = 0; i < trailLength; i++) {
        trailLeftPoints.push(dummyVec.clone());
        trailRightPoints.push(dummyVec.clone());
      }
      
      const trailMat = new THREE.LineBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.6,
        linewidth: 2
      });
      
      const trailLeftGeom = new THREE.BufferGeometry().setFromPoints(trailLeftPoints);
      trailLeftMesh = new THREE.Line(trailLeftGeom, trailMat);
      scene.add(trailLeftMesh);
      
      const trailRightGeom = new THREE.BufferGeometry().setFromPoints(trailRightPoints);
      trailRightMesh = new THREE.Line(trailRightGeom, trailMat);
      scene.add(trailRightMesh);
    }

    // Crear ArrowHelpers para el DCL (Diagrama de Cuerpo Libre) en 3D
    const arrowHelpers = {};
    const arrowOrigins = new THREE.Vector3(0, 0.8, 0); // Origen en el centro del carro
    
    // 1. Tracción (Verde)
    arrowHelpers.traccion = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      arrowOrigins,
      0,
      0x10b981,
      0.6,
      0.3
    );
    carGroup.add(arrowHelpers.traccion);

    // 2. Frenado (Rojo)
    arrowHelpers.frenado = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, -1),
      arrowOrigins,
      0,
      0xef4444,
      0.6,
      0.3
    );
    carGroup.add(arrowHelpers.frenado);

    // 3. Fricción/Rodadura o fricción cinética (Rosa)
    arrowHelpers.friccion = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(0, 0.6, -0.2), // Ligeramente desplazado para evitar superposiciones
      0,
      0xf43f5e,
      0.6,
      0.3
    );
    carGroup.add(arrowHelpers.friccion);

    // 4. Arrastre/Drag (Amarillo)
    arrowHelpers.drag = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(0, 1.0, 0), // Más arriba del techo
      0,
      0xeab308,
      0.6,
      0.3
    );
    carGroup.add(arrowHelpers.drag);

    // 5. Normal (Cian)
    arrowHelpers.normal = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      arrowOrigins,
      0,
      0x06b6d4,
      0.6,
      0.3
    );
    carGroup.add(arrowHelpers.normal);

    // 6. Peso (Rojo, en coordenadas del mundo absoluto, jala hacia el centro de la tierra)
    arrowHelpers.peso = new THREE.ArrowHelper(
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(0, 0, 0), 
      0,
      0xef4444,
      0.6,
      0.3
    );
    scene.add(arrowHelpers.peso);

    threeSceneRef.current = {
      container,
      scene,
      camera,
      renderer,
      controls,
      carGroup,
      wheels,
      propellerMesh,
      landingGearLeft,
      landingGearRight,
      landingGearNose,
      trailLeftMesh,
      trailRightMesh,
      trailLeftPoints,
      trailRightPoints,
      trailLength,
      arrowHelpers,
      longitudTotal,
      dirLight,
      ambientLight,
      clock: new THREE.Clock()
    };

    const pStart = obtenerPuntoEnPista(0);
    carGroup.position.set(pStart.x, pStart.y, pStart.z);
    carGroup.rotation.y = pStart.heading;
    carGroup.rotation.z = pStart.peralte;

    camera.position.set(pStart.x, pStart.y + 5.0, pStart.z - 12.0);
    camera.lookAt(pStart.x, pStart.y + 0.8, pStart.z);
    if (controls) {
      controls.target.set(pStart.x, pStart.y + 0.8, pStart.z);
      controls.update();
    }

    const tempVector1 = new THREE.Vector3();
    const tempVector2 = new THREE.Vector3();
    let frameId;
    const renderTick = () => {
      const t = threeSceneRef.current;
      if (!t) return;

      frameId = requestAnimationFrame(renderTick);
      t.animationFrameId = frameId;

      const dtClock = t.clock.getDelta();

      // Inicializar estado de interpolación visual para Three.js (evita tirones del loop de React a 20fps)
      if (!t.smoothState) {
        t.smoothState = {
          x: telemetriaRef.current ? telemetriaRef.current.x : 0.0,
          y: telemetriaRef.current ? (telemetriaRef.current.y || 0.0) : 0.0,
          v: telemetriaRef.current ? telemetriaRef.current.v : 0.0,
          v_y: telemetriaRef.current ? (telemetriaRef.current.v_y || 0.0) : 0.0
        };
      }

      if (isRunning) {
        const targetX = telemetriaRef.current ? telemetriaRef.current.x : 0.0;
        const targetY = telemetriaRef.current ? (telemetriaRef.current.y || 0.0) : 0.0;
        const targetV = telemetriaRef.current ? telemetriaRef.current.v : 0.0;
        const targetVy = telemetriaRef.current ? (telemetriaRef.current.v_y || 0.0) : 0.0;

        t.smoothState.x += (targetX - t.smoothState.x) * 0.15;
        t.smoothState.y += (targetY - t.smoothState.y) * 0.15;
        t.smoothState.v += (targetV - t.smoothState.v) * 0.15;
        t.smoothState.v_y += (targetVy - t.smoothState.v_y) * 0.15;
      } else if (telemetriaRef.current && telemetriaRef.current.terminado && !telemetriaRef.current.derrapado && !telemetriaRef.current.deslizado) {
        // Victoria / Inercia post-término: continuar moviéndose visualmente a velocidad constante para evitar congelamientos bruscos
        const vFinal = telemetriaRef.current.v;
        const vyFinal = telemetriaRef.current.v_y || 0.0;
        
        t.smoothState.x += vFinal * dtClock;
        t.smoothState.y += vyFinal * dtClock;
        t.smoothState.v = vFinal;
        t.smoothState.v_y = vyFinal;
      } else {
        // En reposo o reset, copiar directamente sin retardo
        t.smoothState.x = telemetriaRef.current ? telemetriaRef.current.x : 0.0;
        t.smoothState.y = telemetriaRef.current ? (telemetriaRef.current.y || 0.0) : 0.0;
        t.smoothState.v = telemetriaRef.current ? telemetriaRef.current.v : 0.0;
        t.smoothState.v_y = telemetriaRef.current ? (telemetriaRef.current.v_y || 0.0) : 0.0;
      }

      const s = t.smoothState.x;
      const v = t.smoothState.v;
      const yAlt = t.smoothState.y;
      const vy = t.smoothState.v_y;

      const p = obtenerPuntoEnPista(s);

      // Posicionar el coche / avión en 3D
      t.carGroup.position.set(p.x, p.y + yAlt, p.z);
      
      // Orientación del vehículo
      t.carGroup.rotation.order = 'YXZ';
      t.carGroup.rotation.y = p.heading;
      t.carGroup.rotation.z = p.peralte;

      // Pitch de ascenso y hélice para el escenario Avión
      if (escenario.toLowerCase() === 'avion') {
        if (yAlt > 0.1) {
          // Pitch arriba basado en climb vertical velocity / horizontal velocity
          t.carGroup.rotation.x = -Math.atan2(vy, Math.max(0.5, v));
        } else {
          t.carGroup.rotation.x = 0;
        }

        // Girar hélice frontal
        if (t.propellerMesh) {
          t.propellerMesh.rotation.z += isRunning ? 0.6 : (v > 0.1 ? 0.3 : 0.0);
        }

        // Replegar tren de aterrizaje
        const retractionFactor = Math.min(1.0, yAlt / 15.0); // se repliega por completo a los 15 metros de altura
        if (t.landingGearLeft) t.landingGearLeft.position.y = 0.1 + retractionFactor * 0.45;
        if (t.landingGearRight) t.landingGearRight.position.y = 0.1 + retractionFactor * 0.45;
        if (t.landingGearNose) t.landingGearNose.position.y = 0.1 + retractionFactor * 0.45;

        // Actualizar estelas de condensación de las puntas de las alas
        if (t.trailLeftMesh && t.trailRightMesh) {
          if (yAlt > 1.5 && v > 5.0) {
            // Forzar actualización de matrices del avión para calcular la posición global exacta
            t.carGroup.updateMatrixWorld(true);
            const lTip = new THREE.Vector3(-2.65, 0.5, 0.1).applyMatrix4(t.carGroup.matrixWorld);
            const rTip = new THREE.Vector3(2.65, 0.5, 0.1).applyMatrix4(t.carGroup.matrixWorld);
            
            t.trailLeftPoints.unshift(lTip);
            if (t.trailLeftPoints.length > t.trailLength) t.trailLeftPoints.pop();
            
            t.trailRightPoints.unshift(rTip);
            if (t.trailRightPoints.length > t.trailLength) t.trailRightPoints.pop();
            
            t.trailLeftMesh.geometry.setFromPoints(t.trailLeftPoints);
            t.trailRightMesh.geometry.setFromPoints(t.trailRightPoints);
            
            t.trailLeftMesh.visible = true;
            t.trailRightMesh.visible = true;
          } else {
            t.trailLeftMesh.visible = false;
            t.trailRightMesh.visible = false;
            // Rellenar puntos con la posición actual del avión para evitar líneas residuales extrañas
            const currentPos = t.carGroup.position;
            for (let i = 0; i < t.trailLength; i++) {
              t.trailLeftPoints[i].copy(currentPos);
              t.trailRightPoints[i].copy(currentPos);
            }
          }
        }

      } else {
        t.carGroup.rotation.x = 0;
        if (t.landingGearLeft) t.landingGearLeft.position.y = 0.1;
        if (t.landingGearRight) t.landingGearRight.position.y = 0.1;
        if (t.landingGearNose) t.landingGearNose.position.y = 0.1;
      }

      // Reactividad ambiental dinámica en 3D según el clima/entorno
      const entL = (entorno || 'seco').toLowerCase();
      let skyColorHex = 0xbae6fd;  // Azul diurno cálido
      let fogColorHex = 0xe0f2fe;
      let lightColorHex = 0xffffff;
      let lightIntensity = 0.95;
      let ambientIntensity = 0.55;
      let fogNear = 150;
      let fogFar = 600;

      if (entL === 'mojado' || entL === 'lluvioso' || entL === 'pista mojada' || entL === 'agua (fluido viscoso)') {
        skyColorHex = 0x475569;     // Gris tormenta lluvioso
        fogColorHex = 0x64748b;     // Niebla densa gris
        lightColorHex = 0x94a3b8;   // Luz diurna difusa fría
        lightIntensity = 0.45;
        ambientIntensity = 0.70;
        fogNear = 40;
        fogFar = 220;               // Rango de visión acortado por lluvia
      } else if (entL === 'hielo' || entL === 'nevado') {
        skyColorHex = 0xcbd5e1;     // Gris azulado frío de invierno
        fogColorHex = 0xf1f5f9;     // Bruma blanca invernal
        lightColorHex = 0xe0f2fe;   // Brillo blanco gélido
        lightIntensity = 1.1;       // Mayor intensidad por reflejo en nieve
        ambientIntensity = 0.45;
        fogNear = 60;
        fogFar = 280;
      }
      
      t.scene.background.setHex(skyColorHex);
      if (t.scene.fog) {
        t.scene.fog.color.setHex(fogColorHex);
        t.scene.fog.near = fogNear;
        t.scene.fog.far = fogFar;
      }
      if (t.dirLight) {
        t.dirLight.color.setHex(lightColorHex);
        t.dirLight.intensity = lightIntensity;
      }
      if (t.ambientLight) {
        t.ambientLight.intensity = ambientIntensity;
      }

      // Rotar ruedas
      const deltaRotation = (v * dtClock) / RADIO_RUEDA;
      t.wheels.forEach(wheel => {
        if (wheel.children[0]) wheel.children[0].rotation.x += deltaRotation;
        if (wheel.children[1]) wheel.children[1].rotation.x += deltaRotation;
      });

      const camMode = modoCamaraRef.current;

      if (t.controls) {
        t.controls.enabled = true; // Permitir órbita y rotación táctil/ratón en todo momento
        
        if (!t.lastCarPos) {
          t.lastCarPos = { x: p.x, y: p.y + yAlt, z: p.z };
        }
        
        // 1. Calcular delta de movimiento del vehículo desde el frame anterior
        const dx = p.x - t.lastCarPos.x;
        const dy = (p.y + yAlt) - t.lastCarPos.y;
        const dz = p.z - t.lastCarPos.z;
        
        // 2. Gestionar la posición de la cámara según el modo seleccionado
        if (camMode === 'Follow') {
          // En modo seguimiento, alinear la cámara detrás del vehículo con giro suave
          if (t.smoothHeading === undefined) {
            t.smoothHeading = p.heading;
          }
          let diff = p.heading - t.smoothHeading;
          diff = Math.atan2(Math.sin(diff), Math.cos(diff));
          t.smoothHeading += diff * 0.08; // Lerp suave del ángulo de orientación
          
          const backD = 12.0;
          const hD = 4.5;
          const targetCamX = p.x - backD * Math.sin(t.smoothHeading);
          const targetCamY = p.y + yAlt + hD;
          const targetCamZ = p.z - backD * Math.cos(t.smoothHeading);
          
          // Fijar posición de la cámara
          t.camera.position.set(targetCamX, targetCamY, targetCamZ);
        } else if (camMode === 'Zenith') {
          // Vista cenital centrada sobre el vehículo
          t.camera.position.set(p.x, p.y + yAlt + 35.0, p.z);
        } else {
          // Desplazar cámara aplicando el delta del vehículo para que mantenga el ángulo y distancia manual del usuario (modo Libre)
          t.camera.position.x += dx;
          t.camera.position.y += dy;
          t.camera.position.z += dz;
        }
        
        t.controls.target.set(p.x, p.y + yAlt + 0.8, p.z);
        t.controls.update();
        
        // Guardar posición para el siguiente tick
        t.lastCarPos.x = p.x;
        t.lastCarPos.y = p.y + yAlt;
        t.lastCarPos.z = p.z;
      } else {
        // Fallback básico si OrbitControls no está disponible
        if (camMode === 'Follow') {
          const backD = 12.0;
          const hD = 4.5;
          const targetCamX = p.x - backD * Math.sin(p.heading);
          const targetCamY = p.y + yAlt + hD;
          const targetCamZ = p.z - backD * Math.cos(p.heading);
          t.camera.position.set(targetCamX, targetCamY, targetCamZ);
          t.camera.lookAt(p.x, p.y + yAlt + 0.8, p.z);
        } else if (camMode === 'Zenith') {
          t.camera.position.set(p.x, p.y + yAlt + 35.0, p.z);
          t.camera.lookAt(p.x, p.y + yAlt, p.z);
        }
      }

      // Actualizar flechas de fuerzas DCL en 3D
      if (t.arrowHelpers && telemetriaRef.current) {
        const F = telemetriaRef.current.fuerzas || {};
        
        // Determinar escala de fuerzas 3D
        const fMaxAbs = Math.max(1000, parseFloat(fuerza), Math.abs(F.Peso || 0));
        const fEscala3D = 7.0 / fMaxAbs; // Máximo 7 metros de flecha
        
        // 1. Tracción
        const tVal = Math.abs(F.Traccion || 0);
        if (tVal > 5) {
          t.arrowHelpers.traccion.setLength(Math.max(1.5, tVal * fEscala3D), 0.6, 0.3);
          t.arrowHelpers.traccion.visible = true;
        } else {
          t.arrowHelpers.traccion.visible = false;
        }
        
        // 2. Frenado
        const frenVal = Math.abs(F.Frenado || 0);
        if (frenVal > 5) {
          t.arrowHelpers.frenado.setLength(Math.max(1.5, frenVal * fEscala3D), 0.6, 0.3);
          t.arrowHelpers.frenado.visible = true;
        } else {
          t.arrowHelpers.frenado.visible = false;
        }
        
        // 3. Fricción/Rodadura
        const fricVal = Math.abs(F.Friccion || 0);
        if (fricVal > 5) {
          t.arrowHelpers.friccion.setLength(Math.max(1.5, fricVal * fEscala3D), 0.6, 0.3);
          t.arrowHelpers.friccion.visible = true;
        } else {
          t.arrowHelpers.friccion.visible = false;
        }
        
        // 4. Arrastre
        const dragVal = Math.abs(F.ResistenciaAire || 0);
        if (dragVal > 5) {
          t.arrowHelpers.drag.setLength(Math.max(1.5, dragVal * fEscala3D), 0.6, 0.3);
          t.arrowHelpers.drag.visible = true;
        } else {
          t.arrowHelpers.drag.visible = false;
        }
        
        // 5. Normal
        const normVal = Math.abs(F.Normal || 0);
        if (normVal > 5) {
          t.arrowHelpers.normal.setLength(Math.max(1.5, normVal * fEscala3D), 0.6, 0.3);
          t.arrowHelpers.normal.visible = true;
        } else {
          t.arrowHelpers.normal.visible = false;
        }
        
        // 6. Peso (Siempre apunta hacia abajo, origen en la posición del vehículo)
        const pesoVal = Math.abs(F.Peso || 0);
        if (pesoVal > 5) {
          t.arrowHelpers.peso.position.copy(t.carGroup.position).add(new THREE.Vector3(0, 0.8, 0));
          t.arrowHelpers.peso.setLength(Math.max(1.5, pesoVal * fEscala3D), 0.6, 0.3);
          t.arrowHelpers.peso.visible = true;
        } else {
          t.arrowHelpers.peso.visible = false;
        }
      }

      t.renderer.render(t.scene, t.camera);
    };

    renderTick();

    const handleResize3D = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize3D);

    return () => {
      window.removeEventListener('resize', handleResize3D);
      cancelAnimationFrame(frameId);
      
      // Liberar todos los recursos de GPU de Three.js para evitar fugas y caídas de FPS
      scene.traverse((object) => {
        if (!object.isMesh) return;
        
        if (object.geometry) {
          object.geometry.dispose();
        }
        
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      renderer.dispose();
      container.innerHTML = '';
      threeSceneRef.current = null;
    };
  }, [vista3d, tab, trazadoPista, escenario, customTramos, entorno, vueloCrucero, inclinacion, radioCurva]);

  // Escuchar redimensionamiento de ventana para actualizar el canvas responsivo
  useEffect(() => {
    const handleResize = () => {
      dibujarEscenario();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ==========================================
  // LOGICA DEL MOTOR FISICO LOCAL (INTEGRACIÓN EULER)
  // ==========================================
  const obtenerCoeficienteFriccion = () => {
    if (modoProblemaActivo === 'A') {
      return parseFloat(paramsA.friccion_calzada);
    }
    if (modoProblemaActivo === 'C') {
      return parseFloat(paramsC.friccion_pista);
    }
    if (modoProblemaActivo === 'E') {
      return parseFloat(paramsE.friccion);
    }
    if (modoProblemaActivo === 'F') {
      return parseFloat(paramsF.friccion);
    }
    if (modoProblemaActivo === 'libre') {
      return parseFloat(paramsLibre.friccion);
    }
    const conf = escenariosConfig[escenario];
    if (conf && conf.climas) {
      return conf.climas[entorno] !== undefined ? conf.climas[entorno] : 0.0;
    }
    return 0.0;
  };

  const obtenerTramoActual = (x) => {
    if (trazadoPista === 'personalizada') {
      pistasCompuestas.personalizada.tramos = customTramos;
    }
    const preset = pistasCompuestas[trazadoPista] || pistasCompuestas.recta;
    
    if (!preset.tramos || preset.tramos.length === 0) {
      return {
        tramo: { tipo: 'recta', longitud: 100, inclinacion: 0, nombre: "Tramo de Emergencia" },
        index: 0,
        localX: x
      };
    }

    let acumulado = 0;
    for (let i = 0; i < preset.tramos.length; i++) {
      const tramo = preset.tramos[i];
      if (x < acumulado + tramo.longitud) {
        return {
          tramo,
          index: i,
          localX: x - acumulado
        };
      }
      acumulado += tramo.longitud;
    }
    const ultimo = preset.tramos[preset.tramos.length - 1];
    return {
      tramo: ultimo,
      index: preset.tramos.length - 1,
      localX: x - (acumulado - ultimo.longitud)
    };
  };

  const calcularPasoFisica = (dt, xAct, vAct, tAct, yAct = 0.0, vyAct = 0.0) => {
    if (trazadoPista === 'personalizada') {
      pistasCompuestas.personalizada.tramos = customTramos;
    }
    const m = parseFloat(masa);
    const f = parseFloat(fuerza);
    const b = parseFloat(resistenciaAire);
    const fric = obtenerCoeficienteFriccion();
    const escLower = escenario.toLowerCase();
    const theta = (inclinacion * Math.PI) / 180.0;
    const modo = frenoManual ? 'Frenado' : modoRef.current;

    if (m <= 0) {
      throw new Error("La masa debe ser estrictamente mayor que cero (m > 0 kg).");
    }

    // --- OVERRIDE CASO A: FASE DE REACCIÓN ---
    if (modoProblemaActivo === 'A' && xAct < parseFloat(paramsA.x_freno)) {
      const Normal = m * G * Math.cos(theta);
      const P_x = m * G * Math.sin(theta);
      const drag = 0.5 * 1.225 * b * (vAct ** 2);
      const fk = fric * Normal;
      
      const t_siguiente = tAct + dt;
      const x_siguiente = xAct + vAct * dt;
      
      // En la fase de reacción la teórica también va a velocidad inicial constante
      const t_reaccion = parseFloat(paramsA.x_freno) / parseFloat(paramsA.v_inicial);
      const t_total_frenado_teorico = (t_siguiente > t_reaccion) ? (t_siguiente - t_reaccion) : 0.0;
      
      return {
        t: t_siguiente,
        x: x_siguiente,
        y: 0.0,
        v_y: 0.0,
        v: vAct,
        a: 0.0,
        a_teorica: 0.0,
        v_teorica: vAct,
        x_teorica: x_siguiente,
        despego: false,
        sustentacion: 0.0,
        fuerzas: {
          Traccion: fk + drag + P_x, // motor compensa para velocidad constante
          Peso: -m * G,
          Normal: Normal,
          Frenado: 0.0,
          Friccion: -fk,
          ResistenciaAire: -drag,
          FuerzaNeta: 0.0
        },
        explicacion: `Fase 1: Avance a velocidad constante (reacción). x = ${x_siguiente.toFixed(1)}m < ${paramsA.x_freno}m.`,
        terminado: false
      };
    }

    // Calcular la fuerza aplicada variable según el perfil
    const obtenerFuerzaVariable = (fBase, t) => {
      switch (perfilFuerza) {
        case 'Impulso':
          return t <= 2.0 ? fBase : 0.0;
        case 'Rampa':
          return fBase * (Math.min(6.0, t) / 6.0);
        case 'Senoidal':
          return fBase * Math.sin(Math.PI * t);
        case 'Constante':
        default:
          return fBase;
      }
    };

    const f_variable = obtenerFuerzaVariable(f, tAct);

    // ----------------------------------------------------
    // CÁLCULO DEL MODELO TEÓRICO IDEAL (Sin resistencia de aire ni estática)
    // ----------------------------------------------------
    let a_teorica = 0.0;
    if (escLower === 'avion') {
      a_teorica = (f - (fric * m * G * Math.cos(theta)) - (m * G * Math.sin(theta))) / m;
    } else if (escLower === 'elevador') {
      if (modoProblemaActivo === 'B') {
        a_teorica = (paramsB.fuerza_freno - (m * G)) / m;
      } else {
        a_teorica = (f - (m * G)) / m;
      }
    } else if (escLower === 'atwood') {
      const m2_val = parseFloat(masa2);
      a_teorica = ((m2_val - m) * G) / (m + m2_val);
    } else if (escLower === 'curva' || escLower === 'automovil' || escLower === 'camion' || escLower === 'motocicleta') {
      const { tramo } = obtenerTramoActual(xAct);
      if (tramo.tipo === 'curva') {
        const thetaLocal = (tramo.inclinacion * Math.PI) / 180.0;
        const R = tramo.radio_curva;
        const NormalTeo = m * (G * Math.cos(thetaLocal) + (vAct ** 2) / R * Math.sin(thetaLocal));
        const fkTeo = fric * NormalTeo;
        if (modo === 'Frenado') {
          a_teorica = (-(f + fkTeo)) / m;
        } else {
          a_teorica = (f - fkTeo) / m;
        }
      } else {
        const thetaLocal = (tramo.inclinacion * Math.PI) / 180.0;
        const P_x = m * G * Math.sin(thetaLocal);
        const Normal = m * G * Math.cos(thetaLocal);
        const fk = fric * Normal;
        if (modo === 'Frenado') {
          if (modoProblemaActivo === 'A') {
            a_teorica = (-(parseFloat(paramsA.fuerza_freno) + fk) - P_x) / m;
          } else {
            a_teorica = (-(f + fk) - P_x) / m;
          }
        } else {
          a_teorica = (f - fk - P_x) / m;
        }
      }
    } else {
      const P_x = m * G * Math.sin(theta);
      const Normal = m * G * Math.cos(theta);
      const fk = fric * Normal;
      if (modo === 'Frenado') {
        if (modoProblemaActivo === 'A') {
          a_teorica = (-(parseFloat(paramsA.fuerza_freno) + fk) - P_x) / m;
        } else {
          a_teorica = (-(f + fk) - P_x) / m;
        }
      } else {
        a_teorica = (f - fk - P_x) / m;
      }
    }

    const t_siguiente = tAct + dt;
    const v_ini_t = (escenario === 'Avion' && vueloCrucero) ? parseFloat(vInicial) : (escenario !== 'Elevador' && escenario !== 'Avion' && escenario !== 'Atwood' ? parseFloat(vInicial) : 0.0);
    let v_teorica_siguiente = v_ini_t + a_teorica * t_siguiente;
    if (v_teorica_siguiente < 0 && (modo === 'Frenado' || escLower === 'atwood')) {
      v_teorica_siguiente = 0.0;
    }
    const x_teorica_siguiente = v_ini_t * t_siguiente + 0.5 * a_teorica * (t_siguiente ** 2);

    // ----------------------------------------------------
    // ESCENARIO: AVION
    // ----------------------------------------------------
    if (escLower === 'avion') {
      const Peso = m * G;
      const cl = parseFloat(sustentacionCoef);
      // L = 1/2 * rho * S * Cl * v^2. Con rho=1.225 y S=225, el factor es ~138
      const Sustentacion = 138.0 * cl * (vAct ** 2);
      const drag = b * (vAct ** 2);
      
      const P_y = Peso * Math.cos(theta);
      const isCrucero = vueloCrucero;
      const despego = isCrucero ? true : (Sustentacion >= P_y);
      
      let Normal = 0.0;
      let f_rodadura = 0.0;
      let estado = isCrucero ? "Vuelo Crucero (Ciudad X → Y)" : "Rodando en pista";
      let a_y = 0.0;
      let v_y_siguiente = 0.0;
      let y_siguiente = yAct;
      
      if (!despego) {
        Normal = (modoProblemaActivo === 'C' || modoProblemaActivo === 'libre') ? P_y : (P_y - Sustentacion);
        f_rodadura = fric * Normal;
      } else {
        Normal = 0.0;
        f_rodadura = 0.0;
        if (!isCrucero) {
          estado = "VUELO (Sust. > Peso)";
          
          // Dinámica de ascenso vertical
          const F_y_neta = Sustentacion - P_y - 0.2 * b * vyAct;
          a_y = F_y_neta / m;
          v_y_siguiente = vyAct + a_y * dt;
          if (v_y_siguiente < -10.0) v_y_siguiente = -10.0;
          y_siguiente = yAct + vyAct * dt + 0.5 * a_y * (dt ** 2);
          
          if (y_siguiente <= 0.0) {
            y_siguiente = 0.0;
            v_y_siguiente = 0.0;
          }
        } else {
          estado = "Vuelo Crucero (Ciudad X → Y)";
          a_y = 0.0;
          v_y_siguiente = 0.0;
          y_siguiente = 150.0;
        }
      }
      
      const P_x = Peso * Math.sin(theta);
      const F_neta = f_variable - f_rodadura - drag - P_x;
      let a = F_neta / m;
      
      let v_siguiente = vAct + a * dt;
      if (v_siguiente < 0) v_siguiente = 0.0;
      
      const x_siguiente = xAct + vAct * dt + 0.5 * a * (dt ** 2);
      
      let terminado = false;
      let explicacion = "";
      
      if (isCrucero) {
        if (y_siguiente <= 0.01 && yAct > 1.0) {
          terminado = true;
          explicacion = "¡COLISIÓN! El avión perdió sustentación en pleno vuelo y chocó contra el terreno.";
        } else if (x_siguiente >= 8000.0) {
          terminado = true;
          explicacion = "¡Vuelo Completado! El trayecto de Ciudad X a Ciudad Y finalizó con éxito en crucero estable.";
        } else {
          explicacion = `Vuelo Crucero (Ciudad X → Y). Empuje = ${f_variable.toFixed(0)} N. Sustentación = ${Sustentacion.toFixed(0)} N. Altitud = ${y_siguiente.toFixed(1)} m.`;
        }
      } else {
        terminado = despego && (x_siguiente >= 2500.0 || v_siguiente > 150.0 || y_siguiente >= 250.0);
        explicacion = terminado ? "Despegue exitoso completado. Avión en ascenso estable." : `${estado}. Empuje = ${f_variable.toFixed(0)} N. Sustentación = ${Sustentacion.toFixed(0)} N. Altitud = ${y_siguiente.toFixed(1)} m.`;
      }
      
      return {
        t: t_siguiente,
        x: x_siguiente,
        y: y_siguiente,
        v_y: v_y_siguiente,
        a_y: a_y,
        v: v_siguiente,
        a: a,
        a_teorica: a_teorica,
        v_teorica: v_teorica_siguiente,
        x_teorica: x_teorica_siguiente,
        despego: despego,
        sustentacion: Sustentacion,
        fuerzas: {
          Traccion: f_variable,
          Peso: -Peso,
          Sustentacion: Sustentacion,
          Normal: Normal,
          Friccion: -f_rodadura,
          ResistenciaAire: -drag,
          FuerzaNeta: F_neta
        },
        explicacion: explicacion,
        terminado: terminado
      };
      
    // ----------------------------------------------------
    // ESCENARIO: ELEVADOR
    // ----------------------------------------------------
    } else if (escLower === 'elevador') {
      const Peso = m * G;
      const F_aire = -b * vAct;
      const F_neta = (modoProblemaActivo === 'B' ? parseFloat(paramsB.fuerza_freno) : f_variable) - Peso + F_aire;
      let a = F_neta / m;
      
      let v_siguiente = vAct + a * dt;
      let y_siguiente = xAct + vAct * dt + 0.5 * a * (dt ** 2);
      
      let terminado = false;
      let explicacion = '';
      
      if (y_siguiente <= 0.0) {
        y_siguiente = 0.0;
        v_siguiente = 0.0;
        a = 0.0;
        terminado = true;
        explicacion = modoProblemaActivo === 'B' 
          ? `¡IMPACTO CONTRA EL SUELO! El elevador chocó a ${Math.abs(vAct).toFixed(2)} m/s (t = ${t_siguiente.toFixed(2)}s).`
          : "El elevador ha tocado fondo en el suelo (y = 0 m).";
      } else if (y_siguiente >= alturaMax) {
        y_siguiente = alturaMax;
        v_siguiente = 0.0;
        a = 0.0;
        terminado = true;
        explicacion = `El elevador ha alcanzado la altura máxima de ${alturaMax} m.`;
      } else {
        if (modoProblemaActivo === 'B') {
          // Si estaba subiendo y f_freno < Peso, desacelera hasta pararse e iniciar descenso.
          // Si estaba bajando y f_freno > Peso, desacelera hasta pararse por completo en el aire.
          if (vAct <= 0 && v_siguiente >= 0) {
            // Se detuvo bajando
            v_siguiente = 0.0;
            a = 0.0;
            terminado = true;
            explicacion = `¡Frenado seguro exitoso! Detenido en el aire a ${y_siguiente.toFixed(2)} m.`;
          } else if (vAct >= 0 && v_siguiente <= 0) {
            // Alcanzó altura máxima de subida tras falla y empieza a caer
            if (parseFloat(paramsB.fuerza_freno) >= Peso) {
              // Si f_freno > Peso, una vez que se detiene no cae, se queda quieto
              v_siguiente = 0.0;
              a = 0.0;
              terminado = true;
              explicacion = `¡Frenado seguro exitoso! Detenido en el aire a ${y_siguiente.toFixed(2)} m.`;
            } else {
              // Continúa cayendo libremente
              explicacion = `Falla de tensión. Iniciando descenso inercial desde y = ${y_siguiente.toFixed(1)} m.`;
            }
          } else {
            explicacion = `¡CABLE ROTOR! Falla de tensión. Frenos de emergencia: ${parseFloat(paramsB.fuerza_freno).toFixed(0)} N. y = ${y_siguiente.toFixed(1)} m.`;
          }
        } else {
          const dir = v_siguiente > 0.01 ? 'subiendo' : (v_siguiente < -0.01 ? 'bajando' : 'estacionario');
          explicacion = `Elevador ${dir}. Tensión = ${f_variable.toFixed(0)} N. Peso = ${Peso.toFixed(0)} N. Arrastre = ${F_aire.toFixed(0)} N.`;
        }
      }
      
      return {
        t: t_siguiente,
        x: y_siguiente,
        y: y_siguiente,
        v_y: v_siguiente,
        v: v_siguiente,
        a: a,
        a_teorica: a_teorica,
        v_teorica: v_teorica_siguiente,
        x_teorica: x_teorica_siguiente,
        fuerzas: {
          Tension: modoProblemaActivo === 'B' ? 0.0 : f_variable,
          Frenado: modoProblemaActivo === 'B' ? parseFloat(paramsB.fuerza_freno) : 0.0,
          Peso: -Peso,
          ResistenciaAire: F_aire,
          FuerzaNeta: F_neta
        },
        explicacion: explicacion,
        terminado: terminado
      };

    // ----------------------------------------------------
    // ESCENARIO: MÁQUINA DE ATWOOD (POLEA)
    // ----------------------------------------------------
    } else if (escLower === 'atwood') {
      const m1 = m;
      const m2_val = parseFloat(masa2);
      const P1 = m1 * G;
      const P2 = m2_val * G;
      
      const F_drag = -b * vAct;
      const F_neta = (P2 - P1) + F_drag;
      const total_m = m1 + m2_val;
      let a = F_neta / total_m;
      
      let v_siguiente = vAct + a * dt;
      let x_siguiente = xAct + vAct * dt + 0.5 * a * (dt ** 2);
      
      const Tension = m1 * (G + a);
      let terminado = false;
      let explicacion = '';
      
      if (x_siguiente >= 8.0) {
        x_siguiente = 8.0;
        v_siguiente = 0.0;
        a = 0.0;
        terminado = true;
        explicacion = "El bloque 2 (derecho) ha tocado el suelo.";
      } else if (x_siguiente <= -8.0) {
        x_siguiente = -8.0;
        v_siguiente = 0.0;
        a = 0.0;
        terminado = true;
        explicacion = "El bloque 1 (izquierdo) ha tocado el suelo.";
      } else {
        const dir = v_siguiente > 0.01 ? 'descendiendo M2 (M1 subiendo)' : (v_siguiente < -0.01 ? 'ascendiendo M2 (M1 bajando)' : 'estacionario');
        explicacion = `Máquina de Atwood: ${dir}. Tensión = ${Tension.toFixed(0)} N. m1 = ${m1.toFixed(0)} kg, m2 = ${m2_val.toFixed(0)} kg.`;
      }
      
      return {
        t: t_siguiente,
        x: x_siguiente,
        y: 0.0,
        v_y: 0.0,
        v: v_siguiente,
        a: a,
        a_teorica: a_teorica,
        v_teorica: v_teorica_siguiente,
        x_teorica: x_teorica_siguiente,
        fuerzas: {
          Traccion: Tension,
          Peso: P2 - P1,
          ResistenciaAire: F_drag,
          FuerzaNeta: F_neta
        },
        explicacion: explicacion,
        terminado: terminado
      };
      
    // ----------------------------------------------------
    // ESCENARIO: CURVA PERALTADA O VEHÍCULOS TERRESTRES (SOPORTE DE PISTA COMPUESTA)
    // ----------------------------------------------------
    } else if (escLower === 'curva' || escLower === 'automovil' || escLower === 'camion' || escLower === 'motocicleta') {
      const { tramo, index, localX } = obtenerTramoActual(xAct);
      const t_siguiente = tAct + dt;
      const drag = 0.5 * 1.225 * b * (vAct ** 2);
      
      if (tramo.tipo === 'curva') {
        const R = tramo.radio_curva;
        const mu_s = tramo.friccion_estatica;
        const peralte = tramo.inclinacion;
        const thetaLocal = (peralte * Math.PI) / 180.0;
        const tan_theta = Math.tan(thetaLocal);

        // Límites de velocidad seguros
        const denom_max = 1.0 - mu_s * tan_theta;
        const v_max = denom_max > 1e-4 ? Math.sqrt(G * R * (tan_theta + mu_s) / denom_max) : 999.0;
        const v_min = tan_theta > mu_s ? Math.sqrt(G * R * (tan_theta - mu_s) / (1.0 + mu_s * tan_theta)) : 0.0;

        // Verificar derrape
        if (vAct > v_max) {
          const Normal = m * (G * Math.cos(thetaLocal) + (vAct ** 2) / R * Math.sin(thetaLocal));
          const isAcademic = modoProblemaActivo && modoProblemaActivo !== 'libre';
          return {
            t: isAcademic ? tAct : tAct + dt,
            x: isAcademic ? xAct : xAct + vAct * dt,
            y: 0.0,
            v: vAct,
            a: 0.0,
            a_teorica: a_teorica,
            v_teorica: v_teorica_siguiente,
            x_teorica: x_teorica_siguiente,
            fuerzas: {
              Traccion: 0.0,
              Peso: -m * G,
              Normal: Normal,
              Frenado: 0.0,
              Friccion: 0.0,
              ResistenciaAire: 0.0,
              FuerzaNeta: 0.0
            },
            explicacion: `¡DERRAPE! Pérdida de control en tramo '${tramo.nombre}' (v = ${vAct.toFixed(1)} m/s > v_máx = ${v_max.toFixed(1)} m/s).`,
            terminado: isAcademic,
            derrapado: true
          };
        }

        if (vAct < v_min) {
          const Normal = m * (G * Math.cos(thetaLocal) + (vAct ** 2) / R * Math.sin(thetaLocal));
          const isAcademic = modoProblemaActivo && modoProblemaActivo !== 'libre';
          return {
            t: isAcademic ? tAct : tAct + dt,
            x: isAcademic ? xAct : xAct + vAct * dt,
            y: 0.0,
            v: vAct,
            a: 0.0,
            a_teorica: a_teorica,
            v_teorica: v_teorica_siguiente,
            x_teorica: x_teorica_siguiente,
            fuerzas: {
              Traccion: 0.0,
              Peso: -m * G,
              Normal: Normal,
              Frenado: 0.0,
              Friccion: 0.0,
              ResistenciaAire: 0.0,
              FuerzaNeta: 0.0
            },
            explicacion: `¡DESLIZAMIENTO! Deslizamiento interior en tramo '${tramo.nombre}' (v = ${vAct.toFixed(1)} m/s < v_mín = ${v_min.toFixed(1)} m/s).`,
            terminado: isAcademic,
            deslizado: true
          };
        }

        if (modo === 'Frenado' && vAct <= 1e-4) {
          return {
            t: tAct,
            x: xAct,
            y: 0.0,
            v: 0.0,
            a: 0.0,
            a_teorica: 0.0,
            v_teorica: 0.0,
            x_teorica: xAct,
            fuerzas: {
              Traccion: 0.0,
              Peso: -m * G,
              Normal: m * G * Math.cos(thetaLocal),
              Frenado: 0.0,
              Friccion: 0.0,
              ResistenciaAire: 0.0,
              FuerzaNeta: 0.0
            },
            explicacion: `Detenido en curva '${tramo.nombre}'.`,
            terminado: true
          };
        }

        const Normal = m * (G * Math.cos(thetaLocal) + (vAct ** 2) / R * Math.sin(thetaLocal));
        let fk = 0.0;
        let F_neta = 0.0;
        
        if (modo === 'Frenado') {
          // El frenado está limitado por la fricción estática/cinética de los neumáticos con la pista
          const maxBrakeForce = fric * Normal;
          const actualBrakeForce = Math.min(f_variable, maxBrakeForce);
          fk = actualBrakeForce;
          F_neta = -(actualBrakeForce + drag);
        } else {
          fk = 0.015 * Normal; // Resistencia de rodadura
          F_neta = f_variable - (fk + drag);
        }

        let a = F_neta / m;
        let v_siguiente = vAct + a * dt;
        let terminado = false;

        if (v_siguiente <= 0.01) {
          v_siguiente = 0.0;
          a = 0.0;
          // Mostrar reporte si se frena o el móvil se detiene por completo tras haber partido
          if (tAct > 0.05 || modo === 'Frenado' || (modoProblemaActivo && modoProblemaActivo !== 'libre') || frenoManual) {
            terminado = true;
          }
        }

        const x_siguiente = xAct + vAct * dt + 0.5 * a * (dt ** 2);
        
        const preset = pistasCompuestas[trazadoPista] || pistasCompuestas.recta;
        const longitudTotal = preset.tramos.reduce((acc, t) => acc + t.longitud, 0);
        const finalizoRuta = x_siguiente >= longitudTotal;

        const fs_req = m * ((vAct ** 2) / R * Math.cos(thetaLocal) - G * Math.sin(thetaLocal));
        let explicacion = `[${tramo.nombre}] Curva R = ${R.toFixed(0)}m, Peralte = ${peralte.toFixed(0)}°. F_mot = ${f_variable.toFixed(0)}N. Fricción lat = ${Math.abs(fs_req).toFixed(0)}N.`;

        if (frenoManual && xAlFrenarRef.current !== null) {
          const d_f = x_siguiente - xAlFrenarRef.current;
          const t_f = t_siguiente - tAlFrenarRef.current;
          if (v_siguiente <= 0.01) {
            explicacion = `¡Frenado Manual Exitoso! Detenido en d_freno = ${d_f.toFixed(1)}m, t_freno = ${t_f.toFixed(1)}s (x total = ${x_siguiente.toFixed(1)}m).`;
          } else {
            explicacion = `[Frenando] d_freno = ${d_f.toFixed(1)}m, t_freno = ${t_f.toFixed(1)}s. ${explicacion}`;
          }
        }

        const x_final = finalizoRuta ? longitudTotal : (x_siguiente < 0 ? 0.0 : x_siguiente);
        const v_final = finalizoRuta ? 0.0 : v_siguiente;
        const a_final = finalizoRuta ? 0.0 : a;

        return {
          t: t_siguiente,
          x: x_final,
          y: 0.0,
          v_y: 0.0,
          v: v_final,
          a: a_final,
          a_teorica: a_teorica,
          v_teorica: v_teorica_siguiente,
          x_teorica: x_teorica_siguiente,
          fuerzas: {
            Traccion: modo === 'Aceleracion' ? f_variable : 0.0,
            Peso: -m * G,
            Normal: Normal,
            Frenado: modo === 'Frenado' ? -f_variable : 0.0,
            Friccion: -fk,
            ResistenciaAire: -drag,
            FuerzaNeta: finalizoRuta ? 0.0 : F_neta,
            FriccionLateral: fs_req
          },
          explicacion: finalizoRuta ? `Trazado completado con éxito.` : explicacion,
          terminado: terminado || finalizoRuta
        };

      } else {
        const inclinacionLocal = tramo.inclinacion;
        const thetaLocal = (inclinacionLocal * Math.PI) / 180.0;
        
        if (modo === 'Frenado' && vAct <= 1e-4) {
          return {
            t: tAct,
            x: xAct,
            y: 0.0,
            v: 0.0,
            a: 0.0,
            a_teorica: 0.0,
            v_teorica: 0.0,
            x_teorica: xAct,
            fuerzas: {
              Traccion: 0.0,
              Peso: -m * G,
              Normal: m * G * Math.cos(thetaLocal),
              Frenado: 0.0,
              Friccion: 0.0,
              ResistenciaAire: 0.0,
              FuerzaNeta: 0.0
            },
            explicacion: `Detenido en recta '${tramo.nombre}'.`,
            terminado: true
          };
        }

        const Normal = m * G * Math.cos(thetaLocal);
        const P_x = m * G * Math.sin(thetaLocal);
        
        let fk = 0.0;
        let F_neta = 0.0;
        let estatico = false;
        
        if (modo === 'Frenado') {
          // El frenado real está acotado por la adherencia de las llantas (friccion * Normal)
          const maxBrakeForce = fric * Normal;
          const actualBrakeForce = Math.min(f_variable, maxBrakeForce);
          fk = actualBrakeForce;
          
          if (vAct <= 1e-3) {
            // Si el vehículo está en reposo, el freno no empuja hacia atrás, solo resiste el movimiento inducido por la gravedad (P_x)
            const f_aplicada = -P_x;
            const fs_max = parseFloat(friccionEstatica) * Normal;
            if (Math.abs(f_aplicada) <= fs_max) {
              F_neta = 0.0;
              fk = -f_aplicada;
              estatico = true;
            } else {
              // Si la gravedad vence la fricción estática, el coche desliza cuesta abajo
              F_neta = -P_x - Math.sign(P_x) * (fric * Normal);
              fk = Math.sign(P_x) * (fric * Normal);
            }
          } else {
            F_neta = -(actualBrakeForce + drag) - P_x;
          }
        } else {
          // Modo Aceleración (Resistencia de Rodadura de neumático)
          fk = 0.015 * Normal;
          if (vAct <= 1e-3) {
            // Arrancar del reposo: solo queda estático si el motor está apagado (f_variable === 0)
            // y la gravedad tangencial P_x no supera el límite de fricción estática.
            if (f_variable === 0.0) {
              const f_aplicada = -P_x;
              const fs_max = parseFloat(friccionEstatica) * Normal;
              if (Math.abs(f_aplicada) <= fs_max) {
                F_neta = 0.0;
                fk = -f_aplicada;
                estatico = true;
              } else {
                F_neta = -P_x - Math.sign(P_x) * (fric * Normal);
              }
            } else {
              // El motor empuja, por lo que arranca inmediatamente venciendo la fricción de rodadura
              F_neta = f_variable - fk - P_x;
            }
          } else {
            F_neta = f_variable - (fk + drag) - P_x;
          }
        }
        
        let a = F_neta / m;
        let v_siguiente = vAct + a * dt;
        let terminado = false;
        
        if (v_siguiente <= 0.01 || estatico) {
          v_siguiente = 0.0;
          a = 0.0;
          // Mostrar reporte si se frena o el móvil se detiene por completo tras haber partido
          if (tAct > 0.05 || modo === 'Frenado' || (modoProblemaActivo && modoProblemaActivo !== 'libre') || frenoManual) {
            terminado = true;
          }
        }
        
        const x_siguiente = xAct + vAct * dt + 0.5 * a * (dt ** 2);
        
        const preset = pistasCompuestas[trazadoPista] || pistasCompuestas.recta;
        const longitudTotal = preset.tramos.reduce((acc, t) => acc + t.longitud, 0);
        const finalizoRuta = x_siguiente >= longitudTotal;
        
        let slopeText = Math.abs(inclinacionLocal) > 0.01 ? ` rampa de ${inclinacionLocal.toFixed(1)}°` : '';
        let explicacion = `[${tramo.nombre}] Recta${slopeText}. F_mot = ${f_variable.toFixed(0)}N. Fricción = -${fk.toFixed(0)}N. P_x = -${P_x.toFixed(0)}N.`;
        
        if (frenoManual && xAlFrenarRef.current !== null) {
          const d_f = x_siguiente - xAlFrenarRef.current;
          const t_f = t_siguiente - tAlFrenarRef.current;
          if (v_siguiente <= 0.01) {
            explicacion = `¡Frenado Manual Exitoso! Detenido en d_freno = ${d_f.toFixed(1)}m, t_freno = ${t_f.toFixed(1)}s (x total = ${x_siguiente.toFixed(1)}m).`;
          } else {
            explicacion = `[Frenando] d_freno = ${d_f.toFixed(1)}m, t_freno = ${t_f.toFixed(1)}s. ${explicacion}`;
          }
        }
        
        const x_final = finalizoRuta ? longitudTotal : (x_siguiente < 0 ? 0.0 : x_siguiente);
        const v_final = finalizoRuta ? 0.0 : v_siguiente;
        const a_final = finalizoRuta ? 0.0 : a;

        return {
          t: t_siguiente,
          x: x_final,
          y: 0.0,
          v_y: 0.0,
          v: v_final,
          a: a_final,
          a_teorica: a_teorica,
          v_teorica: v_teorica_siguiente,
          x_teorica: x_teorica_siguiente,
          fuerzas: {
            Traccion: modo === 'Aceleracion' ? f_variable : 0.0,
            Peso: -m * G,
            Normal: Normal,
            Frenado: modo === 'Frenado' ? -f_variable : 0.0,
            Friccion: -fk,
            ResistenciaAire: -drag,
            FuerzaNeta: finalizoRuta ? 0.0 : F_neta
          },
          explicacion: finalizoRuta ? `Trazado completado con éxito.` : explicacion,
          terminado: terminado || finalizoRuta
        };
      }
    }
  };

  const absDegree = (deg) => Math.abs(deg);

  const animarLoop = (timestamp) => {
    if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
    const elapsed = timestamp - lastUpdateRef.current;
    
    // Ajustar el intervalo según el factor de velocidad
    const targetInterval = 50 / factorVelocidad;
    
    if (elapsed >= targetInterval) {
      lastUpdateRef.current = timestamp;
      
      const ultimo = pasosRef.current[pasosRef.current.length - 1] || { 
        t: 0.0, 
        x: 0.0, 
        y: 0.0,
        v_y: 0.0,
        v: escenario !== 'Elevador' && escenario !== 'Avion' ? parseFloat(vInicial) : 0.0 
      };
      
      try {
        const sig = calcularPasoFisica(0.05, ultimo.x, ultimo.v, ultimo.t, ultimo.y, ultimo.v_y);
        
        const nuevoPaso = {
          t: sig.t,
          x: sig.x,
          y: sig.y || 0.0,
          v_y: sig.v_y || 0.0,
          v: sig.v,
          a: sig.a,
          fuerza_neta: sig.fuerzas.FuerzaNeta || sig.fuerzas.Tension - Math.abs(sig.fuerzas.Peso) + (sig.fuerzas.ResistenciaAire || 0),
          fuerzas: sig.fuerzas,
          explicacion: sig.explicacion,
          terminado: sig.terminado,
          a_teorica: sig.a_teorica || 0.0,
          v_teorica: sig.v_teorica || 0.0,
          x_teorica: sig.x_teorica || 0.0
        };
        
        const nuevosPasos = [...pasosRef.current, nuevoPaso];
        pasosRef.current = nuevosPasos;
        setPasos(nuevosPasos);
        setTelemetria(sig);
        telemetriaRef.current = sig;
        
        if (sig.terminado) {
          setIsRunning(false);
          setFrenoManual(false);
          guardarEnBaseDatos(nuevosPasos, sig);
        }
      } catch (err) {
        setIsRunning(false);
        setErrorMessage(err.message);
      }
    }
    
    if (isRunning) {
      requestRef.current = requestAnimationFrame(animarLoop);
    }
  };

  const avanzarPasoSimulacion = () => {
    if (isRunning) return;
    setErrorMessage('');
    
    const ultimo = pasosRef.current[pasosRef.current.length - 1] || { 
      t: 0.0, 
      x: 0.0, 
      y: 0.0,
      v_y: 0.0,
      v: escenario !== 'Elevador' && escenario !== 'Avion' ? parseFloat(vInicial) : 0.0 
    };
    
    try {
      const sig = calcularPasoFisica(0.05, ultimo.x, ultimo.v, ultimo.t, ultimo.y, ultimo.v_y);
      
      const nuevoPaso = {
        t: sig.t,
        x: sig.x,
        y: sig.y || 0.0,
        v_y: sig.v_y || 0.0,
        v: sig.v,
        a: sig.a,
        fuerza_neta: sig.fuerzas.FuerzaNeta || sig.fuerzas.Tension - Math.abs(sig.fuerzas.Peso) + (sig.fuerzas.ResistenciaAire || 0),
        fuerzas: sig.fuerzas,
        explicacion: sig.explicacion,
        terminado: sig.terminado,
        a_teorica: sig.a_teorica || 0.0,
        v_teorica: sig.v_teorica || 0.0,
        x_teorica: sig.x_teorica || 0.0
      };
      
      const nuevosPasos = [...pasosRef.current, nuevoPaso];
      pasosRef.current = nuevosPasos;
      setPasos(nuevosPasos);
      setTelemetria(sig);
      telemetriaRef.current = sig;
      
      if (sig.terminado) {
        setFrenoManual(false);
        guardarEnBaseDatos(nuevosPasos, sig);
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const generarNuevoDesafio = () => {
    setQuizRespuestaUsuario('');
    setQuizVerificado(false);
    setQuizEsCorrecto(false);
    
    // Escoger escenario aleatorio (0: Terrestre, 1: Elevador, 2: Atwood)
    const tipo = Math.floor(Math.random() * 3);
    const G = 9.81;
    
    if (tipo === 0) {
      // Vehículo Terrestre
      const m = Math.floor(Math.random() * 1500) + 500; // 500 - 2000 kg
      const theta = Math.floor(Math.random() * 20) + 5; // 5 - 25 grados
      const mu_k = parseFloat((Math.random() * 0.3 + 0.1).toFixed(2)); // 0.1 - 0.4
      const f_motor = Math.floor(Math.random() * 6000) + 3000; // 3000 - 9000 N
      
      const angleRad = (theta * Math.PI) / 180.0;
      const P_x = m * G * Math.sin(angleRad);
      const Normal = m * G * Math.cos(angleRad);
      const f_rod = mu_k * Normal;
      const F_neta = f_motor - f_rod - P_x;
      const acel = F_neta / m;
      
      setQuizPregunta(`Un automóvil de masa m = ${m} kg sube por una calzada inclinada θ = ${theta}° con coeficiente de fricción cinética μk = ${mu_k}. El motor ejerce una fuerza de tracción constante de ${f_motor} N. Determine analíticamente la aceleración del vehículo cuesta arriba (en m/s²).`);
      setQuizRespuestaCorrecta(acel);
      
      setQuizProcedimiento([
        `DATOS IDENTIFICADOS DEL PROBLEMA:`,
        `  • Masa del cuerpo (m) = ${m} kg`,
        `  • Ángulo de inclinación (θ) = ${theta}°`,
        `  • Coeficiente de fricción cinética (μk) = ${mu_k}`,
        `  • Fuerza de tracción aplicada (F_motor) = ${f_motor} N`,
        `  • Aceleración de la gravedad (g) = 9.81 m/s²`,
        ``,
        `DESGLOSE DE RESOLUCIÓN PASO A PASO:`,
        `1. Peso tangencial: Px = m · g · sen(θ) = ${m} · 9.81 · sen(${theta}°) = ${P_x.toFixed(1)} N`,
        `2. Fuerza Normal: N = m · g · cos(θ) = ${m} · 9.81 · cos(${theta}°) = ${Normal.toFixed(1)} N`,
        `3. Fuerza de Rozamiento: fk = μk · N = ${mu_k} · ${Normal.toFixed(1)} = ${f_rod.toFixed(1)} N`,
        `4. Fuerza Neta en el eje del plano: Fneta = F_motor - fk - Px = ${f_motor} - ${f_rod.toFixed(1)} - ${P_x.toFixed(1)} = ${F_neta.toFixed(1)} N`,
        `5. Aceleración: a = Fneta / m = ${F_neta.toFixed(1)} / ${m} = ${acel.toFixed(2)} m/s²`
      ]);
      
      setQuizParams({
        escenario: 'Automovil',
        masa: m,
        fuerza: f_motor,
        entorno: 'Seco',
        clima: 'Personalizado',
        inclinacion: theta,
        resistencia_aire: 0.0,
        friccion: mu_k,
        velocidad_inicial: 0.0,
        modo: 'Aceleracion'
      });
    } else if (tipo === 1) {
      // Elevador
      const m = Math.floor(Math.random() * 800) + 400; // 400 - 1200 kg
      const Peso = m * G;
      const acel_random = parseFloat((Math.random() * 2 + 1).toFixed(2)); // 1 - 3 m/s2
      const T_req = Math.round(m * (G + acel_random));
      
      const F_neta = T_req - Peso;
      const acel = F_neta / m;
      
      setQuizPregunta(`Una cabina de elevador de masa m = ${m} kg es izada verticalmente. El cable de tracción ejerce una fuerza de tensión constante de T = ${T_req} N. Determine la aceleración ascendente de la cabina (en m/s²), despreciando el rozamiento de aire.`);
      setQuizRespuestaCorrecta(acel);
      
      setQuizProcedimiento([
        `DATOS IDENTIFICADOS DEL PROBLEMA:`,
        `  • Masa de la cabina (m) = ${m} kg`,
        `  • Fuerza de tensión aplicada (T) = ${T_req} N`,
        `  • Aceleración de la gravedad (g) = 9.81 m/s²`,
        ``,
        `DESGLOSE DE RESOLUCIÓN PASO A PASO:`,
        `1. Fuerza de Gravedad (Peso): P = m · g = ${m} · 9.81 = ${Peso.toFixed(1)} N`,
        `2. Ecuación de Movimiento (Newton): Fneta = T - P = ${T_req} - ${Peso.toFixed(1)} = ${F_neta.toFixed(1)} N`,
        `3. Aceleración del elevador: a = Fneta / m = ${F_neta.toFixed(1)} / ${m} = ${acel.toFixed(2)} m/s²`
      ]);
      
      setQuizParams({
        escenario: 'Elevador',
        masa: m,
        fuerza: T_req,
        entorno: 'Aire',
        clima: 'Aire',
        inclinacion: 0.0,
        resistencia_aire: 0.0,
        velocidad_inicial: 0.0,
        modo: 'Aceleracion'
      });
    } else {
      // Atwood
      const m1 = Math.floor(Math.random() * 30) + 10; // 10 - 40 kg
      const m2 = m1 + Math.floor(Math.random() * 20) + 5; // ensure m2 > m1, 15 - 60 kg
      
      const P1 = m1 * G;
      const P2 = m2 * G;
      const F_neta = P2 - P1;
      const total_m = m1 + m2;
      const acel = F_neta / total_m;
      const Tension = m1 * (G + acel);
      
      setQuizPregunta(`En una Máquina de Atwood acoplada, la masa de la izquierda es m1 = ${m1} kg y la de la derecha es m2 = ${m2} kg. El sistema parte libremente del reposo. Determine la aceleración resultante del sistema de bloques (en m/s²).`);
      setQuizRespuestaCorrecta(acel);
      
      setQuizProcedimiento([
        `DATOS IDENTIFICADOS DEL PROBLEMA:`,
        `  • Masa izquierda (m1) = ${m1} kg`,
        `  • Masa derecha (m2) = ${m2} kg`,
        `  • Aceleración de la gravedad (g) = 9.81 m/s²`,
        ``,
        `DESGLOSE DE RESOLUCIÓN PASO A PASO:`,
        `1. Peso del bloque izquierdo: P1 = m1 · g = ${m1} · 9.81 = ${P1.toFixed(1)} N`,
        `2. Peso del bloque derecho: P2 = m2 · g = ${m2} · 9.81 = ${P2.toFixed(1)} N`,
        `3. Fuerza Neta en el sistema acoplado: Fneta = P2 - P1 = ${P2.toFixed(1)} - ${P1.toFixed(1)} = ${F_neta.toFixed(1)} N`,
        `4. Masa Total Inercial: M = m1 + m2 = ${m1} + ${m2} = ${total_m} kg`,
        `5. Aceleración de los bloques: a = Fneta / M = ${F_neta.toFixed(1)} / ${total_m} = ${acel.toFixed(2)} m/s²`,
        `6. Tensión resultante del hilo: T = m1 · (g + a) = ${m1} · (9.81 + ${acel.toFixed(2)}) = ${Tension.toFixed(1)} N`
      ]);
      
      setQuizParams({
        escenario: 'Atwood',
        masa: m1,
        masa_2: m2,
        fuerza: 0.0,
        entorno: 'Aire',
        clima: 'Aire',
        inclinacion: 0.0,
        resistencia_aire: 0.0,
        velocidad_inicial: 0.0,
        modo: 'Aceleracion'
      });
    }
  };

  const cargarQuizEnSimulador = () => {
    if (!quizParams) return;
    cargandoPresetRef.current = true;
    setFrenoManual(false);
    setEscenario(quizParams.escenario);
    setMasa(quizParams.masa);
    if (quizParams.masa_2 !== undefined) setMasa2(quizParams.masa_2);
    setFuerza(quizParams.fuerza);
    setEntorno(quizParams.entorno);
    setInclinacion(quizParams.inclinacion);
    setResistenciaAire(quizParams.resistencia_aire);
    setVInicial(quizParams.velocidad_inicial);
    setModo(quizParams.modo);
    
    // Configurar y activar el modo problema libre para sincronizar los coeficientes de fricción del quiz
    setModoProblemaActivo('libre');
    setParamsLibre({
      escenario: quizParams.escenario,
      masa: quizParams.masa,
      masa_2: quizParams.masa_2 || 0,
      fuerza: quizParams.fuerza,
      friccion: quizParams.friccion !== undefined ? quizParams.friccion : 0.0,
      friccion_estatica: quizParams.friccion !== undefined ? quizParams.friccion + 0.2 : 0.8,
      inclinacion: quizParams.inclinacion,
      v_inicial: quizParams.velocidad_inicial,
      v_final: 50.0,
      tipo_movimiento: quizParams.modo === 'Frenado' ? 'Frenado' : 'Aceleracion',
      radio_curva: 80
    });

    if (quizParams.friccion !== undefined) {
      setFriccionEstatica(quizParams.friccion + 0.2);
    }
    setTab('simulador');
    
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center space-x-2 font-mono text-xs transition-all duration-500 ease-out translate-y-10 opacity-0';
    toast.innerHTML = `<i class="fa-solid fa-flask text-cyan-400 text-sm animate-bounce"></i> <span>Parámetros del Desafío cargados en el Simulador. ¡Corriendo simulación para comprobar la aceleración!</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('translate-y-10', 'opacity-0');
    }, 10);
    setTimeout(() => {
      toast.classList.add('translate-y-10', 'opacity-0');
      setTimeout(() => toast.remove(), 500);
    }, 3500);
    
    setTimeout(() => {
      cargandoPresetRef.current = false;
    }, 100);

    setTimeout(() => {
      resetearSimulacion();
      iniciarSimulacion();
    }, 200);
  };

  const iniciarSimulacion = () => {
    setErrorMessage('');
    if (telemetria.terminado) {
      resetearSimulacion();
    }
    
    if (pasos.length === 0) {
      const isAvionCrucero = escenario === 'Avion' && vueloCrucero;
      const v_ini = isAvionCrucero ? parseFloat(vInicial) : (escenario !== 'Elevador' && escenario !== 'Avion' && escenario !== 'Atwood' ? parseFloat(vInicial) : 0.0);
      vInicialCorrida.current = v_ini;
      
      const estadoInicial = {
        t: 0.0,
        x: 0.0,
        y: isAvionCrucero ? 150.0 : 0.0,
        v_y: 0.0,
        v: v_ini,
        a: 0.0,
        a_teorica: 0.0,
        v_teorica: v_ini,
        x_teorica: 0.0,
        despego: isAvionCrucero ? true : false,
        sustentacion: isAvionCrucero ? (138.0 * parseFloat(sustentacionCoef) * (v_ini ** 2)) : 0.0,
        fuerzas: { Traccion: 0, Peso: 0, Normal: 0, Frenado: 0, Friccion: 0, ResistenciaAire: 0, FuerzaNeta: 0 },
        explicacion: isAvionCrucero ? 'Iniciando vuelo crucero...' : 'Iniciando simulación...',
        terminado: false
      };
      setPasos([estadoInicial]);
      pasosRef.current = [estadoInicial];
    }
    
    setIsRunning(true);
  };

  const pausarSimulacion = () => {
    setIsRunning(false);
    setFrenoManual(false);

    // Freno en seco: detener el vehículo de forma inmediata y marcar como terminado para mostrar análisis
    setTelemetria(prev => {
      const sig = {
        ...prev,
        v: 0.0,
        a: 0.0,
        terminado: true,
        explicacion: "Freno en seco activado. Simulación pausada y finalizada con detención de emergencia."
      };
      telemetriaRef.current = sig;
      
      // Actualizar el último paso para que la tabla y gráficas muestren la detención
      setPasos(prevPasos => {
        if (prevPasos.length === 0) return prevPasos;
        const nuevos = [...prevPasos];
        const ult = { ...nuevos[nuevos.length - 1] };
        ult.v = 0.0;
        ult.a = 0.0;
        ult.terminado = true;
        ult.explicacion = sig.explicacion;
        
        // Simular fuerza máxima de fricción estática del freno en seco para el DCL
        if (ult.fuerzas) {
          const mVal = parseFloat(masa) || 1500.0;
          const inclRad = (parseFloat(inclinacion) * Math.PI) / 180.0;
          const Normal = mVal * 9.81 * Math.cos(inclRad);
          const f_fric = parseFloat(friccionEstatica || 0.8) * Normal;
          
          ult.fuerzas = {
            ...ult.fuerzas,
            Frenado: -f_fric,
            Friccion: -f_fric,
            FuerzaNeta: 0.0
          };
        }
        nuevos[nuevos.length - 1] = ult;
        return nuevos;
      });
      
      return sig;
    });
  };

  const resetearSimulacion = () => {
    setIsRunning(false);
    setErrorMessage('');
    setFrenoManual(false);
    xAlFrenarRef.current = null;
    tAlFrenarRef.current = null;
    
    const isAvionCrucero = escenario === 'Avion' && vueloCrucero;
    const v_ini = isAvionCrucero ? parseFloat(vInicial) : (escenario !== 'Elevador' && escenario !== 'Avion' && escenario !== 'Atwood' ? parseFloat(vInicial) : 0.0);
    
    const estadoReset = {
      t: 0.0,
      x: 0.0,
      y: isAvionCrucero ? 150.0 : 0.0,
      v_y: 0.0,
      v: v_ini,
      a: 0.0,
      a_teorica: 0.0,
      v_teorica: v_ini,
      x_teorica: 0.0,
      despego: isAvionCrucero ? true : false,
      sustentacion: isAvionCrucero ? (138.0 * parseFloat(sustentacionCoef) * (v_ini ** 2)) : 0.0,
      fuerzas: { Traccion: 0, Peso: 0, Normal: 0, Frenado: 0, Friccion: 0, ResistenciaAire: 0, FuerzaNeta: 0 },
      explicacion: isAvionCrucero ? 'Simulador en vuelo crucero listo.' : 'Simulador configurado y listo.',
      terminado: false
    };
    
    setTelemetria(estadoReset);
    telemetriaRef.current = estadoReset;
    setPasos([]);
    pasosRef.current = [];
    setHoveredPoint(null);
  };

  const obtenerAnalisisDeError = () => {
    if (pasos.length === 0) return null;
    
    const validPasos = pasos.filter(p => p.t > 0);
    if (validPasos.length === 0) return null;
    
    const acelRealProm = validPasos.reduce((sum, p) => sum + p.a, 0) / validPasos.length;
    const acelTeoricaProm = validPasos.reduce((sum, p) => sum + (p.a_teorica || 0), 0) / validPasos.length;
    
    const ultimoPaso = pasos[pasos.length - 1];
    const velRealFinal = ultimoPaso.v;
    const velTeoricaFinal = ultimoPaso.v_teorica || 0.0;
    
    const posRealFinal = ultimoPaso.x;
    const posTeoricaFinal = ultimoPaso.x_teorica || 0.0;
    
    let errorAcel = 0;
    if (Math.abs(acelTeoricaProm) > 1e-4) {
      errorAcel = (Math.abs(acelTeoricaProm - acelRealProm) / Math.abs(acelTeoricaProm)) * 100;
    }
    
    let errorVel = 0;
    if (Math.abs(velTeoricaFinal) > 1e-4) {
      errorVel = (Math.abs(velTeoricaFinal - velRealFinal) / Math.abs(velTeoricaFinal)) * 100;
    }

    let errorPos = 0;
    if (Math.abs(posTeoricaFinal) > 1e-4) {
      errorPos = (Math.abs(posTeoricaFinal - posRealFinal) / Math.abs(posTeoricaFinal)) * 100;
    }
    
    let explicacion = "";
    const b = parseFloat(resistenciaAire);
    const escL = escenario.toLowerCase();
    
    if (escL === 'atwood') {
      if (b > 0) {
        explicacion = `El error relativo se debe principalmente a la resistencia del aire (coeficiente b = ${b.toFixed(2)} N·s/m). En el modelo teórico ideal, se asume un sistema completamente libre de fricción y arrastre del medio.`;
      } else {
        explicacion = `Con coeficiente de arrastre nulo (b = 0), el comportamiento real coincide plenamente con el modelo teórico de la Máquina de Atwood.`;
      }
    } else if (escL === 'elevador') {
      if (b > 0) {
        explicacion = `La discrepancia del ${errorVel.toFixed(1)}% en la velocidad final surge por la resistencia viscosa del fluido (${entorno === 'Agua (Fluido Viscoso)' ? 'agua' : 'aire'}) con coeficiente b = ${b.toFixed(2)} N·s/m, la cual aumenta linealmente con la velocidad de cabina, limitando la aceleración real frente a la ideal.`;
      } else {
        explicacion = `Sin resistencia de fluido (vacío), la cabina se acelera siguiendo rigurosamente la ecuación teórica a = (T - P)/m.`;
      }
    } else {
      if (b > 0) {
        explicacion = `El modelo real considera la resistencia aerodinámica del aire (F_d = 0.5·ρ·Cd·A·v²) que aumenta con el cuadrado de la velocidad. Esto genera una fuerza retardadora progresiva que reduce la aceleración neta real en comparación con el modelo ideal sin arrastre aerodinámico.`;
      } else {
        explicacion = `Al anular la resistencia del aire, el comportamiento del vehículo se rige únicamente por la fuerza del motor, la gravedad en rampa y la fricción constante del suelo.`;
      }
    }
    
    return {
      acelRealProm,
      acelTeoricaProm,
      velRealFinal,
      velTeoricaFinal,
      posRealFinal,
      posTeoricaFinal,
      errorAcel,
      errorVel,
      errorPos,
      explicacion
    };
  };

  const renderAnalisisDeErrorOverlay = () => {
    if (!telemetria.terminado || pasos.length === 0) return null;
    const analisis = obtenerAnalisisDeError();
    if (!analisis) return null;
    
    return (
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-fade-in">
        <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 max-w-lg w-full shadow-2xl flex flex-col space-y-2.5 max-h-[92vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
            <h4 className="text-xs font-bold text-cyan-400 tracking-wider uppercase flex items-center">
              <i className="fa-solid fa-square-poll-vertical mr-2"></i> Reporte y Resultados del Ensayo
            </h4>
            <button 
              onClick={() => resetearSimulacion()}
              className="text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded hover:bg-slate-800"
              title="Resetear simulación"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 flex flex-col justify-center">
              <span className="text-[8px] font-bold text-slate-500 uppercase font-mono">Aceleración Promedio</span>
              <span className="text-xs font-bold text-cyan-400 font-mono mt-0.5">{analisis.acelRealProm.toFixed(3)} m/s²</span>
              <span className="text-[8.5px] text-slate-500 font-mono">Teórica Ideal: {analisis.acelTeoricaProm.toFixed(3)} m/s² (Dif: {analisis.errorAcel.toFixed(1)}%)</span>
            </div>
            
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 flex flex-col justify-center">
              <span className="text-[8px] font-bold text-slate-500 uppercase font-mono">Velocidad Final Alcanzada</span>
              <span className="text-xs font-bold text-cyan-400 font-mono mt-0.5">{analisis.velRealFinal.toFixed(3)} m/s</span>
              <span className="text-[8.5px] text-slate-500 font-mono">Teórica Ideal: {analisis.velTeoricaFinal.toFixed(3)} m/s (Dif: {analisis.errorVel.toFixed(1)}%)</span>
            </div>
            
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 flex flex-col justify-center">
              <span className="text-[8px] font-bold text-slate-500 uppercase font-mono">Distancia de Desplazamiento</span>
              <span className="text-xs font-bold text-cyan-400 font-mono mt-0.5">{analisis.posRealFinal.toFixed(2)} m</span>
              <span className="text-[8.5px] text-slate-500 font-mono">Teórica Ideal: {analisis.posTeoricaFinal.toFixed(2)} m (Dif: {analisis.errorPos.toFixed(1)}%)</span>
            </div>
            
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 flex flex-col justify-center">
              <span className="text-[8px] font-bold text-slate-500 uppercase font-mono">Tiempo Total de Tránsito</span>
              <span className="text-xs font-bold text-cyan-400 font-mono mt-0.5">{telemetria.t.toFixed(3)} s</span>
              <span className="text-[8.5px] text-slate-500 font-mono">Masa Principal: {masa} kg {escenario === 'Atwood' ? `• Masa Derecha: ${masa2} kg` : ''}</span>
            </div>
          </div>
          
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 space-y-1.5">
            <span className="text-[8.5px] font-bold text-cyan-400 uppercase tracking-widest block font-mono">Breakdown de Fuerzas en el Sistema (DCL):</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[9.5px] text-slate-400 font-mono">
              <div>• Tracción/Cable: <span className="text-emerald-400 font-bold">{(telemetria.fuerzas.Traccion || 0.0).toFixed(1)} N</span></div>
              <div>• Gravedad (Peso): <span className="text-rose-400 font-bold">{(telemetria.fuerzas.Peso || 0.0).toFixed(1)} N</span></div>
              {escenario !== 'Elevador' && escenario !== 'Atwood' && (
                <div>• Reacción Normal: <span className="text-cyan-400 font-bold">{(telemetria.fuerzas.Normal || 0.0).toFixed(1)} N</span></div>
              )}
              {escenario !== 'Elevador' && escenario !== 'Atwood' && (
                <div>• Fricción Calzada: <span className="text-rose-400 font-bold">{(telemetria.fuerzas.Friccion || 0.0).toFixed(1)} N</span></div>
              )}
              {parseFloat(resistenciaAire) > 0 && (
                <div>• Arrastre del Aire: <span className="text-amber-500 font-bold">{(telemetria.fuerzas.ResistenciaAire || 0.0).toFixed(1)} N</span></div>
              )}
              <div>• Fuerza Neta: <span className="text-teal-400 font-bold">{(telemetria.fuerzas.FuerzaNeta || 0.0).toFixed(1)} N</span></div>
            </div>
          </div>
          
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 text-[10px] text-slate-300 font-mono leading-relaxed h-auto max-h-[100px] overflow-y-auto">
            <span className="text-cyan-400 font-bold">Conclusión Dinámica del Ensayo:</span>
            <p className="mt-0.5 text-slate-400">{analisis.explicacion}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-2 border-t border-slate-800/60">
            <span className="text-[8.5px] text-slate-500">Laboratorio de Física UTP • Universidad Tecnológica del Perú</span>
            
            <div className="flex items-center space-x-1 justify-end">
              <button 
                onClick={exportarTXT} 
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-1 px-2 rounded-lg text-[9px] flex items-center space-x-1 transition-all cursor-pointer border border-slate-700"
                title="Exportar reporte de telemetría a TXT"
              >
                <i className="fa-solid fa-file-lines text-cyan-400"></i> 
                <span>TXT</span>
              </button>
              <button 
                onClick={exportarCSV} 
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-1 px-2 rounded-lg text-[9px] flex items-center space-x-1 transition-all cursor-pointer border border-slate-700"
                title="Exportar datos a CSV"
              >
                <i className="fa-solid fa-file-csv text-teal-400"></i> 
                <span>CSV</span>
              </button>
              <button 
                onClick={exportarExcel} 
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-1 px-2 rounded-lg text-[9px] flex items-center space-x-1 transition-all cursor-pointer border border-slate-700"
                title="Exportar reporte científico a Excel"
              >
                <i className="fa-solid fa-file-excel text-emerald-400"></i> 
                <span>Excel</span>
              </button>
              <button 
                onClick={imprimirReporteLaboratorio} 
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-1 px-2 rounded-lg text-[9px] flex items-center space-x-1 transition-all cursor-pointer border border-slate-700"
                title="Imprimir reporte en PDF"
              >
                <i className="fa-solid fa-print text-cyan-400"></i> 
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // CONEXIÓN CON EL BACKEND (REST API)
  // ==========================================
  const cargarHistorial = async () => {
    try {
      const res = await fetch('/api/records/');
      if (res.ok) {
        const data = await res.json();
        setHistorial(data);
      }
    } catch (e) {
      console.error("Error al cargar historial desde la API:", e);
    }
  };

  const guardarEnBaseDatos = async (historialCorrida, estadoFinal) => {
    const sumaAcel = historialCorrida.reduce((acc, p) => acc + p.a, 0);
    const acelProm = sumaAcel / Math.max(1, historialCorrida.length);
    
    const bodyData = {
      escenario: escenario,
      masa: parseFloat(masa),
      fuerza: parseFloat(fuerza),
      friccion: obtenerCoeficienteFriccion(),
      aceleracion_promedio: acelProm,
      tiempo_total: estadoFinal.t,
      distancia_recorrida: estadoFinal.x,
      altura: escenario === 'Elevador' ? parseFloat(alturaMax) : (escenario === 'Avion' ? estadoFinal.y : (escenario === 'Curva' ? parseFloat(radioCurva) : undefined)),
      clima: entorno,
      velocidad_inicial: escenario !== 'Elevador' && escenario !== 'Avion' && escenario !== 'Atwood' ? parseFloat(vInicial) : 0.0,
      resistencia_aire: parseFloat(resistenciaAire),
      inclinacion: parseFloat(inclinacion),
      masa_2: escenario === 'Atwood' ? parseFloat(masa2) : undefined,
      friccion_estatica: parseFloat(friccionEstatica),
      perfil_fuerza: perfilFuerza,
      modo: modo,
      sustentacion_coef: escenario === 'Avion' ? parseFloat(sustentacionCoef) : undefined
    };
    
    try {
      const res = await fetch('/api/records/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      if (res.ok) {
        cargarHistorial();
      }
    } catch (e) {
      console.error("Error al guardar registro en base de datos:", e);
    }
  };

  const eliminarRegistro = async (id) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el ensayo #${id}?`)) return;
    try {
      const res = await fetch(`/api/records/${id}/`, { method: 'DELETE' });
      if (res.ok) {
        cargarHistorial();
      }
    } catch (e) {
      console.error("Error al eliminar registro:", e);
    }
  };

  const cargarRegistro = (reg) => {
    cargandoPresetRef.current = true;
    setEscenario(reg.escenario);
    setMasa(reg.masa);
    setFuerza(reg.fuerza);
    setEntorno(reg.clima);
    setResistenciaAire(reg.resistencia_aire);
    if (reg.velocidad_inicial !== undefined) setVInicial(reg.velocidad_inicial);
    if (reg.inclinacion !== undefined) setInclinacion(reg.inclinacion);
    if (reg.masa_2 !== undefined && reg.masa_2 !== null) setMasa2(reg.masa_2);
    if (reg.friccion_estatica !== undefined && reg.friccion_estatica !== null) setFriccionEstatica(reg.friccion_estatica);
    if (reg.perfil_fuerza !== undefined && reg.perfil_fuerza !== null) setPerfilFuerza(reg.perfil_fuerza);
    if (reg.modo !== undefined && reg.modo !== null) setModo(reg.modo);
    if (reg.sustentacion_coef !== undefined && reg.sustentacion_coef !== null) setSustentacionCoef(reg.sustentacion_coef);
    if (reg.altura !== undefined && reg.altura !== null) {
      if (reg.escenario === 'Elevador') setAlturaMax(reg.altura);
      if (reg.escenario === 'Curva') setRadioCurva(reg.altura);
    }
    
    setTab('simulador');

    // Muestra una notificación toast elegante
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center space-x-2 font-mono text-xs transition-all duration-500 ease-out translate-y-10 opacity-0';
    toast.innerHTML = `<i class="fa-solid fa-circle-check text-cyan-400 text-sm"></i> <span>Ensayo <strong class="text-cyan-400">#${reg.id}</strong> cargado con éxito. ¡Listo para simular!</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('translate-y-10', 'opacity-0');
    }, 10);
    setTimeout(() => {
      toast.classList.add('translate-y-10', 'opacity-0');
      setTimeout(() => toast.remove(), 500);
    }, 3000);

    setTimeout(() => {
      cargandoPresetRef.current = false;
    }, 100);
    
    setTimeout(() => {
      resetearSimulacion();
    }, 100);
  };

  const simularPasosParaRegistro = (reg) => {
    const escLower = reg.escenario.toLowerCase();
    const m = reg.masa;
    const f = reg.fuerza;
    const b = reg.resistencia_aire || 0.0;
    const inclinacionVal = reg.inclinacion || 0.0;
    const theta = (inclinacionVal * Math.PI) / 180.0;
    const fric = reg.friccion;
    const v_inicial = reg.velocidad_inicial || 0.0;
    const m2_val = reg.masa_2 || 0.0;
    const mu_s = reg.friccion_estatica || 0.8;
    const perfilF = reg.perfil_fuerza || 'Constante';
    const rmodo = reg.modo || 'Aceleracion';
    
    const dt = 0.05;
    let t = 0.0;
    let x = 0.0;
    let v = v_inicial;
    let y = 0.0;
    let v_y = 0.0;
    let terminado = false;
    
    const localPasos = [];
    
    if (escLower === 'elevador' && v_inicial < 0.0) {
      x = reg.altura - 20; 
      if (x < 10) x = 60;
      y = x;
      v_y = v;
    }
    
    const limit = Math.ceil(reg.tiempo_total / dt) + 10;
    let count = 0;
    
    while (!terminado && count < limit && t <= Math.max(30.0, reg.tiempo_total)) {
      count++;
      let f_var = f;
      if (perfilF === 'Impulso') {
        f_var = t <= 2.0 ? f : 0.0;
      } else if (perfilF === 'Rampa') {
        f_var = f * (Math.min(6.0, t) / 6.0);
      } else if (perfilF === 'Senoidal') {
        f_var = f * Math.sin(Math.PI * t);
      }
      
      let a_teorica = 0.0;
      let a = 0.0;
      let forces = {};
      
      if (escLower === 'avion') {
        a_teorica = (f - (fric * m * 9.81 * Math.cos(theta)) - (m * 9.81 * Math.sin(theta))) / m;
      } else if (escLower === 'elevador') {
        a_teorica = (f - (m * 9.81)) / m;
      } else if (escLower === 'atwood') {
        a_teorica = ((m2_val - m) * 9.81) / (m + m2_val);
      } else {
        a_teorica = (f - (fric * m * 9.81 * Math.cos(theta)) - (m * 9.81 * Math.sin(theta))) / m;
      }
      
      let v_teorica = v_inicial + a_teorica * t;
      if (v_teorica < 0) v_teorica = 0.0;
      let x_teorica = v_inicial * t + 0.5 * a_teorica * (t ** 2);
      
      if (escLower === 'avion') {
        const cl = reg.sustentacion_coef || 0.5;
        const Sustentacion = 138.0 * cl * (v ** 2);
        const drag = b * (v ** 2);
        const P_y = m * 9.81 * Math.cos(theta);
        const P_x = m * 9.81 * Math.sin(theta);
        const despego = Sustentacion >= P_y;
        
        let Normal = 0.0;
        let f_rod = 0.0;
        let a_y = 0.0;
        
        if (!despego) {
          Normal = P_y - Sustentacion;
          f_rod = fric * Normal;
        } else {
          const F_y_neta = Sustentacion - P_y - 0.2 * b * v_y;
          a_y = F_y_neta / m;
          v_y = v_y + a_y * dt;
          y = y + v_y * dt + 0.5 * a_y * (dt ** 2);
          if (y < 0) { y = 0.0; v_y = 0.0; }
        }
        
        const F_neta = f_var - f_rod - drag - P_x;
        a = F_neta / m;
        v = v + a * dt;
        if (v < 0) v = 0.0;
        x = x + v * dt + 0.5 * a * (dt ** 2);
        
        forces = { FuerzaNeta: F_neta, Normal, Friccion: -f_rod, ResistenciaAire: -drag };
        terminado = despego && (x >= 2500.0 || v > 150.0 || y >= 250.0);
      }
      else if (escLower === 'elevador') {
        const Peso = m * 9.81;
        const F_aire = -b * v;
        const F_neta = f_var - Peso + F_aire;
        a = F_neta / m;
        v = v + a * dt;
        x = x + v * dt + 0.5 * a * (dt ** 2);
        y = x;
        
        forces = { FuerzaNeta: F_neta, Peso: -Peso, ResistenciaAire: F_aire };
        
        if (x <= 0.0) {
          x = 0.0; y = 0.0; v = 0.0; a = 0.0;
          terminado = true;
        } else if (x >= reg.altura) {
          x = reg.altura; y = reg.altura; v = 0.0; a = 0.0;
          terminado = true;
        }
      }
      else if (escLower === 'atwood') {
        const P1 = m * 9.81;
        const P2 = m2_val * 9.81;
        const F_drag = -b * v;
        const F_neta = (P2 - P1) + F_drag;
        a = F_neta / (m + m2_val);
        v = v + a * dt;
        x = x + v * dt + 0.5 * a * (dt ** 2);
        
        forces = { FuerzaNeta: F_neta, Peso: P2 - P1, ResistenciaAire: F_drag };
        if (x >= 8.0 || x <= -8.0) {
          x = x >= 8.0 ? 8.0 : -8.0;
          v = 0.0; a = 0.0;
          terminado = true;
        }
      }
      else if (escLower === 'curva') {
        const R = reg.altura || 80.0;
        const thetaLocal = theta;
        const tan_theta = Math.tan(thetaLocal);
        const denom_max = 1.0 - mu_s * tan_theta;
        const v_max = denom_max > 1e-4 ? Math.sqrt(9.81 * R * (tan_theta + mu_s) / denom_max) : 999.0;
        const v_min = tan_theta > mu_s ? Math.sqrt(9.81 * R * (tan_theta - mu_s) / (1.0 + mu_s * tan_theta)) : 0.0;
        
        if (v > v_max || v < v_min) {
          terminado = true;
        }
        
        const Normal = m * (9.81 * Math.cos(thetaLocal) + (v ** 2) / R * Math.sin(thetaLocal));
        const fk = fric * Normal;
        const drag = 0.5 * 1.225 * b * (v ** 2);
        
        let F_neta = rmodo === 'Frenado' ? -(f_var + fk + drag) : f_var - (fk + drag);
        a = F_neta / m;
        v = v + a * dt;
        if (rmodo === 'Frenado' && v <= 0.0) { v = 0.0; a = 0.0; terminado = true; }
        x = x + v * dt + 0.5 * a * (dt ** 2);
        
        forces = { FuerzaNeta: F_neta, Normal, Friccion: -fk, ResistenciaAire: -drag };
        if (x >= 800.0) terminado = true;
      }
      else {
        const Normal = m * 9.81 * Math.cos(theta);
        const fk = fric * Normal;
        const P_x = m * 9.81 * Math.sin(theta);
        const drag = 0.5 * 1.225 * b * (v ** 2);
        
        let F_neta = rmodo === 'Frenado' ? -(f_var + fk + drag) - P_x : f_var - (fk + drag) - P_x;
        a = F_neta / m;
        v = v + a * dt;
        if (rmodo === 'Frenado' && v <= 0.0) { v = 0.0; a = 0.0; terminado = true; }
        x = x + v * dt + 0.5 * a * (dt ** 2);
        
        forces = { FuerzaNeta: F_neta, Normal, Friccion: -fk, ResistenciaAire: -drag };
        if (x >= 800.0) terminado = true;
      }
      
      localPasos.push({
        t: t,
        x: x,
        y: y,
        v_y: v_y,
        v: v,
        a: a,
        a_teorica: a_teorica,
        v_teorica: v_teorica,
        x_teorica: x_teorica,
        fuerzas: forces
      });
      
      t += dt;
    }
    
    return localPasos;
  };

  const exportarRegistroEspecificoExcel = async (reg) => {
    const localPasos = simularPasosParaRegistro(reg);
    const payload = {
      info: {
        id: reg.id,
        escenario: reg.escenario,
        masa: reg.masa,
        fuerza: reg.fuerza,
        friccion: reg.friccion,
        tiempo_total: reg.tiempo_total,
        distancia_recorrida: reg.distancia_recorrida,
        aceleracion_promedio: reg.aceleracion_promedio,
        v_inicial: reg.velocidad_inicial,
        inclinacion: reg.inclinacion,
        clima: reg.clima,
        masa_2: reg.masa_2,
        friccion_estatica: reg.friccion_estatica,
        perfil_fuerza: reg.perfil_fuerza,
        resistencia_aire: reg.resistencia_aire,
        sustentacion_coef: reg.sustentacion_coef,
        circuito: (reg.escenario === 'Curva' || reg.escenario === 'Automovil' || reg.escenario === 'Camion' || reg.escenario === 'Motocicleta' || reg.escenario === 'Avion') ? 'Recta de Ensayos UTP' : undefined
      },
      pasos: localPasos
    };

    try {
      const res = await fetch('/api/records/export-excel/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_historico_ensayo_${reg.id}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (e) {
      console.error("Error al exportar Excel de registro específico:", e);
    }
  };

  const imprimirReporteLaboratorio = () => {
    if (pasos.length === 0) return;
    
    const w = window.open('', '_blank');
    if (!w) {
      alert("Por favor, permite las ventanas emergentes (popups) para generar la ficha de laboratorio.");
      return;
    }
    
    const sumaAcel = pasos.reduce((acc, p) => acc + p.a, 0);
    const acelProm = sumaAcel / Math.max(1, pasos.length);
    
    const m = parseFloat(masa);
    const fric = obtenerCoeficienteFriccion();
    const escL = escenario.toLowerCase();
    const theta = (inclinacion * Math.PI) / 180.0;
    
    const ecFinal = 0.5 * m * (telemetria.v ** 2);
    let hFinal = 0.0;
    if (escL === 'elevador' || escL === 'avion') {
      hFinal = telemetria.y || 0.0;
    } else {
      hFinal = telemetria.x * Math.sin(theta);
    }
    const epFinal = m * G * hFinal;
    
    let preguntas = [];
    if (escL === 'elevador') {
      preguntas = [
        "1. ¿Cómo se relaciona la fuerza de tensión del cable con la dirección de la aceleración observada?",
        "2. En caso de caída libre (Tensión = 0), explique el efecto del freno magnético en la velocidad final.",
        "3. Describa cómo varía la relación de energía potencial y cinética durante el ascenso."
      ];
    } else if (escL === 'atwood') {
      preguntas = [
        "1. Demuestre analíticamente por qué la aceleración del sistema Atwood es menor que la gravedad (g).",
        "2. Si las masas m1 y m2 fueran idénticas, describa el comportamiento dinámico del sistema.",
        "3. ¿Cómo influye el peso de la masa descendente en la tensión del cable?"
      ];
    } else if (escL === 'avion') {
      preguntas = [
        "1. ¿Cuál es la condición física de fuerzas verticales requerida para que el avión se sustente en el aire?",
        "2. Explique cómo afecta la resistencia aerodinámica (arrastre) al tiempo de despegue.",
        "3. Describa la transformación de energía desde el rodaje en pista hasta el vuelo estable."
      ];
    } else {
      preguntas = [
        "1. Explique cómo afecta el coeficiente de fricción de la superficie (μk) a la fuerza neta resultante.",
        "2. En base a los gráficos obtenidos, ¿la aceleración del móvil fue constante? Justifique su respuesta.",
        "3. ¿Qué ocurre con la energía mecánica total del móvil a lo largo del tiempo? Justifique en base al trabajo del roce."
      ];
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ficha de Laboratorio - Leyes de Newton</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 30px;
            color: #1e293b;
            font-size: 11px;
            line-height: 1.5;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .header-table td {
            border: 1px solid #cbd5e1;
            padding: 8px;
          }
          .header-title {
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            background-color: #f8fafc;
          }
          .section-title {
            font-size: 12px;
            font-weight: bold;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 4px;
            margin-top: 20px;
            margin-bottom: 10px;
            text-transform: uppercase;
            color: #0f172a;
          }
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          .data-table th, .data-table td {
            border: 1px solid #cbd5e1;
            padding: 6px;
            text-align: left;
          }
          .data-table th {
            background-color: #f1f5f9;
            font-weight: bold;
          }
          .blackboard-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-left: 4px solid #0284c7;
            padding: 10px;
            font-family: monospace;
            font-size: 10.5px;
            white-space: pre-wrap;
            margin-bottom: 15px;
          }
          .question-box {
            margin-bottom: 12px;
            padding: 8px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
          }
          .signature-space {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
          }
          .signature-line {
            width: 45%;
            border-top: 1px solid #64748b;
            text-align: center;
            padding-top: 5px;
            margin-top: 40px;
            font-weight: bold;
          }
          @media print {
            body { margin: 15px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td rowspan="3" style="width: 20%; text-align: center; font-weight: bold; font-size: 12px; color: #0284c7;">
              LABORATORIO DE FÍSICA UTP
            </td>
            <td class="header-title" colspan="2">
              REPORTE DE PRÁCTICA DE LABORATORIO DE FÍSICA CLÁSICA
            </td>
          </tr>
          <tr>
            <td style="width: 40%;"><strong>Asignatura:</strong> Física General - Dinámica</td>
            <td style="width: 40%;"><strong>Fecha de Simulación:</strong> ${new Date().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td><strong>Tema:</strong> 2da Ley de Newton (Dinámica Lineal)</td>
            <td><strong>Escenario Simulado:</strong> ${escenario.toUpperCase()}</td>
          </tr>
        </table>

        <div style="margin-bottom: 15px;">
          <strong>Estudiante(s):</strong> __________________________________________________________________________
        </div>

        <div class="section-title">1. Introducción Teórica</div>
        <p>
          La Segunda Ley de Newton establece que la aceleración de un objeto es directamente proporcional a la fuerza neta que actúa sobre él e inversamente proporcional a su masa ($a = F_{neta} / m$). En esta práctica de laboratorio digital, se analiza el comportamiento de las fuerzas aplicadas, normales, de roce cinético y arrastre aerodinámico en un sistema mecánico controlado, registrando de forma continua la cinemática y la conservación de la energía.
        </p>

        <div class="section-title">2. Variables y Parámetros del Ensayo</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Parámetro Físico</th>
              <th>Valor Ajustado</th>
              <th>Unidad</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Masa del Cuerpo ($m$)</td>
              <td>${masa}</td>
              <td>kg</td>
              <td>Masa inercial principal del móvil simulado</td>
            </tr>
            ${escenario === 'Atwood' ? `
            <tr>
              <td>Masa del Bloque 2 ($m_2$)</td>
              <td>${masa2}</td>
              <td>kg</td>
              <td>Masa acoplada del segundo bloque suspendido</td>
            </tr>
            ` : ''}
            <tr>
              <td>Fuerza Aplicada / Tracción ($F_{motor}$)</td>
              <td>${fuerza}</td>
              <td>N</td>
              <td>Fuerza constante ejercida por el motor o cable tensor</td>
            </tr>
            <tr>
              <td>Coeficiente de Roce Cinético ($\mu_k$)</td>
              <td>${fric.toFixed(2)}</td>
              <td>adim.</td>
              <td>Rozamiento del suelo según superficie (${entorno})</td>
            </tr>
            <tr>
              <td>Ángulo de Inclinación ($\theta$)</td>
              <td>${inclinacion}</td>
              <td>grados (°)</td>
              <td>Inclinación o pendiente del tramo inicial de pista</td>
            </tr>
            <tr>
              <td>Velocidad Inicial ($v_0$)</td>
              <td>${vInicialCorrida.current || 0.0}</td>
              <td>m/s</td>
              <td>Velocidad inicial en el instante t = 0s</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">3. Resultados y Telemetría del Sistema</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Indicador de Rendimiento</th>
              <th>Resultado Simulado</th>
              <th>Unidad</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tiempo Total registrado ($t_{fin}$)</td>
              <td>${telemetria.t.toFixed(2)}</td>
              <td>segundos (s)</td>
              <td>Duración del movimiento controlado</td>
            </tr>
            <tr>
              <td>Distancia Recorrida ($x_{fin}$)</td>
              <td>${telemetria.x.toFixed(2)}</td>
              <td>metros (m)</td>
              <td>Posición final alcanzada por el móvil</td>
            </tr>
            <tr>
              <td>Aceleración Promedio ($a_{prom}$)</td>
              <td>${acelProm.toFixed(2)}</td>
              <td>m/s²</td>
              <td>Promedio de la aceleración en todo el recorrido</td>
            </tr>
            <tr>
              <td>Velocidad Máxima ($v_{max}$)</td>
              <td>${Math.max(...pasos.map(p => p.v)).toFixed(1)}</td>
              <td>m/s</td>
              <td>Pico de velocidad cinemática alcanzada</td>
            </tr>
            <tr>
              <td>Energía Cinética Final ($E_c$)</td>
              <td>${ecFinal.toLocaleString(undefined, {maximumFractionDigits:1})}</td>
              <td>Joules (J)</td>
              <td>Energía asociada al movimiento al finalizar la corrida</td>
            </tr>
            <tr>
              <td>Energía Potencial Final ($E_p$)</td>
              <td>${epFinal.toLocaleString(undefined, {maximumFractionDigits:1})}</td>
              <td>Joules (J)</td>
              <td>Energía posicional respecto a la altura ganada</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">4. Desglose Analítico en Pizarra (Cálculo Teórico)</div>
        <div class="blackboard-box">
${escenario === 'Atwood' ? `
1. Fuerzas actuantes:
   - Bloque Izquierdo (m1 = ${m} kg): Peso P1 = ${m} * 9.81 = ${(m * 9.81).toFixed(1)} N
   - Bloque Derecho (m2 = ${masa2} kg): Peso P2 = ${masa2} * 9.81 = ${(parseFloat(masa2) * 9.81).toFixed(1)} N
2. Ecuación dinámica de sistema acoplado:
   a_teorica = (P2 - P1) / (m1 + m2) = (${(parseFloat(masa2) * 9.81).toFixed(1)} - ${(m * 9.81).toFixed(1)}) / (${m} + ${masa2})
   a_teorica = ${( (parseFloat(masa2)*9.81 - m*9.81) / (m + parseFloat(masa2)) ).toFixed(2)} m/s²
` : `
1. Fuerza Gravitatoria: P = m · g = ${m} · 9.81 = ${(m * 9.81).toFixed(1)} N
2. Componentes del Peso en Rampa (θ = ${inclinacion}°):
   - Py (Normal) = P · cos(θ) = ${(m * 9.81 * Math.cos(theta)).toFixed(1)} N
   - Px (Tangencial) = P · sen(θ) = ${(m * 9.81 * Math.sin(theta)).toFixed(1)} N
3. Fuerza de Rozamiento: fk = μk · Normal = ${fric.toFixed(2)} · ${(m * 9.81 * Math.cos(theta)).toFixed(1)} = ${(fric * m * 9.81 * Math.cos(theta)).toFixed(1)} N
4. Fuerza Neta en el Plano: Fneta = Fuerza_Motor - fk - Px = ${fuerza} - ${(fric * m * 9.81 * Math.cos(theta)).toFixed(1)} - ${(m * 9.81 * Math.sin(theta)).toFixed(1)} = ${(parseFloat(fuerza) - (fric * m * 9.81 * Math.cos(theta)) - (m * 9.81 * Math.sin(theta))).toFixed(1)} N
5. Aceleración Resultante: a = Fneta / m = ${acelProm.toFixed(2)} m/s²
`}
        </div>

        <div class="section-title">5. Cuestionario de Evaluación y Análisis</div>
        <p style="margin-bottom: 15px;">Responda con precisión las siguientes interrogantes en base a su observación en el laboratorio virtual:</p>
        
        ${preguntas.map(p => `
          <div class="question-box">
            <strong>${p}</strong>
            <div style="height: 55px; border-bottom: 1px dotted #94a3b8; margin-top: 15px;"></div>
          </div>
        `).join('')}

        <div class="section-title">6. Conclusiones y Firmas</div>
        <div style="height: 60px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 10px; margin-bottom: 20px;">
          Escriba aquí las conclusiones principales referentes a la Segunda Ley de Newton, la fricción y la energía observadas:
        </div>

        <div class="signature-space">
          <div class="signature-line">Firma del Estudiante</div>
          <div class="signature-line">Firma del Docente Evaluador</div>
        </div>

        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print();" style="background-color: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
            Imprimir Reporte o Guardar como PDF
          </button>
        </div>
      </body>
      </html>
    `;
    
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const exportarTXT = async () => {
    if (pasos.length === 0) return;
    const sumaAcel = pasos.reduce((acc, p) => acc + p.a, 0);
    const acelProm = sumaAcel / Math.max(1, pasos.length);
    
    const payload = {
      info: {
        escenario: escenario,
        masa: parseFloat(masa),
        fuerza: parseFloat(fuerza),
        friccion: obtenerCoeficienteFriccion(),
        tiempo_total: telemetria.t,
        distancia_recorrida: telemetria.x,
        aceleracion_promedio: acelProm,
        v_inicial: vInicialCorrida.current,
        inclinacion: parseFloat(inclinacion),
        clima: entorno,
        masa_2: escenario === 'Atwood' ? parseFloat(masa2) : undefined,
        friccion_estatica: parseFloat(friccionEstatica),
        perfil_fuerza: perfilFuerza,
        circuito: (escenario === 'Curva' || escenario === 'Automovil' || escenario === 'Camion' || escenario === 'Motocicleta' || escenario === 'Avion')
          ? (pistasCompuestas[trazadoPista] ? pistasCompuestas[trazadoPista].nombre : undefined)
          : undefined
      },
      pasos: pasos
    };

    try {
      const res = await fetch('/api/records/export-txt/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_${escenario.toLowerCase()}_newton.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const errData = await res.json();
        console.error("Error de backend al exportar TXT:", errData.error, errData.traceback);
        alert(`Error al exportar TXT: ${errData.error}\n\nRevisa la consola del servidor Django para ver el desglose completo.`);
      }
    } catch (e) {
      console.error("Error al exportar TXT:", e);
    }
  };

  const exportarCSV = async () => {
    if (pasos.length === 0) return;
    const payload = { pasos: pasos };

    try {
      const res = await fetch('/api/records/export-csv/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `muestreo_${escenario.toLowerCase()}_newton.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const errData = await res.json();
        console.error("Error de backend al exportar CSV:", errData.error, errData.traceback);
        alert(`Error al exportar CSV: ${errData.error}\n\nRevisa la consola del servidor Django para ver el desglose completo.`);
      }
    } catch (e) {
      console.error("Error al exportar CSV:", e);
    }
  };

  const exportarExcel = async () => {
    if (pasos.length === 0) return;
    const sumaAcel = pasos.reduce((acc, p) => acc + p.a, 0);
    const acelProm = sumaAcel / Math.max(1, pasos.length);
    
    const payload = {
      info: {
        escenario: escenario,
        masa: parseFloat(masa),
        fuerza: parseFloat(fuerza),
        friccion: obtenerCoeficienteFriccion(),
        tiempo_total: telemetria.t,
        distancia_recorrida: telemetria.x,
        aceleracion_promedio: acelProm,
        v_inicial: vInicialCorrida.current,
        inclinacion: parseFloat(inclinacion),
        clima: entorno,
        masa_2: escenario === 'Atwood' ? parseFloat(masa2) : undefined,
        friccion_estatica: parseFloat(friccionEstatica),
        perfil_fuerza: perfilFuerza,
        circuito: (escenario === 'Curva' || escenario === 'Automovil' || escenario === 'Camion' || escenario === 'Motocicleta' || escenario === 'Avion')
          ? (pistasCompuestas[trazadoPista] ? pistasCompuestas[trazadoPista].nombre : undefined)
          : undefined
      },
      pasos: pasos
    };

    try {
      const res = await fetch('/api/records/export-excel/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_${escenario.toLowerCase()}_newton.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const errData = await res.json();
        console.error("Error de backend al exportar Excel:", errData.error, errData.traceback);
        alert(`Error al exportar Excel: ${errData.error}\n\nRevisa la consola del servidor Django para ver el desglose completo.`);
      }
    } catch (e) {
      console.error("Error al exportar Excel:", e);
    }
  };

  const exportarHistorialExcel = async () => {
    try {
      const res = await fetch('/api/records/export-history/', {
        method: 'GET'
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `historial_completo_simulaciones.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const errData = await res.json();
        console.error("Error de backend al exportar historial:", errData.error, errData.traceback);
        alert(`Error al exportar historial: ${errData.error}\n\nRevisa la consola del navegador o del servidor Django para ver el desglose completo.`);
      }
    } catch (e) {
      console.error("Error al exportar historial a Excel:", e);
    }
  };



  const cargarCasoRapido = (caso) => {
    const escL = escenario.toLowerCase();
    if (escL === 'automovil' || escL === 'camion' || escL === 'motocicleta') {
      if (caso === 1) { // Subida / Ascenso
        const defaultAng = 12;
        const input = prompt(`Ingrese el ángulo de inclinación para la subida en grados (positivo, ej: ${defaultAng}):`, defaultAng);
        if (input === null) return; // Si cancela, no se altera nada
        let ang = parseFloat(input);
        if (isNaN(ang) || ang < 0) {
          alert("Ángulo inválido. Debe ser un número positivo para subida.");
          ang = defaultAng;
        }
        setModo('Aceleracion');
        setEntorno('Seco');
        setInclinacion(ang);
        setFuerza(escenario === 'Automovil' ? 14000 : (escenario === 'Camion' ? 50000 : 8000));
        setVInicial(0);
      } else if (caso === 2) { // Plano / Equilibrio
        setModo('Aceleracion');
        setEntorno('Seco');
        setInclinacion(0);
        setFuerza(escenario === 'Automovil' ? 8000 : (escenario === 'Camion' ? 25000 : 4500));
        setVInicial(0);
      } else if (caso === 3) { // Bajada / Descenso
        const defaultAng = -10;
        const input = prompt(`Ingrese el ángulo de inclinación para la bajada en grados (negativo, ej: ${defaultAng}):`, defaultAng);
        if (input === null) return; // Si cancela, no se altera nada
        let ang = parseFloat(input);
        if (isNaN(ang) || ang > 0) {
          alert("Ángulo inválido. Debe ser un número negativo para bajada.");
          ang = defaultAng;
        }
        setModo('Frenado');
        setEntorno('Mojado');
        setInclinacion(ang);
        setFuerza(escenario === 'Automovil' ? 12000 : (escenario === 'Camion' ? 35000 : 6000));
        setVInicial(25);
      }
    } else if (escL === 'elevador') {
      if (caso === 1) { // Subida / Ascenso
        setEntorno('Aire');
        setMasa(1200);
        setFuerza(18000);
      } else if (caso === 2) { // Plano / Equilibrio
        setEntorno('Aire');
        setMasa(1200);
        setFuerza(11772); // T = P (1200 * 9.81 = 11772)
      } else if (caso === 3) { // Bajada / Descenso
        setEntorno('Agua (Fluido Viscoso)');
        setMasa(1200);
        setFuerza(6000);
      }
    } else if (escL === 'avion') {
      if (caso === 1) { // Subida / Ascenso
        const defaultAng = 5;
        const input = prompt(`Ingrese el ángulo de inclinación para el avión en grados (positivo, ej: ${defaultAng}):`, defaultAng);
        if (input === null) return;
        let ang = parseFloat(input);
        if (isNaN(ang) || ang < 0) {
          alert("Ángulo de subida inválido. Se usará el valor por defecto.");
          ang = defaultAng;
        }
        setEntorno('Pista Seca');
        setInclinacion(ang);
        setFuerza(120000);
        setMasa(45000);
        setSustentacionCoef(0.55);
      } else if (caso === 2) { // Plano / Equilibrio
        setEntorno('Pista Seca');
        setInclinacion(0);
        setFuerza(95000);
        setMasa(45000);
        setSustentacionCoef(0.50);
      } else if (caso === 3) { // Bajada / Descenso
        const defaultAng = -3;
        const input = prompt(`Ingrese el ángulo de inclinación para el avión en grados (negativo, ej: ${defaultAng}):`, defaultAng);
        if (input === null) return;
        let ang = parseFloat(input);
        if (isNaN(ang) || ang > 0) {
          alert("Ángulo de bajada inválido. Se usará el valor por defecto.");
          ang = defaultAng;
        }
        setEntorno('Pista Mojada');
        setInclinacion(ang);
        setFuerza(80000);
        setMasa(48000);
        setSustentacionCoef(0.40);
      }
    } else if (escL === 'atwood') {
      if (caso === 1) { // Subida / Ascenso (m2 > m1, aceleración positiva)
        setEntorno('Vacío (Sin fricción)');
        setMasa(15);
        setMasa2(25);
        setResistenciaAire(0);
      } else if (caso === 2) { // Plano / Equilibrio (m1 = m2, aceleración nula)
        setEntorno('Vacío (Sin fricción)');
        setMasa(20);
        setMasa2(20);
        setResistenciaAire(0);
      } else if (caso === 3) { // Bajada / Descenso (m2 < m1, aceleración negativa)
        setEntorno('Aire');
        setMasa(30);
        setMasa2(15);
        setResistenciaAire(0.1);
      }
    }
  };

  // ==========================================
  // DIBUJO DENTRO DEL LIENZO CANVAS 2D
  // ==========================================
  const dibujarEscenario = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Ajustar resolución interna del canvas al tamaño real en el DOM (evita estiramiento)
    const rect = canvas.getBoundingClientRect();
    const desiredWidth = Math.round(rect.width);
    const desiredHeight = Math.round(rect.height);
    if (desiredWidth > 0 && desiredHeight > 0) {
      if (canvas.width !== desiredWidth || canvas.height !== desiredHeight) {
        canvas.width = desiredWidth;
        canvas.height = desiredHeight;
      }
    }

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    const pos = telemetria.x;
    const altitud = telemetria.y || 0.0;
    const vel = telemetria.v;
    const F = telemetria.fuerzas;
    const escLower = escenario.toLowerCase();
    const thetaRad = (inclinacion * Math.PI) / 180.0;

    // Fondo según la altitud del avión (de día soleado a espacio negro)
    let colorFondo;
    if (escLower === 'avion' && altitud > 10) {
      const factorColor = Math.min(1.0, altitud / 250.0);
      const r1 = Math.round(186 - factorColor * 186);
      const g1 = Math.round(230 - factorColor * 230);
      const b1 = Math.round(253 - factorColor * 253);
      
      const r2 = Math.round(224 - factorColor * 224);
      const g2 = Math.round(242 - factorColor * 242);
      const b2 = Math.round(254 - factorColor * 254);
      
      colorFondo = ctx.createLinearGradient(0, 0, 0, h);
      colorFondo.addColorStop(0, `rgb(${r1}, ${g1}, ${b1})`);
      colorFondo.addColorStop(1, `rgb(${r2}, ${g2}, ${b2})`);
    } else {
      colorFondo = ctx.createLinearGradient(0, 0, 0, h);
      colorFondo.addColorStop(0, '#bae6fd'); // Celeste soleado
      colorFondo.addColorStop(1, '#e0f2fe'); // Celeste claro
    }
    
    ctx.fillStyle = colorFondo;
    ctx.fillRect(0, 0, w, h);
    
    // Rejilla de fondo (sutil en tema diurno)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    for (let i = 25; i < w; i += 25) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h);
      ctx.stroke();
    }
    for (let j = 25; j < h; j += 25) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(w, j);
      ctx.stroke();
    }

    // Dibujar Nubes animadas / Desplazadas por paralaje
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    nubesRef.current.forEach((nube, idx) => {
      // Si el vehículo avanza en X, las nubes se desplazan a la izquierda
      // Si el avión sube en Y, las nubes se desplazan hacia abajo
      let cloudX = (nube.x - pos * nube.speed * 0.5) % (w + 100);
      if (cloudX < -100) cloudX += (w + 200);
      
      let cloudY = nube.y + altitud * 0.8;
      if (escLower === 'avion' && cloudY > h + 50) {
        // Reciclar nube arriba
        cloudY = (cloudY % (h + 100)) - 50;
      }
      
      // Dibujar nube simple con elipses
      ctx.beginPath();
      ctx.arc(cloudX, cloudY, nube.w * 0.3, 0, Math.PI * 2);
      ctx.arc(cloudX + nube.w * 0.2, cloudY - nube.w * 0.1, nube.w * 0.35, 0, Math.PI * 2);
      ctx.arc(cloudX + nube.w * 0.4, cloudY, nube.w * 0.25, 0, Math.PI * 2);
      ctx.fill();
    });

    if (escLower !== 'elevador' && escLower !== 'atwood' && escLower !== 'curva') {
      const dMax = escLower === 'avion' ? 1000.0 : 800.0;
      const spanPista = (w - 190) * (1.0 - 0.22 * Math.abs(Math.sin(thetaRad)));
      const xVehiculo = 65 + (pos / dMax) * spanPista;
      const yOffsetVehiculo = - (xVehiculo - 65) * Math.sin(thetaRad);
      
      // Cámara de seguimiento vertical dinámica (sigue al coche cuesta arriba/abajo)
      const yPiso = Math.round(h * 0.65 - yOffsetVehiculo * 0.85);
      
      // --- DIBUJAR PAISAJE DE HORIZONTE ESTÁTICO (MONTAÑAS, COLINAS, ÁRBOLES) ---
      let colorColinas = '#4ade80'; // Seco: verde brillante
      let colorCopaArbol = '#16a34a'; // Seco: verde
      let colorMontanas = '#64748b'; // Seco: gris azulado
      
      const eLower = (entorno || '').toLowerCase();
      if (eLower.includes('mojado') || eLower.includes('agua')) {
        colorColinas = '#15803d'; // Húmedo
        colorCopaArbol = '#064e3b';
        colorMontanas = '#475569';
      } else if (eLower.includes('hielo') || eLower.includes('nevada')) {
        colorColinas = '#f1f5f9'; // Nieve
        colorCopaArbol = '#e2e8f0';
        colorMontanas = '#cbd5e1';
      }

      // 1. Montañas Distantes
      ctx.fillStyle = colorMontanas;
      ctx.beginPath();
      ctx.moveTo(0, yPiso);
      ctx.lineTo(w * 0.18, yPiso - 52);
      ctx.lineTo(w * 0.35, yPiso);
      ctx.lineTo(w * 0.58, yPiso - 68);
      ctx.lineTo(w * 0.78, yPiso);
      ctx.lineTo(w * 0.88, yPiso - 42);
      ctx.lineTo(w, yPiso);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // 2. Colinas de césped
      ctx.fillStyle = colorColinas;
      ctx.beginPath();
      ctx.moveTo(0, yPiso);
      ctx.quadraticCurveTo(w * 0.25, yPiso - 20, w * 0.5, yPiso);
      ctx.quadraticCurveTo(w * 0.75, yPiso - 15, w, yPiso);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // 3. Árboles en el paisaje
      const dibujarArbol2D = (tx, ty) => {
        ctx.fillStyle = '#78350f'; // Tronco
        ctx.fillRect(tx - 3, ty - 12, 6, 12);
        ctx.fillStyle = colorCopaArbol; // Copa
        ctx.beginPath();
        ctx.arc(tx, ty - 18, 9, 0, Math.PI * 2);
        ctx.arc(tx - 6, ty - 14, 7, 0, Math.PI * 2);
        ctx.arc(tx + 6, ty - 14, 7, 0, Math.PI * 2);
        ctx.fill();
      };
      
      dibujarArbol2D(w * 0.12, yPiso);
      dibujarArbol2D(w * 0.38, yPiso);
      dibujarArbol2D(w * 0.76, yPiso);

      // Las variables dMax, spanPista y xVehiculo ya se declararon arriba para la cámara de seguimiento
      
      ctx.save();
      
      // Rotar y trasladar el contexto según la inclinación de la pista
      // Trasladar al origen visual de la pista (65, yPiso)
      ctx.translate(65, yPiso);
      ctx.rotate(-thetaRad); // Negativo para que +ángulo sea rampa de subida

      // Dibujar carretera en el espacio de coordenadas rotado
      const xInicioCarretera = -200;
      const xFinCarretera = w + 200;
      
      // 1. Relleno de montaña bajo el asfalto (evita efecto carretera flotando)
      ctx.fillStyle = colorColinas;
      ctx.fillRect(xInicioCarretera, 30, xFinCarretera - xInicioCarretera, 600);
      
      // 2. Capa de tierra/roca bajo el asfalto para mayor realismo
      ctx.fillStyle = '#78350f'; // Tierra marrón
      ctx.fillRect(xInicioCarretera, 30, xFinCarretera - xInicioCarretera, 6);
      
      // 3. Asfalto de la carretera
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(xInicioCarretera, 0, xFinCarretera - xInicioCarretera, 30);
      
      // Líneas intermitentes de carril
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.moveTo(xInicioCarretera, 12);
      ctx.lineTo(xFinCarretera, 12);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Dibujar huellas de frenado (skid marks) en el asfalto (alineado con las ruedas en el eje local)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.65)'; // Negro neumático translúcido
      pasos.forEach(p => {
        if (p.fuerzas && Math.abs(p.fuerzas.Frenado || 0) > 1.0 && p.v > 0.05) {
          const pX = (p.x / dMax) * spanPista;
          // Dibujar huellas de neumáticos traseros
          ctx.fillRect(pX - 8, 20, 5, 2);
          ctx.fillRect(pX - 8, 8, 5, 2);
        }
      });
      
      // Línea de meta de la simulación
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(spanPista, 0);
      ctx.lineTo(spanPista, 30);
      ctx.stroke();
      
      // Texto indicador de meta
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 7.5px monospace';
      ctx.fillText(`META ${dMax.toFixed(0)}m`, spanPista + 5, 22);

      // Dibujar el vehículo en la posición correspondiente en el espacio rotado
      // El vehículo se traslada horizontalmente a lo largo del eje X local
      const localX = xVehiculo - 65;
      const angleRuedas = (pos / RADIO_RUEDA) % (Math.PI * 2);

      // Escalar vehículo y DCL en dispositivos móviles o lienzos pequeños para evitar saturación visual
      const esCelular = w < 640 || h < 185;
      const escalaVehiculo = esCelular ? 0.72 : 1.0;

      ctx.save();
      if (esCelular) {
        ctx.translate(localX, 0);
        ctx.scale(escalaVehiculo, escalaVehiculo);
        ctx.translate(-localX, 0);
      }

      if (escLower === 'automovil') {
        const yCar = -30;
        
        ctx.fillStyle = '#06b6d4'; // Cyan
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        ctx.moveTo(localX, yCar + 15);
        ctx.lineTo(localX + 5, yCar + 5);
        ctx.lineTo(localX + 15, yCar + 5);
        ctx.lineTo(localX + 24, yCar - 4);
        ctx.lineTo(localX + 48, yCar - 4);
        ctx.lineTo(localX + 58, yCar + 8);
        ctx.lineTo(localX + 66, yCar + 10);
        ctx.lineTo(localX + 66, yCar + 22);
        ctx.lineTo(localX, yCar + 22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Vidrio
        ctx.fillStyle = 'rgba(186, 230, 253, 0.7)';
        ctx.beginPath();
        ctx.moveTo(localX + 26, yCar - 1);
        ctx.lineTo(localX + 46, yCar - 1);
        ctx.lineTo(localX + 53, yCar + 8);
        ctx.lineTo(localX + 26, yCar + 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Faros
        if (isRunning) {
          const gradFaro = ctx.createLinearGradient(localX + 66, yCar + 14, localX + 130, yCar + 20);
          gradFaro.addColorStop(0, 'rgba(34, 211, 238, 0.35)');
          gradFaro.addColorStop(1, 'rgba(34, 211, 238, 0)');
          ctx.fillStyle = gradFaro;
          ctx.beginPath();
          ctx.moveTo(localX + 66, yCar + 12);
          ctx.lineTo(localX + 130, yCar);
          ctx.lineTo(localX + 130, yCar + 30);
          ctx.closePath();
          ctx.fill();
        }
        if (modo === 'Frenado') {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(localX + 3, yCar + 15, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        dibujarRueda(ctx, localX + 13, -8, 8, angleRuedas);
        dibujarRueda(ctx, localX + 50, -8, 8, angleRuedas);

      } else if (escLower === 'camion') {
        const yTruck = -48;
        
        // Cabina
        ctx.fillStyle = '#3b82f6';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(localX + 63, yTruck + 18, 18, 22, 2);
        ctx.fill();
        ctx.stroke();

        // Ventana
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(localX + 70, yTruck + 22, 8, 8);

        // Contenedor
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.roundRect(localX, yTruck, 61, 40, 2);
        ctx.fill();
        ctx.stroke();

        if (modo === 'Frenado') {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
          ctx.fillRect(localX - 2, yTruck + 30, 3, 6);
          ctx.shadowBlur = 0;
        }

        dibujarRueda(ctx, localX + 12, -8, 8.5, angleRuedas);
        dibujarRueda(ctx, localX + 23, -8, 8.5, angleRuedas);
        dibujarRueda(ctx, localX + 71, -8, 8.5, angleRuedas);

      } else if (escLower === 'motocicleta') {
        const yMoto = -25;
        
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(localX + 8, -8);
        ctx.lineTo(localX + 19, yMoto + 10);
        ctx.lineTo(localX + 36, yMoto + 10);
        ctx.lineTo(localX + 44, -8);
        ctx.stroke();

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(localX + 14, yMoto + 6, 17, 4);

        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(localX + 28, yMoto + 12, 5, 0, Math.PI * 2);
        ctx.fill();

        // Piloto
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(localX + 27, yMoto - 7, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(localX + 27, yMoto - 3);
        ctx.lineTo(localX + 21, yMoto + 7);
        ctx.stroke();

        if (modo === 'Frenado') {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(localX + 8, yMoto + 10, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        dibujarRueda(ctx, localX + 7, -8, 8.5, angleRuedas);
        dibujarRueda(ctx, localX + 44, -8, 8.5, angleRuedas);

      } else if (escLower === 'avion') {
        // En el avión, si vuela, la posición vertical 'y' local es negativa (subiendo)
        // Escalamos 1 metro físico de altitud a 0.6 pixeles para que quepa en pantalla
        const localY = telemetria.despego ? -altitud * 0.6 : 0.0;
        const angleCabeceo = telemetria.despego ? Math.min(22, (telemetria.v_y || 0) * 2.5) * Math.PI / 180 : 0.0;

        ctx.save();
        ctx.translate(localX + 40, localY + 8);
        ctx.rotate(-angleCabeceo); // Pitch up

        // Estela
        if (isRunning) {
          const flamaW = Math.min(45, 10 + (fuerza * 0.00015));
          const gradFlama = ctx.createRadialGradient(-55, 4, 1, -55 - flamaW, 4, 12);
          gradFlama.addColorStop(0, '#f97316');
          gradFlama.addColorStop(0.5, '#ef4444');
          gradFlama.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = gradFlama;
          ctx.beginPath();
          ctx.arc(-42, 4, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(-42 - flamaW, 1, flamaW, 6);
        }

        // Tren de aterrizaje retráctil dibujado dentro del chasis del avión
        const factorRetraccion = Math.min(1.0, altitud / 15.0); // 0 en el suelo, 1 en vuelo alto
        const largoTren = 12 - factorRetraccion * 10; // De 12px a 2px
        
        if (largoTren > 2) {
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          
          // Tren trasero
          ctx.moveTo(-15, 6);
          ctx.lineTo(-15, 6 + largoTren);
          
          // Tren delantero
          ctx.moveTo(15, 6);
          ctx.lineTo(15, 6 + largoTren);
          ctx.stroke();
          
          // Ruedas
          dibujarRueda(ctx, -15, 6 + largoTren, 4, angleRuedas);
          dibujarRueda(ctx, 15, 6 + largoTren, 4, angleRuedas);
        }

        // Fuselaje
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 40, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cabina de piloto (Cockpit)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.moveTo(10, -6);
        ctx.quadraticCurveTo(22, -6, 26, -1);
        ctx.lineTo(8, -1);
        ctx.closePath();
        ctx.fill();

        // Cola
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(-32, -6);
        ctx.lineTo(-40, -20);
        ctx.lineTo(-30, -20);
        ctx.lineTo(-20, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Ala
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(-5, 2);
        ctx.lineTo(-20, 20);
        ctx.lineTo(-10, 20);
        ctx.lineTo(15, 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Turbina
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-8, 4, 15, 6);

        // Hélice giratoria en la nariz (x = 40)
        const anguloHelice = (Date.now() * (isRunning ? 0.05 : (vel > 0.1 ? 0.02 : 0.0))) % (Math.PI * 2);
        ctx.fillStyle = '#ef4444'; // Cono rojo
        ctx.beginPath();
        ctx.arc(40, 0, 4, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
        
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        const largoAspa = 15;
        ctx.beginPath();
        ctx.moveTo(40, 0);
        ctx.lineTo(40 + Math.sin(anguloHelice) * 2, Math.cos(anguloHelice) * largoAspa);
        ctx.moveTo(40, 0);
        ctx.lineTo(40 - Math.sin(anguloHelice) * 2, -Math.cos(anguloHelice) * largoAspa);
        ctx.stroke();

        ctx.restore();
      }

      // --- DCL DENTRO DEL SISTEMA DE COORDENADAS ROTADO ---
      // El centro de fuerzas está centrado sobre el vehículo y sube si el avión vuela
      const localYForce = escLower === 'avion' && telemetria.despego ? -altitud * 0.6 : 0.0;
      const cFx = localX + 35;
      const cFy = -8 + localYForce;

      if (pasos.length > 0) {
        const fMaxAbs = Math.max(1000, parseFloat(fuerza), Math.abs(F.Peso || 0));
        const fEscala = 65.0 / fMaxAbs;

        // 1. Tracción / Empuje
        const traccVal = Math.abs(F.Traccion || 0);
        if (traccVal > 0) {
          const lTracc = Math.min(85, Math.max(15, traccVal * fEscala));
          dibujarFlechaDCL(ctx, cFx, cFy, cFx + lTracc, cFy, '#10b981', `FT: ${traccVal.toFixed(0)}N`);
        }

        // 2. Frenado / Fricción
        const frenVal = Math.abs(F.Frenado || 0);
        const fricVal = Math.abs(F.Friccion || 0);
        if (frenVal > 0) {
          const lFren = Math.min(85, Math.max(15, frenVal * fEscala));
          dibujarFlechaDCL(ctx, cFx, cFy, cFx - lFren, cFy, '#ef4444', `Ff: ${frenVal.toFixed(0)}N`);
        }
        if (fricVal > 0) {
          const lFric = Math.min(85, Math.max(15, fricVal * fEscala));
          dibujarFlechaDCL(ctx, cFx, cFy + 8, cFx - lFric, cFy + 8, '#f43f5e', `fr: ${fricVal.toFixed(0)}N`);
        }

        // 3. Arrastre del aire
        const dragVal = Math.abs(F.ResistenciaAire || 0);
        if (dragVal > 5) {
          const lDrag = Math.min(85, Math.max(15, dragVal * fEscala));
          dibujarFlechaDCL(ctx, cFx, cFy - 8, cFx - lDrag, cFy - 8, '#eab308', `Fd: ${dragVal.toFixed(0)}N`);
        }

        // 4. Peso de Gravedad (El peso siempre tira verticalmente hacia abajo en el mundo real,
        // pero en la vista del plano inclinado, la fuerza perpendicular es P_y y la paralela es P_x.
        // Dibujemos Peso total apuntando hacia abajo en el sistema rotado rotándolo al revés, o simplemente
        // dibujando el vector de gravedad con el ángulo real.
        // Dibujar Peso real y Normal)
        const pesoVal = Math.abs(F.Peso || 0);
        if (pesoVal > 0) {
          // El peso real tira verticalmente absoluto. Rotamos el vector por +thetaRad para que apunte hacia el centro de la tierra.
          const lPeso = Math.min(65, Math.max(15, pesoVal * fEscala));
          const pLocalX = cFx + lPeso * Math.sin(thetaRad);
          const pLocalY = cFy + lPeso * Math.cos(thetaRad);
          dibujarFlechaDCL(ctx, cFx, cFy, pLocalX, pLocalY, '#ef4444', `P: ${pesoVal.toFixed(0)}N`);
          
          // Descomposición del Peso (si hay inclinación)
          if (Math.abs(inclinacion) > 0.01) {
            const P_x_val = pesoVal * Math.sin(thetaRad);
            const P_y_val = pesoVal * Math.cos(thetaRad);
            
            // Py (perpendicular a la rampa, hacia abajo)
            const lPy = Math.min(65, Math.max(15, Math.abs(P_y_val) * fEscala));
            dibujarFlechaDCL(ctx, cFx, cFy, cFx, cFy + lPy, '#f87171', `Py: ${Math.abs(P_y_val).toFixed(0)}N`, true);
            
            // Px (paralelo a la rampa, hacia atrás si theta > 0)
            const lPx = Math.min(65, Math.max(15, Math.abs(P_x_val) * fEscala));
            const signPx = P_x_val >= 0 ? -1 : 1; // si sube, jala hacia atrás (-x local)
            dibujarFlechaDCL(ctx, cFx, cFy, cFx + signPx * lPx, cFy, '#f472b6', `Px: ${Math.abs(P_x_val).toFixed(0)}N`, true);
            
            // Dibujar líneas discontinuas de proyección del vector Peso a sus componentes
            ctx.strokeStyle = 'rgba(248, 113, 113, 0.4)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            ctx.moveTo(pLocalX, pLocalY);
            ctx.lineTo(cFx, cFy + lPy);
            ctx.moveTo(pLocalX, pLocalY);
            ctx.lineTo(cFx + signPx * lPx, cFy);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }

        // 5. Normal
        const normVal = Math.abs(F.Normal || 0);
        if (normVal > 0) {
          const lNorm = Math.min(65, Math.max(15, normVal * fEscala));
          dibujarFlechaDCL(ctx, cFx, cFy, cFx, cFy - lNorm, '#06b6d4', `N: ${normVal.toFixed(0)}N`);
        }

        // 6. Sustentación (Sólo avión)
        const sustVal = Math.abs(F.Sustentacion || 0);
        if (sustVal > 0) {
          const lSust = Math.min(65, Math.max(15, sustVal * fEscala));
          dibujarFlechaDCL(ctx, cFx + 8, cFy, cFx + 8, cFy - lSust, '#38bdf8', `L: ${sustVal.toFixed(0)}N`);
        }
      }

      ctx.restore(); // Restaura la escala del vehículo (móviles)
      ctx.restore(); // Restaura la rotación/traslación principal de la carretera

    } else if (escLower === 'curva') {
      const R_m = parseFloat(radioCurva);
      const theta = thetaRad;
      const mu_s = parseFloat(friccionEstatica);

      // --- DIBUJO 1: VISTA DE PLANTA (Curva Superior Izquierda) ---
      const cxLeft = w * 0.28;
      const cyLeft = h * 0.52;
      const R_pixel = Math.max(35, Math.round(h * 0.33));

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 26;
      ctx.beginPath();
      ctx.arc(cxLeft, cyLeft, R_pixel, Math.PI, 1.5 * Math.PI, false);
      ctx.stroke();

      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(cxLeft, cyLeft, R_pixel, Math.PI, 1.5 * Math.PI, false);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cxLeft, cyLeft - R_pixel - 13);
      ctx.lineTo(cxLeft, cyLeft - R_pixel + 13);
      ctx.stroke();

      const maxDist = 800.0;
      const anguloCoche = Math.PI + (pos / maxDist) * (Math.PI / 2);
      const carX = cxLeft + R_pixel * Math.cos(anguloCoche);
      const carY = cyLeft + R_pixel * Math.sin(anguloCoche);
      const carAngle = anguloCoche + Math.PI / 2;

      ctx.save();
      ctx.translate(carX, carY);
      ctx.rotate(carAngle);
      
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-8, -4, 16, 8);
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(2, -3, 3, 6);
      ctx.fillStyle = '#000000';
      ctx.fillRect(-6, -5, 3, 2);
      ctx.fillRect(-6, 3, 3, 2);
      ctx.fillRect(3, -5, 3, 2);
      ctx.fillRect(3, 3, 3, 2);

      ctx.restore();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 8px monospace';
      ctx.fillText("VISTA DE PLANTA (GIRO)", cxLeft - R_pixel - 10, cyLeft + 30);
      ctx.fillText(`Radio: ${R_m.toFixed(0)}m`, cxLeft - 30, cyLeft - 5);

      // --- DIBUJO 2: VISTA DE SECCIÓN (Peralte y DCL a la Derecha) ---
      const cxRight = w * 0.72;
      const cyRight = h * 0.58;
      
      const lenPeralte = Math.max(65, Math.round(h * 0.58));
      const pxStart = cxRight - (lenPeralte / 2) * Math.cos(theta);
      const pyStart = cyRight + (lenPeralte / 2) * Math.sin(theta);
      const pxEnd = cxRight + (lenPeralte / 2) * Math.cos(theta);
      const pyEnd = cyRight - (lenPeralte / 2) * Math.sin(theta);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(pxStart, pyStart);
      ctx.lineTo(pxEnd, pyEnd);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cxRight - lenPeralte/2 - 10, cyRight);
      ctx.lineTo(cxRight + lenPeralte/2 + 10, cyRight);
      ctx.stroke();

      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pxStart, pyStart, 30, 0, -theta, true);
      ctx.stroke();
      ctx.fillStyle = '#eab308';
      ctx.font = '7.5px monospace';
      ctx.fillText(`θ = ${(inclinacion).toFixed(0)}°`, pxStart + 35, pyStart - 8);

      const cCGx = cxRight;
      const cCGy = cyRight - 12;

      ctx.save();
      ctx.translate(cxRight, cyRight);
      ctx.rotate(-theta);

      ctx.fillStyle = '#06b6d4';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-16, -18, 32, 14, 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-12, -15, 24, 7);

      ctx.fillStyle = '#000000';
      ctx.fillRect(-14, -4, 6, 4);
      ctx.fillRect(8, -4, 6, 4);

      ctx.restore();

      if (pasos.length > 0) {
        const F_peso = m * G;
        const F_normal = m * (G * Math.cos(theta) + (vel ** 2) / R_m * Math.sin(theta));
        const F_fric_lat = m * ((vel ** 2) / R_m * Math.cos(theta) - G * Math.sin(theta));
        const F_centripeta = (m * (vel ** 2)) / R_m;

        const maxForce = Math.max(1000, F_peso, F_normal, Math.abs(F_fric_lat));
        const fScale = 45.0 / maxForce;

        const lP = Math.min(50, Math.max(15, F_peso * fScale));
        dibujarFlechaDCL(ctx, cCGx, cCGy, cCGx, cCGy + lP, '#ef4444', `P: ${F_peso.toFixed(0)}N`);

        const lN = Math.min(50, Math.max(15, F_normal * fScale));
        const nLocalX = cCGx - lN * Math.sin(theta);
        const nLocalY = cCGy - lN * Math.cos(theta);
        dibujarFlechaDCL(ctx, cCGx, cCGy, nLocalX, nLocalY, '#22d3ee', `N: ${F_normal.toFixed(0)}N`);

        if (Math.abs(F_fric_lat) > 5) {
          const lFs = Math.min(50, Math.max(10, Math.abs(F_fric_lat) * fScale));
          const fsSign = F_fric_lat > 0 ? -1 : 1;
          const fsLocalX = cCGx + fsSign * lFs * Math.cos(theta);
          const fsLocalY = cCGy + fsSign * lFs * Math.sin(theta);
          dibujarFlechaDCL(ctx, cCGx, cCGy, fsLocalX, fsLocalY, '#f43f5e', `fs: ${Math.abs(F_fric_lat).toFixed(0)}N`);
        }

        if (F_centripeta > 5) {
          const lFc = Math.min(45, Math.max(10, F_centripeta * fScale));
          dibujarFlechaDCL(ctx, cCGx, cCGy - 20, cCGx - lFc, cCGy - 20, '#eab308', `Fc: ${F_centripeta.toFixed(0)}N`);
        }
      }

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 8px monospace';
      ctx.fillText("DCL EN SECCIÓN TRANSVERSAL", cxRight - 65, cyRight + 30);

    } else if (escLower === 'elevador') {
      // ESCENARIO VERTICAL: ELEVADOR
      const cxEje = w / 2;
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cxEje - 50, 10);
      ctx.lineTo(cxEje - 50, h - 10);
      ctx.moveTo(cxEje + 50, 10);
      ctx.lineTo(cxEje + 50, h - 10);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '8px monospace';
      const rangoVisualY = h - 40;
      const ySuelo = h - 20;
      for (let mAlt = 0; mAlt <= alturaMax; mAlt += alturaMax / 5) {
        const yPosAlt = ySuelo - (mAlt / alturaMax) * rangoVisualY;
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cxEje - 60, yPosAlt);
        ctx.lineTo(cxEje - 50, yPosAlt);
        ctx.stroke();
        ctx.fillText(`${mAlt.toFixed(0)}m`, cxEje - 85, yPosAlt + 3);
      }

      const yCabina = ySuelo - (pos / alturaMax) * rangoVisualY;
      const altoCaja = 34;
      const anchoCaja = 44;

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cxEje, 10);
      ctx.lineTo(cxEje, yCabina);
      ctx.stroke();

      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cxEje, 10, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cxEje - Math.sin(pos) * 8, 10 - Math.cos(pos) * 8);
      ctx.lineTo(cxEje + Math.sin(pos) * 8, 10 + Math.cos(pos) * 8);
      ctx.stroke();

      ctx.fillStyle = '#10b981';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cxEje - anchoCaja / 2, yCabina, anchoCaja, altoCaja, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(cxEje - 12, yCabina + 6, 24, 10);

      if (pasos.length > 0) {
        const fMaxAbs = Math.max(1000, parseFloat(fuerza), Math.abs(F.Peso || 0));
        const fEscala = 55.0 / fMaxAbs;

        const tensVal = Math.abs(F.Tension || 0);
        if (tensVal > 0) {
          const lTens = Math.min(65, Math.max(15, tensVal * fEscala));
          dibujarFlechaDCL(ctx, cxEje, yCabina, cxEje, yCabina - lTens, '#10b981', `T: ${tensVal.toFixed(0)}N`);
        }

        const pesoVal = Math.abs(F.Peso || 0);
        if (pesoVal > 0) {
          const lPeso = Math.min(65, Math.max(15, pesoVal * fEscala));
          dibujarFlechaDCL(ctx, cxEje, yCabina + altoCaja, cxEje, yCabina + altoCaja + lPeso, '#ef4444', `P: ${pesoVal.toFixed(0)}N`);
        }

        const dragVal = Math.abs(F.ResistenciaAire || 0);
        if (dragVal > 1) {
          const lDrag = Math.min(50, Math.max(10, dragVal * fEscala));
          if (vel > 0) {
            dibujarFlechaDCL(ctx, cxEje + 15, yCabina + altoCaja, cxEje + 15, yCabina + altoCaja + lDrag, '#eab308', `Fd: ${dragVal.toFixed(0)}N`);
          } else if (vel < 0) {
            dibujarFlechaDCL(ctx, cxEje + 15, yCabina, cxEje + 15, yCabina - lDrag, '#eab308', `Fd: ${dragVal.toFixed(0)}N`);
          }
        }
      }
    } else if (escLower === 'atwood') {
      const cxPulley = w / 2;
      const cyPulley = Math.round(h * 0.23);
      const rPulley = Math.round(h * 0.08);
      
      // 1. Dibujar Soporte de la Polea
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cxPulley, 0);
      ctx.lineTo(cxPulley, cyPulley);
      ctx.stroke();
      
      // 2. Dibujar Suelo visual
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cxPulley - 90, h - 20);
      ctx.lineTo(cxPulley + 90, h - 20);
      ctx.stroke();
      
      // 3. Alturas de los dos bloques hanging.
      const scaleAtwood = Math.max(4.0, h * 0.0375); // 9 pixeles por metro a 240px de alto
      const yEquil = Math.round(h * 0.56);      // altura de equilibrio en pos = 0
      
      const y1 = yEquil - pos * scaleAtwood; // bloque izquierda (m1)
      const y2 = yEquil + pos * scaleAtwood; // bloque derecha (m2)
      
      const m1Val = parseFloat(masa);
      const m2Val = parseFloat(masa2);

      
      // Tamaños proporcionales a las masas
      const s1 = Math.max(18, Math.min(38, 14 + Math.sqrt(m1Val) * 3));
      const s2 = Math.max(18, Math.min(38, 14 + Math.sqrt(m2Val) * 3));
      
      // 4. Dibujar Cuerdas
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // izquierda
      ctx.moveTo(cxPulley - rPulley, cyPulley);
      ctx.lineTo(cxPulley - rPulley, y1);
      // derecha
      ctx.moveTo(cxPulley + rPulley, cyPulley);
      ctx.lineTo(cxPulley + rPulley, y2);
      // arco sobre polea
      ctx.arc(cxPulley, cyPulley, rPulley, Math.PI, 0, false);
      ctx.stroke();
      
      // 5. Dibujar Rueda Polea
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cxPulley, cyPulley, rPulley, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // eje central
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(cxPulley, cyPulley, 4.5, 0, Math.PI * 2);
      ctx.fill();
      
      // 6. Dibujar Bloque 1 (Izquierdo - m1)
      ctx.fillStyle = '#06b6d4'; // Cyan
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cxPulley - rPulley - s1 / 2, y1, s1, s1, 4);
      ctx.fill();
      ctx.stroke();
      
      // Texto m1
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8.5px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`m1`, cxPulley - rPulley, y1 + s1 / 2 - 2);
      ctx.fillText(`${m1Val.toFixed(0)}kg`, cxPulley - rPulley, y1 + s1 / 2 + 7);
      
      // 7. Dibujar Bloque 2 (Derecho - m2)
      ctx.fillStyle = '#10b981'; // Emerald
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cxPulley + rPulley - s2 / 2, y2, s2, s2, 4);
      ctx.fill();
      ctx.stroke();
      
      // Texto m2
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`m2`, cxPulley + rPulley, y2 + s2 / 2 - 2);
      ctx.fillText(`${m2Val.toFixed(0)}kg`, cxPulley + rPulley, y2 + s2 / 2 + 7);
      ctx.textAlign = 'left'; // restaurar alineación
      
      // 8. DCL de la Máquina de Atwood
      if (pasos.length > 0) {
        const T_val = F.Traccion || 0.0;
        const P1_val = m1Val * G;
        const P2_val = m2Val * G;
        
        const fMax = Math.max(100, P1_val, P2_val, T_val);
        const fEscala = 40.0 / fMax;
        
        const cx1 = cxPulley - rPulley;
        // Flecha Tensión (T) hacia arriba
        const lT1 = Math.min(50, Math.max(10, T_val * fEscala));
        dibujarFlechaDCL(ctx, cx1, y1, cx1, y1 - lT1, '#06b6d4', `T:${T_val.toFixed(0)}N`);
        // Flecha Peso 1 (P1) hacia abajo
        const lP1 = Math.min(50, Math.max(10, P1_val * fEscala));
        dibujarFlechaDCL(ctx, cx1, y1 + s1, cx1, y1 + s1 + lP1, '#ef4444', `P1:${P1_val.toFixed(0)}N`);
        
        const cx2 = cxPulley + rPulley;
        // Flecha Tensión (T) hacia arriba
        const lT2 = Math.min(50, Math.max(10, T_val * fEscala));
        dibujarFlechaDCL(ctx, cx2, y2, cx2, y2 - lT2, '#10b981', `T:${T_val.toFixed(0)}N`);
        // Flecha Peso 2 (P2) hacia abajo
        const lP2 = Math.min(50, Math.max(10, P2_val * fEscala));
        dibujarFlechaDCL(ctx, cx2, y2 + s2, cx2, y2 + s2 + lP2, '#ef4444', `P2:${P2_val.toFixed(0)}N`);
      }
    }
  };

  // Dibujar flechas del Diagrama de Cuerpo Libre
  const dibujarFlechaDCL = (ctx, x1, y1, x2, y2, color, etiqueta, dashed = false) => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = dashed ? 1.5 : 2.5;

    if (dashed) {
      ctx.setLineDash([3, 3]);
    }
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    if (dashed) {
      ctx.setLineDash([]);
    }

    // Dibujar cabeza de flecha
    const angulo = Math.atan2(y2 - y1, x2 - x1);
    const tamanoCabeza = 6;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - tamanoCabeza * Math.cos(angulo - Math.PI / 6), y2 - tamanoCabeza * Math.sin(angulo - Math.PI / 6));
    ctx.lineTo(x2 - tamanoCabeza * Math.cos(angulo + Math.PI / 6), y2 - tamanoCabeza * Math.sin(angulo + Math.PI / 6));
    ctx.fill();

    // Etiqueta
    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    const textW = ctx.measureText(etiqueta).width;
    const txtX = x2 + (x2 >= x1 ? 5 : -textW - 5);
    const txtY = y2 + (y2 >= y1 ? 3 : -3);
    ctx.fillRect(txtX - 2, txtY - 7, textW + 4, 9);
    
    ctx.fillStyle = color;
    ctx.fillText(etiqueta, txtX, txtY);
  };

  // Dibujar ruedas con radios rotatorios
  const dibujarRueda = (ctx, cx, cy, radio, angulo) => {
    ctx.fillStyle = '#090d16';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    
    ctx.beginPath();
    ctx.arc(cx, cy, radio, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - Math.sin(angulo) * radio, cy - Math.cos(angulo) * radio);
    ctx.lineTo(cx + Math.sin(angulo) * radio, cy + Math.cos(angulo) * radio);
    ctx.moveTo(cx - Math.sin(angulo + Math.PI/2) * radio, cy - Math.cos(angulo + Math.PI/2) * radio);
    ctx.lineTo(cx + Math.sin(angulo + Math.PI/2) * radio, cy + Math.cos(angulo + Math.PI/2) * radio);
    ctx.stroke();
  };

  // ==========================================
  // COMPONENTES DE GRAFICACIÓN SVG CON INTERACTIVIDAD HOVER
  // ==========================================
  const handleGraphMouseMove = (e, svgWidth) => {
    if (pasos.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const padding = 20;
    const graphW = svgWidth - 2 * padding;
    
    const tMax = Math.max(1.0, pasos[pasos.length - 1].t);
    const frac = (clientX - padding) / graphW;
    const tTarget = frac * tMax;

    if (clientX >= padding && clientX <= svgWidth - padding) {
      let masCercano = pasos[0];
      let diffMin = Math.abs(pasos[0].t - tTarget);
      
      for (let i = 1; i < pasos.length; i++) {
        const diff = Math.abs(pasos[i].t - tTarget);
        if (diff < diffMin) {
          diffMin = diff;
          masCercano = pasos[i];
        }
      }
      setHoveredPoint(masCercano);
    } else {
      setHoveredPoint(null);
    }
  };

  const renderGraficoSVG = (tipo) => {
    const w = 450;
    const h = 130;
    const padding = 20;
    const color = tipo === 'v' ? '#06b6d4' : '#ef4444';
    const labelY = tipo === 'v' ? 'Velocidad (m/s)' : 'Acel. (m/s²)';
    
    if (pasos.length === 0) {
      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full bg-slate-900/60 rounded-xl border border-slate-800">
          <text x={w/2} y={h/2} fill="#64748b" fontSize="11" textAnchor="middle" fontWeight="bold">
            Sin datos. Presione Iniciar Simulación.
          </text>
        </svg>
      );
    }

    const tMax = Math.max(1.0, pasos[pasos.length - 1].t);
    const m = parseFloat(masa);
    const fric = obtenerCoeficienteFriccion();
    const escL = escenario.toLowerCase();
    const theta = (inclinacion * Math.PI) / 180.0;

    if (tipo === 'e') {
      const datosEnergia = pasos.map(p => {
        const Ec = 0.5 * m * (p.v ** 2);
        
        let h_val = 0.0;
        if (escL === 'elevador' || escL === 'avion') {
          h_val = p.y || 0.0;
        } else {
          h_val = p.x * Math.sin(theta);
        }
        const Ep = m * 9.81 * h_val;
        
        const normalForce = escL === 'elevador' ? 0.0 : (escL === 'avion' ? (p.y > 0.01 ? 0.0 : m * 9.81 * Math.cos(theta) - (138 * parseFloat(sustentacionCoef) * (p.v ** 2))) : m * 9.81 * Math.cos(theta));
        const forceFric = normalForce > 0 ? normalForce * fric : 0.0;
        const Wfric = forceFric * p.x;
        
        return {
          t: p.t,
          Ec,
          Ep,
          Wfric,
          Etot: Ec + Ep + Wfric
        };
      });

      const todasEnergias = datosEnergia.flatMap(d => [d.Ec, d.Ep, d.Wfric, d.Etot]);
      let maxVal = Math.max(...todasEnergias, 10.0);
      let minVal = 0.0;

      const margen = maxVal * 0.1;
      maxVal += margen;

      const mapPoints = (key) => {
        return datosEnergia.map(d => {
          const x = padding + (d.t / tMax) * (w - 2 * padding);
          const y = h - padding - ((d[key] - minVal) / (maxVal - minVal)) * (h - 2 * padding);
          return `${x},${y}`;
        }).join(' ');
      };

      const ptsEc = mapPoints('Ec');
      const ptsEp = mapPoints('Ep');
      const ptsW = mapPoints('Wfric');
      const ptsTot = mapPoints('Etot');

      let hoverX = null;
      let hoverData = null;
      if (hoveredPoint) {
        const idx = Math.min(pasos.length - 1, Math.floor((hoveredPoint.t / tMax) * (pasos.length - 1)));
        hoverX = padding + (hoveredPoint.t / tMax) * (w - 2 * padding);
        hoverData = datosEnergia[idx];
      }

      return (
        <svg 
          viewBox={`0 0 ${w} ${h}`} 
          className="w-full h-full bg-slate-900/60 rounded-xl border border-slate-800 cursor-crosshair select-none"
          onMouseMove={(e) => handleGraphMouseMove(e, w)}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <line x1={padding} y1={h/2} x2={w-padding} y2={h/2} stroke="rgba(71, 85, 105, 0.2)" strokeDasharray="3,3" />
          <line x1={padding} y1={padding} x2={w-padding} y2={padding} stroke="rgba(71, 85, 105, 0.1)" />
          <line x1={padding} y1={h-padding} x2={w-padding} y2={h-padding} stroke="rgba(71, 85, 105, 0.1)" />

          <line x1={padding} y1={padding} x2={padding} y2={h-padding} stroke="#475569" strokeWidth="1.5" />
          <line x1={padding} y1={h-padding} x2={w-padding} y2={h-padding} stroke="#475569" strokeWidth="1.5" />
          
          <text x={padding + 5} y={padding + 8} fill="#94a3b8" fontSize="8" fontFamily="monospace">{maxVal.toLocaleString(undefined, {maximumFractionDigits:0})} J</text>
          <text x={padding + 5} y={h - padding - 2} fill="#94a3b8" fontSize="8" fontFamily="monospace">0 J</text>
          
          {/* Leyenda */}
          <g transform={`translate(${w - padding - 150}, ${padding - 10})`} fontSize="6.5" fontFamily="monospace" fontWeight="bold">
            <circle cx="5" cy="5" r="2.5" fill="#06b6d4" />
            <text x="10" y="7" fill="#06b6d4">Ec</text>
            <circle cx="30" cy="5" r="2.5" fill="#10b981" />
            <text x="35" y="7" fill="#10b981">Ep</text>
            <circle cx="55" cy="5" r="2.5" fill="#f97316" />
            <text x="60" y="7" fill="#f97316">Wroc</text>
            <circle cx="85" cy="5" r="2.5" fill="#d946ef" />
            <text x="90" y="7" fill="#d946ef">E_tot</text>
          </g>

          <polyline fill="none" stroke="#06b6d4" strokeWidth="1.5" points={ptsEc} />
          <polyline fill="none" stroke="#10b981" strokeWidth="1.5" points={ptsEp} />
          <polyline fill="none" stroke="#f97316" strokeWidth="1.5" points={ptsW} />
          <polyline fill="none" stroke="#d946ef" strokeWidth="2" points={ptsTot} />
          
          {hoverX !== null && hoverData && (
            <g>
              <line x1={hoverX} y1={padding} x2={hoverX} y2={h - padding} stroke="#64748b" strokeWidth="1" strokeDasharray="3,2" />
              
              <rect 
                x={hoverX > w / 2 ? hoverX - 105 : hoverX + 5} 
                y={padding} 
                width="100" 
                height="45" 
                rx="3" 
                fill="#0f172a" 
                stroke="#475569" 
                strokeWidth="1" 
              />
              <text x={hoverX > w / 2 ? hoverX - 100 : hoverX + 10} y={padding + 10} fill="#06b6d4" fontSize="7" fontFamily="monospace">Ec: {hoverData.Ec.toLocaleString(undefined, {maximumFractionDigits:0})} J</text>
              <text x={hoverX > w / 2 ? hoverX - 100 : hoverX + 10} y={padding + 20} fill="#10b981" fontSize="7" fontFamily="monospace">Ep: {hoverData.Ep.toLocaleString(undefined, {maximumFractionDigits:0})} J</text>
              <text x={hoverX > w / 2 ? hoverX - 100 : hoverX + 10} y={padding + 30} fill="#f97316" fontSize="7" fontFamily="monospace">Wr: {hoverData.Wfric.toLocaleString(undefined, {maximumFractionDigits:0})} J</text>
              <text x={hoverX > w / 2 ? hoverX - 100 : hoverX + 10} y={padding + 40} fill="#d946ef" fontSize="7" fontFamily="monospace" fontWeight="bold">Et: {hoverData.Etot.toLocaleString(undefined, {maximumFractionDigits:0})} J</text>
            </g>
          )}

          <text x={w - padding} y={h - 6} fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="end">{tMax.toFixed(2)}s</text>
          <text x={padding} y={h - 6} fill="#94a3b8" fontSize="8" fontFamily="monospace">0.0s</text>
        </svg>
      );
    }

    const valores = pasos.map(p => tipo === 'v' ? p.v : p.a);
    const valoresTeoricos = mostrarTeorica && pasos[0].a_teorica !== undefined ? pasos.map(p => tipo === 'v' ? p.v_teorica : p.a_teorica) : [];
    const todosValores = [...valores, ...valoresTeoricos];
    let minVal = Math.min(...todosValores);
    let maxVal = Math.max(...todosValores);

    if (Math.abs(maxVal - minVal) < 1e-4) {
      maxVal += 1.0;
      minVal -= 1.0;
    } else {
      const margen = (maxVal - minVal) * 0.15;
      maxVal += margen;
      minVal -= margen;
    }

    const puntos = pasos.map(p => {
      const val = tipo === 'v' ? p.v : p.a;
      const x = padding + (p.t / tMax) * (w - 2 * padding);
      const y = h - padding - ((val - minVal) / (maxVal - minVal)) * (h - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    const puntosTeoricos = mostrarTeorica && pasos[0].a_teorica !== undefined ? pasos.map(p => {
      const val = tipo === 'v' ? p.v_teorica : p.a_teorica;
      const x = padding + (p.t / tMax) * (w - 2 * padding);
      const y = h - padding - ((val - minVal) / (maxVal - minVal)) * (h - 2 * padding);
      return `${x},${y}`;
    }).join(' ') : null;

    let hoverX = null;
    let hoverY = null;
    let hoverVal = null;
    let hoverValTeorico = null;
    if (hoveredPoint) {
      hoverX = padding + (hoveredPoint.t / tMax) * (w - 2 * padding);
      const val = tipo === 'v' ? hoveredPoint.v : hoveredPoint.a;
      hoverY = h - padding - ((val - minVal) / (maxVal - minVal)) * (h - 2 * padding);
      hoverVal = val;
      hoverValTeorico = tipo === 'v' ? hoveredPoint.v_teorica : hoveredPoint.a_teorica;
    }

    return (
      <svg 
        viewBox={`0 0 ${w} ${h}`} 
        className="w-full h-full bg-slate-900/60 rounded-xl border border-slate-800 cursor-crosshair select-none"
        onMouseMove={(e) => handleGraphMouseMove(e, w)}
        onMouseLeave={() => setHoveredPoint(null)}
      >
        <line x1={padding} y1={h/2} x2={w-padding} y2={h/2} stroke="rgba(71, 85, 105, 0.3)" strokeDasharray="3,3" />
        <line x1={padding} y1={padding} x2={w-padding} y2={padding} stroke="rgba(71, 85, 105, 0.15)" />
        <line x1={padding} y1={h-padding} x2={w-padding} y2={h-padding} stroke="rgba(71, 85, 105, 0.15)" />

        <line x1={padding} y1={padding} x2={padding} y2={h-padding} stroke="#475569" strokeWidth="1.5" />
        <line x1={padding} y1={h-padding} x2={w-padding} y2={h-padding} stroke="#475569" strokeWidth="1.5" />
        
        <text x={padding + 5} y={padding + 8} fill="#94a3b8" fontSize="8" fontFamily="monospace">{maxVal.toFixed(1)}</text>
        <text x={padding + 5} y={h - padding - 2} fill="#94a3b8" fontSize="8" fontFamily="monospace">{minVal.toFixed(1)}</text>
        <text x={w - padding - 10} y={padding + 8} fill={color} fontSize="8.5" fontFamily="monospace" fontWeight="bold" textAnchor="end">{labelY}</text>

        {/* Línea Teórica Ideal (Dashed) */}
        {puntosTeoricos && (
          <polyline fill="none" stroke={tipo === 'v' ? '#22d3ee' : '#f87171'} strokeWidth="1.5" strokeDasharray="4,3" strokeOpacity="0.5" points={puntosTeoricos} />
        )}

        {/* Línea Real Simulada */}
        <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={puntos} />
        
        {hoverX !== null && (
          <g>
            <line x1={hoverX} y1={padding} x2={hoverX} y2={h - padding} stroke="#64748b" strokeWidth="1" strokeDasharray="3,2" />
            <circle cx={hoverX} cy={hoverY} r="4" fill={color} stroke="#ffffff" strokeWidth="1.5" />
            
            <rect 
              x={hoverX > w / 2 ? hoverX - 115 : hoverX + 5} 
              y={hoverY - 20 < padding ? padding : hoverY - 20} 
              width="110" 
              height="24" 
              rx="3" 
              fill="#0f172a" 
              stroke="#475569" 
              strokeWidth="1" 
            />
            <text 
              x={hoverX > w / 2 ? hoverX - 60 : hoverX + 60} 
              y={hoverY - 20 < padding ? padding + 9 : hoverY - 11} 
              fill="#ffffff" 
              fontSize="7.5" 
              fontFamily="monospace" 
              textAnchor="middle"
            >
              Real: {hoverVal.toFixed(2)}
            </text>
            <text 
              x={hoverX > w / 2 ? hoverX - 60 : hoverX + 60} 
              y={hoverY - 20 < padding ? padding + 19 : hoverY - 1} 
              fill={tipo === 'v' ? '#22d3ee' : '#f87171'} 
              fontSize="7.5" 
              fontFamily="monospace" 
              textAnchor="middle"
              fontWeight="bold"
            >
              Teórico: {hoverValTeorico !== undefined && hoverValTeorico !== null ? hoverValTeorico.toFixed(2) : 'N/A'}
            </text>
          </g>
        )}

        <text x={w - padding} y={h - 6} fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="end">{tMax.toFixed(2)}s</text>
        <text x={padding} y={h - 6} fill="#94a3b8" fontSize="8" fontFamily="monospace">0.0s</text>
      </svg>
    );
  };

  // ==========================================
  // ENUNCIADO DINÁMICO UTP
  // ==========================================
  const generarEnunciadoDinamico = () => {
    const m = parseFloat(masa);
    const f = parseFloat(fuerza);
    const incl = parseFloat(inclinacion);
    const clim = entorno; // Seco, Mojado, Hielo
    const fric = obtenerCoeficienteFriccion();
    const b = parseFloat(resistenciaAire);
    const r = parseFloat(radioCurva);
    const m2 = parseFloat(masa2);
    const isFrenado = modo === 'Frenado' || frenoManual;
    
    if (escenario === 'Automovil' || escenario === 'Camion' || escenario === 'Motocicleta') {
      const vehName = escenario === 'Automovil' ? 'automóvil' : escenario === 'Camion' ? 'camión de carga' : 'motociclista';
      const inclText = incl > 0 ? `sube por una pendiente inclinada θ = ${incl}°` : incl < 0 ? `desciende por una pendiente inclinada θ = ${Math.abs(incl)}°` : 'se desplaza sobre un plano horizontal';
      const forceText = isFrenado ? `se aplican los frenos ejerciendo una fuerza opositora constante de F_freno = ${f} N` : `el motor ejerce una fuerza de tracción constante de T = ${f} N`;
      return `Un ${vehName} de masa m = ${m} kg ${inclText}. En el trayecto sobre la calzada (${clim}, con coeficiente de fricción cinética μk = ${fric.toFixed(2)}), ${forceText}. Determine analíticamente la aceleración del vehículo (en m/s²) y analice el comportamiento dinámico considerando un arrastre aerodinámico b = ${b.toFixed(2)} kg/m.`;
    }
    if (escenario === 'Elevador') {
      const forceText = isFrenado ? `se activan los frenos magnéticos de emergencia ejerciendo una fuerza de frenado constante de F_freno = ${f} N` : `el cable de tracción ejerce una fuerza de tensión constante de T = ${f} N`;
      return `Una cabina de elevador de masa m = ${m} kg es izada verticalmente. El sistema opera de modo que ${forceText}. Determine la aceleración resultante de la cabina (en m/s²), despreciando el rozamiento de aire.`;
    }
    if (escenario === 'Avion') {
      return `Un avión comercial de masa m = ${m} kg inicia su rodaje en pista con un empuje de turbinas constante de T = ${f} N. La fuerza de sustentación vertical se modela con Cl = ${sustentacionCoef.toFixed(2)}. Calcule la aceleración horizontal del avión en pista venciendo la resistencia de rodadura (μ = 0.015) y el arrastre aerodinámico de b = ${b.toFixed(2)} kg/m antes del despegue.`;
    }
    if (escenario === 'Atwood') {
      return `En una máquina de Atwood acoplada, dos masas m1 = ${m} kg (izquierda) y m2 = ${m2} kg (derecha) están unidas por un cable ideal e inextensible sobre una polea sin fricción. Determine la aceleración resultante del sistema de bloques (en m/s²) al liberarse desde el reposo y la tensión resultante del cable de acoplamiento.`;
    }
    if (escenario === 'Curva') {
      return `Un vehículo de masa m = ${m} kg transita por una curva de radio R = ${r} m peraltada a θ = ${incl}° con un coeficiente de fricción estática de calzada μs = ${friccionEstatica.toFixed(2)}. Determine la fuerza normal dinámica de soporte, los límites seguros de velocidad de adherencia para evitar derrapes y la aceleración tangencial aplicando una fuerza tangencial constante de F = ${f} N.`;
    }
    const conf = escenariosConfig[escenario] || {};
    return conf.descripcion || '';
  };

  // ==========================================
  // DESGLOSE MATEMÁTICO EN TIEMPO REAL (FÓRMULAS)
  // ==========================================
  const renderFormulaSubstitution = () => {
    const modo = frenoManual ? 'Frenado' : modoRef.current;
    const m = parseFloat(masa);
    const f = parseFloat(fuerza);
    const fric = obtenerCoeficienteFriccion();
    const vAct = telemetria.v;
    const b = parseFloat(resistenciaAire);
    const escL = escenario.toLowerCase();
    const theta = (inclinacion * Math.PI) / 180.0;

    if (escL === 'avion') {
      const Peso = m * G;
      const cl = parseFloat(sustentacionCoef);
      // L = 1/2 * rho * S * Cl * v^2, factor = 138
      const Sustentacion = 138.0 * cl * (vAct ** 2);
      const drag = b * (vAct ** 2);
      
      const P_y = Peso * Math.cos(theta);
      const isCrucero = vueloCrucero;
      const despego = isCrucero ? true : (Sustentacion >= P_y);
      const Normal = isCrucero ? 0.0 : ((modoProblemaActivo === 'C' || modoProblemaActivo === 'libre') ? (despego ? 0.0 : P_y) : (despego ? 0.0 : P_y - Sustentacion));
      const f_rod = despego ? 0.0 : fric * Normal;
      const P_x = Peso * Math.sin(theta);
      const F_neta = f - f_rod - drag - P_x;
      const a = F_neta / m;

      return (
        <div className="space-y-2.5 font-mono text-[11px] text-slate-300">
          <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-sky-400 font-bold">1. Peso del Avión (P) y Sustentación (L):</span>
            <div className="pl-2 mt-1 text-slate-400">
              P = {m} · 9.81 = <strong className="text-white">{Peso.toFixed(0)} N</strong><br/>
              L = 138 · {cl.toFixed(2)} · {vAct.toFixed(1)}² = <strong className="text-sky-300">{Sustentacion.toFixed(0)} N</strong>
            </div>
          </div>
          <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-amber-400 font-bold">2. Fricción Pista, Arrastre y Pendiente:</span>
            <div className="pl-2 mt-1 text-slate-400">
              Normal = {isCrucero ? "0 N (Vuelo Crucero)" : (despego ? "0 N (Vuelo)" : `${P_y.toFixed(0)} - ${Sustentacion.toFixed(0)} = ${Normal.toFixed(0)} N`)}<br/>
              fr = {isCrucero ? "0 N (En el Aire)" : (despego ? "0 N" : `${fric.toFixed(3)} · ${Normal.toFixed(0)} = ${f_rod.toFixed(0)} N`)}<br/>
              Fd = {b.toFixed(2)} · {vAct.toFixed(1)}² = <strong className="text-amber-300">{drag.toFixed(0)} N</strong><br/>
              P_x = m · g · sen(θ) = <strong className="text-white">{P_x.toFixed(0)} N</strong>
            </div>
          </div>
          <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-emerald-400 font-bold">3. Aceleración Horizontal (ΣFx):</span>
            <div className="pl-2 mt-1 text-slate-400">
              ΣFx = Empuje - fr - Fd - P_x = <strong className="text-emerald-300">{F_neta.toFixed(0)} N</strong><br/>
              a = ΣFx / m = {F_neta.toFixed(0)} / {m} = <strong className="text-white">{a.toFixed(2)} m/s²</strong>
            </div>
          </div>
        </div>
      );
    } else if (escL === 'elevador') {
      const Peso = m * G;
      const F_aire = -b * vAct;
      const F_cable = modoProblemaActivo === 'B' ? 0.0 : f;
      const F_freno = modoProblemaActivo === 'B' ? parseFloat(paramsB.fuerza_freno) : 0.0;
      const F_neta = (modoProblemaActivo === 'B' ? F_freno : F_cable) - Peso + F_aire;
      const a = F_neta / m;

      return (
        <div className="space-y-2.5 font-mono text-[11px] text-slate-300">
          <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-rose-400 font-bold">1. Fuerza de Gravedad (Peso P):</span>
            <div className="pl-2 mt-1 text-slate-400">P = m · g = {m} kg · 9.81 = <strong className="text-white">{Peso.toFixed(0)} N</strong></div>
          </div>
          <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-amber-400 font-bold">2. Fuerza de Arrastre Viscosa (Fd):</span>
            <div className="pl-2 mt-1 text-slate-400">Fd = -b · v = -{b.toFixed(2)} · {vAct.toFixed(2)} = <strong className="text-amber-300">{F_aire.toFixed(1)} N</strong></div>
          </div>
          <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-emerald-400 font-bold">3. Ecuación de Newton (ΣFy):</span>
            <div className="pl-2 mt-1 text-slate-400">
              ΣFy = {modoProblemaActivo === 'B' ? `F_freno - Peso + Fd = ${F_freno} - ${Peso.toFixed(0)} + (${F_aire.toFixed(0)})` : `Tension - Peso + Fd = ${f} - ${Peso.toFixed(0)} + (${F_aire.toFixed(0)})`} = <strong className="text-emerald-300">{F_neta.toFixed(0)} N</strong><br/>
              a = ΣFy / m = {F_neta.toFixed(0)} / {m} = <strong className="text-white">{a.toFixed(2)} m/s²</strong>
            </div>
          </div>
        </div>
      );
    } else if (escL === 'atwood') {
      const m1 = m;
      const m2_val = parseFloat(masa2);
      const P1 = m1 * G;
      const P2 = m2_val * G;
      const F_drag = -b * vAct;
      const F_neta = (P2 - P1) + F_drag;
      const total_m = m1 + m2_val;
      const a = F_neta / total_m;
      const Tension = m1 * (G + a);

      return (
        <div className="space-y-2.5 font-mono text-[11px] text-slate-300">
          <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-sky-400 font-bold">1. Fuerzas Gravitatorias (Pesos):</span>
            <div className="pl-2 mt-1 text-slate-400">
              P1 (Masa Izq) = m1 · g = {m1.toFixed(0)} · 9.81 = <strong className="text-white">{P1.toFixed(0)} N</strong><br/>
              P2 (Masa Der) = m2 · g = {m2_val.toFixed(0)} · 9.81 = <strong className="text-white">{P2.toFixed(0)} N</strong>
            </div>
          </div>
          <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-amber-400 font-bold">2. Arrastre de Aire y Tensión del Cable:</span>
            <div className="pl-2 mt-1 text-slate-400">
              Fd = -b · v = -{b.toFixed(2)} · {vAct.toFixed(1)} = <strong className="text-amber-300">{F_drag.toFixed(1)} N</strong><br/>
              T = m1 · (g + a) = <strong className="text-white">{Tension.toFixed(1)} N</strong>
            </div>
          </div>
          <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-emerald-400 font-bold">3. Dinámica del Sistema Acoplado:</span>
            <div className="pl-2 mt-1 text-slate-400">
              F_neta = (P2 - P1) + Fd = ({P2.toFixed(0)} - {P1.toFixed(0)}) + ({F_drag.toFixed(0)}) = <strong className="text-emerald-300">{F_neta.toFixed(0)} N</strong><br/>
              a = F_neta / (m1 + m2) = {F_neta.toFixed(0)} / {total_m.toFixed(0)} = <strong className="text-white">{a.toFixed(2)} m/s²</strong>
            </div>
          </div>
        </div>
      );
    } else if (escL === 'curva' || escL === 'automovil' || escL === 'camion' || escL === 'motocicleta') {
      const { tramo } = obtenerTramoActual(telemetria.x || 0.0);
      const thetaLocal = ((tramo.inclinacion || 0.0) * Math.PI) / 180.0;
      
      if (tramo.tipo === 'curva') {
        const R = tramo.radio_curva || 60.0;
        const mu_s = tramo.friccion_estatica || 0.8;
        const tan_theta = Math.tan(thetaLocal);
        
        const Normal = m * (G * Math.cos(thetaLocal) + (vAct ** 2) / R * Math.sin(thetaLocal));
        const fk = modo === 'Frenado' ? (fric * Normal) : (0.015 * Normal);
        const drag = 0.5 * 1.225 * b * (vAct ** 2);
        
        const fs_req = m * ((vAct ** 2) / R * Math.cos(thetaLocal) - G * Math.sin(thetaLocal));
        
        const denom_max = 1.0 - mu_s * tan_theta;
        const v_max = denom_max > 1e-4 ? Math.sqrt(G * R * (tan_theta + mu_s) / denom_max) : 999.0;
        const v_min = tan_theta > mu_s ? Math.sqrt(G * R * (tan_theta - mu_s) / (1.0 + mu_s * tan_theta)) : 0.0;

        let F_neta = modo === 'Frenado' ? -(f + fk + drag) : f - (fk + drag);
        const a = F_neta / m;

        return (
          <div className="space-y-2.5 font-mono text-[11px] text-slate-300">
            <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-sky-400 font-bold">1. Fuerza Normal (N) Dinámica en Curva:</span>
              <div className="pl-2 mt-1 text-slate-400">
                N = m(g·cosθ + v²/R·senθ) = {m}(9.81·cos({tramo.inclinacion}°) + {vAct.toFixed(1)}²/{R}·sen({tramo.inclinacion}°)) = <strong className="text-white">{Normal.toFixed(0)} N</strong>
              </div>
            </div>
            <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-rose-400 font-bold">2. Fricción Lateral Requerida vs Estática:</span>
              <div className="pl-2 mt-1 text-slate-400">
                fs_req = m(v²/R·cosθ - g·senθ) = <strong className="text-rose-300">{fs_req.toFixed(0)} N</strong><br/>
                fs_máx = μ_s · N = {mu_s.toFixed(2)} · {Normal.toFixed(0)} = <strong className="text-white">{(mu_s * Normal).toFixed(0)} N</strong>
              </div>
            </div>
            <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-amber-400 font-bold">3. Límites de Velocidad de Adherencia:</span>
              <div className="pl-2 mt-1 text-slate-400">
                v_mín = <strong className="text-white">{v_min.toFixed(1)} m/s</strong> | v_máx = <strong className="text-white">{v_max.toFixed(1)} m/s</strong><br/>
                v_actual = <strong className="text-amber-300">{vAct.toFixed(1)} m/s</strong>
              </div>
            </div>
            <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-emerald-400 font-bold">4. Aceleración Tangencial ({tramo.nombre}):</span>
              <div className="pl-2 mt-1 text-slate-400">
                ΣFt = {modo === 'Frenado' ? `-(F_freno + fk + Fd) = -(${f} + ${fk.toFixed(0)} + ${drag.toFixed(0)})` : `F_motor - fr - Fd = ${f} - ${fk.toFixed(0)} - ${drag.toFixed(0)}`} = <strong className="text-emerald-300">{F_neta.toFixed(0)} N</strong><br/>
                a = ΣFt / m = <strong className="text-white">{a.toFixed(2)} m/s²</strong>
              </div>
            </div>
          </div>
        );
      } else {
        // Tramo recto
        const Normal = m * G * Math.cos(thetaLocal);
        const fk = modo === 'Frenado' ? fric * Normal : 0.015 * Normal;
        const P_x = m * G * Math.sin(thetaLocal);
        const drag = 0.5 * 1.225 * b * (vAct ** 2);
        
        let F_neta = 0;
        if (modo === 'Frenado') {
          F_neta = -(f + fk + drag) - P_x;
        } else {
          F_neta = f - (fk + drag) - P_x;
        }
        const a = F_neta / m;
 
        return (
          <div className="space-y-2.5 font-mono text-[11px] text-slate-300">
            <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-sky-400 font-bold">1. Fuerza Normal (N) e Inclinación:</span>
              <div className="pl-2 mt-1 text-slate-400">
                N = m · g · cos(θ) = {m} · 9.81 · cos({tramo.inclinacion}°) = <strong className="text-white">{Normal.toFixed(0)} N</strong><br/>
                P_x = m · g · sen(θ) = <strong className="text-white">{P_x.toFixed(0)} N</strong>
              </div>
            </div>
            <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-rose-400 font-bold">
                {modo === 'Frenado' ? '2. Fricción Dinámica (fk) y Resistencia Aire (Fd):' : '2. Resistencia de Rodadura (fr) y Resistencia Aire (Fd):'}
              </span>
              <div className="pl-2 mt-1 text-slate-400">
                {modo === 'Frenado' ? (
                  <span>fk = μ · N = {fric.toFixed(2)} · {Normal.toFixed(0)} = <strong className="text-white">{fk.toFixed(0)} N</strong></span>
                ) : (
                  <span>fr = 0.015 · N = 0.015 · {Normal.toFixed(0)} = <strong className="text-white">{fk.toFixed(0)} N</strong></span>
                )}
                <br/>
                Fd = ½ · ρ · Cd · A · v² = 0.6125 · {b.toFixed(2)} · {vAct.toFixed(1)}² = <strong className="text-amber-300">{drag.toFixed(0)} N</strong>
              </div>
            </div>
            <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-emerald-400 font-bold">3. Fuerza Neta Horizontal (ΣFx) en {tramo.nombre}:</span>
              <div className="pl-2 mt-1 text-slate-400">
                {modo === 'Frenado' ? (
                  <span>ΣFx = -(F_freno + fk + Fd) - P_x = -({f} + {fk.toFixed(0)} + {drag.toFixed(0)}) - {P_x.toFixed(0)} = <strong className="text-emerald-300">{F_neta.toFixed(0)} N</strong></span>
                ) : (
                  <span>ΣFx = F_motor - fr - Fd - P_x = {f} - {fk.toFixed(0)} - {drag.toFixed(0)} - {P_x.toFixed(0)} = <strong className="text-emerald-300">{F_neta.toFixed(0)} N</strong></span>
                )}
                <br/>
                a = ΣFx / m = {F_neta.toFixed(0)} / {m} = <strong className="text-white">{a.toFixed(2)} m/s²</strong>
              </div>
            </div>
          </div>
        );
      }
    }
  };

  const handleInputChange = (valStr, setter, min, max) => {
    let numeric = parseFloat(valStr);
    if (isNaN(numeric)) {
      numeric = min;
    }
    setter(numeric);
  };

  const handleInputBlur = (numeric, setter, min, max) => {
    let acotado = Math.max(min, Math.min(max, numeric));
    setter(acotado);
  };

  const obtenerIconoClima = (clima) => {
    switch(clima) {
      case 'Seco':
      case 'Pista Seca':
        return 'fa-sun text-amber-400';
      case 'Mojado':
      case 'Pista Mojada':
        return 'fa-cloud-rain text-blue-400';
      case 'Hielo':
      case 'Pista Nevada':
        return 'fa-snowflake text-sky-200';
      case 'Vacío':
        return 'fa-moon text-indigo-400';
      case 'Aire':
        return 'fa-wind text-slate-300';
      case 'Agua (Fluido Viscoso)':
        return 'fa-droplet text-blue-500';
      default:
        return 'fa-cloud text-slate-400';
    }
  };

  const handleParamChange = (caso, paramKey, value) => {
    if (caso === 'A') {
      setParamsA(prev => ({ ...prev, [paramKey]: value }));
    } else if (caso === 'B') {
      setParamsB(prev => ({ ...prev, [paramKey]: value }));
    } else if (caso === 'C') {
      setParamsC(prev => ({ ...prev, [paramKey]: value }));
    } else if (caso === 'D') {
      setParamsD(prev => ({ ...prev, [paramKey]: value }));
    } else if (caso === 'E') {
      setParamsE(prev => ({ ...prev, [paramKey]: value }));
    } else if (caso === 'F') {
      setParamsF(prev => ({ ...prev, [paramKey]: value }));
    } else if (caso === 'libre') {
      setParamsLibre(prev => ({ ...prev, [paramKey]: value }));
    }
  };

  const obtenerEnunciadoLibre = () => {
    const esc = paramsLibre.escenario;
    const escL = esc.toLowerCase();
    const m = paramsLibre.masa;
    const m2 = paramsLibre.masa_2;
    const v0 = paramsLibre.v_inicial;
    const vf = paramsLibre.v_final;
    const f = paramsLibre.fuerza;
    const incl = paramsLibre.inclinacion;
    const fric = paramsLibre.friccion;
    const r = paramsLibre.radio_curva;
    const mu_s = paramsLibre.friccion_estatica;
    const mov = paramsLibre.tipo_movimiento === 'Frenado' ? 'desaceleración (frenado)' : 'aceleración (tracción)';

    if (escL === 'atwood') {
      return `Máquina de Atwood Personalizada: Dos masas acopladas verticalmente, m1 = ${m} kg (izquierda) y m2 = ${m2} kg (derecha), están suspendidas por un hilo ideal inextensible que pasa sobre una polea sin fricción. Si el sistema parte con una velocidad inicial v0 = ${v0} m/s, determine analíticamente la aceleración de los bloques, la tensión en la cuerda y la distancia recorrida/tiempo transcurrido para alcanzar una velocidad final de ${vf} m/s.`;
    }
    if (escL === 'elevador') {
      return `Elevador Vertical Personalizado: Una cabina de elevador de masa m = ${m} kg se desplaza verticalmente en un pozo de mina. Se le aplica una fuerza de tensión constante de ${f} N en el cable. Si el elevador inicia su movimiento con una velocidad de ${v0} m/s, calcule la aceleración de la cabina y el tiempo/distancia requeridos para alcanzar una velocidad final de ${vf} m/s.`;
    }
    if (escL === 'avion') {
      return `Despegue Aeronáutico Personalizado: Un avión comercial de masa m = ${m} kg inicia su rodaje en una pista de despegue con velocidad inicial v0 = ${v0} m/s. Las turbinas generan un empuje constante de ${f} N, venciendo una fricción de rodadura con coeficiente μ = ${fric}. Determine la aceleración horizontal del avión en pista y la distancia crítica necesaria para alcanzar la velocidad de despegue seguro configurada en vf = ${vf} m/s.`;
    }
    if (escL === 'curva') {
      return `Curva Peraltada Personalizada: Un automóvil de masa m = ${m} kg recorre una curva peraltada de radio R = ${r} m con ángulo de inclinación θ = ${incl}°. El coeficiente de fricción estática lateral es μs = ${mu_s} y el de fricción cinética es μk = ${fric}. Si se le aplica una fuerza motora tangencial de ${f} N (${mov}) y entra a la curva a v0 = ${v0} m/s, determine la fuerza normal dinámica, los límites de velocidad de adherencia para evitar derrapes y la aceleración tangencial para alcanzar una velocidad final vf = ${vf} m/s.`;
    }
    const tipoVehiculo = esc === 'Automovil' ? 'automóvil' : esc === 'Camion' ? 'camión de carga' : 'motociclista';
    return `Dinámica Terrestre Personalizada: Un ${tipoVehiculo} de masa m = ${m} kg se desplaza por una pendiente inclinada a θ = ${incl}° con coeficiente de fricción cinética μk = ${fric}. Se le aplica una fuerza constante de ${f} N en dirección de ${mov} partiendo con v0 = ${v0} m/s. Determine analíticamente la fuerza normal de la calzada, la fricción dinámica, la aceleración neta y la distancia recorrida para alcanzar una velocidad final de ${vf} m/s.`;
  };

  const obtenerEnunciadoDinamico = (caso) => {
    if (caso === 'A') {
      const { masa, v_inicial, fuerza_freno, inclinacion, friccion_calzada, x_freno } = paramsA;
      const signoRampa = inclinacion > 0 ? "cuesta arriba (subida)" : (inclinacion < 0 ? "cuesta abajo (bajada)" : "plana");
      return `Un automóvil de masa m = ${masa} kg avanza con una velocidad inicial de v₀ = ${v_inicial} m/s por una rampa con una inclinación de θ = ${Math.abs(inclinacion)}° (${signoRampa}) y un coeficiente de fricción cinética μₖ = ${friccion_calzada}. Al alcanzar una distancia de x = ${x_freno} m, el conductor aplica los frenos de servicio ejerciendo una fuerza de frenado constante de F_freno = ${fuerza_freno} N. Determine la desaceleración del vehículo, la distancia y el tiempo transcurrido hasta detenerse por completo, despreciando la resistencia del aire.`;
    }
    if (caso === 'B') {
      const { masa, v_inicial, y_falla, fuerza_freno } = paramsB;
      const dirInicial = v_inicial < 0 ? "descendiendo" : (v_inicial > 0 ? "ascendiendo" : "en reposo");
      return `Una cabina de elevador de masa m = ${masa} kg se desplaza verticalmente ${dirInicial} a una velocidad de v₀ = ${Math.abs(v_inicial)} m/s. Repentinamente, el cable de tracción se rompe a una altura crítica de y₀ = ${y_falla} m, activando de inmediato los frenos magnéticos de emergencia con una fuerza retardadora constante de F_freno = ${fuerza_freno} N. Determine la aceleración de la cabina y si logra detenerse de forma segura antes de impactar contra el suelo (y = 0 m). Si impacta, determine el tiempo de colisión y la velocidad de impacto.`;
    }
    if (caso === 'C') {
      const { masa, empuje, friccion_pista, l_pista, v_despegue, v_inicial } = paramsC;
      return `Un avión comercial de pasajeros de masa m = ${masa} kg inicia su carrera de despegue desde una velocidad inicial de v₀ = ${v_inicial} m/s sobre una pista de longitud L = ${l_pista} m. Los turborreactores ejercen un empuje constante de F_empuje = ${empuje} N contra una resistencia de rodamiento con un coeficiente de fricción de μ = ${friccion_pista}. Determine la aceleración de la aeronave en pista y si logrará alcanzar la velocidad de despegue segura de v_despegue = ${v_despegue} m/s antes de agotar la longitud disponible de la pista.`;
    }
    if (caso === 'D') {
      const { masa, masa_2, v_inicial, v_final } = paramsD;
      return `Una máquina de Atwood académica consta de dos bloques suspendidos de masas m₁ = ${masa} kg (bloque izquierdo) y m₂ = ${masa_2} kg (bloque derecho) acoplados por una cuerda ideal de masa despreciable a través de una polea fija sin fricción. Si el sistema se libera desde una velocidad inicial v₀ = ${v_inicial} m/s, determine la aceleración resultante de las masas, la tensión T en el cable de suspensión y la distancia vertical que se desplaza cada bloque hasta alcanzar una velocidad final de v_final = ${v_final} m/s.`;
    }
    if (caso === 'E') {
      const { masa, inclinacion, friccion, fuerza, v_inicial, v_final } = paramsE;
      return `Un camión de carga de masa m = ${masa} kg asciende por una pendiente inclinada a θ = ${inclinacion}° impulsado por una fuerza motriz constante de F_motor = ${fuerza} N. Si el coeficiente de fricción cinética entre las llantas y el pavimento es μₖ = ${friccion} y parte con una velocidad de v₀ = ${v_inicial} m/s, determine la aceleración ascendente del vehículo y la distancia necesaria que debe recorrer sobre la pendiente para alcanzar su velocidad de crucero objetivo de v_crucero = ${v_final} m/s.`;
    }
    if (caso === 'F') {
      const { masa, radio_curva, inclinacion, friccion_estatica, friccion, fuerza, v_inicial, v_final, tipo_movimiento } = paramsF;
      const tipoMovText = tipo_movimiento === 'Frenado' ? 'frenado' : 'aceleración';
      return `Un automóvil de pasajeros de masa m = ${masa} kg transita por una curva de carretera de radio R = ${radio_curva} m provista de un peralte de θ = ${inclinacion}°. El coeficiente de fricción estática lateral es μₛ = ${friccion_estatica} y el de fricción cinética es μₖ = ${friccion}. Si el automóvil ingresa a la curva con una velocidad tangencial inicial de v₀ = ${v_inicial} m/s y el motor/freno aplica una fuerza tangencial constante de F = ${fuerza} N en modo de ${tipoMovText}, determine si el vehículo sufrirá un deslizamiento lateral (derrape exterior o deslizamiento interior) y calcule la aceleración tangencial para alcanzar una velocidad de salida de v_final = ${v_final} m/s.`;
    }
    if (caso === 'libre') {
      return obtenerEnunciadoLibre();
    }
    return '';
  };

  const resolverProblema = async () => {
    setCargandoSolucion(true);
    setErrorMessage('');

    // Validación robusta de parámetros de entrada
    const esNumeroValido = (val) => !isNaN(parseFloat(val)) && isFinite(val);
    const esPositivo = (val) => parseFloat(val) > 0;
    const esNoNegativo = (val) => parseFloat(val) >= 0;

    let errorValidacion = '';
    if (casoSeleccionado === 'A') {
      if (!esNumeroValido(paramsA.masa) || !esNumeroValido(paramsA.v_inicial) || !esNumeroValido(paramsA.fuerza_freno) || !esNumeroValido(paramsA.inclinacion) || !esNumeroValido(paramsA.friccion_calzada) || !esNumeroValido(paramsA.x_freno)) {
        errorValidacion = 'Por favor, complete todos los parámetros con valores numéricos válidos.';
      } else if (!esPositivo(paramsA.masa)) {
        errorValidacion = 'La masa del vehículo debe ser mayor a 0 kg.';
      } else if (!esNoNegativo(paramsA.fuerza_freno)) {
        errorValidacion = 'La fuerza de frenado no puede ser negativa.';
      } else if (!esNoNegativo(paramsA.friccion_calzada)) {
        errorValidacion = 'El coeficiente de fricción no puede ser negativo.';
      }
    } else if (casoSeleccionado === 'B') {
      if (!esNumeroValido(paramsB.masa) || !esNumeroValido(paramsB.v_inicial) || !esNumeroValido(paramsB.y_falla) || !esNumeroValido(paramsB.fuerza_freno)) {
        errorValidacion = 'Por favor, complete todos los parámetros con valores numéricos.';
      } else if (!esPositivo(paramsB.masa)) {
        errorValidacion = 'La masa de la cabina debe ser mayor a 0 kg.';
      } else if (!esPositivo(paramsB.y_falla)) {
        errorValidacion = 'La altura del accidente debe ser mayor a 0 metros.';
      } else if (!esNoNegativo(paramsB.fuerza_freno)) {
        errorValidacion = 'La fuerza del freno auxiliar no puede ser negativa.';
      }
    } else if (casoSeleccionado === 'C') {
      if (!esNumeroValido(paramsC.masa) || !esNumeroValido(paramsC.empuje) || !esNumeroValido(paramsC.friccion_pista) || !esNumeroValido(paramsC.l_pista) || !esNumeroValido(paramsC.v_despegue) || !esNumeroValido(paramsC.v_inicial)) {
        errorValidacion = 'Por favor, complete todos los parámetros con valores numéricos.';
      } else if (!esPositivo(paramsC.masa)) {
        errorValidacion = 'La masa de la aeronave debe ser mayor a 0 kg.';
      } else if (!esPositivo(paramsC.l_pista)) {
        errorValidacion = 'La longitud de la pista debe ser mayor a 0 metros.';
      } else if (!esPositivo(paramsC.v_despegue)) {
        errorValidacion = 'La velocidad de despegue debe ser mayor a 0 m/s.';
      } else if (!esNoNegativo(paramsC.empuje)) {
        errorValidacion = 'El empuje de los turborreactores no puede ser negativo.';
      } else if (!esNoNegativo(paramsC.friccion_pista)) {
        errorValidacion = 'La fricción de rodadura no puede ser negativa.';
      }
    } else if (casoSeleccionado === 'D') {
      if (!esNumeroValido(paramsD.masa) || !esNumeroValido(paramsD.masa_2) || !esNumeroValido(paramsD.v_inicial) || !esNumeroValido(paramsD.v_final)) {
        errorValidacion = 'Por favor, complete todos los parámetros con valores numéricos.';
      } else if (!esPositivo(paramsD.masa) || !esPositivo(paramsD.masa_2)) {
        errorValidacion = 'Ambas masas de Atwood deben ser mayores a 0 kg.';
      }
    } else if (casoSeleccionado === 'E') {
      if (!esNumeroValido(paramsE.masa) || !esNumeroValido(paramsE.fuerza) || !esNumeroValido(paramsE.inclinacion) || !esNumeroValido(paramsE.friccion) || !esNumeroValido(paramsE.v_inicial) || !esNumeroValido(paramsE.v_final)) {
        errorValidacion = 'Por favor, complete todos los parámetros con valores numéricos.';
      } else if (!esPositivo(paramsE.masa)) {
        errorValidacion = 'La masa del vehículo debe ser mayor a 0 kg.';
      } else if (!esNoNegativo(paramsE.fuerza)) {
        errorValidacion = 'La fuerza del motor no puede ser negativa.';
      } else if (!esNoNegativo(paramsE.friccion)) {
        errorValidacion = 'El coeficiente de fricción no puede ser negativo.';
      }
    } else if (casoSeleccionado === 'F') {
      if (!esNumeroValido(paramsF.masa) || !esNumeroValido(paramsF.radio_curva) || !esNumeroValido(paramsF.inclinacion) || !esNumeroValido(paramsF.friccion_estatica) || !esNumeroValido(paramsF.friccion) || !esNumeroValido(paramsF.fuerza) || !esNumeroValido(paramsF.v_inicial) || !esNumeroValido(paramsF.v_final)) {
        errorValidacion = 'Por favor, complete todos los parámetros con valores numéricos.';
      } else if (!esPositivo(paramsF.masa)) {
        errorValidacion = 'La masa del vehículo debe ser mayor a 0 kg.';
      } else if (!esPositivo(paramsF.radio_curva)) {
        errorValidacion = 'El radio de la curva debe ser mayor a 0 metros.';
      } else if (!esNoNegativo(paramsF.friccion_estatica) || !esNoNegativo(paramsF.friccion)) {
        errorValidacion = 'Los coeficientes de fricción no pueden ser negativos.';
      } else if (!esNoNegativo(paramsF.fuerza)) {
        errorValidacion = 'La fuerza tangencial no puede ser negativa.';
      }
    } else if (casoSeleccionado === 'libre') {
      if (!esNumeroValido(paramsLibre.masa) || !esNumeroValido(paramsLibre.v_inicial) || !esNumeroValido(paramsLibre.v_final) || !esNumeroValido(paramsLibre.fuerza) || !esNumeroValido(paramsLibre.inclinacion) || !esNumeroValido(paramsLibre.friccion) || !esNumeroValido(paramsLibre.masa_2)) {
        errorValidacion = 'Por favor, complete todos los parámetros con valores numéricos.';
      } else if (!esPositivo(paramsLibre.masa) || (paramsLibre.escenario === 'Atwood' && !esPositivo(paramsLibre.masa_2))) {
        errorValidacion = 'Las masas deben ser mayores a 0 kg.';
      } else if (!esNoNegativo(paramsLibre.friccion)) {
        errorValidacion = 'El coeficiente de fricción no puede ser negativo.';
      }
    }

    if (errorValidacion) {
      setErrorMessage(errorValidacion);
      setCargandoSolucion(false);
      return;
    }

    let params = {};
    if (casoSeleccionado === 'A') {
      params = {
        masa: parseFloat(paramsA.masa),
        v_inicial: parseFloat(paramsA.v_inicial),
        fuerza_freno: parseFloat(paramsA.fuerza_freno),
        inclinacion: parseFloat(paramsA.inclinacion),
        friccion_calzada: parseFloat(paramsA.friccion_calzada),
        x_freno: parseFloat(paramsA.x_freno)
      };
    } else if (casoSeleccionado === 'B') {
      params = {
        masa: parseFloat(paramsB.masa),
        v_inicial: parseFloat(paramsB.v_inicial),
        y_falla: parseFloat(paramsB.y_falla),
        fuerza_freno: parseFloat(paramsB.fuerza_freno)
      };
    } else if (casoSeleccionado === 'C') {
      params = {
        masa: parseFloat(paramsC.masa),
        empuje: parseFloat(paramsC.empuje),
        friccion_pista: parseFloat(paramsC.friccion_pista),
        l_pista: parseFloat(paramsC.l_pista),
        v_despegue: parseFloat(paramsC.v_despegue),
        v_inicial: parseFloat(paramsC.v_inicial)
      };
    } else if (casoSeleccionado === 'D') {
      params = {
        masa: parseFloat(paramsD.masa),
        masa_2: parseFloat(paramsD.masa_2),
        v_inicial: parseFloat(paramsD.v_inicial),
        v_final: parseFloat(paramsD.v_final)
      };
    } else if (casoSeleccionado === 'E') {
      params = {
        masa: parseFloat(paramsE.masa),
        inclinacion: parseFloat(paramsE.inclinacion),
        friccion: parseFloat(paramsE.friccion),
        fuerza: parseFloat(paramsE.fuerza),
        v_inicial: parseFloat(paramsE.v_inicial),
        v_final: parseFloat(paramsE.v_final)
      };
    } else if (casoSeleccionado === 'F') {
      params = {
        masa: parseFloat(paramsF.masa),
        radio_curva: parseFloat(paramsF.radio_curva),
        inclinacion: parseFloat(paramsF.inclinacion),
        friccion_estatica: parseFloat(paramsF.friccion_estatica),
        friccion: parseFloat(paramsF.friccion),
        fuerza: parseFloat(paramsF.fuerza),
        v_inicial: parseFloat(paramsF.v_inicial),
        v_final: parseFloat(paramsF.v_final),
        tipo_movimiento: paramsF.tipo_movimiento
      };
    } else if (casoSeleccionado === 'libre') {
      params = {
        escenario: paramsLibre.escenario,
        masa: parseFloat(paramsLibre.masa),
        v_inicial: parseFloat(paramsLibre.v_inicial),
        v_final: parseFloat(paramsLibre.v_final),
        fuerza: parseFloat(paramsLibre.fuerza),
        inclinacion: parseFloat(paramsLibre.inclinacion),
        friccion: parseFloat(paramsLibre.friccion),
        tipo_movimiento: paramsLibre.tipo_movimiento,
        masa_2: parseFloat(paramsLibre.masa_2)
      };
    }

    try {
      const res = await fetch('/api/solve-problem/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caso: casoSeleccionado,
          params: params
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSolucionResultado(data);
      } else {
        setErrorMessage(data.error || 'Error al resolver el problema.');
      }
    } catch (e) {
      console.error("Error al resolver:", e);
      setErrorMessage("No se pudo conectar con el servidor para resolver el problema.");
    } finally {
      setCargandoSolucion(false);
    }
  };

  const simularYValidar = (caso) => {
    cargandoPresetRef.current = true;
    setErrorMessage('');
    resetearSimulacion();
    
    if (caso === 'A') {
      setEscenario('Automovil');
      setMasa(parseFloat(paramsA.masa));
      setFuerza(parseFloat(paramsA.fuerza_freno));
      setVInicial(parseFloat(paramsA.v_inicial));
      setInclinacion(parseFloat(paramsA.inclinacion));
      setResistenciaAire(0.0);
      setModo('Frenado');
      setPerfilFuerza('Constante');
      setModoProblemaActivo('A');
    } else if (caso === 'B') {
      setEscenario('Elevador');
      setMasa(parseFloat(paramsB.masa));
      setFuerza(0.0); // Tensión cae a 0 N
      setVInicial(parseFloat(paramsB.v_inicial));
      setAlturaMax(parseFloat(paramsB.y_falla) + 20);
      setResistenciaAire(0.0);
      setModo('Frenado');
      setPerfilFuerza('Constante');
      setModoProblemaActivo('B');
    } else if (caso === 'C') {
      setEscenario('Avion');
      setMasa(parseFloat(paramsC.masa));
      setFuerza(parseFloat(paramsC.empuje));
      setVInicial(parseFloat(paramsC.v_inicial));
      setInclinacion(0.0);
      setResistenciaAire(0.0);
      const cl = (parseFloat(paramsC.masa) * G) / (parseFloat(paramsC.v_despegue) ** 2);
      setSustentacionCoef(cl);
      setModo('Aceleracion');
      setPerfilFuerza('Constante');
      setModoProblemaActivo('C');
    } else if (caso === 'D') {
      setEscenario('Atwood');
      setMasa(parseFloat(paramsD.masa));
      setMasa2(parseFloat(paramsD.masa_2));
      setFuerza(0.0);
      setVInicial(parseFloat(paramsD.v_inicial));
      setInclinacion(0.0);
      setResistenciaAire(0.0);
      setPerfilFuerza('Constante');
      setModo('Aceleracion');
      setModoProblemaActivo('D');
    } else if (caso === 'E') {
      setEscenario('Camion');
      setMasa(parseFloat(paramsE.masa));
      setFuerza(parseFloat(paramsE.fuerza));
      setVInicial(parseFloat(paramsE.v_inicial));
      setInclinacion(parseFloat(paramsE.inclinacion));
      setResistenciaAire(0.0);
      setPerfilFuerza('Constante');
      setModo('Aceleracion');
      setModoProblemaActivo('E');
    } else if (caso === 'F') {
      setEscenario('Curva');
      setMasa(parseFloat(paramsF.masa));
      setRadioCurva(parseFloat(paramsF.radio_curva));
      setInclinacion(parseFloat(paramsF.inclinacion));
      setFriccionEstatica(parseFloat(paramsF.friccion_estatica));
      setFuerza(parseFloat(paramsF.fuerza));
      setVInicial(parseFloat(paramsF.v_inicial));
      setResistenciaAire(0.0);
      setPerfilFuerza('Constante');
      setModo(paramsF.tipo_movimiento);
      setModoProblemaActivo('F');
    } else if (caso === 'libre') {
      const esc = paramsLibre.escenario;
      setEscenario(esc);
      setMasa(parseFloat(paramsLibre.masa));
      setFuerza(parseFloat(paramsLibre.fuerza));
      setVInicial(parseFloat(paramsLibre.v_inicial));
      setInclinacion(parseFloat(paramsLibre.inclinacion));
      setResistenciaAire(0.0);
      setPerfilFuerza('Constante');
      
      const escL = esc.toLowerCase();
      if (escL === 'elevador') {
        setAlturaMax(Math.max(100, Math.abs(parseFloat(paramsLibre.v_inicial)) * 10 + 20));
        setModo('Frenado'); // se opone
      } else if (escL === 'atwood') {
        setMasa2(parseFloat(paramsLibre.masa_2));
      } else if (escL === 'avion') {
        const cl = (parseFloat(paramsLibre.masa) * G) / (parseFloat(paramsLibre.v_final || 80) ** 2);
        setSustentacionCoef(cl);
        setModo('Aceleracion');
      } else if (escL === 'curva') {
        setRadioCurva(parseFloat(paramsLibre.radio_curva));
        setFriccionEstatica(parseFloat(paramsLibre.friccion_estatica));
        setModo(paramsLibre.tipo_movimiento);
      } else {
        setModo(paramsLibre.tipo_movimiento);
      }
      setModoProblemaActivo('libre');
    }
    
    setTab('simulador');
    
    setTimeout(() => {
      cargandoPresetRef.current = false;
    }, 100);

    setTimeout(() => {
      resetearSimulacion();
      iniciarSimulacion();
    }, 200);
  };


  const renderResolutorView = () => {
    return (
      <div id="main-resolutor-container" className="flex flex-col lg:grid lg:grid-cols-12 gap-5 p-5 h-auto lg:h-full overflow-y-auto lg:overflow-hidden">
        
        {/* BACKDROP DE COMPATIBILIDAD MÓVIL PARA LA BARRA LATERAL */}
        {!sidebarCollapsed && (
          <div 
            onClick={() => setSidebarCollapsed(true)} 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden cursor-pointer"
          />
        )}
        
        {/* PANEL IZQUIERDO DE PARÁMETROS (3 Columnas o Drawer Móvil) */}
        {!sidebarCollapsed && (
          <section className="fixed inset-y-0 left-0 w-[290px] z-50 bg-slate-900 border-r border-slate-800 p-5 flex flex-col overflow-y-auto space-y-4 shadow-2xl lg:relative lg:inset-auto lg:w-auto lg:h-auto lg:z-0 lg:border lg:border-slate-800/80 lg:rounded-2xl lg:col-span-3 lg:shadow-none lg:max-h-full">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-cyan-400 tracking-wider uppercase flex items-center">
                  <i className="fa-solid fa-graduation-cap mr-2"></i> Resolutor de Casos UTP
                </h3>
                <p className="text-[10.5px] text-slate-400">
                  Resuelva problemas de ingeniería paso a paso y valídelos numéricamente en el laboratorio interactivo.
                </p>
              </div>
              <button 
                onClick={() => setSidebarCollapsed(true)} 
                className="text-slate-400 hover:text-white hover:bg-slate-850 p-1.5 rounded-lg transition-all cursor-pointer flex-shrink-0 ml-2"
                title="Contraer barra lateral"
              >
                <i className="fa-solid fa-xmark fa-lg"></i>
              </button>
            </div>

          {/* SELECTOR DE CASO */}
          <div className="space-y-2">
            <label className="text-[10.5px] text-slate-400 font-bold uppercase block">Seleccionar Caso de Estudio</label>
            <div className="space-y-2">
              <button 
                onClick={() => { setCasoSeleccionado('A'); setSolucionResultado(null); }}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-start space-x-3 ${casoSeleccionado === 'A' ? 'bg-cyan-500/10 border-cyan-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${casoSeleccionado === 'A' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>A</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">Parada Límite (Terrestre)</div>
                  <div className="text-[9.5px] text-slate-500 truncate">Frenado de emergencia en rampa inclinada</div>
                </div>
              </button>

              <button 
                onClick={() => { setCasoSeleccionado('B'); setSolucionResultado(null); }}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-start space-x-3 ${casoSeleccionado === 'B' ? 'bg-cyan-500/10 border-cyan-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${casoSeleccionado === 'B' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>B</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">Falla de Tensión (Vertical)</div>
                  <div className="text-[9.5px] text-slate-500 truncate">Cable roto y frenado magnético de elevador</div>
                </div>
              </button>

              <button 
                onClick={() => { setCasoSeleccionado('C'); setSolucionResultado(null); }}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-start space-x-3 ${casoSeleccionado === 'C' ? 'bg-cyan-500/10 border-cyan-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${casoSeleccionado === 'C' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>C</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">Despegue Límite (Aéreo)</div>
                  <div className="text-[9.5px] text-slate-500 truncate">Longitud crítica de pista para despegue</div>
                </div>
              </button>

              <button 
                onClick={() => { setCasoSeleccionado('D'); setSolucionResultado(null); }}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-start space-x-3 ${casoSeleccionado === 'D' ? 'bg-cyan-500/10 border-cyan-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${casoSeleccionado === 'D' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>D</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">Máquina de Atwood (Polipasto)</div>
                  <div className="text-[9.5px] text-slate-500 truncate">Aceleración acoplada y tensión en cable</div>
                </div>
              </button>

              <button 
                onClick={() => { setCasoSeleccionado('E'); setSolucionResultado(null); }}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-start space-x-3 ${casoSeleccionado === 'E' ? 'bg-cyan-500/10 border-cyan-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${casoSeleccionado === 'E' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>E</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">Ascenso de Carga (Pendiente)</div>
                  <div className="text-[9.5px] text-slate-500 truncate">Aceleración cuesta arriba de camión en rampa</div>
                </div>
              </button>

              <button 
                onClick={() => { setCasoSeleccionado('F'); setSolucionResultado(null); }}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-start space-x-3 ${casoSeleccionado === 'F' ? 'bg-cyan-500/10 border-cyan-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${casoSeleccionado === 'F' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>F</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">Curva Peraltada (Fuerza Centrípeta)</div>
                  <div className="text-[9.5px] text-slate-500 truncate">Giro en curva, peraltes y velocidad de derrape</div>
                </div>
              </button>

              <button 
                onClick={() => { setCasoSeleccionado('libre'); setSolucionResultado(null); }}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-start space-x-3 ${casoSeleccionado === 'libre' ? 'bg-cyan-500/10 border-cyan-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${casoSeleccionado === 'libre' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>L</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">Caso Personalizado / Libre</div>
                  <div className="text-[9.5px] text-slate-500 truncate">Configure cualquier escenario y parámetros libremente</div>
                </div>
              </button>
            </div>
          </div>

          {/* FORMULARIO DE ENTRADA DINÁMICO */}
          <div className="pt-3 border-t border-slate-800/60 space-y-4">
            <h4 className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase">
              <i className="fa-solid fa-gears mr-1"></i> Parámetros de Entrada
            </h4>

            {casoSeleccionado === 'A' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Masa del Vehículo (m)</span>
                    <span className="text-slate-500 font-mono">kg</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsA.masa}
                    onChange={(e) => handleParamChange('A', 'masa', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="500"
                    max="5000"
                    step="50"
                    value={parseFloat(paramsA.masa) || 1500}
                    onChange={(e) => handleParamChange('A', 'masa', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Velocidad Inicial (v0)</span>
                    <span className="text-slate-500 font-mono">m/s</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsA.v_inicial}
                    onChange={(e) => handleParamChange('A', 'v_inicial', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={parseFloat(paramsA.v_inicial) || 25}
                    onChange={(e) => handleParamChange('A', 'v_inicial', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Fuerza de Frenado (F_freno)</span>
                    <span className="text-slate-500 font-mono">N</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsA.fuerza_freno}
                    onChange={(e) => handleParamChange('A', 'fuerza_freno', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="1000"
                    max="30000"
                    step="500"
                    value={parseFloat(paramsA.fuerza_freno) || 8000}
                    onChange={(e) => handleParamChange('A', 'fuerza_freno', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Inclinación Rampa (θ)</span>
                    <span className="text-slate-500 font-mono">grados (°)</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsA.inclinacion}
                    onChange={(e) => handleParamChange('A', 'inclinacion', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="-15"
                    max="30"
                    step="1"
                    value={parseFloat(paramsA.inclinacion) || 8}
                    onChange={(e) => handleParamChange('A', 'inclinacion', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Coef. Fricción Calzada (μ_k)</span>
                    <span className="text-slate-500 font-mono">adimensional</span>
                  </div>
                  <input 
                    type="number"
                    step="0.05"
                    value={paramsA.friccion_calzada}
                    onChange={(e) => handleParamChange('A', 'friccion_calzada', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="0.0"
                    max="1.2"
                    step="0.05"
                    value={parseFloat(paramsA.friccion_calzada) || 0.8}
                    onChange={(e) => handleParamChange('A', 'friccion_calzada', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Distancia de Reacción (x_freno)</span>
                    <span className="text-slate-500 font-mono">m</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsA.x_freno}
                    onChange={(e) => handleParamChange('A', 'x_freno', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="0"
                    max="300"
                    step="5"
                    value={parseFloat(paramsA.x_freno) || 100}
                    onChange={(e) => handleParamChange('A', 'x_freno', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
              </div>
            )}

            {casoSeleccionado === 'B' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Masa de la Cabina (m)</span>
                    <span className="text-slate-500 font-mono">kg</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsB.masa}
                    onChange={(e) => handleParamChange('B', 'masa', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="300"
                    max="3000"
                    step="50"
                    value={parseFloat(paramsB.masa) || 1200}
                    onChange={(e) => handleParamChange('B', 'masa', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Velocidad en Falla (v0)</span>
                    <span className="text-slate-500 font-mono">m/s (bajada &lt; 0)</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsB.v_inicial}
                    onChange={(e) => handleParamChange('B', 'v_inicial', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="-15"
                    max="15"
                    step="0.5"
                    value={parseFloat(paramsB.v_inicial) || -4}
                    onChange={(e) => handleParamChange('B', 'v_inicial', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Altura del Accidente (y_falla)</span>
                    <span className="text-slate-500 font-mono">m</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsB.y_falla}
                    onChange={(e) => handleParamChange('B', 'y_falla', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="10"
                    max="100"
                    step="2"
                    value={parseFloat(paramsB.y_falla) || 50}
                    onChange={(e) => handleParamChange('B', 'y_falla', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Fuerza Freno Auxiliar (F_freno)</span>
                    <span className="text-slate-500 font-mono">N</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsB.fuerza_freno}
                    onChange={(e) => handleParamChange('B', 'fuerza_freno', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="0"
                    max="25000"
                    step="500"
                    value={parseFloat(paramsB.fuerza_freno) || 15000}
                    onChange={(e) => handleParamChange('B', 'fuerza_freno', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
              </div>
            )}

            {casoSeleccionado === 'C' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Masa de Aeronave (m)</span>
                    <span className="text-slate-500 font-mono">kg</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsC.masa}
                    onChange={(e) => handleParamChange('C', 'masa', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="2000"
                    max="80000"
                    step="500"
                    value={parseFloat(paramsC.masa) || 12000}
                    onChange={(e) => handleParamChange('C', 'masa', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Empuje Turborreactores (F)</span>
                    <span className="text-slate-500 font-mono">N</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsC.empuje}
                    onChange={(e) => handleParamChange('C', 'empuje', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="10000"
                    max="250000"
                    step="1000"
                    value={parseFloat(paramsC.empuje) || 60000}
                    onChange={(e) => handleParamChange('C', 'empuje', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Fricción Rodadura de Pista (μ)</span>
                    <span className="text-slate-500 font-mono">adimensional</span>
                  </div>
                  <input 
                    type="number"
                    step="0.005"
                    value={paramsC.friccion_pista}
                    onChange={(e) => handleParamChange('C', 'friccion_pista', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="0.0"
                    max="0.5"
                    step="0.01"
                    value={parseFloat(paramsC.friccion_pista) || 0.02}
                    onChange={(e) => handleParamChange('C', 'friccion_pista', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Longitud de la Pista (L_pista)</span>
                    <span className="text-slate-500 font-mono">m</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsC.l_pista}
                    onChange={(e) => handleParamChange('C', 'l_pista', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="200"
                    max="3000"
                    step="50"
                    value={parseFloat(paramsC.l_pista) || 1000}
                    onChange={(e) => handleParamChange('C', 'l_pista', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Velocidad Despegue Requerida</span>
                    <span className="text-slate-500 font-mono">m/s</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsC.v_despegue}
                    onChange={(e) => handleParamChange('C', 'v_despegue', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="30"
                    max="120"
                    step="1"
                    value={parseFloat(paramsC.v_despegue) || 65}
                    onChange={(e) => handleParamChange('C', 'v_despegue', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Velocidad Inicial en Pista (v0)</span>
                    <span className="text-slate-500 font-mono">m/s</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsC.v_inicial}
                    onChange={(e) => handleParamChange('C', 'v_inicial', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={parseFloat(paramsC.v_inicial) || 0}
                    onChange={(e) => handleParamChange('C', 'v_inicial', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
              </div>
            )}

            {casoSeleccionado === 'D' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Masa Izquierda (m1)</span>
                    <span className="text-slate-500 font-mono">kg</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsD.masa}
                    onChange={(e) => handleParamChange('D', 'masa', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="1"
                    max="500"
                    step="1"
                    value={parseFloat(paramsD.masa) || 50}
                    onChange={(e) => handleParamChange('D', 'masa', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Masa Derecha (m2)</span>
                    <span className="text-slate-500 font-mono">kg</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsD.masa_2}
                    onChange={(e) => handleParamChange('D', 'masa_2', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="1"
                    max="500"
                    step="1"
                    value={parseFloat(paramsD.masa_2) || 40}
                    onChange={(e) => handleParamChange('D', 'masa_2', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Velocidad Inicial (v0)</span>
                    <span className="text-slate-500 font-mono">m/s</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsD.v_inicial}
                    onChange={(e) => handleParamChange('D', 'v_inicial', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="-20"
                    max="20"
                    step="0.5"
                    value={parseFloat(paramsD.v_inicial) || 0}
                    onChange={(e) => handleParamChange('D', 'v_inicial', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Velocidad Final Objetivo (vf)</span>
                    <span className="text-slate-500 font-mono">m/s</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsD.v_final}
                    onChange={(e) => handleParamChange('D', 'v_final', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="-20"
                    max="20"
                    step="0.5"
                    value={parseFloat(paramsD.v_final) || 5}
                    onChange={(e) => handleParamChange('D', 'v_final', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
              </div>
            )}

            {casoSeleccionado === 'E' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Masa del Vehículo (m)</span>
                    <span className="text-slate-500 font-mono">kg</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsE.masa}
                    onChange={(e) => handleParamChange('E', 'masa', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="1000"
                    max="25000"
                    step="100"
                    value={parseFloat(paramsE.masa) || 8000}
                    onChange={(e) => handleParamChange('E', 'masa', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Fuerza del Motor (FT)</span>
                    <span className="text-slate-500 font-mono">N</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsE.fuerza}
                    onChange={(e) => handleParamChange('E', 'fuerza', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="5000"
                    max="150000"
                    step="1000"
                    value={parseFloat(paramsE.fuerza) || 25000}
                    onChange={(e) => handleParamChange('E', 'fuerza', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Inclinación Rampa (θ)</span>
                    <span className="text-slate-500 font-mono">grados (°)</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsE.inclinacion}
                    onChange={(e) => handleParamChange('E', 'inclinacion', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="-15"
                    max="30"
                    step="1"
                    value={parseFloat(paramsE.inclinacion) || 10}
                    onChange={(e) => handleParamChange('E', 'inclinacion', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Coef. de Fricción (μ)</span>
                    <span className="text-slate-500 font-mono">adimensional</span>
                  </div>
                  <input 
                    type="number"
                    step="0.01"
                    value={paramsE.friccion}
                    onChange={(e) => handleParamChange('E', 'friccion', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="0.0"
                    max="1.2"
                    step="0.01"
                    value={parseFloat(paramsE.friccion) || 0.15}
                    onChange={(e) => handleParamChange('E', 'friccion', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Velocidad Inicial (v0)</span>
                    <span className="text-slate-500 font-mono">m/s</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsE.v_inicial}
                    onChange={(e) => handleParamChange('E', 'v_inicial', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="0"
                    max="40"
                    step="1"
                    value={parseFloat(paramsE.v_inicial) || 10}
                    onChange={(e) => handleParamChange('E', 'v_inicial', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Velocidad Final Objetivo (vf)</span>
                    <span className="text-slate-500 font-mono">m/s</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsE.v_final}
                    onChange={(e) => handleParamChange('E', 'v_final', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="0"
                    max="40"
                    step="1"
                    value={parseFloat(paramsE.v_final) || 25}
                    onChange={(e) => handleParamChange('E', 'v_final', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
              </div>
            )}

            {casoSeleccionado === 'F' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Masa del Vehículo (m)</span>
                    <span className="text-slate-500 font-mono">kg</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsF.masa}
                    onChange={(e) => handleParamChange('F', 'masa', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="500"
                    max="5000"
                    step="50"
                    value={parseFloat(paramsF.masa) || 1500}
                    onChange={(e) => handleParamChange('F', 'masa', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Radio de la Curva (R)</span>
                    <span className="text-slate-500 font-mono">m</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsF.radio_curva}
                    onChange={(e) => handleParamChange('F', 'radio_curva', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="20"
                    max="300"
                    step="5"
                    value={parseFloat(paramsF.radio_curva) || 120}
                    onChange={(e) => handleParamChange('F', 'radio_curva', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Ángulo de Peralte (θ)</span>
                    <span className="text-slate-500 font-mono">grados (°)</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsF.inclinacion}
                    onChange={(e) => handleParamChange('F', 'inclinacion', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="0"
                    max="45"
                    step="1"
                    value={parseFloat(paramsF.inclinacion) || 10}
                    onChange={(e) => handleParamChange('F', 'inclinacion', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Fricción Estática Neumático (μs)</span>
                    <span className="text-slate-500 font-mono">adimensional</span>
                  </div>
                  <input 
                    type="number"
                    step="0.05"
                    value={paramsF.friccion_estatica}
                    onChange={(e) => handleParamChange('F', 'friccion_estatica', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="0.0"
                    max="1.5"
                    step="0.05"
                    value={parseFloat(paramsF.friccion_estatica) || 0.6}
                    onChange={(e) => handleParamChange('F', 'friccion_estatica', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Fricción Cinética Calzada (μk)</span>
                    <span className="text-slate-500 font-mono">adimensional</span>
                  </div>
                  <input 
                    type="number"
                    step="0.05"
                    value={paramsF.friccion}
                    onChange={(e) => handleParamChange('F', 'friccion', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="0.0"
                    max="1.2"
                    step="0.05"
                    value={parseFloat(paramsF.friccion) || 0.4}
                    onChange={(e) => handleParamChange('F', 'friccion', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Acción Principal</span>
                  </div>
                  <select
                    value={paramsF.tipo_movimiento}
                    onChange={(e) => handleParamChange('F', 'tipo_movimiento', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Aceleracion">Acelerar (Fuerza a favor)</option>
                    <option value="Frenado">Frenar (Fuerza en contra)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Fuerza Tangencial (F)</span>
                    <span className="text-slate-500 font-mono">N</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsF.fuerza}
                    onChange={(e) => handleParamChange('F', 'fuerza', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="0"
                    max="20000"
                    step="200"
                    value={parseFloat(paramsF.fuerza) || 3000}
                    onChange={(e) => handleParamChange('F', 'fuerza', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Velocidad Inicial (v0)</span>
                    <span className="text-slate-500 font-mono">m/s</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsF.v_inicial}
                    onChange={(e) => handleParamChange('F', 'v_inicial', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="0"
                    max="60"
                    step="1"
                    value={parseFloat(paramsF.v_inicial) || 20}
                    onChange={(e) => handleParamChange('F', 'v_inicial', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Velocidad Final Objetivo (vf)</span>
                    <span className="text-slate-500 font-mono">m/s</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsF.v_final}
                    onChange={(e) => handleParamChange('F', 'v_final', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="0"
                    max="60"
                    step="1"
                    value={parseFloat(paramsF.v_final) || 40}
                    onChange={(e) => handleParamChange('F', 'v_final', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
              </div>
            )}

            {casoSeleccionado === 'libre' && (
              <div className="space-y-3">
                {/* Escenario */}
                <div className="space-y-1">
                  <span className="text-[10.5px] text-slate-400 font-bold uppercase block">Escenario del Sistema</span>
                  <select
                    value={paramsLibre.escenario}
                    onChange={(e) => handleParamChange('libre', 'escenario', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Automovil">Automóvil de Pasajeros</option>
                    <option value="Camion">Camión de Carga Pesada</option>
                    <option value="Motocicleta">Motocicleta Deportiva</option>
                    <option value="Elevador">Elevador / Ascensor Minero</option>
                    <option value="Avion">Avión Comercial (Despegue)</option>
                    <option value="Atwood">Máquina de Atwood</option>
                    <option value="Curva">Vehículo en Curva Peraltada</option>
                  </select>
                </div>

                {/* Tipo de Movimiento (Aceleración/Frenado) */}
                {paramsLibre.escenario !== 'Elevador' && paramsLibre.escenario !== 'Atwood' && (
                  <div className="space-y-1">
                    <span className="text-[10.5px] text-slate-400 font-bold uppercase block">Acción Principal</span>
                    <select
                      value={paramsLibre.tipo_movimiento}
                      onChange={(e) => handleParamChange('libre', 'tipo_movimiento', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Aceleracion">Acelerar (Fuerza a favor)</option>
                      <option value="Frenado">Frenar (Fuerza en contra)</option>
                    </select>
                  </div>
                )}

                {/* Masa 1 */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">
                      {paramsLibre.escenario === 'Atwood' ? 'Masa Izquierda (m1)' : 'Masa del Objeto (m)'}
                    </span>
                    <span className="text-slate-500 font-mono">kg</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsLibre.masa}
                    onChange={(e) => handleParamChange('libre', 'masa', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <input 
                    type="range"
                    min="500"
                    max="50000"
                    step="100"
                    value={parseFloat(paramsLibre.masa) || 1500}
                    onChange={(e) => handleParamChange('libre', 'masa', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>

                {/* Masa 2 (Atwood) */}
                {paramsLibre.escenario === 'Atwood' && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300">Masa Derecha (m2)</span>
                      <span className="text-slate-500 font-mono">kg</span>
                    </div>
                    <input 
                      type="number"
                      value={paramsLibre.masa_2}
                      onChange={(e) => handleParamChange('libre', 'masa_2', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none"
                    />
                    <input 
                      type="range"
                      min="1"
                      max="500"
                      step="1"
                      value={parseFloat(paramsLibre.masa_2) || 40}
                      onChange={(e) => handleParamChange('libre', 'masa_2', e.target.value)}
                      className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                    />
                  </div>
                )}

                {/* Fuerza (Se oculta en Atwood) */}
                {paramsLibre.escenario !== 'Atwood' && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300">
                        {paramsLibre.escenario === 'Elevador' ? 'Tensión del Cable (T)' : (paramsLibre.tipo_movimiento === 'Frenado' ? 'Fuerza de Frenado (F_freno)' : 'Fuerza de Tracción / Empuje (F)')}
                      </span>
                      <span className="text-slate-500 font-mono">N</span>
                    </div>
                    <input 
                      type="number"
                      value={paramsLibre.fuerza}
                      onChange={(e) => handleParamChange('libre', 'fuerza', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none"
                    />
                    <input 
                      type="range"
                      min={paramsLibre.tipo_movimiento === 'Frenado' ? '0' : '-50000'}
                      max="100000"
                      step="1000"
                      value={parseFloat(paramsLibre.fuerza) || 5000}
                      onChange={(e) => handleParamChange('libre', 'fuerza', e.target.value)}
                      className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                    />
                  </div>
                )}

                {/* Coef. Fricción (Se oculta en Elevador) */}
                {paramsLibre.escenario !== 'Elevador' && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300">Coef. de Fricción (μ)</span>
                      <span className="text-slate-500 font-mono">adimensional</span>
                    </div>
                    <input 
                      type="number"
                      step="0.01"
                      value={paramsLibre.friccion}
                      onChange={(e) => handleParamChange('libre', 'friccion', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none"
                    />
                    <input 
                      type="range"
                      min="0.0"
                      max="1.5"
                      step="0.05"
                      value={parseFloat(paramsLibre.friccion) || 0.1}
                      onChange={(e) => handleParamChange('libre', 'friccion', e.target.value)}
                      className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                    />
                  </div>
                )}

                {/* Parámetros Específicos de Curva en Caso Libre */}
                {paramsLibre.escenario === 'Curva' && (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300">Radio de Curva (R)</span>
                        <span className="text-slate-500 font-mono">m</span>
                      </div>
                      <input 
                        type="number"
                        value={paramsLibre.radio_curva}
                        onChange={(e) => handleParamChange('libre', 'radio_curva', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none"
                      />
                      <input 
                        type="range"
                        min="20"
                        max="300"
                        step="5"
                        value={parseFloat(paramsLibre.radio_curva) || 120}
                        onChange={(e) => handleParamChange('libre', 'radio_curva', e.target.value)}
                        className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300">Fricción Estática (μs)</span>
                        <span className="text-slate-500 font-mono">adimensional</span>
                      </div>
                      <input 
                        type="number"
                        step="0.05"
                        value={paramsLibre.friccion_estatica}
                        onChange={(e) => handleParamChange('libre', 'friccion_estatica', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none"
                      />
                      <input 
                        type="range"
                        min="0.0"
                        max="1.5"
                        step="0.05"
                        value={parseFloat(paramsLibre.friccion_estatica) || 0.6}
                        onChange={(e) => handleParamChange('libre', 'friccion_estatica', e.target.value)}
                        className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                      />
                    </div>
                  </>
                )}

                {/* Inclinación Rampa (Se oculta en Elevador y Atwood) */}
                {paramsLibre.escenario !== 'Elevador' && paramsLibre.escenario !== 'Atwood' && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300">
                        {paramsLibre.escenario === 'Curva' ? 'Ángulo Peralte (θ)' : 'Inclinación Rampa (θ)'}
                      </span>
                      <span className="text-slate-500 font-mono">grados (°)</span>
                    </div>
                    <input 
                      type="number"
                      value={paramsLibre.inclinacion}
                      onChange={(e) => handleParamChange('libre', 'inclinacion', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none"
                    />
                    <input 
                      type="range"
                      min="-45"
                      max="45"
                      step="1"
                      value={parseFloat(paramsLibre.inclinacion) || 0}
                      onChange={(e) => handleParamChange('libre', 'inclinacion', e.target.value)}
                      className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                    />
                  </div>
                )}

                {/* Velocidad Inicial */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Velocidad Inicial (v0)</span>
                    <span className="text-slate-500 font-mono">m/s</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsLibre.v_inicial}
                    onChange={(e) => handleParamChange('libre', 'v_inicial', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none"
                  />
                  <input 
                    type="range"
                    min="-50"
                    max="100"
                    step="1"
                    value={parseFloat(paramsLibre.v_inicial) || 0}
                    onChange={(e) => handleParamChange('libre', 'v_inicial', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>

                {/* Velocidad Final */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Velocidad Final Objetivo (vf)</span>
                    <span className="text-slate-500 font-mono">m/s</span>
                  </div>
                  <input 
                    type="number"
                    value={paramsLibre.v_final}
                    onChange={(e) => handleParamChange('libre', 'v_final', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-400 focus:outline-none"
                  />
                  <input 
                    type="range"
                    min="-50"
                    max="100"
                    step="1"
                    value={parseFloat(paramsLibre.v_final) || 20}
                    onChange={(e) => handleParamChange('libre', 'v_final', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
              </div>
            )}

            <button 
              onClick={resolverProblema}
              disabled={cargandoSolucion}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shadow shadow-cyan-500/10"
            >
              {cargandoSolucion ? (
                <>
                  <i className="fa-solid fa-atom animate-spin"></i>
                  <span>Calculando Ecuaciones...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-calculator"></i>
                  <span>Resolver Analíticamente</span>
                </>
              )}
            </button>
          </div>
        </section>
        )}

        {/* PIZARRA VIRTUAL DE DESARROLLO (9 o 12 Columnas) */}
        <section className={`${sidebarCollapsed ? 'lg:col-span-12' : 'lg:col-span-9'} flex flex-col space-y-4 lg:overflow-hidden lg:h-full`}>
          
          {sidebarCollapsed && (
            <div className="flex-shrink-0 flex items-center mb-1">
              <button 
                onClick={() => setSidebarCollapsed(false)}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-md"
                title="Mostrar barra lateral"
              >
                <i className="fa-solid fa-bars"></i>
                <span>Abrir barra lateral</span>
              </button>
            </div>
          )}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col flex-1 min-h-0 relative">
            
            {/* Header de Pizarra */}
            <div className="bg-slate-950/80 px-5 py-3 border-b border-slate-800/60 flex justify-between items-center flex-shrink-0">
              <span className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                <i className="fa-solid fa-chalkboard text-cyan-400"></i>
                <span className="uppercase tracking-wider">PIZARRA VIRTUAL DE FISICA APLICADA</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-mono border border-cyan-800 bg-cyan-950/40 px-2 py-0.5 rounded">
                Modelo: Segunda Ley de Newton
              </span>
            </div>

            {/* Pizarra Text/Blackboard */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-950 font-mono text-xs leading-relaxed relative">
              {/* Notebook / Blackboard grid pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:30px_30px] opacity-15 pointer-events-none"></div>
              
              <div className="relative z-10 space-y-4">
                
                {/* Enunciado */}
                <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                  <span className="text-cyan-400 font-bold uppercase text-[10px] block mb-1">Enunciado del Caso {casoSeleccionado}:</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {obtenerEnunciadoDinamico(casoSeleccionado)}
                  </p>
                </div>

                {/* Solución step-by-step */}
                {solucionResultado ? (
                  <div className="space-y-4">
                    <div className="space-y-2 border-l-2 border-cyan-500/30 pl-4 py-1">
                      <span className="text-cyan-400 font-bold uppercase text-[10px] block mb-2">Desglose Analítico Paso a Paso:</span>
                      {solucionResultado.procedimiento.map((step, idx) => (
                        <div key={idx} className="text-slate-300 text-[11px] py-0.5 whitespace-pre-wrap">
                          {step}
                        </div>
                      ))}
                    </div>

                    {/* Resultados Clave en Neon Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">
                          {solucionResultado.incognitas.aceleracion < 0 ? 'Desaceleración' : 'Aceleración'}
                        </span>
                        <span className="text-sm font-bold text-rose-400 font-mono mt-1 block">
                          {solucionResultado.incognitas.aceleracion !== undefined && solucionResultado.incognitas.aceleracion !== null ? `${Math.abs(solucionResultado.incognitas.aceleracion).toFixed(4)} m/s²` : 'N/A'}
                        </span>
                        <span className="text-[8.5px] text-slate-500 block mt-0.5">
                          {solucionResultado.incognitas.aceleracion < 0 ? '(Se opone al movimiento)' : '(A favor del movimiento)'}
                        </span>
                      </div>
                      
                       {((casoSeleccionado === 'A' || casoSeleccionado === 'E' || casoSeleccionado === 'libre') && (casoSeleccionado !== 'libre' || paramsLibre.escenario !== 'Curva')) && (
                        <>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">
                              {casoSeleccionado === 'A' ? 'Tiempo Parada' : 'Tiempo Transición'}
                            </span>
                            <span className="text-sm font-bold text-cyan-400 font-mono mt-1 block">
                              {solucionResultado.incognitas.tiempo_freno !== null && solucionResultado.incognitas.tiempo_freno !== undefined ? `${solucionResultado.incognitas.tiempo_freno.toFixed(3)} s` : 'Incalculable'}
                            </span>
                          </div>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">
                              {casoSeleccionado === 'A' ? 'Posición Parada' : 'Distancia Recorrida'}
                            </span>
                            <span className="text-sm font-bold text-emerald-400 font-mono mt-1 block">
                              {solucionResultado.incognitas.posicion_final !== null && solucionResultado.incognitas.posicion_final !== undefined ? `${solucionResultado.incognitas.posicion_final.toFixed(3)} m` : 'No se detiene'}
                            </span>
                          </div>
                        </>
                      )}

                      {(casoSeleccionado === 'F' || (casoSeleccionado === 'libre' && paramsLibre.escenario === 'Curva')) && (
                        <>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Velocidades Límites</span>
                            <span className="text-[11px] font-bold text-cyan-400 font-mono mt-1 block">
                              {solucionResultado.incognitas.v_min !== undefined ? `${solucionResultado.incognitas.v_min.toFixed(2)} a ${solucionResultado.incognitas.v_max > 990 ? '∞' : `${solucionResultado.incognitas.v_max.toFixed(2)}`} m/s` : 'N/A'}
                            </span>
                            <span className="text-[8.5px] text-slate-500 block mt-0.5">
                              (Ideal: {solucionResultado.incognitas.v_ideal !== undefined ? `${solucionResultado.incognitas.v_ideal.toFixed(2)} m/s` : 'N/A'})
                            </span>
                          </div>
                          
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Fricción Lateral / Normal</span>
                            <span className="text-[11px] font-bold text-emerald-400 font-mono mt-1 block">
                              {solucionResultado.incognitas.friccion_lateral !== undefined ? `${solucionResultado.incognitas.friccion_lateral.toFixed(1)} N / ${solucionResultado.incognitas.normal.toFixed(1)} N` : 'N/A'}
                            </span>
                          </div>

                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Estado Adherencia</span>
                            <span className={`text-[11px] font-bold font-mono mt-1 block ${solucionResultado.incognitas.se_desliza ? 'text-rose-500' : 'text-emerald-400'}`}>
                              {solucionResultado.incognitas.se_desliza ? '¡Deslizamiento/Derrape!' : 'Estable (Adherido)'}
                            </span>
                            <span className="text-[8.5px] text-slate-500 block mt-0.5">
                              {solucionResultado.incognitas.se_desliza ? 'Pérdida de control' : 'Giro Seguro'}
                            </span>
                          </div>

                          {solucionResultado.incognitas.tiempo_freno !== null && solucionResultado.incognitas.tiempo_freno !== undefined && (
                            <>
                              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Tiempo Transición</span>
                                <span className="text-sm font-bold text-cyan-400 font-mono mt-1 block">
                                  {`${solucionResultado.incognitas.tiempo_freno.toFixed(3)} s`}
                                </span>
                              </div>
                              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Distancia Transición</span>
                                <span className="text-sm font-bold text-emerald-400 font-mono mt-1 block">
                                  {`${solucionResultado.incognitas.distancia_freno.toFixed(2)} m`}
                                </span>
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {casoSeleccionado === 'D' && (
                        <>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Tensión Cable</span>
                            <span className="text-sm font-bold text-cyan-400 font-mono mt-1 block">
                              {solucionResultado.incognitas.tension !== null && solucionResultado.incognitas.tension !== undefined ? `${solucionResultado.incognitas.tension.toFixed(2)} N` : 'N/A'}
                            </span>
                          </div>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Tiempo Transición</span>
                            <span className="text-sm font-bold text-emerald-400 font-mono mt-1 block">
                              {solucionResultado.incognitas.tiempo_freno !== null && solucionResultado.incognitas.tiempo_freno !== undefined ? `${solucionResultado.incognitas.tiempo_freno.toFixed(3)} s` : 'Incalculable'}
                            </span>
                          </div>
                        </>
                      )}

                      {casoSeleccionado === 'B' && (
                        <>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Estado Final</span>
                            <span className={`text-xs font-bold font-mono mt-1 block ${solucionResultado.incognitas.se_detiene ? 'text-emerald-400' : 'text-rose-500'}`}>
                              {solucionResultado.incognitas.se_detiene ? 'Frenado Seguro' : 'Impacto contra Suelo'}
                            </span>
                          </div>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Alt/Vel Final</span>
                            <span className="text-xs font-bold text-cyan-400 font-mono mt-1 block">
                              {solucionResultado.incognitas.se_detiene 
                                ? `y = ${solucionResultado.incognitas.altura_parada.toFixed(2)} m` 
                                : `v = ${Math.abs(solucionResultado.incognitas.v_impacto).toFixed(2)} m/s`}
                            </span>
                          </div>
                        </>
                      )}

                      {casoSeleccionado === 'C' && (
                        <>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Pista Necesaria</span>
                            <span className="text-sm font-bold text-cyan-400 font-mono mt-1 block">
                              {solucionResultado.incognitas.d_necesaria !== null && solucionResultado.incognitas.d_necesaria !== undefined ? `${solucionResultado.incognitas.d_necesaria.toFixed(2)} m` : 'N/A'}
                            </span>
                          </div>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Resultado</span>
                            <span className={`text-xs font-bold font-mono mt-1 block ${solucionResultado.incognitas.logra_despegue ? 'text-emerald-400' : 'text-rose-500'}`}>
                              {solucionResultado.incognitas.logra_despegue ? 'Despegue Exitoso' : 'Pista Insuficiente'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Conclusión */}
                    <div className="p-4 bg-cyan-950/20 border border-cyan-800/40 rounded-xl text-cyan-200 text-[11px] leading-relaxed">
                      <span className="text-cyan-400 font-bold block mb-1">Discusión de Resultados:</span>
                      {solucionResultado.conclusion}
                    </div>

                    {/* Botón Simular y Validar */}
                    <div className="pt-2 flex justify-center">
                      <button 
                        onClick={() => simularYValidar(casoSeleccionado)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs transition-all flex items-center space-x-2 shadow-lg shadow-emerald-500/10 cursor-pointer animate-pulse"
                      >
                        <i className="fa-solid fa-circle-play text-sm"></i>
                        <span>Simular y Validar en Laboratorio</span>
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-slate-500 text-center space-y-3">
                    <i className="fa-solid fa-signature text-3xl text-slate-700"></i>
                    <p className="text-xs italic">
                      Pizarra en blanco. Configure los parámetros en el formulario de la izquierda y haga clic en <strong>"Resolver Analíticamente"</strong> para mostrar las ecuaciones paso a paso.
                    </p>
                  </div>
                )}

              </div>
            </div>
            
          </div>
        </section>

      </div>
    );
  };

  const confActual = escenariosConfig[escenario] || {};

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
      
      {/* HEADER PRINCIPAL */}
      <header className="bg-slate-900/90 border-b border-slate-800 py-2.5 sm:py-3.5 px-3 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 shadow-lg backdrop-blur-sm z-10">
        <div className="flex items-center space-x-2.5 sm:space-x-3.5 w-full md:w-auto justify-center md:justify-start">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/10 flex-shrink-0">
            <i className="fa-solid fa-atom text-white text-base sm:text-xl animate-spin-slow"></i>
          </div>
          <div className="min-w-0 text-center md:text-left">
            <h1 className="text-xs sm:text-lg font-bold text-white tracking-wide uppercase break-words whitespace-normal">LABORATORIO NEWTONIANO INTERACTIVO</h1>
            <p className="text-[8.5px] sm:text-[10.5px] text-cyan-400/80 font-mono break-words whitespace-normal leading-tight">Simulaciones de Dinámica y Leyes de Newton — UTP Física Clásica</p>
          </div>
        </div>
        
        {/* PESTAÑAS DE NAVEGACIÓN */}
        <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full md:flex md:w-auto md:gap-1.5 md:p-1.5">
          <button 
            onClick={() => setTab('simulador')}
            className={`px-1 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 w-full text-center ${tab === 'simulador' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <i className="fa-solid fa-gauge-high text-xs sm:text-sm"></i>
            <span>Simulador</span>
          </button>
          <button 
            onClick={() => { setTab('resolutor'); setSolucionResultado(null); }}
            className={`px-1 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 w-full text-center ${tab === 'resolutor' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <i className="fa-solid fa-graduation-cap text-xs sm:text-sm"></i>
            <span className="hidden sm:inline">Resolutor de Problemas</span>
            <span className="inline sm:hidden">Resolutor</span>
          </button>
          <button 
            onClick={() => { setTab('quiz'); generarNuevoDesafio(); }}
            className={`px-1 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 w-full text-center ${tab === 'quiz' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <i className="fa-solid fa-clipboard-question text-xs sm:text-sm"></i>
            <span className="hidden sm:inline">Autoevaluación Quiz</span>
            <span className="inline sm:hidden">Quiz</span>
          </button>
          <button 
            onClick={() => { setTab('historial'); cargarHistorial(); }}
            className={`px-1 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 w-full text-center ${tab === 'historial' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <i className="fa-solid fa-square-poll-vertical text-xs sm:text-sm"></i>
            <span className="hidden sm:inline">Historial BD ({historial.length})</span>
            <span className="inline sm:hidden">Historial ({historial.length})</span>
          </button>
        </div>
      </header>

      {/* RENDER ALERTA DE ERROR */}
      {errorMessage && (
        <div className="bg-rose-950/80 border-b border-rose-800 text-rose-200 px-6 py-2.5 text-xs flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <i className="fa-solid fa-circle-exclamation text-rose-400 text-sm"></i>
            <span><strong>Límite Físico:</strong> {errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-400 hover:text-white">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      {/* CONTENIDO DE LA VISTA */}
      <main className="flex-1 overflow-y-auto lg:overflow-hidden">
        {tab === 'simulador' && (
          
          /* CONTENEDOR GRID PRINCIPAL */
          <div id="main-simulator-container" className="flex flex-col lg:grid lg:grid-cols-12 gap-5 p-5 h-auto lg:h-full overflow-y-auto lg:overflow-hidden">
            
            {modoProblemaActivo && (
              <div className="col-span-12 bg-cyan-950/80 border border-cyan-500/30 text-cyan-200 px-4 py-2.5 rounded-xl text-xs flex justify-between items-center shadow-lg shadow-cyan-500/5 animate-pulse">
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-graduation-cap text-cyan-400 text-sm"></i>
                  <span>
                    <strong>Validación del Caso {modoProblemaActivo}:</strong> Los parámetros físicos están sincronizados y optimizados para verificar el problema de la UTP. El arrastre del aire se ha desactivado para concordar con el modelo analítico ideal.
                  </span>
                </div>
                <button 
                  onClick={() => setModoProblemaActivo(null)} 
                  className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 px-3 py-1 rounded-lg font-bold transition-all text-[10px] cursor-pointer"
                >
                  Liberar Controles
                </button>
              </div>
            )}
            
            {/* BACKDROP DE COMPATIBILIDAD MÓVIL PARA LA BARRA LATERAL */}
            {!sidebarCollapsed && (
              <div 
                onClick={() => setSidebarCollapsed(true)} 
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden cursor-pointer"
              />
            )}
            
            {/* PANEL DE CONTROL IZQUIERDO (3 Columnas o Drawer) */}
            {!sidebarCollapsed && (
              <section className="fixed inset-y-0 left-0 w-[290px] z-50 bg-slate-900 border-r border-slate-800 p-5 flex flex-col overflow-y-auto space-y-4 shadow-2xl lg:relative lg:inset-auto lg:w-auto lg:h-auto lg:z-0 lg:border lg:border-slate-800/80 lg:rounded-2xl lg:col-span-3 lg:shadow-none lg:max-h-full">
                
                {/* ESCENARIO SELECTOR */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-cyan-400 tracking-wider uppercase flex items-center">
                      <i className="fa-solid fa-compass-drafting mr-2"></i> 1. Escenario de Estudio
                    </h3>
                    <button 
                      onClick={() => setSidebarCollapsed(true)} 
                      className="text-slate-400 hover:text-white hover:bg-slate-850 p-1.5 rounded-lg transition-all cursor-pointer"
                      title="Contraer barra lateral"
                    >
                      <i className="fa-solid fa-xmark fa-lg"></i>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(escenariosConfig).filter(key => key !== 'Curva').map((key) => {
                      const active = escenario === key;
                      const config = escenariosConfig[key];
                      return (
                        <button
                          key={key}
                          onClick={() => { if (!isRunning) { setEscenario(key); setModoProblemaActivo(null); } }}
                          disabled={isRunning}
                          title={config.nombre}
                          className={`py-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                            active 
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-md shadow-cyan-500/5' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30'
                          }`}
                        >
                          <i className={`fa-solid ${config.icono} text-base`}></i>
                          <span className="text-[8px] font-bold mt-1 truncate w-full text-center px-0.5">{key}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1.5 shadow-inner">
                    <span className="text-[8.5px] font-bold text-cyan-400 uppercase tracking-widest block font-mono flex items-center gap-1">
                      <i className="fa-solid fa-graduation-cap text-[10px]"></i> Enunciado del Problema (UTP):
                    </span>
                    <p className="text-[9.5px] text-slate-300 font-mono leading-relaxed select-all cursor-text" title="Haz doble clic para seleccionar y copiar">
                      {generarEnunciadoDinamico()}
                    </p>
                  </div>
                </div>



              {/* CONTROLES FÍSICOS EDITABLES */}
              <div className="space-y-4 pt-3 border-t border-slate-800/60">
                <h3 className="text-xs font-bold text-cyan-400 tracking-wider uppercase flex items-center">
                  <i className="fa-solid fa-sliders mr-2"></i> 2. Variables del Sistema
                </h3>
                
                {/* CONTROL MASA */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-300">
                      {escenario === 'Atwood' ? 'Masa Izquierda (m1)' : 'Masa (m)'}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <input 
                        type="number"
                        min={confActual.masa_min}
                        max={confActual.masa_max}
                        value={masa}
                        onChange={(e) => handleInputChange(e.target.value, setMasa, confActual.masa_min, confActual.masa_max)}
                        onBlur={() => handleInputBlur(masa, setMasa, confActual.masa_min, confActual.masa_max)}
                        className="w-16 bg-slate-950 border border-slate-800 text-right font-mono text-xs px-1.5 py-0.5 rounded text-cyan-400 focus:outline-none focus:border-cyan-500"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">{confActual.masa_unidad}</span>
                    </div>
                  </div>
                  <input 
                    type="range"
                    min={confActual.masa_min}
                    max={confActual.masa_max}
                    step={escenario === 'Motocicleta' ? 10 : (escenario === 'Atwood' ? 1 : 100)}
                    value={masa}
                    onChange={(e) => setMasa(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                {/* CONTROL MASA 2 (Solo Atwood) */}
                {escenario === 'Atwood' && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-300">Masa Derecha (m2)</span>
                      <div className="flex items-center space-x-1.5">
                        <input 
                          type="number"
                          min={confActual.masa2_min || 1}
                          max={confActual.masa2_max || 100}
                          value={masa2}
                          onChange={(e) => handleInputChange(e.target.value, setMasa2, confActual.masa2_min || 1, confActual.masa2_max || 100)}
                          onBlur={() => handleInputBlur(masa2, setMasa2, confActual.masa2_min || 1, confActual.masa2_max || 100)}
                          className="w-16 bg-slate-950 border border-slate-800 text-right font-mono text-xs px-1.5 py-0.5 rounded text-cyan-400 focus:outline-none focus:border-cyan-500"
                        />
                        <span className="text-[10px] text-slate-500 font-mono">{confActual.masa2_unidad || 'kg'}</span>
                      </div>
                    </div>
                    <input 
                      type="range"
                      min={confActual.masa2_min || 1}
                      max={confActual.masa2_max || 100}
                      step={1}
                      value={masa2}
                      onChange={(e) => setMasa2(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                )}

                {/* CONTROL FUERZA (Se oculta en Atwood ya que la tensión se calcula) */}
                {escenario !== 'Atwood' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-300">{confActual.fuerza_label}</span>
                      <div className="flex items-center space-x-1.5">
                        <input 
                          type="number"
                          min={confActual.fuerza_min}
                          max={confActual.fuerza_max}
                          value={fuerza}
                          onChange={(e) => handleInputChange(e.target.value, setFuerza, confActual.fuerza_min, confActual.fuerza_max)}
                          onBlur={() => handleInputBlur(fuerza, setFuerza, confActual.fuerza_min, confActual.fuerza_max)}
                          className="w-18 bg-slate-950 border border-slate-800 text-right font-mono text-xs px-1.5 py-0.5 rounded text-cyan-400 focus:outline-none focus:border-cyan-500"
                        />
                        <span className="text-[10px] text-slate-500 font-mono">{confActual.fuerza_unidad}</span>
                      </div>
                    </div>
                    <input 
                      type="range"
                      min={confActual.fuerza_min}
                      max={confActual.fuerza_max}
                      step={100}
                      value={fuerza}
                      onChange={(e) => setFuerza(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    
                    {/* Perfil de Fuerza */}
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Perfil de Fuerza</span>
                      <select
                        value={perfilFuerza}
                        onChange={(e) => setPerfilFuerza(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-white font-bold focus:outline-none"
                      >
                        <option value="Constante">Constante</option>
                        <option value="Impulso">Impulso (2s)</option>
                        <option value="Rampa">Rampa Lineal</option>
                        <option value="Senoidal">Senoidal</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* CONTROL INCLINACIÓN DE PISTA (Rampa/Cuesta) - Se oculta si es Elevador o Atwood */}
                {escenario !== 'Elevador' && escenario !== 'Atwood' && (
                  <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-300 flex items-center">
                        <i className="fa-solid fa-mountain mr-1.5 text-amber-500"></i>
                        <span>{escenario === 'Curva' ? 'Ángulo Peralte (θ)' : 'Inclinación Rampa (θ)'}</span>
                      </span>
                      <div className="flex items-center space-x-1">
                        <input 
                          type="number"
                          min={escenario === 'Curva' ? 0 : -15}
                          max={escenario === 'Curva' ? 45 : 30}
                          value={inclinacion}
                          onChange={(e) => handleInputChange(e.target.value, setInclinacion, escenario === 'Curva' ? 0 : -15, escenario === 'Curva' ? 45 : 30)}
                          onBlur={() => handleInputBlur(inclinacion, setInclinacion, escenario === 'Curva' ? 0 : -15, escenario === 'Curva' ? 45 : 30)}
                          className="w-12 bg-slate-950 border border-slate-800 text-right font-mono text-xs px-1 py-0.5 rounded text-cyan-400 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500">°</span>
                      </div>
                    </div>
                    <input 
                      type="range"
                      min={escenario === 'Curva' ? 0 : -15}
                      max={escenario === 'Curva' ? 45 : 30}
                      step={1}
                      value={inclinacion}
                      onChange={(e) => setInclinacion(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <div className="flex justify-between text-[8.5px] text-slate-500 font-mono">
                      <span>{escenario === 'Curva' ? 'Plano (0°)' : 'Downhill (-15°)'}</span>
                      <span className={inclinacion > 0 ? 'text-emerald-400' : (inclinacion < 0 ? 'text-rose-400' : '')}>
                        {inclinacion === 0 ? 'Plano (0°)' : `${inclinacion}°`}
                      </span>
                      <span>{escenario === 'Curva' ? 'Peralte Máx (45°)' : 'Uphill (+30°)'}</span>
                    </div>
                  </div>
                )}

                {/* CONTROL RADIO CURVA - Solo si es Curva */}
                {escenario === 'Curva' && (
                  <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-300 flex items-center">
                        <i className="fa-solid fa-circle-nodes mr-1.5 text-cyan-400"></i>
                        <span>Radio Curva (R)</span>
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <input 
                          type="number"
                          min={20}
                          max={300}
                          value={radioCurva}
                          onChange={(e) => handleInputChange(e.target.value, setRadioCurva, 20, 300)}
                          onBlur={() => handleInputBlur(radioCurva, setRadioCurva, 20, 300)}
                          className="w-16 bg-slate-950 border border-slate-800 text-right font-mono text-xs px-1.5 py-0.5 rounded text-cyan-400 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500 font-mono">m</span>
                      </div>
                    </div>
                    <input 
                      type="range"
                      min={20}
                      max={300}
                      step={5}
                      value={radioCurva}
                      onChange={(e) => setRadioCurva(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                )}

                {/* CONTROL VELOCIDAD INICIAL (Solo vehículos terrestres y Avión en Crucero) */}
                {((escenario !== 'Elevador' && escenario !== 'Avion' && escenario !== 'Atwood') || (escenario === 'Avion' && vueloCrucero)) && (
                  <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-300">
                        {vueloCrucero ? 'Velocidad de Crucero (v0)' : 'Velocidad Inicial (v0)'}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <input 
                          type="number"
                          min={(escenario === 'Avion' && vueloCrucero) ? 60 : confActual.v_ini_min}
                          max={(escenario === 'Avion' && vueloCrucero) ? 160 : confActual.v_ini_max}
                          value={vInicial}
                          disabled={isRunning}
                          onChange={(e) => handleInputChange(e.target.value, setVInicial, (escenario === 'Avion' && vueloCrucero) ? 60 : confActual.v_ini_min, (escenario === 'Avion' && vueloCrucero) ? 160 : confActual.v_ini_max)}
                          onBlur={() => handleInputBlur(vInicial, setVInicial, (escenario === 'Avion' && vueloCrucero) ? 60 : confActual.v_ini_min, (escenario === 'Avion' && vueloCrucero) ? 160 : confActual.v_ini_max)}
                          className="w-16 bg-slate-950 border border-slate-800 text-right font-mono text-xs px-1.5 py-0.5 rounded text-cyan-400 focus:outline-none disabled:opacity-45"
                        />
                        <span className="text-[10px] text-slate-500 font-mono">m/s</span>
                      </div>
                    </div>
                    <input 
                      type="range"
                      min={(escenario === 'Avion' && vueloCrucero) ? 60 : confActual.v_ini_min}
                      max={(escenario === 'Avion' && vueloCrucero) ? 160 : confActual.v_ini_max}
                      step={1}
                      value={vInicial}
                      disabled={isRunning}
                      onChange={(e) => setVInicial(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-20"
                    />
                  </div>
                )}

                {/* CONTROL RESISTENCIA AIRE (Se oculta en Atwood) */}
                {escenario !== 'Atwood' && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-300">{confActual.b_label}</span>
                      <input 
                        type="number"
                        min={confActual.b_min}
                        max={confActual.b_max}
                        step={0.01}
                        value={resistenciaAire}
                        onChange={(e) => handleInputChange(e.target.value, setResistenciaAire, confActual.b_min, confActual.b_max)}
                        onBlur={() => handleInputBlur(resistenciaAire, setResistenciaAire, confActual.b_min, confActual.b_max)}
                        className="w-16 bg-slate-950 border border-slate-800 text-right font-mono text-xs px-1.5 py-0.5 rounded text-cyan-400 focus:outline-none"
                      />
                    </div>
                    <input 
                      type="range"
                      min={confActual.b_min}
                      max={confActual.b_max}
                      step={0.01}
                      value={resistenciaAire}
                      onChange={(e) => setResistenciaAire(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                )}

                {/* CONTROLES ESPECÍFICOS SEGÚN ESCENARIO */}
                {escenario === 'Avion' && (
                  <div className="space-y-3.5">
                    {/* Selector de fase: Despegue / Vuelo Crucero */}
                    <div className="flex flex-col space-y-1 bg-sky-950/20 p-2.5 rounded-xl border border-sky-800/30">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fase de Simulación</span>
                      <select
                        value={vueloCrucero ? 'crucero' : 'despegue'}
                        disabled={isRunning}
                        onChange={(e) => {
                          const isCrucero = e.target.value === 'crucero';
                          setVueloCrucero(isCrucero);
                          setVInicial(isCrucero ? 110 : 0);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-500 cursor-pointer disabled:opacity-50"
                      >
                        <option value="despegue">🛫 Despegue en Pista</option>
                        <option value="crucero">☁️ Vuelo Crucero (Ciudad X → Y)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-slate-300">Coef. Sustentación (Cl)</span>
                      <input 
                        type="number"
                        min={confActual.sustentacion_coef_min}
                        max={confActual.sustentacion_coef_max}
                        step={0.05}
                        value={sustentacionCoef}
                        onChange={(e) => handleInputChange(e.target.value, setSustentacionCoef, confActual.sustentacion_coef_min, confActual.sustentacion_coef_max)}
                        onBlur={() => handleInputBlur(sustentacionCoef, setSustentacionCoef, confActual.sustentacion_coef_min, confActual.sustentacion_coef_max)}
                        className="w-16 bg-slate-950 border border-slate-800 text-right font-mono text-xs px-1.5 py-0.5 rounded text-cyan-400 focus:outline-none"
                      />
                    </div>
                    <input 
                      type="range"
                      min={confActual.sustentacion_coef_min}
                      max={confActual.sustentacion_coef_max}
                      step={0.05}
                      value={sustentacionCoef}
                      onChange={(e) => setSustentacionCoef(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                </div>
              )}

                {escenario === 'Elevador' && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-300">Límite de Altura</span>
                      <div className="flex items-center space-x-1">
                        <input 
                          type="number"
                          min={confActual.altura_max_min}
                          max={confActual.altura_max_max}
                          value={alturaMax}
                          onChange={(e) => handleInputChange(e.target.value, setAlturaMax, confActual.altura_max_min, confActual.altura_max_max)}
                          onBlur={() => handleInputBlur(alturaMax, setAlturaMax, confActual.altura_max_min, confActual.altura_max_max)}
                          className="w-16 bg-slate-950 border border-slate-800 text-right font-mono text-xs px-1.5 py-0.5 rounded text-cyan-400"
                        />
                        <span className="text-[10px] text-slate-500">m</span>
                      </div>
                    </div>
                    <input 
                      type="range"
                      min={confActual.altura_max_min}
                      max={confActual.altura_max_max}
                      step={10}
                      value={alturaMax}
                      onChange={(e) => setAlturaMax(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                )}

                {/* ENTORNO Y CLIMA */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10.5px] text-slate-400 font-bold uppercase flex items-center gap-1.5">
                      <i className={`fa-solid ${obtenerIconoClima(entorno)}`}></i>
                      <span>{escenario === 'Elevador' ? 'Fluido' : (escenario === 'Atwood' ? 'Medio' : 'Medio / Clima')}</span>
                    </span>
                    <select
                      value={entorno}
                      onChange={(e) => setEntorno(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
                    >
                      {confActual.climas && Object.keys(confActual.climas).map((cl) => (
                        <option key={cl} value={cl}>{cl}</option>
                      ))}
                    </select>
                  </div>

                  {escenario !== 'Elevador' && escenario !== 'Atwood' && (
                    <div className="space-y-1">
                      <span className="text-[10.5px] text-slate-400 block font-bold uppercase">Dirección Fuerza</span>
                      <select
                        value={modo}
                        onChange={(e) => cambiarModo(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
                      >
                        <option value="Aceleracion">Acelerar (Motor)</option>
                        <option value="Frenado">Frenar (Opuesta)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Parámetros de Fricción (Solo vehículos terrestres y avión) */}
                {escenario !== 'Elevador' && escenario !== 'Atwood' && (
                  <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40 space-y-2">
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="text-slate-400">Fricción Cinética (μ_k, auto):</span>
                      <span className="font-mono text-cyan-400 font-bold">{obtenerCoeficienteFriccion().toFixed(2)}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-slate-300">Coef. Fricción Estática (μ_s)</span>
                        <span className="font-mono text-cyan-400 font-bold text-xs">{friccionEstatica.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range"
                        min={obtenerCoeficienteFriccion()}
                        max={1.0}
                        step={0.01}
                        value={friccionEstatica}
                        onChange={(e) => setFriccionEstatica(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                    </div>
                  </div>
                )}

                {/* 3. TRAZADO DE LA PISTA COMPUESTA (3D) */}
                {(escenario === 'Curva' || escenario === 'Automovil' || escenario === 'Camion' || escenario === 'Motocicleta' || escenario === 'Avion') && (
                  <div className="space-y-2 pt-3 border-t border-slate-800/60">
                    <h3 className="text-xs font-bold text-cyan-400 tracking-wider uppercase flex items-center">
                      <i className="fa-solid fa-road mr-2"></i> 3. Trazado de Pista (3D)
                    </h3>
                    <div className="space-y-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40">
                      <div className="flex flex-col space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Circuito Seleccionado</span>
                        <select
                          value={trazadoPista}
                          onChange={(e) => {
                            setTrazadoPista(e.target.value);
                            resetearSimulacion();
                          }}
                          className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-xs text-white font-bold focus:outline-none focus:border-cyan-500 w-full"
                        >
                          <option value="recta">Recta de Ensayos UTP (800m)</option>
                          <option value="curva">Curva Peraltada Única (500m)</option>
                          <option value="ovalo">Super Circuito Ovalado (700m)</option>
                          <option value="serpiente">Circuito Serpiente S-Curves (500m)</option>
                          <option value="autodromo">Autódromo de Ingeniería UTP (600m)</option>
                          <option value="personalizada">★ Diseñar Pista Personalizada</option>
                        </select>
                      </div>
                      <div className="text-[9px] text-slate-400 leading-normal font-mono whitespace-pre-line border-t border-slate-850 pt-1 mb-1">
                        {trazadoPista === 'recta' && "• Tramo 1: Recta de 800m."}
                        {trazadoPista === 'curva' && `• Tramo 1: Curva única de 500m (R = ${radioCurva}m, peralte = ${inclinacion}°).`}
                        {trazadoPista === 'ovalo' && "• Tramo 1: Recta de 200m\n• Tramo 2: Curva 180° R=47.7m (Peralte 12°)\n• Tramo 3: Recta de 200m\n• Tramo 4: Curva 180° R=47.7m (Peralte 12°)."}
                        {trazadoPista === 'serpiente' && "• Recta 100m\n• Curva Der. 90° R=50.9m (10°)\n• Recta 80m\n• Curva Izq. 90° R=50.9m (10°)\n• Recta 160m."}
                        {trazadoPista === 'autodromo' && "• Recta Acel. 150m\n• Curva Rápida R=80m (15°)\n• Recta 100m\n• Curva Cerrada R=40m (5°)\n• Recta Frenado 150m."}
                        {trazadoPista === 'personalizada' && "• Trazado diseñado por el usuario."}
                      </div>

                      {trazadoPista === 'personalizada' && (
                        <div className="border-t border-slate-800/80 pt-2.5 mt-2.5 space-y-3">
                          <span className="text-[10px] font-bold text-cyan-400 block uppercase">
                            Diseñador de Tramos UTP:
                          </span>
                          
                          {/* LISTA DE TRAMOS */}
                          <div className="space-y-2">
                            {customTramos.map((tramo, idx) => (
                              <div key={idx} className="bg-slate-950/80 p-2 rounded-xl border border-slate-850 text-[10px] font-mono space-y-1.5">
                                <div className="flex justify-between items-center border-b border-slate-850/60 pb-1">
                                  <span className={`font-bold px-1 py-0.5 rounded text-[8.5px] uppercase ${tramo.tipo === 'recta' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'}`}>
                                    {idx + 1}. {tramo.tipo === 'recta' ? 'Recta' : 'Curva'}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const updated = customTramos.filter((_, i) => i !== idx);
                                      setCustomTramos(updated);
                                      resetearSimulacion();
                                    }}
                                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 p-1 rounded transition-colors cursor-pointer"
                                    title="Eliminar tramo"
                                  >
                                    <i className="fa-solid fa-trash-can text-[9px]"></i>
                                  </button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 text-slate-400 text-[9.5px]">
                                  {/* Longitud Control */}
                                  <div className="flex items-center justify-between col-span-2 sm:col-span-1">
                                    <span>L (m):</span>
                                    <div className="flex items-center space-x-1">
                                      <button 
                                        onClick={() => {
                                          const updated = [...customTramos];
                                          updated[idx].longitud = Math.max(10, (updated[idx].longitud || 0) - 10);
                                          setCustomTramos(updated);
                                          resetearSimulacion();
                                        }}
                                        className="bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850 px-1 rounded font-bold cursor-pointer"
                                      >-</button>
                                      <input 
                                        type="number"
                                        value={tramo.longitud || 0}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value) || 0;
                                          const updated = [...customTramos];
                                          updated[idx].longitud = Math.max(10, Math.min(20000, val));
                                          setCustomTramos(updated);
                                          resetearSimulacion();
                                        }}
                                        className="w-12 bg-slate-900 border border-slate-800 px-0.5 text-center font-mono text-white focus:outline-none rounded text-[9.5px]"
                                      />
                                      <button 
                                        onClick={() => {
                                          const updated = [...customTramos];
                                          updated[idx].longitud = Math.min(20000, (updated[idx].longitud || 0) + 10);
                                          setCustomTramos(updated);
                                          resetearSimulacion();
                                        }}
                                        className="bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850 px-1 rounded font-bold cursor-pointer"
                                      >+</button>
                                    </div>
                                  </div>

                                  {/* Inclinación/Peralte Control */}
                                  <div className="flex items-center justify-between col-span-2 sm:col-span-1">
                                    <span>θ (°):</span>
                                    <div className="flex items-center space-x-1">
                                      <button 
                                        onClick={() => {
                                          const updated = [...customTramos];
                                          const limitMin = tramo.tipo === 'recta' ? -15 : 0;
                                          updated[idx].inclinacion = Math.max(limitMin, (updated[idx].inclinacion || 0) - 1);
                                          setCustomTramos(updated);
                                          resetearSimulacion();
                                        }}
                                        className="bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850 px-1 rounded font-bold cursor-pointer"
                                      >-</button>
                                      <input 
                                        type="number"
                                        value={tramo.inclinacion || 0}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value) || 0;
                                          const updated = [...customTramos];
                                          const limitMin = tramo.tipo === 'recta' ? -15 : 0;
                                          updated[idx].inclinacion = Math.max(limitMin, Math.min(30, val));
                                          setCustomTramos(updated);
                                          resetearSimulacion();
                                        }}
                                        className="w-10 bg-slate-900 border border-slate-800 px-0.5 text-center font-mono text-white focus:outline-none rounded text-[9.5px]"
                                      />
                                      <button 
                                        onClick={() => {
                                          const updated = [...customTramos];
                                          updated[idx].inclinacion = Math.min(30, (updated[idx].inclinacion || 0) + 1);
                                          setCustomTramos(updated);
                                          resetearSimulacion();
                                        }}
                                        className="bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850 px-1 rounded font-bold cursor-pointer"
                                      >+</button>
                                    </div>
                                  </div>
                                  
                                  {/* Curve specifics */}
                                  {tramo.tipo === 'curva' && (
                                    <>
                                      <div className="flex items-center justify-between col-span-2 sm:col-span-1">
                                        <span>R (m):</span>
                                        <div className="flex items-center space-x-1">
                                          <button 
                                            onClick={() => {
                                              const updated = [...customTramos];
                                              updated[idx].radio_curva = Math.max(20, (updated[idx].radio_curva || 0) - 10);
                                              setCustomTramos(updated);
                                              resetearSimulacion();
                                            }}
                                            className="bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850 px-1 rounded font-bold cursor-pointer"
                                          >-</button>
                                          <input 
                                            type="number"
                                            value={tramo.radio_curva || 0}
                                            onChange={(e) => {
                                              const val = parseInt(e.target.value) || 0;
                                              const updated = [...customTramos];
                                              updated[idx].radio_curva = Math.max(20, Math.min(1000, val));
                                              setCustomTramos(updated);
                                              resetearSimulacion();
                                            }}
                                            className="w-12 bg-slate-900 border border-slate-800 px-0.5 text-center font-mono text-white focus:outline-none rounded text-[9.5px]"
                                          />
                                          <button 
                                            onClick={() => {
                                              const updated = [...customTramos];
                                              updated[idx].radio_curva = Math.min(1000, (updated[idx].radio_curva || 0) + 10);
                                              setCustomTramos(updated);
                                              resetearSimulacion();
                                            }}
                                            className="bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850 px-1 rounded font-bold cursor-pointer"
                                          >+</button>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center justify-between col-span-2 sm:col-span-1">
                                        <span>Giro:</span>
                                        <button 
                                          onClick={() => {
                                            const updated = [...customTramos];
                                            updated[idx].direccion = updated[idx].direccion === 'derecha' ? 'izquierda' : 'derecha';
                                            setCustomTramos(updated);
                                            resetearSimulacion();
                                          }}
                                          className="bg-slate-900 border border-slate-800 text-cyan-400 px-1.5 py-0.5 rounded text-[8.5px] cursor-pointer hover:bg-slate-800 transition-colors uppercase font-bold"
                                        >
                                          {tramo.direccion === 'derecha' ? 'Der ➜' : '⬅ Izq'}
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                            {customTramos.length === 0 && (
                              <div className="text-[9.5px] text-slate-500 italic py-1 text-center">
                                Sin tramos. Añade uno abajo.
                              </div>
                            )}
                          </div>

                          {/* PLANTILLAS RÁPIDAS */}
                          <div className="flex flex-col space-y-1 bg-slate-950/40 p-2 rounded border border-slate-850">
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Plantillas de Pista UTP:</span>
                            <div className="grid grid-cols-3 gap-1">
                              <button
                                onClick={() => {
                                  setCustomTramos([
                                    { tipo: 'recta', longitud: 150, inclinacion: 0, nombre: "Recta Inicial" },
                                    { tipo: 'curva', longitud: 100, radio_curva: 60, inclinacion: 10, friccion_estatica: 0.8, direccion: 'derecha', nombre: "Curva 1" },
                                    { tipo: 'recta', longitud: 150, inclinacion: 5, nombre: "Subida Final" }
                                  ]);
                                  resetearSimulacion();
                                }}
                                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-1 py-1 rounded text-[8px] text-cyan-400 font-bold transition-all cursor-pointer text-center"
                              >
                                Pista Rápida
                              </button>
                              <button
                                onClick={() => {
                                  setCustomTramos([
                                    { tipo: 'recta', longitud: 100, inclinacion: 15, nombre: "Rampa 1" },
                                    { tipo: 'recta', longitud: 100, inclinacion: 30, nombre: "Rampa 2" },
                                    { tipo: 'recta', longitud: 100, inclinacion: -10, nombre: "Bajada" }
                                  ]);
                                  resetearSimulacion();
                                }}
                                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-1 py-1 rounded text-[8px] text-amber-400 font-bold transition-all cursor-pointer text-center"
                              >
                                Rampa Extrema
                              </button>
                              <button
                                onClick={() => {
                                  setCustomTramos([
                                    { tipo: 'recta', longitud: 80, inclinacion: 8, nombre: "Entrada" },
                                    { tipo: 'curva', longitud: 345, radio_curva: 55, inclinacion: 8, friccion_estatica: 0.8, direccion: 'derecha', nombre: "Hélice 1" },
                                    { tipo: 'curva', longitud: 345, radio_curva: 55, inclinacion: 8, friccion_estatica: 0.8, direccion: 'derecha', nombre: "Hélice 2" },
                                    { tipo: 'curva', longitud: 345, radio_curva: 55, inclinacion: 8, friccion_estatica: 0.8, direccion: 'derecha', nombre: "Hélice 3" },
                                    { tipo: 'recta', longitud: 100, inclinacion: 8, nombre: "Salida" }
                                  ]);
                                  resetearSimulacion();
                                }}
                                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-1 py-1 rounded text-[8px] text-pink-400 font-bold transition-all cursor-pointer text-center"
                                title="Rampa helicoidal en espiral de 3 niveles"
                              >
                                Rampa en Espiral
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                setCustomTramos([]);
                                resetearSimulacion();
                              }}
                              className="w-full bg-slate-900 hover:bg-rose-950/20 border border-rose-900/30 py-0.5 rounded text-[8px] text-rose-400 font-bold transition-all cursor-pointer text-center mt-1"
                            >
                              Limpiar Todo el Trazado
                            </button>
                          </div>

                          {/* BOTONES SIMPLES PARA AÑADIR TRAMOS */}
                          <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
                            <button
                              onClick={() => {
                                const newTramo = { 
                                  tipo: 'recta', 
                                  longitud: 150, 
                                  inclinacion: 0,
                                  nombre: `Recta ${customTramos.length + 1}` 
                                };
                                const updated = [...customTramos, newTramo];
                                setCustomTramos(updated);
                                resetearSimulacion();
                              }}
                              className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-2 px-2.5 rounded-lg text-[10px] text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-lg shadow-cyan-950/20"
                            >
                              <i className="fa-solid fa-circle-plus text-xs"></i>
                              <span>+ Añadir Recta</span>
                            </button>
                            <button
                              onClick={() => {
                                const newTramo = { 
                                  tipo: 'curva', 
                                  longitud: 100, 
                                  radio_curva: 60, 
                                  inclinacion: 10, 
                                  friccion_estatica: 0.8, 
                                  direccion: 'derecha',
                                  nombre: `Curva ${customTramos.length + 1}` 
                                };
                                const updated = [...customTramos, newTramo];
                                setCustomTramos(updated);
                                resetearSimulacion();
                              }}
                              className="bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 px-2.5 rounded-lg text-[10px] text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-lg shadow-pink-950/20"
                            >
                              <i className="fa-solid fa-circle-plus text-xs"></i>
                              <span>+ Añadir Curva</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* CASOS ACADÉMICOS RÁPIDOS */}
                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-[9.5px] font-bold text-slate-500 block uppercase mb-1.5">Ensayos Rápidos:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button 
                      onClick={() => cargarCasoRapido(1)} 
                      className="bg-slate-950 border border-slate-800 hover:border-emerald-500 text-[9px] py-2 px-1 rounded-xl font-bold text-slate-300 hover:text-white transition-all flex flex-col items-center justify-center gap-0.5"
                      title="Simular caso de subida o ascenso"
                    >
                      <i className="fa-solid fa-angles-up text-emerald-400 text-[10px]"></i>
                      <span className="truncate w-full text-center">Subida / Ascenso</span>
                    </button>
                    <button 
                      onClick={() => cargarCasoRapido(2)} 
                      className="bg-slate-950 border border-slate-800 hover:border-cyan-500 text-[9px] py-2 px-1 rounded-xl font-bold text-slate-300 hover:text-white transition-all flex flex-col items-center justify-center gap-0.5"
                      title="Simular caso en plano o equilibrio"
                    >
                      <i className="fa-solid fa-grip-lines text-cyan-400 text-[10px]"></i>
                      <span className="truncate w-full text-center">Plano / Equil.</span>
                    </button>
                    <button 
                      onClick={() => cargarCasoRapido(3)} 
                      className="bg-slate-950 border border-slate-800 hover:border-rose-500 text-[9px] py-2 px-1 rounded-xl font-bold text-slate-300 hover:text-white transition-all flex flex-col items-center justify-center gap-0.5"
                      title="Simular caso de bajada o descenso"
                    >
                      <i className="fa-solid fa-angles-down text-rose-400 text-[10px]"></i>
                      <span className="truncate w-full text-center">Bajada / Desc.</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* COMPLEMENTO FÓRMULA SUSTITUCIÓN */}
              <div className="pt-3 border-t border-slate-800/60">
                <h4 className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase mb-1.5">
                  <i className="fa-solid fa-calculator mr-1"></i> Desglose de Cálculo (2da Ley)
                </h4>
                {renderFormulaSubstitution()}
              </div>

            </section>
          )}
          
          {/* PANEL DE DIBUJO Y GRÁFICAS DE LA DERECHA (9 o 12 Columnas) */}
          <section className={`${sidebarCollapsed ? 'lg:col-span-12' : 'lg:col-span-9'} flex flex-col space-y-4 lg:overflow-hidden lg:h-full`}>
            
            {sidebarCollapsed && (
              <div className="flex-shrink-0 flex items-center mb-1">
                <button 
                  onClick={() => setSidebarCollapsed(false)}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-md"
                  title="Mostrar barra lateral"
                >
                  <i className="fa-solid fa-bars"></i>
                  <span>Abrir barra lateral</span>
                </button>
              </div>
            )}
              
              {/* INDICADORES DIGITALES (TELEMETRÍA) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
                <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-xl p-3 flex flex-col items-center justify-center shadow">
                  <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mb-0.5">Tiempo</span>
                  <div className="font-mono text-lg font-bold text-cyan-400">{telemetria.t.toFixed(2)} s</div>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-xl p-3 flex flex-col items-center justify-center shadow">
                  <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mb-0.5">
                    {escenario === 'Elevador' ? 'Altura (y)' : 'Recorrido en Pista (x)'}
                  </span>
                  <div className="font-mono text-lg font-bold text-emerald-400">{telemetria.x.toFixed(2)} m</div>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-xl p-3 flex flex-col items-center justify-center shadow">
                  <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mb-0.5">Velocidad</span>
                  <div className="font-mono text-lg font-bold text-amber-400">{telemetria.v.toFixed(2)} m/s</div>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-xl p-3 flex flex-col items-center justify-center shadow">
                  <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mb-0.5">
                    {telemetria.a < -0.01 ? 'Desaceleración' : 'Aceleración'}
                  </span>
                  <div className="font-mono text-lg font-bold text-rose-400">{Math.abs(telemetria.a).toFixed(2)} m/s²</div>
                </div>
              </div>

              {/* LIENZO CANVAS DE ANIMACIÓN */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col flex-shrink-0">
                <div className="bg-slate-900/40 px-4 py-2 border-b border-slate-800/60 flex flex-col lg:flex-row justify-between items-center gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-slate-300 flex items-center">
                      <i className="fa-solid fa-gamepad mr-2 text-cyan-400"></i> Visualización
                    </span>
                    
                    {/* Selector 2D / 3D */}
                    {(escenario === 'Curva' || escenario === 'Automovil' || escenario === 'Camion' || escenario === 'Motocicleta' || escenario === 'Avion') && (
                      <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800/60 text-[9.5px]">
                        <button
                          onClick={() => setVista3d(false)}
                          className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${!vista3d ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          Esquema 2D
                        </button>
                        <button
                          onClick={() => setVista3d(true)}
                          className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${vista3d ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          Simulador 3D
                        </button>
                      </div>
                    )}

                    {/* Selector Aceleración / Frenado Rápido */}
                    {escenario !== 'Elevador' && escenario !== 'Atwood' && (
                      <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800/60 text-[9.5px]">
                        <button
                          onClick={() => cambiarModo('Aceleracion')}
                          className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer flex items-center ${modo === 'Aceleracion' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                          title="Fuerza del motor a favor del movimiento"
                        >
                          <i className="fa-solid fa-gauge mr-1"></i> Acelerar
                        </button>
                        <button
                          onClick={() => cambiarModo('Frenado')}
                          className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer flex items-center ${modo === 'Frenado' ? 'bg-rose-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                          title="Fuerza de frenado opuesta al movimiento"
                        >
                          <i className="fa-solid fa-circle-dot mr-1"></i> Frenar
                        </button>
                      </div>
                    )}

                    {/* Selector de Cámaras 3D */}
                    {vista3d && (escenario === 'Curva' || escenario === 'Automovil' || escenario === 'Camion' || escenario === 'Motocicleta' || escenario === 'Avion') && (
                      <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800/60 text-[9.5px] items-center space-x-1">
                        <span className="text-slate-500 px-1 text-[8.5px] uppercase font-bold">Cámara:</span>
                        {['Follow', 'Free', 'Zenith'].map((cam) => (
                          <button
                            key={cam}
                            onClick={() => setModoCamara(cam)}
                            className={`px-1.5 py-0.5 rounded-md font-bold transition-all cursor-pointer ${modoCamara === cam ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                          >
                            {cam === 'Follow' ? 'Seguimiento' : (cam === 'Free' ? 'Libre 360°' : 'Aérea')}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* ACCIONES Y MANDOS DE LA SIMULACIÓN */}
                  <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto justify-center">
                    {/* BOTONES DE EXPORTACIÓN */}
                    <div className="grid grid-cols-4 sm:flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850 w-full md:w-auto">
                      <button 
                        onClick={exportarTXT} 
                        disabled={pasos.length === 0 || isRunning}
                        className="w-full sm:w-auto justify-center bg-slate-900/60 hover:bg-slate-800 hover:text-white text-slate-300 border border-slate-800/80 font-bold py-1 px-1.5 rounded-md text-[9.5px] flex items-center space-x-1 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        title="Exportar Reporte de Ensayo (TXT)"
                      >
                        <i className="fa-solid fa-file-lines text-sky-400"></i> 
                        <span>TXT</span>
                      </button>
                      <button 
                        onClick={exportarCSV} 
                        disabled={pasos.length === 0 || isRunning}
                        className="w-full sm:w-auto justify-center bg-slate-900/60 hover:bg-slate-800 hover:text-white text-slate-300 border border-slate-800/80 font-bold py-1 px-1.5 rounded-md text-[9.5px] flex items-center space-x-1 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        title="Exportar Muestreo de Datos (CSV)"
                      >
                        <i className="fa-solid fa-file-csv text-teal-400"></i> 
                        <span>CSV</span>
                      </button>
                      <button 
                        onClick={exportarExcel} 
                        disabled={pasos.length === 0 || isRunning}
                        className="w-full sm:w-auto justify-center bg-slate-900/60 hover:bg-slate-800 hover:text-white text-slate-300 border border-slate-800/80 font-bold py-1 px-1.5 rounded-md text-[9.5px] flex items-center space-x-1 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        title="Exportar Reporte Científico Completo (Excel)"
                      >
                        <i className="fa-solid fa-file-excel text-emerald-400"></i> 
                        <span>Excel</span>
                      </button>
                      <button 
                        onClick={imprimirReporteLaboratorio} 
                        disabled={pasos.length === 0 || isRunning}
                        className="w-full sm:w-auto justify-center bg-slate-900/60 hover:bg-slate-800 hover:text-white text-slate-300 border border-slate-800/80 font-bold py-1 px-1.5 rounded-md text-[9.5px] flex items-center space-x-1 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        title="Generar Ficha de Laboratorio para Imprimir o Guardar como PDF"
                      >
                        <i className="fa-solid fa-print text-cyan-400"></i> 
                        <span>PDF</span>
                      </button>
                    </div>

                    {/* BOTONES FLOTANTES DE ACCESO RÁPIDO EN CABECERA DEL LIENZO */}
                    <div className="flex items-center justify-between sm:justify-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-850 w-full md:w-auto">
                      {!isRunning ? (
                        <>
                          <button 
                            onClick={iniciarSimulacion}
                            className="flex-1 sm:flex-none justify-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded transition-all cursor-pointer flex items-center space-x-1"
                            title="Iniciar reproducción"
                          >
                            <i className="fa-solid fa-play text-[9px]"></i> <span className="uppercase text-[9px]">Play</span>
                          </button>
                          <button 
                            onClick={avanzarPasoSimulacion}
                            className="flex-1 sm:flex-none justify-center bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-2 py-1 rounded transition-all cursor-pointer flex items-center space-x-1"
                            title="Avanzar 0.05s (Paso a Paso)"
                          >
                            <i className="fa-solid fa-forward-step text-[9px]"></i> <span className="uppercase text-[9px]">Paso</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={pausarSimulacion}
                            className="flex-1 sm:flex-none justify-center bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-1 rounded transition-all cursor-pointer flex items-center space-x-1"
                            title="Pausar reproducción"
                          >
                            <i className="fa-solid fa-pause text-[9px]"></i> <span className="uppercase text-[9px]">Pause</span>
                          </button>
                          {modo === 'Aceleracion' && escenario !== 'Elevador' && escenario !== 'Atwood' && escenario !== 'Avion' && (
                            <button 
                              onClick={() => {
                                setFrenoManual(true);
                                xAlFrenarRef.current = telemetriaRef.current.x;
                                tAlFrenarRef.current = telemetriaRef.current.t;
                              }}
                              disabled={frenoManual}
                              className="flex-1 sm:flex-none justify-center bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-[10px] font-bold px-2 py-1 rounded transition-all cursor-pointer flex items-center space-x-1 border border-rose-500/40"
                              title="Aplicar freno de mano en tiempo real"
                            >
                              <i className="fa-solid fa-circle-dot text-[9px] text-rose-400 animate-pulse"></i> 
                              <span className="uppercase text-[9px]">{frenoManual ? 'Frenando' : 'Frenar'}</span>
                            </button>
                          )}
                        </>
                      )}
                      <button 
                        onClick={resetearSimulacion}
                        className="flex-1 sm:flex-none justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold px-2 py-1 rounded transition-all cursor-pointer flex items-center space-x-1"
                        title="Reiniciar a estado inicial"
                      >
                        <i className="fa-solid fa-arrow-rotate-left text-[9px]"></i> <span className="uppercase text-[9px]">Reset</span>
                      </button>
                      <div className="h-4 w-[1px] bg-slate-800/80 mx-1"></div>
                      <select 
                        value={factorVelocidad} 
                        onChange={(e) => setFactorVelocidad(parseFloat(e.target.value))}
                        className="bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-[8.5px] text-cyan-400 font-mono focus:outline-none cursor-pointer font-bold"
                        title="Velocidad de reproducción"
                      >
                        <option value="0.25">0.25x</option>
                        <option value="0.5">0.50x</option>
                        <option value="1">1.00x</option>
                        <option value="1.5">1.50x</option>
                        <option value="2">2.00x</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="relative w-full aspect-[75/24] max-h-[160px] sm:max-h-[200px] md:max-h-[240px] bg-slate-950">
                  {vista3d && (escenario === 'Curva' || escenario === 'Automovil' || escenario === 'Camion' || escenario === 'Motocicleta' || escenario === 'Avion') ? (
                    <div 
                      ref={threeContainerRef} 
                      className="w-full h-full block overflow-hidden" 
                    />
                  ) : (
                    <canvas 
                      ref={canvasRef} 
                      className="w-full h-full block"
                    />
                  )}
                  {/* BADGES DE TELEMETRÍA Y ESTADO DE ANIMACIÓN */}
                  <div className="absolute top-2 right-2 flex flex-col items-end space-y-1 z-10">
                    {telemetria.despego && (
                      <div className="bg-sky-500/20 border border-sky-500 text-sky-300 font-mono text-[9px] font-bold px-2 py-0.5 rounded animate-pulse">
                        ¡AVIÓN SUSTENTADO! L &gt; P | Altitud: {(telemetria.y || 0.0).toFixed(1)}m
                      </div>
                    )}
                    {telemetria.terminado && !telemetria.derrapado && !telemetria.deslizado && (
                      <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-mono text-[9px] font-bold px-2 py-0.5 rounded animate-pulse shadow-md shadow-emerald-500/10">
                        <i className="fa-solid fa-circle-check mr-1 text-emerald-400"></i> COMPLETADO ✅
                      </div>
                    )}
                    {telemetria.derrapado && (
                      <div className="bg-rose-500/20 border border-rose-500 text-rose-300 font-mono text-[9px] font-bold px-2 py-0.5 rounded animate-pulse shadow-md shadow-rose-500/10">
                        <i className="fa-solid fa-triangle-exclamation mr-1 text-rose-400"></i> DERRAPE (V &gt; V_MAX) ⚠️
                      </div>
                    )}
                    {telemetria.deslizado && (
                      <div className="bg-amber-500/20 border border-amber-500 text-amber-300 font-mono text-[9px] font-bold px-2 py-0.5 rounded animate-pulse shadow-md shadow-amber-500/10">
                        <i className="fa-solid fa-triangle-exclamation mr-1 text-amber-400"></i> DESLIZAMIENTO ⚠️
                      </div>
                    )}
                    {!telemetria.terminado && isRunning && escenario !== 'Elevador' && escenario !== 'Atwood' && modo === 'Frenado' && (
                      <div className="bg-rose-600/20 border border-rose-500 text-rose-300 font-mono text-[9px] font-bold px-2 py-0.5 rounded animate-pulse">
                        <i className="fa-solid fa-circle-dot mr-1 text-rose-400"></i> FRENANDO... 🛑
                      </div>
                    )}
                    {!telemetria.terminado && isRunning && escenario !== 'Elevador' && escenario !== 'Atwood' && modo === 'Aceleracion' && (
                      <div className="bg-emerald-600/20 border border-emerald-500 text-emerald-300 font-mono text-[9px] font-bold px-2 py-0.5 rounded animate-pulse">
                        <i className="fa-solid fa-gauge mr-1 text-emerald-400"></i> ACELERANDO... ⚡
                      </div>
                    )}
                  </div>
                  {escenario !== 'Elevador' && absDegree(inclinacion) > 0.01 && (
                    <div className="absolute top-2 left-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[8.5px] font-bold px-1.5 py-0.5 rounded">
                      Rampa: {inclinacion > 0 ? `+${inclinacion}` : inclinacion}° ({inclinacion > 0 ? 'Subida' : 'Bajada'})
                    </div>
                  )}
                  {renderAnalisisDeErrorOverlay()}
                </div>
                <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 text-[10px] text-slate-400 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between font-mono">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                    <span className="text-cyan-400 font-bold whitespace-nowrap">ESTADO FÍSICO:</span>
                    <span className="text-slate-300 break-words">{telemetria.explicacion}</span>
                  </div>
                  {escenario === 'Avion' && (
                    <div className="text-sky-400 font-bold flex items-center gap-3 sm:space-x-3 mt-1 sm:mt-0">
                      <span>Altitud: {(telemetria.y || 0.0).toFixed(1)} m</span>
                      <span>v_y: {(telemetria.v_y || 0.0).toFixed(1)} m/s</span>
                    </div>
                  )}
                </div>
              </div>

              {/* GRÁFICOS SVG EN TIEMPO REAL */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col space-y-2.5 shadow-lg flex-1 min-h-0">
                <div className="border-b border-slate-800/60 pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 flex-shrink-0">
                  <h3 className="text-xs font-bold text-slate-300 flex items-center">
                    <i className="fa-solid fa-chart-line mr-2 text-rose-500"></i> Gráficos Cinemáticos de Ensayo
                  </h3>
                  <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                    <label className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-400 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={mostrarTeorica}
                        onChange={(e) => setMostrarTeorica(e.target.checked)}
                        className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                      />
                      <span>Comparativa Teórica</span>
                    </label>
                    {hoveredPoint && (
                      <div className="text-[9.5px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        Hover: <span className="text-cyan-400">t={hoveredPoint.t.toFixed(2)}s</span> | 
                        v=<span className="text-amber-400">{hoveredPoint.v.toFixed(1)}m/s</span> | 
                        a=<span className="text-rose-400">{hoveredPoint.a.toFixed(1)}m/s²</span>
                        {escenario === 'Avion' && <span> | y=<span className="text-sky-400">{(hoveredPoint.y || 0.0).toFixed(1)}m</span></span>}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 flex-1 min-h-0">
                  <div className="flex flex-col space-y-1.5 min-h-0">
                    <span className="text-[9.5px] font-bold text-slate-400 text-center uppercase tracking-wide flex-shrink-0">Aceleración vs Tiempo</span>
                    <div className="flex-1 min-h-0">
                      {renderGraficoSVG('a')}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1.5 min-h-0">
                    <span className="text-[9.5px] font-bold text-slate-400 text-center uppercase tracking-wide flex-shrink-0">Velocidad vs Tiempo</span>
                    <div className="flex-1 min-h-0">
                      {renderGraficoSVG('v')}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1.5 min-h-0">
                    <span className="text-[9.5px] font-bold text-slate-400 text-center uppercase tracking-wide flex-shrink-0">Energía vs Tiempo (Ec, Ep, Wroc, Etot)</span>
                    <div className="flex-1 min-h-0">
                      {renderGraficoSVG('e')}
                    </div>
                  </div>
                </div>
              </div>

            </section>

          </div>
        )}

        {tab === 'resolutor' && renderResolutorView()}

        {tab === 'quiz' && (
          <div className="h-auto lg:h-full bg-slate-950 p-5 overflow-y-auto lg:overflow-hidden flex flex-col font-sans">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-full shadow-lg w-full overflow-y-auto">
              
              <div className="border-b border-slate-800 pb-4 mb-4">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <i className="fa-solid fa-clipboard-question text-cyan-400"></i>
                  <span>Autoevaluación Académica de Física</span>
                </h2>
                <p className="text-xs text-slate-400">Pon a prueba tus conocimientos sobre la Segunda Ley de Newton. Resuelve el problema y verifica tu resultado.</p>
              </div>

              {/* Pregunta Box */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block font-mono">Pregunta / Enunciado del Desafío:</span>
                <p className="text-sm text-slate-200 leading-relaxed font-mono">
                  {quizPregunta}
                </p>
              </div>

              {/* Respuesta Form */}
              <div className="mt-6 bg-slate-950/40 p-5 rounded-xl border border-slate-800/60 max-w-md space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Tu Respuesta (m/s²):</label>
                  <div className="flex space-x-2">
                    <input 
                      type="number"
                      step="0.01"
                      disabled={quizVerificado}
                      placeholder="Ej: 2.45"
                      value={quizRespuestaUsuario}
                      onChange={(e) => setQuizRespuestaUsuario(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-400 focus:outline-none focus:border-cyan-500 flex-1 font-mono"
                    />
                    <button
                      onClick={() => {
                        if (!quizRespuestaUsuario) return;
                        const userVal = parseFloat(quizRespuestaUsuario);
                        const correctVal = quizRespuestaCorrecta;
                        const esCorrecto = Math.abs(userVal - correctVal) <= 0.05;
                        setQuizEsCorrecto(esCorrecto);
                        setQuizVerificado(true);
                      }}
                      disabled={quizVerificado || !quizRespuestaUsuario}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center space-x-1"
                    >
                      <i className="fa-solid fa-check"></i>
                      <span>Verificar</span>
                    </button>
                  </div>
                </div>

                {quizVerificado && (
                  <div className={`p-4 rounded-xl border flex items-start space-x-3 transition-all ${quizEsCorrecto ? 'bg-emerald-950/20 border-emerald-800/80 text-emerald-300' : 'bg-rose-950/20 border-rose-800/80 text-rose-300'}`}>
                    <i className={`fa-solid ${quizEsCorrecto ? 'fa-circle-check text-emerald-400' : 'fa-circle-exclamation text-rose-400'} text-lg mt-0.5`}></i>
                    <div className="space-y-1 text-xs">
                      <span className="font-bold block uppercase text-[10px]">
                        {quizEsCorrecto ? '¡Respuesta Correcta!' : 'Respuesta Incorrecta'}
                      </span>
                      <span>
                        {quizEsCorrecto 
                          ? `Excelente cálculo. El resultado coincide con el modelo físico (${quizRespuestaCorrecta.toFixed(2)} m/s²).` 
                          : `El valor correcto de la aceleración es de ${quizRespuestaCorrecta.toFixed(2)} m/s².`
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Procedimiento & Pizarra */}
              {quizVerificado && (
                <div className="mt-6 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 font-mono">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Pizarra de Resolución y Desglose:</span>
                  <div className="space-y-2 border-l border-slate-800 pl-4 text-xs text-slate-300">
                    {quizProcedimiento.map((step, idx) => (
                      <div key={idx} className="py-0.5">{step}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Acciones del pie */}
              <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-800 pt-4 flex-shrink-0">
                <button
                  onClick={generarNuevoDesafio}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <i className="fa-solid fa-arrow-right"></i>
                  <span>Siguiente Desafío</span>
                </button>
                <button
                  onClick={cargarQuizEnSimulador}
                  className="bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-800 text-cyan-400 font-bold px-4 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <i className="fa-solid fa-flask"></i>
                  <span>Cargar en el Simulador para Probar</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {tab === 'historial' && (
          
          /* HISTORIAL DE ENSAYOS DE LA BASE DE DATOS */
          <div className="h-auto lg:h-full bg-slate-950 p-5 overflow-y-auto lg:overflow-hidden flex flex-col">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col h-full shadow-lg">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 mb-4 gap-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center">
                    <i className="fa-solid fa-database mr-2 text-cyan-400"></i> Registro Histórico de Ensayos
                  </h2>
                  <p className="text-xs text-slate-400">Respaldado y persistido en la Base de Datos SQLite/PostgreSQL del Servidor Django.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={exportarHistorialExcel}
                    disabled={historial.length === 0}
                    className="bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer text-white disabled:opacity-30 disabled:pointer-events-none"
                    title="Exportar Historial Completo a Excel"
                  >
                    <i className="fa-solid fa-file-excel"></i>
                    <span>Exportar Historial</span>
                  </button>
                  <button 
                    onClick={cargarHistorial}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-arrows-rotate"></i>
                    <span>Actualizar Historial</span>
                  </button>
                </div>
              </div>

              {/* TABLA CON REGISTROS (VISTA ESCRITORIO) */}
              <div className="hidden md:block flex-1 overflow-auto rounded-xl border border-slate-800 bg-slate-950/80">
                <table className="w-full border-collapse text-xs text-left">
                  <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="p-3 text-center">ID</th>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Escenario</th>
                      <th className="p-3 text-right">Masa (kg)</th>
                      <th className="p-3 text-right">Fuerza (N)</th>
                      <th className="p-3 text-center">Rampa / Clima</th>
                      <th className="p-3 text-right">Acel. Prom (m/s²)</th>
                      <th className="p-3 text-right">Tiempo Total (s)</th>
                      <th className="p-3 text-right">Desplazamiento (m)</th>
                      <th className="p-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {historial.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="p-10 text-center text-slate-500 italic">
                          No hay registros en la base de datos de simulación. Corre y finaliza un ensayo para guardarlo.
                        </td>
                      </tr>
                    ) : (
                      historial.map((reg) => (
                        <tr key={reg.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-3 text-center font-mono font-bold text-cyan-400">#{reg.id}</td>
                          <td className="p-3 text-slate-400 font-mono">{reg.fecha}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              reg.escenario === 'Elevador' 
                              ? 'bg-indigo-950/40 text-indigo-400 border-indigo-800' 
                              : (reg.escenario === 'Avion' ? 'bg-sky-950/40 text-sky-400 border-sky-850' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800')
                            }`}>
                              {escenariosConfig[reg.escenario] ? escenariosConfig[reg.escenario].nombre : reg.escenario}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono">{reg.masa.toLocaleString()}</td>
                          <td className="p-3 text-right font-mono">{reg.fuerza.toLocaleString()}</td>
                          <td className="p-3 text-center font-mono text-slate-300">
                            {reg.inclinacion !== 0 ? `${reg.inclinacion > 0 ? '+' : ''}${reg.inclinacion}° / ` : ''}{reg.clima}
                          </td>
                          <td className="p-3 text-right font-mono text-rose-400">{reg.aceleracion_promedio.toFixed(3)}</td>
                          <td className="p-3 text-right font-mono text-cyan-400">{reg.tiempo_total.toFixed(2)}</td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-400">{reg.distancia_recorrida.toFixed(2)}</td>
                          <td className="p-3 text-center space-x-2 whitespace-nowrap">
                            <button 
                              onClick={() => cargarRegistro(reg)}
                              className="bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-800/60 px-2 py-1 rounded-lg font-bold transition-all cursor-pointer text-xs"
                              title="Cargar variables en panel de control"
                            >
                              <i className="fa-solid fa-download mr-1"></i> Cargar
                            </button>
                            <button 
                              onClick={() => exportarRegistroEspecificoExcel(reg)}
                              className="bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-800/60 px-2 py-1 rounded-lg font-bold transition-all cursor-pointer text-xs"
                              title="Exportar esta simulación a Excel"
                            >
                              <i className="fa-solid fa-file-excel mr-1"></i> Excel
                            </button>
                            <button 
                              onClick={() => eliminarRegistro(reg.id)}
                              className="bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-800/60 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer text-xs"
                              title="Eliminar registro"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* VISTA DE TARJETAS / CARDS (SOLO CELULARES Y TABLETS EN MODO RETRATO) */}
              <div className="block md:hidden flex-1 overflow-y-auto space-y-3 pr-1">
                {historial.length === 0 ? (
                  <div className="p-10 text-center text-slate-500 italic bg-slate-900 border border-slate-800 rounded-xl text-xs">
                    No hay registros en la base de datos de simulación. Corre y finaliza un ensayo para guardarlo.
                  </div>
                ) : (
                  historial.map((reg) => (
                    <div key={reg.id} className="bg-slate-900 border border-slate-800/60 rounded-xl p-3.5 space-y-3 shadow-md hover:border-cyan-500/30 transition-all">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-cyan-400 text-xs">#{reg.id}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{reg.fecha}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-[11px] border-t border-b border-slate-850 py-2.5">
                        <div className="space-y-0.5">
                          <span className="text-slate-500 block text-[9.5px] uppercase font-bold tracking-wider">Escenario</span>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                            reg.escenario === 'Elevador' 
                            ? 'bg-indigo-950/40 text-indigo-400 border-indigo-800' 
                            : (reg.escenario === 'Avion' ? 'bg-sky-950/40 text-sky-400 border-sky-850' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800')
                          }`}>
                            {escenariosConfig[reg.escenario] ? escenariosConfig[reg.escenario].nombre : reg.escenario}
                          </span>
                        </div>
                        <div className="space-y-0.5 text-right">
                          <span className="text-slate-500 block text-[9.5px] uppercase font-bold tracking-wider">Masa / Fuerza</span>
                          <span className="text-slate-300 font-mono font-bold">{reg.masa.toLocaleString()} kg / {reg.fuerza.toLocaleString()} N</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-slate-500 block text-[9.5px] uppercase font-bold tracking-wider">Inclinación / Clima</span>
                          <span className="text-slate-300 font-mono">
                            {reg.inclinacion !== 0 ? `${reg.inclinacion > 0 ? '+' : ''}${reg.inclinacion}° / ` : ''}{reg.clima}
                          </span>
                        </div>
                        <div className="space-y-0.5 text-right">
                          <span className="text-slate-500 block text-[9.5px] uppercase font-bold tracking-wider">Aceleración</span>
                          <span className="text-rose-400 font-mono font-bold">{reg.aceleracion_promedio.toFixed(3)} m/s²</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-slate-500 block text-[9.5px] uppercase font-bold tracking-wider">Tiempo</span>
                          <span className="text-cyan-400 font-mono font-bold">{reg.tiempo_total.toFixed(2)} s</span>
                        </div>
                        <div className="space-y-0.5 text-right">
                          <span className="text-slate-500 block text-[9.5px] uppercase font-bold tracking-wider">Recorrido</span>
                          <span className="text-emerald-400 font-mono font-bold">{reg.distancia_recorrida.toFixed(2)} m</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 pt-1 justify-between items-center">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => cargarRegistro(reg)}
                            className="bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-800/60 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer text-[10px] flex items-center"
                          >
                            <i className="fa-solid fa-download mr-1"></i> Cargar
                          </button>
                          <button 
                            onClick={() => exportarRegistroEspecificoExcel(reg)}
                            className="bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-800/60 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer text-[10px] flex items-center"
                          >
                            <i className="fa-solid fa-file-excel mr-1"></i> Excel
                          </button>
                        </div>
                        <button 
                          onClick={() => eliminarRegistro(reg.id)}
                          className="bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-800/60 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer text-[10px]"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 text-[10.5px] text-slate-500 italic text-right">
                * Nota: Presionar 'Cargar' cargará las variables de la prueba en el panel activo para re-simular.
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Inicialización de punto de montaje
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
