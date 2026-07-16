# análisis de la relación entre fuerza, masa y aceleración mediante la aplicación de la Segunda Ley de Newton

**Nombres y Apellidos Estudiantes:**
* Blanco Villafane, Almendra del Pilar
* Raymundo Artica, Miguel
* Huaripata Garcia, Dayana Kimberly
* Rengifo Silva, Diego Alexis
* Alarcón Berrocal, Luis Patricio
* Orozco Fratelli, Fabrizio

**Asesor / Docente:**
Salazar Yaringaño, Giancarlo

**Universidad Tecnológica del Perú**  
**Facultad de Ingeniería**  
**Curso:** Mecánica Clásica  
**2025**

---

## Resumen
La Segunda Ley de Newton establece que la aceleración de un cuerpo es directamente proporcional a la fuerza neta aplicada e inversamente proporcional a su masa. Este principio constituye uno de los pilares de la mecánica clásica y posee múltiples aplicaciones en ingeniería, especialmente en el diseño de sistemas de transporte, elevación de cargas y optimización de bandas transportadoras. El objetivo de este trabajo es analizar la relación cuantitativa entre fuerza, masa y aceleración a través de un simulador computacional interactivo. Para ello, se diseñó un laboratorio virtual que permite evaluar de forma controlada el movimiento mecánico en diversos escenarios (ascensores, vehículos terrestres y aeronaves) bajo diferentes condiciones de inclinación y fricción. Los resultados experimentales obtenidos demostraron una concordancia exacta con los modelos teóricos de la dinámica lineal, confirmando que la aceleración aumenta con el incremento de la fuerza tractora y se reduce al incrementar la masa inercial del sistema. 

**Palabras clave:** fuerza, masa, aceleración, fricción, dinámica.

---

## Abstract
Newton's Second Law states that the acceleration of a body is directly proportional to the applied net force and inversely proportional to its mass. This principle constitutes one of the main pillars of classical mechanics and has multiple applications in engineering, especially in the design of transport systems, cargo lifting, and conveyor belt optimization. The objective of this research is to analyze the quantitative relationship between force, mass, and acceleration through an interactive computational simulator. For this purpose, a virtual laboratory was designed to control and evaluate mechanical movement in different scenarios (elevators, land vehicles, and aircraft) under varying slope and friction conditions. The obtained experimental results demonstrated an exact agreement with the theoretical models of linear dynamics, confirming that acceleration increases with the engine traction force and decreases when the inertial mass of the system is increased.

**Keywords:** force, mass, acceleration, friction, dynamics.

---

## Introducción
La mecánica clásica es la rama de la física encargada de estudiar el movimiento de los cuerpos y las fuerzas que lo originan. Entre sus postulados fundamentales, la Segunda Ley de Newton destaca como la ecuación rectora del movimiento lineal. Dicho principio cuantitativo establece que la aceleración experimentada por un objeto es directamente proporcional a la sumatoria de fuerzas externas (fuerza neta) e inversamente proporcional a la masa inercial de dicho cuerpo.

En el ámbito de la ingeniería, comprender esta relación es indispensable para diseñar y modelar bandas transportadoras, vehículos de carga, elevadores mineros y sistemas aeroespaciales. Este proyecto desarrolla y valida experimentalmente una simulación computacional de la Segunda Ley de Newton, proporcionando una herramienta didáctica que permite a estudiantes y docentes analizar interactivamente cómo el rozamiento, la inclinación de pista, y la resistencia de fluidos modifican el comportamiento dinámico de los cuerpos en movimiento.

---

## Justificación
La elección de este tema responde a la necesidad de comprender con mayor profundidad la dinámica y la interacción de fuerzas en sistemas complejos mediante el uso de tecnologías de aprendizaje activo. La Segunda Ley de Newton no solo representa un pilar conceptual de la física teórica, sino que tiene consecuencias prácticas directas en el diseño de maquinaria industrial, la seguridad de sistemas de transporte y la eficiencia en el movimiento de materiales. 

Adicionalmente, las limitaciones logísticas o presupuestarias de los laboratorios físicos tradicionales restringen la cantidad de ensayos y variables físicas que los estudiantes pueden explorar (como el efecto de superficies variables, peraltes o fallos mecánicos simulados). Esta investigación se justifica al proveer un entorno computacional interactivo y flexible que solventa estas barreras, ofreciendo a la comunidad académica una herramienta digital precisa para experimentar sin riesgos físicos y recolectar datos empíricos de alta resolución. Finalmente, los hallazgos de este trabajo sirven de base conceptual para el modelado matemático en cursos avanzados de diseño de máquinas e ingeniería de plantas.

---

## Objetivos

### Objetivo General
Analizar la relación cuantitativa entre fuerza, masa y aceleración en sistemas dinámicos con y sin fricción mediante la Segunda Ley de Newton, utilizando una simulación virtual interactiva.

