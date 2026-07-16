# -*- coding: utf-8 -*-
"""
Módulo: simulador_core.py
Descripción: Motor físico del simulador de la Segunda Ley de Newton. 
             Calcula el movimiento paso a paso utilizando diferencias finitas
             (método de Euler semi-implícito) para dos escenarios de ingeniería.
"""

import math

class PhysicsError(Exception):
    """Excepción personalizada para errores de coherencia física."""
    pass

class SimuladorCore:
    def __init__(self):
        # Aceleración de la gravedad estándar (m/s^2)
        self.g = 9.81

    def simular_paso_automotriz(self, masa, v_inicial, F_frenado, mu, t_actual, x_actual, v_actual, dt=0.05):
        """
        Calcula un paso de simulación para el frenado de un camión (plano horizontal).
        
        Parámetros:
            masa (float): Masa del camión (kg). Debe ser > 0.
            v_inicial (float): Velocidad inicial (m/s).
            F_frenado (float): Fuerza constante aplicada por los frenos (N).
            mu (float): Coeficiente de fricción cinética de la superficie.
            t_actual (float): Tiempo actual en segundos (s).
            x_actual (float): Posición actual en metros (m).
            v_actual (float): Velocidad actual en m/s.
            dt (float): Diferencial de tiempo continuo (s).
            
        Retorna:
            dict: Estado actualizado con posición, velocidad, aceleración, fuerzas y explicación.
        """
        # Validación de física básica (Segunda Ley de Newton)
        if masa <= 0:
            raise PhysicsError("Según la física clásica, la masa debe ser estrictamente mayor que cero (m > 0 kg).")
        if F_frenado < 0:
            raise PhysicsError("La fuerza de frenado no puede ser negativa.")
        if mu < 0:
            raise PhysicsError("El coeficiente de fricción no puede ser negativo.")
        if v_inicial < 0:
            raise PhysicsError("La velocidad inicial de movimiento debe ser positiva o cero en este modelo.")

        # Si el camión ya está detenido
        if v_actual <= 1e-6:
            return {
                "t": t_actual,
                "x": x_actual,
                "v": 0.0,
                "a": 0.0,
                "fuerzas": {
                    "Peso (m*g)": masa * self.g,
                    "Normal (N)": masa * self.g,
                    "Fuerza de Frenado (Ff)": 0.0,
                    "Fuerza de Fricción (fk)": 0.0,
                    "Fuerza Neta (ΣF)": 0.0
                },
                "explicacion": "El camión se encuentra completamente detenido. La velocidad es 0 m/s.",
                "terminado": True
            }

        # 1. Fuerza Normal (N) en un plano horizontal
        Normal = masa * self.g
        
        # 2. Fuerza de Fricción Cinética (fk = mu * Normal)
        fk = mu * Normal
        
        # 3. Fuerza Neta (ΣF)
        # Ambas fuerzas (frenado y fricción de rodadura/asfalto) se oponen al movimiento.
        # Si la velocidad es positiva (>0), la fuerza neta debe ser negativa para desacelerar.
        F_neta = -(F_frenado + fk)
        
        # 4. Segunda Ley de Newton: Aceleración (a = ΣF / m)
        a = F_neta / masa
        
        # 5. Integración numérica (Euler semi-implícito)
        v_siguiente = v_actual + a * dt
        
        # Control para no retroceder debido a las fuerzas de fricción/frenado
        terminado = False
        if v_siguiente <= 0.0:
            v_siguiente = 0.0
            # Si se detiene en este paso, la aceleración se hace cero
            a = 0.0
            terminado = True
            
        x_siguiente = x_actual + v_siguiente * dt
        t_siguiente = t_actual + dt

        # Redondear valores mínimos
        if x_siguiente < x_actual:
            x_siguiente = x_actual

        explicacion = (
            f"Frenando en asfalto con μ = {mu:.2f}.\n"
            f"Fricción fk = μ * N = {fk:.1f} N. "
            f"Fuerza de Frenado = {F_frenado:.1f} N.\n"
            f"Fuerza Neta ΣF = {F_neta:.1f} N. "
            f"Aceleración a = {a:.2f} m/s²."
        )

        return {
            "t": t_siguiente,
            "x": x_siguiente,
            "v": v_siguiente,
            "a": a,
            "fuerzas": {
                "Peso (m*g)": masa * self.g,
                "Normal (N)": Normal,
                "Fuerza de Frenado (Ff)": -F_frenado,
                "Fuerza de Fricción (fk)": -fk,
                "Fuerza Neta (ΣF)": F_neta
            },
            "explicacion": explicacion,
            "terminado": terminado
        }

    def simular_paso_ascensor(self, masa, tension, b, t_actual, y_actual, v_actual, dt=0.05, altura_max=50.0):
        """
        Calcula un paso de simulación para un ascensor de carga minera (eje vertical).
        
        Parámetros:
            masa (float): Masa total del elevador y la carga (kg). Debe ser > 0.
            tension (float): Fuerza de tensión del cable vertical (N).
            b (float): Coeficiente de fricción del aire (resistencia fluida en N*s/m).
            t_actual (float): Tiempo actual (s).
            y_actual (float): Altura actual en metros (m).
            v_actual (float): Velocidad actual (m/s). Hacia arriba es positivo.
            dt (float): Diferencial de tiempo continuo (s).
            altura_max (float): Altura máxima del pozo o torre (m).
            
        Retorna:
            dict: Estado actualizado con altura, velocidad, aceleración, fuerzas y explicación.
        """
        if masa <= 0:
            raise PhysicsError("Según la física clásica, la masa debe ser estrictamente mayor que cero (m > 0 kg).")
        if tension < 0:
            raise PhysicsError("La tensión del cable no puede ser negativa (los cables solo tiran, no empujan).")
        if b < 0:
            raise PhysicsError("El coeficiente de resistencia del aire no puede ser negativo.")
        if altura_max <= 0:
            raise PhysicsError("La altura máxima de la torre debe ser mayor que cero.")

        # 1. Fuerza de Gravedad (Peso = m * g, hacia abajo)
        Peso = masa * self.g
        
        # 2. Resistencia del aire (Fricción fluida: F_aire = -b * v, se opone a la dirección de v)
        F_aire = -b * v_actual
        
        # 3. Fuerza Neta (ΣF = Tensión - Peso + Fuerza Aire)
        # Tensión tira hacia arriba (+), Peso tira hacia abajo (-), F_aire se opone (-b*v)
        F_neta = tension - Peso + F_aire
        
        # 4. Segunda Ley de Newton: Aceleración (a = ΣF / m)
        a = F_neta / masa
        
        # 5. Integración numérica
        v_siguiente = v_actual + a * dt
        y_siguiente = y_actual + v_siguiente * dt
        t_siguiente = t_actual + dt
        
        terminado = False
        explicacion = ""
        
        # Verificación de colisión / límites físicos
        if y_siguiente <= 0.0:
            y_siguiente = 0.0
            v_siguiente = 0.0
            a = 0.0
            terminado = True
            explicacion = "El ascensor ha colisionado o aterrizado en el suelo (Límite inferior, y = 0 m)."
        elif y_siguiente >= altura_max:
            y_siguiente = altura_max
            v_siguiente = 0.0
            a = 0.0
            terminado = True
            explicacion = f"El ascensor ha alcanzado el límite de seguridad superior de la torre (y = {altura_max:.1f} m)."
        else:
            direccion = "subiendo" if v_siguiente > 1e-4 else ("bajando" if v_siguiente < -1e-4 else "estacionario")
            explicacion = (
                f"Ascensor {direccion}.\n"
                f"Tensión (T) = {tension:.1f} N. Peso (m*g) = {Peso:.1f} N.\n"
                f"Resistencia del Aire (b*v) = {F_aire:.1f} N. "
                f"Aceleración = {a:.2f} m/s²."
            )
            
        return {
            "t": t_siguiente,
            "x": y_siguiente,  # Usamos la clave 'x' de forma generalizada para la posición
            "v": v_siguiente,
            "a": a,
            "fuerzas": {
                "Tensión (T)": tension,
                "Peso (m*g)": -Peso,
                "Resistencia Aire": F_aire,
                "Fuerza Neta (ΣF)": F_neta
            },
            "explicacion": explicacion,
            "terminado": terminado
        }
