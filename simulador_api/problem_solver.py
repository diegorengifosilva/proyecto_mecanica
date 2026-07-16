# -*- coding: utf-8 -*-
"""
Módulo: problem_solver.py (Dentro de simulador_api)
Descripción: Resuelve analíticamente problemas clásicos de física de la Segunda Ley de Newton,
             mostrando la sustitución de fórmulas paso a paso para fines académicos de la UTP.
"""
import math

class ProblemSolver:
    def __init__(self):
        self.g = 9.81

    def resolver(self, caso, params):
        """
        Punto de entrada para resolver problemas analíticos.
        'caso' puede ser 'A', 'B', 'C' o 'libre'.
        'params' contiene los valores numéricos correspondientes.
        """
        if caso == 'A':
            return self._resolver_caso_a(params)
        elif caso == 'B':
            return self._resolver_caso_b(params)
        elif caso == 'C':
            return self._resolver_caso_c(params)
        elif caso == 'D':
            return self._resolver_caso_d(params)
        elif caso == 'E':
            return self._resolver_caso_e(params)
        elif caso == 'F':
            return self._resolver_caso_f(params)
        elif caso == 'libre':
            return self._resolver_caso_libre(params)
        else:
            return {"error": "Caso de estudio no reconocido."}

    def _resolver_caso_a(self, p):
        """
        Caso A: Distancia de Parada Límite (Frenado Terrestre en Rampa)
        """
        try:
            m = float(p.get('masa', 1500.0))
            v0 = float(p.get('v_inicial', 25.0))
            f_freno = float(p.get('fuerza_freno', 8000.0))
            inclinacion = float(p.get('inclinacion', 0.0))
            mu_k = float(p.get('friccion_calzada', 0.8))
            x_freno = float(p.get('x_freno', 100.0))
        except (ValueError, TypeError):
            return {"error": "Parámetros de entrada inválidos para el Caso A."}

        if m <= 0:
            return {"error": "La masa debe ser estrictamente mayor a 0 kg."}

        theta_rad = (inclinacion * math.pi) / 180.0
        Normal = m * self.g * math.cos(theta_rad)
        f_k = mu_k * Normal
        P_x = m * self.g * math.sin(theta_rad)
        
        # Desaceleración durante el frenado
        F_neta_freno = -(f_freno + f_k) - P_x
        a_frenado = F_neta_freno / m

        pasos = []
        pasos.append("DATOS IDENTIFICADOS DEL PROBLEMA:")
        pasos.append(f"  • Masa del vehículo (m): {m:.2f} kg")
        pasos.append(f"  • Velocidad inicial (v₀): {v0:.2f} m/s")
        pasos.append(f"  • Fuerza de frenado (F_freno): {f_freno:.2f} N")
        pasos.append(f"  • Ángulo de inclinación de la rampa (θ): {inclinacion:.2f}°")
        pasos.append(f"  • Coeficiente de fricción cinética (μk): {mu_k:.2f}")
        pasos.append(f"  • Distancia hasta frenado (x_freno): {x_freno:.2f} m")
        pasos.append(f"  • Aceleración de la gravedad (g): 9.81 m/s²")
        pasos.append("")
        pasos.append("DESGLOSE ANALÍTICO PASO A PASO:")
        pasos.append(f"1. Cálculo de la Fuerza Normal perpendicular a la rampa:")
        pasos.append(f"   N = m · g · cos(θ) = {m:.1f} · 9.81 · cos({inclinacion:.1f}°) = {Normal:.2f} N")
        pasos.append(f"2. Cálculo de la Fuerza de Fricción Dinámica:")
        pasos.append(f"   fk = μk · N = {mu_k:.4f} · {Normal:.2f} = {f_k:.2f} N")
        pasos.append(f"3. Componente del Peso paralela a la rampa (Gravedad):")
        pasos.append(f"   Px = m · g · sen(θ) = {m:.1f} · 9.81 · sen({inclinacion:.1f}°) = {P_x:.2f} N")
        pasos.append(f"4. Fuerza Neta y Desaceleración al aplicar los frenos:")
        pasos.append(f"   ΣFx = -(F_freno + fk) - Px = -({f_freno:.1f} + {f_k:.1f}) - {P_x:.1f} = {F_neta_freno:.2f} N")
        pasos.append(f"   a_frenado = ΣFx / m = {F_neta_freno:.2f} / {m:.1f} = {a_frenado:.4f} m/s² (El signo negativo indica una desaceleración que se opone al avance)")

        if a_frenado >= 0:
            explicacion_final = "La fuerza de frenado y la fricción son insuficientes para contrarrestar el peso en bajada. El vehículo continuará acelerando cuesta abajo."
            return {
                "caso": "A",
                "incognitas": {
                    "normal": round(Normal, 2),
                    "friccion": round(f_k, 2),
                    "peso_x": round(P_x, 2),
                    "aceleracion": round(a_frenado, 4),
                    "tiempo_freno": None,
                    "distancia_freno": None,
                    "posicion_final": None,
                    "logra_detenerse": False
                },
                "procedimiento": pasos,
                "conclusion": explicacion_final
            }

        # Tiempo y distancia de frenado
        t_freno = -v0 / a_frenado
        d_freno = - (v0 ** 2) / (2 * a_frenado)
        x_final = x_freno + d_freno
        
        t_reaccion = x_freno / v0 if v0 > 0 else 0.0
        t_total = t_reaccion + t_freno

        pasos.append(f"5. Aplicando cinemática para detenerse por completo (v_final = 0 m/s):")
        pasos.append(f"   Tiempo de frenado: t_freno = -v0 / a = -{v0:.1f} / ({a_frenado:.4f}) = {t_freno:.3f} s")
        pasos.append(f"   Distancia de parada: d_freno = -v0² / (2·a) = -{v0:.1f}² / (2 · {a_frenado:.4f}) = {d_freno:.3f} m")
        pasos.append(f"6. Resultados finales de posición y tiempo transcurrido:")
        if t_reaccion > 0:
            pasos.append(f"   Tiempo previo de reacción (avanzando a v0 constante): t_reaccion = x_freno / v0 = {x_freno:.1f} / {v0:.1f} = {t_reaccion:.3f} s")
            pasos.append(f"   Tiempo total transcurrido: t_total = t_reaccion + t_freno = {t_reaccion:.3f} + {t_freno:.3f} = {t_total:.3f} s")
        pasos.append(f"   Posición final de parada: x_final = x_freno + d_freno = {x_freno:.1f} + {d_freno:.3f} = {x_final:.3f} m")

        explicacion_final = f"El vehículo se detiene completamente en la posición {x_final:.2f} m (recorriendo {d_freno:.2f} m desde que aplicó los frenos) tras un tiempo de frenado de {t_freno:.2f} s."

        return {
            "caso": "A",
            "incognitas": {
                "normal": round(Normal, 2),
                "friccion": round(f_k, 2),
                "peso_x": round(P_x, 2),
                "aceleracion": round(a_frenado, 4),
                "tiempo_freno": round(t_freno, 3),
                "distancia_freno": round(d_freno, 3),
                "posicion_final": round(x_final, 3),
                "tiempo_total": round(t_total, 3),
                "logra_detenerse": True
            },
            "procedimiento": pasos,
            "conclusion": explicacion_final
        }

    def _resolver_caso_b(self, p):
        """
        Caso B: Falla de Tensión y Altura de Impacto (Elevador / Ascensor Minero)
        """
        try:
            m = float(p.get('masa', 1200.0))
            v0 = float(p.get('v_inicial', -4.0))  # Negativa = bajando
            y_falla = float(p.get('y_falla', 60.0))
            f_freno = float(p.get('fuerza_freno', 16000.0))
        except (ValueError, TypeError):
            return {"error": "Parámetros de entrada inválidos para el Caso B."}

        if m <= 0:
            return {"error": "La masa debe ser estrictamente mayor a 0 kg."}

        Peso = m * self.g
        
        # Desaceleración post-falla (F_freno hacia arriba (+), Peso hacia abajo (-))
        F_neta = f_freno - Peso
        a = F_neta / m

        pasos = []
        pasos.append("DATOS IDENTIFICADOS DEL PROBLEMA:")
        pasos.append(f"  • Masa de la cabina (m): {m:.2f} kg")
        pasos.append(f"  • Velocidad inicial (v₀): {v0:.2f} m/s")
        pasos.append(f"  • Altura de falla (y_falla): {y_falla:.2f} m")
        pasos.append(f"  • Fuerza de frenado de emergencia (F_freno): {f_freno:.2f} N")
        pasos.append(f"  • Aceleración de la gravedad (g): 9.81 m/s²")
        pasos.append("")
        pasos.append("DESGLOSE ANALÍTICO PASO A PASO:")
        pasos.append(f"1. Cálculo del Peso del elevador:")
        pasos.append(f"   P = m · g = {m:.1f} · 9.81 = {Peso:.2f} N")
        pasos.append(f"2. Cálculo de la Fuerza Neta y la Aceleración post-falla (con frenos de emergencia activos):")
        pasos.append(f"   ΣFy = F_freno - Peso = {f_freno:.1f} - {Peso:.1f} = {F_neta:.2f} N")
        pasos.append(f"   a = ΣFy / m = {F_neta:.2f} / {m:.1f} = {a:.4f} m/s² (fuerza retardadora neta)")

        if v0 <= 0:
            if a <= 0:
                t_discriminante = v0**2 - 2 * a * y_falla
                t_impacto = (-v0 - math.sqrt(t_discriminante)) / a if a != 0 else y_falla / -v0 if v0 != 0 else 0.0
                v_impacto = v0 + a * t_impacto
                
                pasos.append(f"3. Dado que la aceleración retardadora ({a:.4f} m/s²) es menor o igual a 0, el elevador no frena sino que cae libremente.")
                pasos.append(f"4. Resolviendo el tiempo de caída libre hasta y = 0 m mediante y(t) = y_falla + v0·t + 0.5·a·t² = 0:")
                pasos.append(f"   t_impacto = {t_impacto:.3f} s")
                pasos.append(f"   Velocidad de impacto: v = v0 + a·t = {v0:.2f} + ({a:.4f})·{t_impacto:.3f} = {v_impacto:.2f} m/s")
                
                conclusion = f"El sistema de frenado falló en detener la caída. El elevador impactó contra el suelo a los {t_impacto:.2f} s con una velocidad de {abs(v_impacto):.2f} m/s."
                return {
                    "caso": "B",
                    "incognitas": {
                        "peso": round(Peso, 2),
                        "aceleracion": round(a, 4),
                        "t_impacto": round(t_impacto, 3),
                        "v_impacto": round(v_impacto, 2),
                        "se_detiene": False,
                        "altura_parada": 0.0
                    },
                    "procedimiento": pasos,
                    "conclusion": conclusion
                }
            else:
                d_parada = (v0 ** 2) / (2 * a)
                y_parada = y_falla - d_parada
                
                pasos.append(f"3. Cálculo de la distancia de parada requerida para frenar por completo (v = 0 m/s):")
                pasos.append(f"   d_parada = v0² / (2·a) = (-{abs(v0):.1f})² / (2 · {a:.4f}) = {d_parada:.3f} m")
                pasos.append(f"4. Comparando la distancia de parada con la altura de la falla:")
                pasos.append(f"   Altura final estimada: y_parada = y_falla - d_parada = {y_falla:.1f} - {d_parada:.3f} = {y_parada:.3f} m")
                
                if y_parada >= 0:
                    t_freno = -v0 / a
                    pasos.append(f"5. Como y_parada >= 0, los frenos de seguridad logran detener la cabina en el aire:")
                    pasos.append(f"   Tiempo de parada: t_freno = -v0 / a = {t_freno:.3f} s")
                    
                    conclusion = f"¡Frenado seguro exitoso! La cabina se detiene por completo en el aire a {y_parada:.2f} metros sobre el suelo en un tiempo de {t_freno:.2f} s."
                    return {
                        "caso": "B",
                        "incognitas": {
                            "peso": round(Peso, 2),
                            "aceleracion": round(a, 4),
                            "t_impacto": round(t_freno, 3),
                            "v_impacto": 0.0,
                            "se_detiene": True,
                            "altura_parada": round(y_parada, 3)
                        },
                        "procedimiento": pasos,
                        "conclusion": conclusion
                    }
                else:
                    t_discriminante = v0**2 - 2 * a * y_falla
                    t_impacto = (-v0 - math.sqrt(t_discriminante)) / a
                    v_impacto = v0 + a * t_impacto
                    
                    pasos.append(f"5. Como y_parada ({y_parada:.3f} m) es menor a 0 m, la cabina impactará antes de detenerse por completo.")
                    pasos.append(f"6. Resolviendo la ecuación cuadrática de colisión (0.5·a·t² + v0·t + y_falla = 0):")
                    pasos.append(f"   t_impacto = (-v0 - √(v0² - 2·a·y_falla)) / a = {t_impacto:.3f} s")
                    pasos.append(f"7. Cálculo de la velocidad de colisión:")
                    pasos.append(f"   v_impacto = v0 + a · t_impacto = {v_impacto:.2f} m/s")
                    
                    conclusion = f"La cabina impacta contra el suelo antes de detenerse por completo. El impacto ocurre a los {t_impacto:.2f} s a una velocidad de {abs(v_impacto):.2f} m/s."
                    return {
                        "caso": "B",
                        "incognitas": {
                            "peso": round(Peso, 2),
                            "aceleracion": round(a, 4),
                            "t_impacto": round(t_impacto, 3),
                            "v_impacto": round(v_impacto, 2),
                            "se_detiene": False,
                            "altura_parada": 0.0
                        },
                        "procedimiento": pasos,
                        "conclusion": conclusion
                    }
        else:
            # Ascendiendo
            if a >= 0:
                conclusion = "El ascensor tiene una fuerza de freno superior al peso y subía. Continuará acelerando hacia arriba."
                return {
                    "caso": "B",
                    "incognitas": {
                        "peso": round(Peso, 2),
                        "aceleracion": round(a, 4),
                        "t_impacto": None,
                        "v_impacto": None,
                        "se_detiene": False,
                        "altura_parada": 999.0
                    },
                    "procedimiento": pasos,
                    "conclusion": conclusion
                }
            else:
                d_subida = -(v0 ** 2) / (2 * a)
                y_max = y_falla + d_subida
                t_subida = -v0 / a
                
                t_caida = math.sqrt(-2 * y_max / a)
                t_total = t_subida + t_caida
                v_impacto = a * t_caida
                
                pasos.append(f"3. Dado que v0 > 0 m/s pero la aceleración es negativa ({a:.4f} m/s²), la cabina subirá un tramo adicional antes de detenerse e iniciar la caída.")
                pasos.append(f"4. Tramo de ascenso inercial:")
                pasos.append(f"   d_subida = -v0² / (2·a) = {d_subida:.3f} m")
                pasos.append(f"   Altura máxima alcanzada: y_max = {y_max:.3f} m")
                pasos.append(f"   Tiempo de ascenso: t_subida = {t_subida:.3f} s")
                pasos.append(f"5. Caída libre desde la altura máxima (y_max) hasta el suelo:")
                pasos.append(f"   t_caida = √(-2 · y_max / a) = {t_caida:.3f} s")
                pasos.append(f"6. Tiempo total de impacto y velocidad final:")
                pasos.append(f"   t_total = {t_total:.3f} s")
                pasos.append(f"   v_impacto = a · t_caida = {v_impacto:.2f} m/s")
                
                conclusion = f"La cabina subió hasta {y_max:.2f} m y luego cayó libremente impactando a los {t_total:.2f} s a una velocidad de {abs(v_impacto):.2f} m/s."
                return {
                    "caso": "B",
                    "incognitas": {
                        "peso": round(Peso, 2),
                        "aceleracion": round(a, 4),
                        "t_impacto": round(t_total, 3),
                        "v_impacto": round(v_impacto, 2),
                        "se_detiene": False,
                        "altura_parada": round(y_max, 3)
                    },
                    "procedimiento": pasos,
                    "conclusion": conclusion
                }

    def _resolver_caso_c(self, p):
        """
        Caso C: Longitud Crítica de Pista de Despegue (Límite Aeronáutico)
        """
        try:
            m = float(p.get('masa', 45000.0))
            empuje = float(p.get('empuje', 90000.0))
            mu_pista = float(p.get('friccion_pista', 0.02))
            l_pista = float(p.get('l_pista', 1200.0))
            v_despegue = float(p.get('v_despegue', 80.0))
            v0 = float(p.get('v_inicial', 0.0))
        except (ValueError, TypeError):
            return {"error": "Parámetros de entrada inválidos para el Caso C."}

        if m <= 0:
            return {"error": "La masa debe ser estrictamente mayor a 0 kg."}

        Peso = m * self.g
        Normal = Peso
        f_rodadura = mu_pista * Normal
        F_neta = empuje - f_rodadura
        a = F_neta / m

        pasos = []
        pasos.append("DATOS IDENTIFICADOS DEL PROBLEMA:")
        pasos.append(f"  • Masa del avión (m): {m:.2f} kg")
        pasos.append(f"  • Empuje de turbinas (T): {empuje:.2f} N")
        pasos.append(f"  • Coeficiente de fricción de rodadura (μ): {mu_pista:.4f}")
        pasos.append(f"  • Longitud de la pista (L): {l_pista:.2f} m")
        pasos.append(f"  • Velocidad de despegue (v_despegue): {v_despegue:.2f} m/s")
        pasos.append(f"  • Velocidad inicial (v₀): {v0:.2f} m/s")
        pasos.append(f"  • Aceleración de la gravedad (g): 9.81 m/s²")
        pasos.append("")
        pasos.append("DESGLOSE ANALÍTICO PASO A PASO:")
        pasos.append(f"1. Cálculo del Peso de la aeronave:")
        pasos.append(f"   P = m · g = {m:.1f} · 9.81 = {Peso:.2f} N")
        pasos.append(f"2. Cálculo de la Fuerza de Fricción de rodadura en la pista:")
        pasos.append(f"   fr = μ · N = {mu_pista:.4f} · {Normal:.2f} = {f_rodadura:.2f} N")
        pasos.append(f"3. Fuerza Neta horizontal y Aceleración en pista:")
        pasos.append(f"   ΣFx = Empuje - fr = {empuje:.1f} - {f_rodadura:.1f} = {F_neta:.2f} N")
        pasos.append(f"   a = ΣFx / m = {F_neta:.2f} / {m:.1f} = {a:.4f} m/s²")

        if a <= 0:
            conclusion = "El empuje de los turborreactores es menor o igual a la fricción de rodadura. La aeronave nunca ganará velocidad ni logrará despegar."
            return {
                "caso": "C",
                "incognitas": {
                    "peso": round(Peso, 2),
                    "friccion": round(f_rodadura, 2),
                    "aceleracion": round(a, 4),
                    "d_necesaria": None,
                    "t_despegue": None,
                    "logra_despegue": False
                },
                "procedimiento": pasos,
                "conclusion": conclusion
            }

        d_necesaria = (v_despegue**2 - v0**2) / (2 * a)
        t_despegue = (v_despegue - v0) / a
        logra_despegue = d_necesaria <= l_pista

        pasos.append(f"4. Cálculo de la distancia de pista teórica necesaria para alcanzar la velocidad de despegue ({v_despegue:.1f} m/s):")
        pasos.append(f"   d_necesaria = (v_despegue² - v0²) / (2·a) = ({v_despegue:.1f}² - {v0:.1f}²) / (2 · {a:.4f}) = {d_necesaria:.3f} m")
        pasos.append(f"5. Cálculo del tiempo requerido para alcanzar el despegue:")
        pasos.append(f"   t_despegue = (v_despegue - v0) / a = ({v_despegue:.1f} - {v0:.1f}) / {a:.4f} = {t_despegue:.3f} s")
        
        pasos.append(f"6. Comparativa con la longitud de pista actual ({l_pista:.1f} m):")
        if logra_despegue:
            pasos.append(f"   Como d_necesaria ({d_necesaria:.3f} m) <= l_pista ({l_pista:.1f} m), el avión despegará antes de llegar al final.")
            conclusion = f"¡Despegue exitoso! El avión alcanza la velocidad de despegue a los {t_despegue:.2f} s en el metro {d_necesaria:.2f} de la pista, sobrando {l_pista - d_necesaria:.2f} m de seguridad."
        else:
            pasos.append(f"   Como d_necesaria ({d_necesaria:.3f} m) > l_pista ({l_pista:.1f} m), el avión no tendrá suficiente pista y colisionará al final.")
            conclusion = f"¡Falla de despegue! El avión requiere {d_necesaria:.2f} m de pista, superando los {l_pista:.1f} m de la pista configurada por {d_necesaria - l_pista:.2f} m."
        return {
            "caso": "C",
            "incognitas": {
                "peso": round(Peso, 2),
                "friccion": round(f_rodadura, 2),
                "aceleracion": round(a, 4),
                "d_necesaria": round(d_necesaria, 2),
                "t_despegue": round(t_despegue, 3),
                "logra_despegue": logra_despegue
            },
            "procedimiento": pasos,
            "conclusion": conclusion
        }

    def _resolver_caso_libre(self, p):
        """
        Caso Libre: Resuelve dinámicamente cualquier escenario en base a parámetros del estudiante,
        calculando aceleración, tiempo y distancia necesarios para pasar de v0 a vf.
        """
        try:
            escenario = p.get('escenario', 'Automovil')
            escL = escenario.lower()
            
            m = float(p.get('masa', 1000.0))
            v0 = float(p.get('v_inicial', 20.0))
            vf = float(p.get('v_final', 0.0))
            fuerza = float(p.get('fuerza', 5000.0))
            inclinacion = float(p.get('inclinacion', 0.0))
            fric_coef = float(p.get('friccion', 0.5))
            tipo_mov = p.get('tipo_movimiento', 'Aceleracion') # 'Aceleracion' o 'Frenado'
            m2 = float(p.get('masa_2', 15.0)) # Atwood
        except (ValueError, TypeError):
            return {"error": "Parámetros de entrada inválidos para el Caso Personalizado."}

        if m <= 0:
            return {"error": "La masa debe ser estrictamente mayor a 0 kg."}

        pasos = []
        pasos.append("DATOS IDENTIFICADOS DEL PROBLEMA:")
        pasos.append(f"  • Escenario seleccionado: {escenario}")
        pasos.append(f"  • Masa del cuerpo principal (m/m1): {m:.2f} kg")
        if escL == 'atwood':
            pasos.append(f"  • Masa del cuerpo secundario (m2): {m2:.2f} kg")
        pasos.append(f"  • Velocidad inicial (v₀): {v0:.2f} m/s")
        pasos.append(f"  • Velocidad final objetivo (vf): {vf:.2f} m/s")
        if escL != 'atwood' and escL != 'elevador':
            pasos.append(f"  • Fuerza aplicada (T/F): {fuerza:.2f} N")
            pasos.append(f"  • Ángulo de inclinación (θ): {inclinacion:.2f}°")
            pasos.append(f"  • Coeficiente de fricción (μ): {fric_coef:.2f}")
        elif escL == 'elevador':
            pasos.append(f"  • Fuerza de tensión del cable (T): {fuerza:.2f} N")
        pasos.append(f"  • Aceleración de la gravedad (g): 9.81 m/s²")
        pasos.append("")
        pasos.append("DESGLOSE ANALÍTICO PASO A PASO:")
        
        # 1. Análisis de Fuerzas y Aceleración según Escenario
        if escL == 'atwood':
            P1 = m * self.g
            P2 = m2 * self.g
            total_m = m + m2
            
            a = ((m2 - m) * self.g) / total_m
            Tension = m * (self.g + a)
            
            pasos.append(f"1. Fuerzas de Gravedad en Atwood:")
            pasos.append(f"   P1 = m1 · g = {m:.2f} · 9.81 = {P1:.2f} N (Masa Izquierda)")
            pasos.append(f"   P2 = m2 · g = {m2:.2f} · 9.81 = {P2:.2f} N (Masa Derecha)")
            pasos.append(f"2. Aceleración Teórica Acoplada:")
            pasos.append(f"   a = (m2 - m1)·g / (m1 + m2) = ({m2:.2f} - {m:.2f}) · 9.81 / ({m:.2f} + {m2:.2f}) = {a:.4f} m/s²")
            pasos.append(f"3. Tensión en el cable:")
            pasos.append(f"   T = m1 · (g + a) = {m:.2f} · (9.81 + {a:.4f}) = {Tension:.2f} N")
            
            incognitas = {
                "peso": round(P1, 2),
                "normal": round(P2, 2), # rehusar campos para serialización genérica
                "friccion": 0.0,
                "aceleracion": round(a, 4),
                "tension": round(Tension, 2),
            }
            
        elif escL == 'elevador':
            Peso = m * self.g
            # Fuerza neta vertical (Tensión - Peso)
            F_neta = fuerza - Peso
            a = F_neta / m
            
            pasos.append(f"1. Fuerza de Gravedad (Peso de cabina):")
            pasos.append(f"   P = m · g = {m:.2f} · 9.81 = {Peso:.2f} N")
            pasos.append(f"2. Ecuación de Newton Vertical (Tensión = {fuerza:.2f} N):")
            pasos.append(f"   ΣFy = Tension - Peso = {fuerza:.2f} - {Peso:.2f} = {F_neta:.2f} N")
            pasos.append(f"3. Aceleración resultante:")
            pasos.append(f"   a = ΣFy / m = {F_neta:.2f} / {m:.2f} = {a:.4f} m/s²")
            
            incognitas = {
                "peso": round(Peso, 2),
                "normal": 0.0,
                "friccion": 0.0,
                "aceleracion": round(a, 4),
            }
            
        elif escL == 'avion':
            Peso = m * self.g
            theta_rad = (inclinacion * math.pi) / 180.0
            Normal = Peso * math.cos(theta_rad)
            f_rod = fric_coef * Normal
            P_x = Peso * math.sin(theta_rad)
            
            # Fuerza neta horizontal en rodaje (Empuje - fricción - rampa)
            F_neta = fuerza - f_rod - P_x
            a = F_neta / m
            
            pasos.append(f"1. Cálculo del Peso de la aeronave:")
            pasos.append(f"   P = m · g = {m:.2f} · 9.81 = {Peso:.2f} N")
            pasos.append(f"2. Fuerza Normal sobre pista inclinada:")
            pasos.append(f"   N = P · cos(θ) = {Peso:.2f} · cos({inclinacion:.1f}°) = {Normal:.2f} N")
            pasos.append(f"3. Resistencia de Rodadura (fricción de rodadura μ = {fric_coef:.4f}):")
            pasos.append(f"   fr = μ · N = {fric_coef:.4f} · {Normal:.2f} = {f_rod:.2f} N")
            if abs(inclinacion) > 0.01:
                pasos.append(f"4. Fuerza de gravedad paralela a la pista:")
                pasos.append(f"   Px = m · g · sen(θ) = {m:.2f} · 9.81 · sen({inclinacion:.1f}°) = {P_x:.2f} N")
            pasos.append(f"4. Ecuación Horizontal de Newton (Empuje Turbinas = {fuerza:.2f} N):")
            pasos.append(f"   ΣFx = Empuje - fr - Px = {fuerza:.2f} - {f_rod:.2f} - {P_x:.2f} = {F_neta:.2f} N")
            pasos.append(f"5. Aceleración en pista:")
            pasos.append(f"   a = ΣFx / m = {F_neta:.2f} / {m:.2f} = {a:.4f} m/s²")
            
            incognitas = {
                "peso": round(Peso, 2),
                "normal": round(Normal, 2),
                "friccion": round(f_rod, 2),
                "aceleracion": round(a, 4),
            }
            
        elif escL == 'curva':
            R = float(p.get('radio_curva', 80.0))
            mu_s = float(p.get('friccion_estatica', 0.8))
            theta_rad = (inclinacion * math.pi) / 180.0
            
            tan_theta = math.tan(theta_rad)
            denom_max = 1.0 - mu_s * tan_theta
            v_max = math.sqrt(self.g * R * (tan_theta + mu_s) / denom_max) if denom_max > 1e-4 else 999.0
            v_min = math.sqrt(self.g * R * (tan_theta - mu_s) / (1.0 + mu_s * tan_theta)) if tan_theta > mu_s else 0.0
            v_ideal = math.sqrt(self.g * R * tan_theta)
            
            Normal = m * (self.g * math.cos(theta_rad) + (v0 ** 2) / R * math.sin(theta_rad))
            fk = fric_coef * Normal
            fs_req = m * ((v0 ** 2) / R * math.cos(theta_rad) - self.g * math.sin(theta_rad))
            
            pasos.append(f"1. Límites de velocidad segura (R = {R:.1f} m, Peralte = {inclinacion:.1f}°, μs = {mu_s:.2f}):")
            pasos.append(f"   v_min = {v_min:.2f} m/s | v_max = {v_max:.2f} m/s | v_ideal = {v_ideal:.2f} m/s")
            
            pasos.append(f"2. Fuerza Normal perpendicular al peralte a v0 = {v0:.2f} m/s:")
            pasos.append(f"   N = m·(g·cosθ + v0²/R·senθ) = {Normal:.2f} N")
            
            pasos.append(f"3. Fricción Lateral requerida:")
            pasos.append(f"   fs_req = m·(v0²/R·cosθ - g·senθ) = {fs_req:.2f} N")
            
            # Dinámica tangencial
            if tipo_mov == 'Frenado':
                F_neta = -(fuerza + fk)
            else:
                F_neta = fuerza - fk
            a = F_neta / m
            
            pasos.append(f"4. Ecuación tangencial (Fuerza = {fuerza:.1f} N, Fricción calzada = {fk:.1f} N):")
            if tipo_mov == 'Frenado':
                pasos.append(f"   ΣFt = -(F_frenado + fk) = {F_neta:.2f} N")
            else:
                pasos.append(f"   ΣFt = F_motor - fk = {F_neta:.2f} N")
            pasos.append(f"   a = ΣFt / m = {a:.4f} m/s²")
            
            incognitas = {
                "peso": round(m * self.g, 2),
                "normal": round(Normal, 2),
                "friccion": round(fk, 2),
                "aceleracion": round(a, 4),
                "friccion_lateral": round(fs_req, 2),
                "v_ideal": round(v_ideal, 2),
                "v_min": round(v_min, 2),
                "v_max": round(v_max, 2)
            }
            
        else:
            # Automovil, Camion, Motocicleta
            Peso = m * self.g
            theta_rad = (inclinacion * math.pi) / 180.0
            Normal = Peso * math.cos(theta_rad)
            fk = fric_coef * Normal
            P_x = Peso * math.sin(theta_rad)
            
            if tipo_mov == 'Frenado':
                F_neta = -(fuerza + fk) - P_x
            else:
                F_neta = fuerza - fk - P_x
                
            a = F_neta / m
            
            pasos.append(f"1. Fuerza Normal del plano inclinado:")
            pasos.append(f"   N = m · g · cos(θ) = {m:.2f} · 9.81 · cos({inclinacion:.1f}°) = {Normal:.2f} N")
            pasos.append(f"2. Fuerza de Fricción Dinámica (μ_k = {fric_coef:.4f}):")
            pasos.append(f"   fk = μk · N = {fric_coef:.4f} · {Normal:.2f} = {fk:.2f} N")
            if abs(inclinacion) > 0.01:
                pasos.append(f"3. Componente paralela del Peso (gravedad):")
                pasos.append(f"   Px = m · g · sen(θ) = {m:.2f} · 9.81 · sen({inclinacion:.1f}°) = {P_x:.2f} N")
            
            pasos.append(f"4. Fuerza Neta y Aceleración ({'Frenado' if tipo_mov == 'Frenado' else 'Aceleración'}):")
            if tipo_mov == 'Frenado':
                pasos.append(f"   ΣFx = -(F_freno + fk) - Px = -({fuerza:.2f} + {fk:.2f}) - {P_x:.2f} = {F_neta:.2f} N")
            else:
                pasos.append(f"   ΣFx = F_motor - fk - Px = {fuerza:.2f} - {fk:.2f} - {P_x:.2f} = {F_neta:.2f} N")
            
            pasos.append(f"5. Aceleración resultante:")
            pasos.append(f"   a = ΣFx / m = {F_neta:.2f} / {m:.2f} = {a:.4f} m/s²")
            
            incognitas = {
                "peso": round(Peso, 2),
                "normal": round(Normal, 2),
                "friccion": round(fk, 2),
                "aceleracion": round(a, 4),
            }

        # 2. Análisis Cinemático Completo
        if abs(a) < 1e-6:
            pasos.append(f"6. La aceleración es nula (sistema en equilibrio). No hay cambio de velocidad en este modelo.")
            t_cine = None
            d_cine = None
        else:
            t_cine = (vf - v0) / a
            d_cine = (vf**2 - v0**2) / (2 * a)
            
            pasos.append(f"6. Análisis Cinemático de Transición (v_ini = {v0:.2f} m/s -> v_fin = {vf:.2f} m/s):")
            pasos.append(f"   Fórmula del tiempo: t = (vf - v0) / a")
            pasos.append(f"   Sustitución: t = ({vf:.2f} - {v0:.2f}) / ({a:.4f}) = {t_cine:.3f} s")
            pasos.append(f"   Fórmula de distancia: d = (vf² - v0²) / (2·a)")
            pasos.append(f"   Sustitución: d = ({vf:.2f}² - {v0:.2f}²) / (2 · {a:.4f}) = {d_cine:.3f} m")

        incognitas["tiempo_freno"] = round(t_cine, 3) if t_cine is not None else None
        incognitas["distancia_freno"] = round(d_cine, 3) if d_cine is not None else None
        incognitas["posicion_final"] = round(d_cine, 3) if d_cine is not None else None
        
        # Conclusión explicativa
        if t_cine is not None and t_cine >= 0:
            conclusion = f"La transición ocurre exitosamente en {t_cine:.2f} s, recorriendo una distancia de {d_cine:.2f} metros."
            if a < 0:
                conclusion += " Dado que la aceleración es negativa, actúa como una desaceleración."
        elif t_cine is not None and t_cine < 0:
            conclusion = f"Aceleración incompatible con la velocidad final deseada. Se requiere un tiempo físicamente inviable de {t_cine:.2f} s."
        else:
            conclusion = f"El sistema permanece en equilibrio constante de velocidad."
            
        return {
            "caso": "libre",
            "incognitas": incognitas,
            "procedimiento": pasos,
            "conclusion": conclusion
        }

    def _resolver_caso_d(self, p):
        """
        Caso D: Máquina de Atwood (Doble Masa Acoplada)
        """
        try:
            m1 = float(p.get('masa', 15.0))
            m2 = float(p.get('masa_2', 25.0))
            v0 = float(p.get('v_inicial', 0.0))
            vf = float(p.get('v_final', 5.0))
        except (ValueError, TypeError):
            return {"error": "Parámetros de entrada inválidos para el Caso D."}

        if m1 <= 0 or m2 <= 0:
            return {"error": "Ambas masas deben ser estrictamente mayores a 0 kg."}

        P1 = m1 * self.g
        P2 = m2 * self.g
        total_m = m1 + m2
        a = ((m2 - m1) * self.g) / total_m
        Tension = m1 * (self.g + a)

        pasos = []
        pasos.append("DATOS IDENTIFICADOS DEL PROBLEMA:")
        pasos.append(f"  • Masa del bloque izquierdo (m1): {m1:.2f} kg")
        pasos.append(f"  • Masa del bloque derecho (m2): {m2:.2f} kg")
        pasos.append(f"  • Velocidad inicial (v₀): {v0:.2f} m/s")
        pasos.append(f"  • Velocidad final objetivo (vf): {vf:.2f} m/s")
        pasos.append(f"  • Aceleración de la gravedad (g): 9.81 m/s²")
        pasos.append("")
        pasos.append("DESGLOSE ANALÍTICO PASO A PASO:")
        pasos.append(f"1. Cálculo de las Fuerzas de Gravedad (Pesos) para cada masa:")
        pasos.append(f"   P1 = m1 · g = {m1:.1f} · 9.81 = {P1:.2f} N (Masa Izquierda)")
        pasos.append(f"   P2 = m2 · g = {m2:.1f} · 9.81 = {P2:.2f} N (Masa Derecha)")
        pasos.append(f"2. Planteamiento de la Segunda Ley de Newton para el sistema acoplado:")
        pasos.append(f"   La fuerza motora neta es la diferencia de pesos: ΣF = P2 - P1 = {P2:.2f} - {P1:.2f} = {P2 - P1:.2f} N")
        pasos.append(f"   La masa total inercial es: m_total = m1 + m2 = {m1:.1f} + {m2:.1f} = {total_m:.1f} kg")
        pasos.append(f"3. Cálculo de la Aceleración del sistema acoplado:")
        pasos.append(f"   a = (P2 - P1) / m_total = {P2 - P1:.2f} / {total_m:.1f} = {a:.4f} m/s² (El signo indica dirección del bloque pesado)")
        
        pasos.append(f"4. Cálculo de la Tensión en la cuerda:")
        pasos.append(f"   Analizando la masa 1 (m1): T - P1 = m1 · a  =>  T = m1 · (g + a)")
        pasos.append(f"   T = {m1:.1f} · (9.81 + {a:.4f}) = {Tension:.2f} N")

        if abs(a) < 1e-6:
            t_cine = None
            d_cine = None
            pasos.append(f"5. Dado que la aceleración es nula, no hay cambio de velocidad.")
        else:
            t_cine = (vf - v0) / a
            d_cine = (vf**2 - v0**2) / (2 * a)
            pasos.append(f"5. Análisis Cinemático para alcanzar la velocidad objetivo ({vf:.1f} m/s) desde {v0:.1f} m/s:")
            pasos.append(f"   Tiempo necesario: t = (vf - v0) / a = ({vf:.1f} - {v0:.1f}) / {a:.4f} = {t_cine:.3f} s")
            pasos.append(f"   Distancia recorrida por cada bloque: d = (vf² - v0²) / (2·a) = ({vf:.1f}² - {v0:.1f}²) / (2 · {a:.4f}) = {d_cine:.3f} m")

        conclusion = f"El sistema de Atwood se acelera a {abs(a):.2f} m/s² con una tensión de {Tension:.2f} N en el cable."
        if t_cine is not None and t_cine >= 0:
            conclusion += f" Transiciona a {vf:.1f} m/s en {t_cine:.2f} s recorriendo {abs(d_cine):.2f} m."

        return {
            "caso": "D",
            "incognitas": {
                "peso": round(P1, 2),
                "normal": round(P2, 2),
                "friccion": 0.0,
                "aceleracion": round(a, 4),
                "tension": round(Tension, 2),
                "tiempo_freno": round(t_cine, 3) if t_cine is not None else None,
                "distancia_freno": round(d_cine, 3) if d_cine is not None else None,
                "posicion_final": round(d_cine, 3) if d_cine is not None else None,
            },
            "procedimiento": pasos,
            "conclusion": conclusion
        }

    def _resolver_caso_e(self, p):
        """
        Caso E: Ascenso Límite de Carga (Camión en Pendiente)
        """
        try:
            m = float(p.get('masa', 8000.0))
            inclinacion = float(p.get('inclinacion', 8.0))
            mu_k = float(p.get('friccion', 0.1))
            fuerza_motor = float(p.get('fuerza', 20000.0))
            v0 = float(p.get('v_inicial', 0.0))
            vf = float(p.get('v_final', 15.0))
        except (ValueError, TypeError):
            return {"error": "Parámetros de entrada inválidos para el Caso E."}

        if m <= 0:
            return {"error": "La masa debe ser estrictamente mayor a 0 kg."}

        theta_rad = (inclinacion * math.pi) / 180.0
        Normal = m * self.g * math.cos(theta_rad)
        f_k = mu_k * Normal
        P_x = m * self.g * math.sin(theta_rad)
        
        # Fuerza neta ascendente
        F_neta = fuerza_motor - f_k - P_x
        a = F_neta / m

        pasos = []
        pasos.append("DATOS IDENTIFICADOS DEL PROBLEMA:")
        pasos.append(f"  • Masa del camión (m): {m:.2f} kg")
        pasos.append(f"  • Ángulo de inclinación de la pendiente (θ): {inclinacion:.2f}°")
        pasos.append(f"  • Coeficiente de fricción cinética (μk): {mu_k:.2f}")
        pasos.append(f"  • Fuerza del motor (F_motor): {fuerza_motor:.2f} N")
        pasos.append(f"  • Velocidad inicial (v₀): {v0:.2f} m/s")
        pasos.append(f"  • Velocidad final objetivo (vf): {vf:.2f} m/s")
        pasos.append(f"  • Aceleración de la gravedad (g): 9.81 m/s²")
        pasos.append("")
        pasos.append("DESGLOSE ANALÍTICO PASO A PASO:")
        pasos.append(f"1. Cálculo de la Fuerza Normal sobre la pendiente:")
        pasos.append(f"   N = m · g · cos(θ) = {m:.1f} · 9.81 · cos({inclinacion:.1f}°) = {Normal:.2f} N")
        pasos.append(f"2. Cálculo de la Fuerza de Fricción Dinámica que se opone:")
        pasos.append(f"   fk = μk · N = {mu_k:.4f} · {Normal:.2f} = {f_k:.2f} N")
        pasos.append(f"3. Componente paralela del Peso (resistencia por gravedad):")
        pasos.append(f"   Px = m · g · sen(θ) = {m:.1f} · 9.81 · sen({inclinacion:.1f}°) = {P_x:.2f} N")
        pasos.append(f"4. Fuerza Neta total en sentido ascendente:")
        pasos.append(f"   ΣFx = F_motor - fk - Px = {fuerza_motor:.1f} - {f_k:.1f} - {P_x:.1f} = {F_neta:.2f} N")
        
        if a < 0:
            pasos.append(f"   a = ΣFx / m = {F_neta:.2f} / {m:.1f} = {a:.4f} m/s² (El signo negativo indica que la fuerza del motor es insuficiente y el vehículo desacelera)")
        else:
            pasos.append(f"   a = ΣFx / m = {F_neta:.2f} / {m:.1f} = {a:.4f} m/s² (El signo positivo indica una aceleración a favor de la subida)")

        # Cinemática de transición
        if abs(a) < 1e-6:
            t_cine = None
            d_cine = None
            pasos.append(f"5. La aceleración es prácticamente nula. Velocidad constante.")
        else:
            t_cine = (vf - v0) / a
            d_cine = (vf**2 - v0**2) / (2 * a)
            pasos.append(f"5. Aplicando cinemática para pasar de v0 = {v0:.1f} m/s a vf = {vf:.1f} m/s:")
            pasos.append(f"   Tiempo requerido: t = (vf - v0) / a = ({vf:.1f} - {v0:.1f}) / ({a:.4f}) = {t_cine:.3f} s")
            pasos.append(f"   Distancia recorrida: d = (vf² - v0²) / (2·a) = ({vf:.1f}² - {v0:.1f}²) / (2 · {a:.4f}) = {d_cine:.3f} m")

        if t_cine is not None and t_cine >= 0:
            conclusion = f"¡Ascenso exitoso! El vehículo logra acelerar hasta {vf:.1f} m/s en {t_cine:.2f} s recorriendo {d_cine:.2f} m."
        elif t_cine is not None and t_cine < 0:
            conclusion = "La fuerza del motor es insuficiente para alcanzar la velocidad deseada. El vehículo retrocederá o desacelerará."
        else:
            conclusion = "El camión continúa a velocidad constante en la rampa."

        return {
            "caso": "E",
            "incognitas": {
                "peso": round(m * self.g, 2),
                "normal": round(Normal, 2),
                "friccion": round(f_k, 2),
                "aceleracion": round(a, 4),
                "tiempo_freno": round(t_cine, 3) if (t_cine is not None and t_cine >= 0) else None,
                "distancia_freno": round(d_cine, 3) if (d_cine is not None and d_cine >= 0) else None,
                "posicion_final": round(d_cine, 3) if (d_cine is not None and d_cine >= 0) else None,
            },
            "procedimiento": pasos,
            "conclusion": conclusion
        }

    def _resolver_caso_f(self, p):
        """
        Caso F: Curva Peraltada y Adherencia Límite (Fuerza Centrípeta y Derrape)
        """
        try:
            m = float(p.get('masa', 1200.0))
            R = float(p.get('radio_curva', 80.0))
            inclinacion = float(p.get('inclinacion', 10.0))
            mu_s = float(p.get('friccion_estatica', 0.8))
            mu_k = float(p.get('friccion', 0.4))
            fuerza = float(p.get('fuerza', 4000.0))
            v0 = float(p.get('v_inicial', 25.0))
            vf = float(p.get('v_final', 15.0))
            tipo_mov = p.get('tipo_movimiento', 'Frenado')
        except (ValueError, TypeError):
            return {"error": "Parámetros de entrada inválidos para el Caso F."}

        if m <= 0:
            return {"error": "La masa debe ser estrictamente mayor a 0 kg."}
        if R <= 0:
            return {"error": "El radio de la curva debe ser estrictamente mayor a 0 m."}
        if mu_s < 0 or mu_k < 0:
            return {"error": "Los coeficientes de fricción no pueden ser negativos."}
        if inclinacion < 0 or inclinacion > 45:
            return {"error": "El peralte debe estar entre 0° y 45°."}

        theta_rad = (inclinacion * math.pi) / 180.0
        tan_theta = math.tan(theta_rad)
        cos_theta = math.cos(theta_rad)
        sin_theta = math.sin(theta_rad)

        denom_max = 1.0 - mu_s * tan_theta
        if denom_max > 1e-4:
            v_max = math.sqrt(self.g * R * (tan_theta + mu_s) / denom_max)
        else:
            v_max = float('inf')

        if tan_theta > mu_s:
            v_min = math.sqrt(self.g * R * (tan_theta - mu_s) / (1.0 + mu_s * tan_theta))
        else:
            v_min = 0.0

        v_ideal = math.sqrt(self.g * R * tan_theta)

        Normal = m * (self.g * cos_theta + (v0 ** 2) / R * sin_theta)
        fs_req = m * ((v0 ** 2) / R * cos_theta - self.g * sin_theta)
        fs_max = mu_s * Normal

        se_desliza = False
        tipo_deslizamiento = ""
        if v0 > v_max:
            se_desliza = True
            tipo_deslizamiento = "derrape"
        elif v0 < v_min:
            se_desliza = True
            tipo_deslizamiento = "deslizamiento"

        pasos = []
        pasos.append("DATOS IDENTIFICADOS DEL PROBLEMA:")
        pasos.append(f"  • Masa del vehículo (m): {m:.2f} kg")
        pasos.append(f"  • Radio de la curva (R): {R:.2f} m")
        pasos.append(f"  • Ángulo de peralte (θ): {inclinacion:.2f}°")
        pasos.append(f"  • Coeficiente de fricción estática (μs): {mu_s:.2f}")
        pasos.append(f"  • Coeficiente de fricción cinética (μk): {mu_k:.2f}")
        pasos.append(f"  • Fuerza tangencial aplicada (F): {fuerza:.2f} N")
        pasos.append(f"  • Velocidad inicial (v₀): {v0:.2f} m/s")
        pasos.append(f"  • Velocidad final objetivo (vf): {vf:.2f} m/s")
        pasos.append(f"  • Aceleración de la gravedad (g): 9.81 m/s²")
        pasos.append("")
        pasos.append("DESGLOSE ANALÍTICO PASO A PASO:")
        pasos.append(f"1. Cálculo de límites de velocidad seguros para adherencia lateral (R = {R:.1f} m, θ = {inclinacion:.1f}°, μs = {mu_s:.2f}):")
        if v_max != float('inf'):
            pasos.append(f"   v_max = √[ g · R · (tan(θ) + μs) / (1 - μs · tan(θ)) ] = √[ 9.81 · {R:.1f} · ({tan_theta:.4f} + {mu_s:.2f}) / (1 - {mu_s:.2f} · {tan_theta:.4f}) ] = {v_max:.2f} m/s")
        else:
            pasos.append(f"   v_max = Infinito (El peralte evita el derrape exterior a cualquier velocidad)")
            
        if tan_theta > mu_s:
            pasos.append(f"   v_min = √[ g · R · (tan(θ) - μs) / (1 + μs · tan(θ)) ] = √[ 9.81 · {R:.1f} · ({tan_theta:.4f} - {mu_s:.2f}) / (1 + {mu_s:.2f} · {tan_theta:.4f}) ] = {v_min:.2f} m/s")
        else:
            pasos.append(f"   Como tan(θ) ({tan_theta:.4f}) <= μs ({mu_s:.2f}), el vehículo no deslizará hacia adentro en reposo. v_min = 0.00 m/s")
            
        pasos.append(f"   Velocidad ideal (sin fricción lateral): v_ideal = √[ g · R · tan(θ) ] = {v_ideal:.2f} m/s")

        pasos.append(f"2. Análisis dinámico en las condiciones iniciales (v0 = {v0:.2f} m/s):")
        pasos.append(f"   Fuerza Normal perpendicular al peralte: N = m · (g · cos(θ) + v0²/R · sen(θ))")
        pasos.append(f"   N = {m:.1f} · (9.81 · cos({inclinacion:.1f}°) + {v0:.1f}²/{R:.1f} · sen({inclinacion:.1f}°)) = {Normal:.2f} N")
        pasos.append(f"   Fuerza de fricción estática lateral requerida: fs_req = m · (v0²/R · cos(θ) - g · sen(θ))")
        pasos.append(f"   fs_req = {m:.1f} · ({v0:.1f}²/{R:.1f} · cos({inclinacion:.1f}°) - 9.81 · sen({inclinacion:.1f}°)) = {fs_req:.2f} N")
        pasos.append(f"   Fricción estática máxima disponible: fs_max = μs · N = {mu_s:.2f} · {Normal:.2f} = {fs_max:.2f} N")

        if se_desliza:
            if tipo_deslizamiento == "derrape":
                conclusion = f"¡DERRAPE! La velocidad inicial (v0 = {v0:.2f} m/s) supera la velocidad máxima permitida (v_max = {v_max:.2f} m/s). El vehículo derrapa hacia el exterior de la curva."
            else:
                conclusion = f"¡DESLIZAMIENTO! La velocidad inicial (v0 = {v0:.2f} m/s) es inferior a la velocidad mínima (v_min = {v_min:.2f} m/s). El vehículo desliza hacia el interior."

            return {
                "caso": "F",
                "incognitas": {
                    "normal": round(Normal, 2),
                    "friccion_lateral": round(fs_req, 2),
                    "aceleracion": 0.0,
                    "v_ideal": round(v_ideal, 2),
                    "v_min": round(v_min, 2),
                    "v_max": round(v_max, 2) if v_max != float('inf') else 999.0,
                    "se_desliza": True,
                    "tiempo_freno": None,
                    "distancia_freno": None,
                    "posicion_final": None,
                    "logra_detenerse": False
                },
                "procedimiento": pasos,
                "conclusion": conclusion
            }

        pasos.append(f"   Como |fs_req| ({abs(fs_req):.2f} N) <= fs_max ({fs_max:.2f} N), el vehículo se mantiene estable en la curva.")

        fk = mu_k * Normal
        if tipo_mov == 'Frenado':
            F_neta_t = -(fuerza + fk)
        else:
            F_neta_t = fuerza - fk
        a = F_neta_t / m

        pasos.append(f"3. Ecuación del movimiento tangencial (Fricción calzada μk = {mu_k:.2f}):")
        pasos.append(f"   Fuerza de fricción cinética tangencial: fk = μk · N = {mu_k:.2f} · {Normal:.2f} = {fk:.2f} N")
        if tipo_mov == 'Frenado':
            pasos.append(f"   ΣFt = -(F_frenado + fk) = -({fuerza:.1f} + {fk:.1f}) = {F_neta_t:.2f} N")
        else:
            pasos.append(f"   ΣFt = F_motor - fk = {fuerza:.1f} - {fk:.1f} = {F_neta_t:.2f} N")
        pasos.append(f"   Aceleración tangencial: a = ΣFt / m = {F_neta_t:.2f} / {m:.1f} = {a:.4f} m/s²")

        if abs(a) < 1e-6:
            t_cine = None
            d_cine = None
            pasos.append(f"4. La aceleración es prácticamente nula. Velocidad constante en la curva.")
            conclusion = f"El vehículo se desplaza por la curva a velocidad constante de {v0:.2f} m/s."
        else:
            t_cine = (vf - v0) / a
            d_cine = (vf**2 - v0**2) / (2 * a)
            pasos.append(f"4. Aplicando cinemática tangencial para transicionar de v0 = {v0:.1f} m/s a vf = {vf:.1f} m/s:")
            pasos.append(f"   Tiempo requerido: t = (vf - v0) / a = ({vf:.1f} - {v0:.1f}) / ({a:.4f}) = {t_cine:.3f} s")
            pasos.append(f"   Distancia recorrida: d = (vf² - v0²) / (2·a) = ({vf:.1f}² - {v0:.1f}²) / (2 · {a:.4f}) = {d_cine:.3f} m")

        if t_cine is not None and t_cine >= 0:
            conclusion = f"¡Transición exitosa! El vehículo recorre {d_cine:.2f} m a lo largo de la curva en {t_cine:.2f} s sin derrapar, transicionando a {vf:.1f} m/s."
        elif t_cine is not None and t_cine < 0:
            conclusion = "La cinemática es incompatible con las velocidades deseadas y el sentido de la aceleración."
        else:
            conclusion = "El vehículo mantiene velocidad constante en la curva."

        return {
            "caso": "F",
            "incognitas": {
                "normal": round(Normal, 2),
                "friccion_lateral": round(fs_req, 2),
                "aceleracion": round(a, 4),
                "v_ideal": round(v_ideal, 2),
                "v_min": round(v_min, 2),
                "v_max": round(v_max, 2) if v_max != float('inf') else 999.0,
                "se_desliza": False,
                "tiempo_freno": round(t_cine, 3) if (t_cine is not None and t_cine >= 0) else None,
                "distancia_freno": round(d_cine, 3) if (d_cine is not None and d_cine >= 0) else None,
                "posicion_final": round(d_cine, 3) if (d_cine is not None and d_cine >= 0) else None,
                "logra_detenerse": (tipo_mov == 'Frenado' and vf == 0.0)
            },
            "procedimiento": pasos,
            "conclusion": conclusion
        }