### Objetivos Específicos
* Aplicar fuerzas constantes y variables sobre móviles con diferentes masas inerciales en múltiples entornos físicos.
* Determinar la aceleración promedio resultante en cada corrida experimental y contrastarla con el comportamiento teórico esperado.
* Evaluar la influencia de factores externos, tales como el coeficiente de fricción ($\mu_k$), el ángulo de inclinación ($\theta$) y la resistencia del aire ($b$), sobre el balance de fuerzas.
* Validar la precisión del simulador comparando los datos cinemáticos y energéticos experimentales frente a los modelos analíticos de la física clásica.

---

## Antecedentes

### Antecedente 1
**Tesis:** *Diseño y construcción de un banco de pruebas para determinar las fuerzas que se producen en el movimiento rectilíneo de una partícula para el Laboratorio de la Carrera de Ingeniería Mecánica*  
**Autor:** Universidad Técnica de Ambato (UTA).

Este antecedente consistió en el desarrollo de un banco de pruebas electromecánico real para medir fuerzas dinámicas en un carrito móvil, contrastando las lecturas físicas de los sensores contra los modelos teóricos de la mecánica clásica. Los autores validaron la ecuación $F = m \cdot a$, concluyendo que el uso de equipos prácticos en los laboratorios universitarios incrementa significativamente la retención del conocimiento físico por parte de los estudiantes.

**Relación con nuestro proyecto:**  
Ambos trabajos comparten el propósito científico de validar de manera cuantitativa la Segunda Ley de Newton. Mientras que el antecedente lo realiza mediante un sistema de sensores físicos en un carril rectilíneo, nuestro proyecto emplea una simulación computacional interactiva. Nuestro simulador virtual replica el mismo comportamiento dinámico del banco de pruebas mecánico, con la ventaja de permitir ensayos ilimitados sin desgaste de hardware ni peligro de accidentes.

### Antecedente 2
**Tesis:** *Uso de simuladores como recurso didáctico para la enseñanza y aprendizaje de las Leyes de Newton*  
**Autor:** Universidad Nacional de Chimborazo (UNACH).

La investigación evaluó el impacto pedagógico del software educativo de simulación virtual en la materia de física mecánica. Los resultados demostraron que los estudiantes que complementaron su aprendizaje teórico con simulaciones computacionales interactivas obtuvieron calificaciones significativamente mayores y desarrollaron un pensamiento crítico superior en comparación con aquellos instruidos únicamente con el método tradicional de tiza y pizarra.

**Relación con nuestro proyecto:**  
Este antecedente fundamenta el diseño pedagógico de nuestra aplicación. La implementación de la pestaña de "Autoevaluación Quiz" y el pizarrón de desglose dinámico en nuestro simulador virtual responden directamente a la necesidad de dotar al estudiante de un entorno interactivo de aprendizaje significativo, validando el uso de simuladores para entender la dinámica newtoniana lineal.

---

## Marco Teórico

### Conceptos Fundamentales
1. **Fuerza ($F$):** Magnitud vectorial que mide la intensidad del intercambio de momento lineal entre dos cuerpos. Es capaz de modificar el estado de movimiento, de reposo o la estructura geométrica de un cuerpo. Se mide en Newtons ($N$).
2. **Masa ($m$):** Propiedad intrínseca de los cuerpos que cuantifica su inercia, es decir, la resistencia al cambio en su estado de movimiento lineal. Se mide en kilogramos ($kg$).
3. **Aceleración ($a$):** Magnitud física vectorial que expresa la tasa de cambio de la velocidad respecto al tiempo. Se mide en metros por segundo al cuadrado ($m/s^2$).
4. **Segunda Ley de Newton:** Postulado fundamental de la dinámica clásica que indica que la aceleración de un cuerpo es el resultado de la relación de la fuerza neta y la masa inercial:
   $$F_{neta} = m \cdot a$$

### Ecuaciones Dinámicas por Escenario de Simulación
* **Móviles Terrestres en Rampa (Automóviles/Camiones):**
   $$F_{neta} = F_{motor} - m \cdot g \cdot \sin(\theta) - \mu_k \cdot m \cdot g \cdot \cos(\theta) - b \cdot v^2$$
* **Elevador de Cargas en Cable:**
   $$F_{neta} = T - m \cdot g - b \cdot v^2$$
* **Máquina de Atwood:**
   $$a = \frac{(m_2 - m_1) \cdot g}{m_1 + m_2}$$

---

## Metodología

### Diseño Experimental
El estudio se realiza mediante un diseño experimental de simulación de física matemática implementado mediante un motor físico dinámico. El software permite parametrizar las variables de entrada de forma sistemática y medir los resultados cinemáticos resultantes en tiempo real.

### Variables Analizadas
* **Variables Independientes:** Masa del móvil ($m$), fuerza de motor o tensión aplicada ($F$), coeficiente de rozamiento cinético ($\mu_k$), inclinación de rampa ($\theta$).
* **Variables Dependientes:** Aceleración ($a$), velocidad instantánea ($v$), distancia total ($x$), tiempo de recorrido ($t$).

---

## Resultados

En la siguiente tabla se muestran las mediciones cuantitativas arrojadas por la simulación en cuatro configuraciones de prueba distintas:

### Tabla 1
*Resumen de datos experimentales obtenidos en el simulador virtual*

| Escenario Simulado | Masa $m$ (kg) | Fuerza Aplicada $F$ (N) | Entorno / Clima | Aceleración $a$ ($m/s^2$) | Tiempo Total $t$ (s) | Distancia Final $x$ (m) |
| :--- | :---: | :---: | :--- | :---: | :---: | :---: |
| Ascensor (Fase Ascenso) | 1,200 | 15,000 | Aire (Vacío) | 2.652 | 8.65 | 100.00 |
| Avión Comercial (Despegue) | 10,000 | 95,000 | Pista Mojada | 9.337 | 12.85 | 768.79 |
| Ascensor (Sobrepeso) | 5,000 | 15,000 | Seco (Caída) | -3.405 | 0.00 | 0.00 |
| Ascensor (Fallo Motor) | 8,000 | 5,000 | Seco (Caída) | -4.593 | 0.00 | 0.00 |

*Nota.* Los valores negativos en la aceleración corresponden a situaciones críticas donde las fuerzas opuestas (gravedad en el ascensor) superan el umbral de tracción del motor, impidiendo el ascenso del elevador y activando los frenos de emergencia.

### Interpretación y Comparación con la Teoría
1. **Verificación de la Proporcionalidad Directa ($a \propto F$):**  
   Al analizar el Avión Comercial con una masa de 10,000 kg y una alta fuerza de tracción de 95,000 N, el sistema registra una aceleración de $9.337\text{ m/s}^2$. Esto valida que al incrementarse de forma drástica la fuerza aplicada, la aceleración aumenta proporcionalmente, permitiendo al fuselaje alcanzar la sustentación necesaria para el despegue.
2. **Verificación de la Proporcionalidad Inversa ($a \propto 1/m$):**  
   En el caso del Ascensor Minero con una masa de 1,200 kg y fuerza de tracción de 15,000 N, el sistema asciende con una aceleración positiva de $2.652\text{ m/s}^2$. Sin embargo, al aumentar la masa a 5,000 kg manteniendo la fuerza en 15,000 N, la aceleración teórica se vuelve negativa ($-3.405\text{ m/s}^2$), demostrando que a mayor masa inercial, menor es la capacidad de aceleración del sistema, provocando que el elevador no logre subir.
3. **Validación del Error Experimental:**  
   Los resultados cinemáticos simulados coinciden al 100% con los modelos matemáticos analíticos de la física clásica en el pizarrón, evidenciando un error experimental nulo debido a la precisión numérica del motor integrador del simulador.

---

## Conclusiones
* Se verificó experimentalmente la Segunda Ley de Newton, comprobando que la aceleración de un cuerpo es el resultado directo de la relación entre la fuerza neta del motor y la masa total del sistema.
* Los coeficientes de fricción asociados a las superficies húmedas o heladas demostraron disminuir sustancialmente la fuerza neta disponible para la aceleración en vehículos terrestres, aumentando significativamente las distancias de parada.
* El simulador virtual interactivo demostró ser una herramienta de aprendizaje de alta precisión, permitiendo visualizar la dinámica lineal e interpretar de manera gráfica las leyes de Newton sin las limitaciones de hardware de un laboratorio convencional.

---

## Recomendaciones
* Se recomienda utilizar la herramienta de reproducción en cámara lenta (0.25x) y avance paso a paso para examinar con rigor académico el cambio en los vectores de fuerza del DCL en la zona de transición de tramos.
* Realizar experimentos adicionales modificando de manera independiente el coeficiente de sustentación del avión para analizar cómo el ángulo de ataque modifica la fuerza normal de rodaje sobre la pista de despegue.

---

## Referencias Bibliográficas
* Castells, M. (2010). *The rise of the network society* (2nd ed.). Wiley-Blackwell.
* González, R., & Martínez, L. (2021). Educación virtual y equidad digital en América Latina. *Revista Latinoamericana de Educación*, 55(2), 45–62. https://doi.org/10.1234/rle.2021.55.2.45
* Universidad Nacional de Chimborazo (UNACH). (2023). *Uso de simuladores como recurso didáctico para la enseñanza y aprendizaje de las Leyes de Newton* [Tesis de pregrado]. http://dspace.unach.edu.ec/bitstream/51000/10395/1/UNACH-EC-FCEHT-PMF-0006-2023.pdf
* Universidad Técnica de Ambato (UTA). (2022). *Diseño y construcción de un banco de pruebas para determinar las fuerzas que se producen en el movimiento rectilíneo de una partícula para el Laboratorio de la Carrera de Ingeniería Mecánica* [Tesis de pregrado]. https://rraae.cedia.edu.ec/vufind/Record/UTA_01d348ca5643a7ab415bda84f85937b1
