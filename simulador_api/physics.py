# -*- coding: utf-8 -*-
"""
Módulo: physics.py (Dentro de simulador_api)
Descripción: Motor físico que implementa la Segunda Ley de Newton para escenarios
             reales con simulación por diferencias finitas (método de Euler).
             Soporta Automóvil, Camión, Motocicleta, Elevador y Avión (con sustentación).
"""
import math

class PhysicsError(Exception):
    """Excepción para errores físicos en la simulación."""
    pass


class PhysicsEngine:
    def __init__(self):
        self.g = 9.81
        self.densidad_aire = 1.225  # kg/m^3 (nivel del mar)

    def simular_paso(self, escenario, masa, fuerza, friccion, v_inicial, t_actual, x_actual, v_actual, dt=0.05, **kwargs):
        """
        Método unificado para simular un paso temporal usando diferencias finitas.
        """
        if masa <= 0:
            raise PhysicsError("La masa debe ser estrictamente mayor a 0 kg para cumplir con la Segunda Ley de Newton.")
        if fuerza < 0:
            raise PhysicsError("La magnitud de la fuerza no puede ser negativa.")
        if friccion < 0:
            raise PhysicsError("El coeficiente de fricción o arrastre no puede ser negativo.")

        escenario_lower = escenario.lower()
        modo = kwargs.get('modo', 'Aceleracion')  # 'Aceleracion' o 'Frenado'
        
        if 'avion' in escenario_lower:
            return self._simular_avion(masa, fuerza, friccion, t_actual, x_actual, v_actual, dt, **kwargs)
        elif 'elevador' in escenario_lower or 'ascensor' in escenario_lower:
            altura_max = float(kwargs.get('altura_max', 100.0))
            return self._simular_elevador(masa, fuerza, friccion, t_actual, x_actual, v_actual, dt, altura_max)
        elif 'curva' in escenario_lower:
            return self._simular_curva(masa, fuerza, friccion, v_inicial, t_actual, x_actual, v_actual, dt, modo, **kwargs)
        else:
            # Automóvil, Camión, Motocicleta (Movimiento Terrestre)
            return self._simular_vehiculo_terrestre(escenario, masa, fuerza, friccion, v_inicial, t_actual, x_actual, v_actual, dt, modo, **kwargs)

    def _simular_vehiculo_terrestre(self, escenario, masa, fuerza, friccion, v_inicial, t_actual, x_actual, v_actual, dt, modo, **kwargs):
        cd_a = float(kwargs.get('resistencia_aire', 0.3))
        inclinacion = float(kwargs.get('inclinacion', 0.0))
        theta = (inclinacion * 3.141592653589793) / 180.0
        
        # Si ya se detuvo en modo frenado o fricción excesiva
        if modo == 'Frenado' and v_actual <= 1e-4:
            return {
                "t": t_actual,
                "x": x_actual,
                "v": 0.0,
                "a": 0.0,
                "fuerzas": {
                    "Traccion": 0.0,
                    "Peso": -masa * self.g,
                    "Normal": masa * self.g * math.cos(theta),
                    "Frenado": 0.0,
                    "Friccion": 0.0,
                    "Resistencia Aire": 0.0,
                    "Fuerza Neta": 0.0
                },
                "explicacion": f"El vehículo ({escenario}) está completamente detenido.",
                "terminado": True
            }

        Normal = masa * self.g * math.cos(theta)
        fk = friccion * Normal
        
        # Componente del peso paralela a la rampa
        P_x = masa * self.g * math.sin(theta)
        
        # Resistencia aerodinámica
        F_drag = 0.5 * self.densidad_aire * cd_a * (v_actual ** 2)
        
        if modo == 'Frenado':
            F_neta = -(fuerza + fk + F_drag) - P_x
        else:
            F_neta = fuerza - (fk + F_drag) - P_x

        a = F_neta / masa
        v_siguiente = v_actual + a * dt
        
        # Evitar retroceso involuntario o velocidad negativa
        terminado = False
        if modo == 'Frenado' and v_siguiente <= 0.0:
            v_siguiente = 0.0
            a = 0.0
            terminado = True
        elif modo == 'Aceleracion' and v_siguiente < 0.0:
            v_siguiente = 0.0
            a = 0.0
        
        x_siguiente = x_actual + v_actual * dt + 0.5 * a * (dt ** 2)
        if x_siguiente < 0:
            x_siguiente = 0.0
            v_siguiente = 0.0
            a = 0.0

        t_siguiente = t_actual + dt
        
        slope_text = f" en rampa de {inclinacion:.1f}°" if abs(inclinacion) > 0.01 else ""
        if modo == 'Frenado':
            explicacion = (
                f"Frenando{slope_text}.\n"
                f"Frenado = -{fuerza:.1f} N. Fricción = -{fk:.1f} N. Gravedad = -{P_x:.1f} N.\n"
                f"Fuerza Neta ΣFx = {F_neta:.1f} N. Aceleración = {a:.2f} m/s²."
            )
        else:
            explicacion = (
                f"Acelerando{slope_text}.\n"
                f"Motor = {fuerza:.1f} N. Fricción = -{fk:.1f} N. Gravedad = -{P_x:.1f} N.\n"
                f"Fuerza Neta ΣFx = {F_neta:.1f} N. Aceleración = {a:.2f} m/s²."
            )

        return {
            "t": t_siguiente,
            "x": x_siguiente,
            "v": v_siguiente,
            "a": a,
            "fuerzas": {
                "Traccion": fuerza if modo == 'Aceleracion' else 0.0,
                "Peso": -masa * self.g,
                "Normal": Normal,
                "Frenado": -fuerza if modo == 'Frenado' else 0.0,
                "Friccion": -fk,
                "Resistencia Aire": -F_drag,
                "Fuerza Neta": F_neta
            },
            "explicacion": explicacion,
            "terminado": terminado or (x_siguiente >= 800.0)
        }

    def _simular_curva(self, masa, fuerza, friccion, v_inicial, t_actual, x_actual, v_actual, dt, modo, **kwargs):
        mu_s = float(kwargs.get('friccion_estatica', 0.8))
        cd_a = float(kwargs.get('resistencia_aire', 0.3))
        peralte = float(kwargs.get('inclinacion', 10.0))
        R = float(kwargs.get('radio_curva', 80.0))
        
        theta = (peralte * 3.141592653589793) / 180.0
        tan_theta = math.tan(theta)
        
        # Límites de velocidad seguros
        denom_max = 1.0 - mu_s * tan_theta
        if denom_max > 1e-4:
            v_max = math.sqrt(self.g * R * (tan_theta + mu_s) / denom_max)
        else:
            v_max = 999.0
            
        if tan_theta > mu_s:
            v_min = math.sqrt(self.g * R * (tan_theta - mu_s) / (1.0 + mu_s * tan_theta))
        else:
            v_min = 0.0
            
        if v_actual > v_max:
            Normal = masa * (self.g * math.cos(theta) + (v_actual ** 2) / R * math.sin(theta))
            return {
                "t": t_actual,
                "x": x_actual,
                "v": v_actual,
                "a": 0.0,
                "fuerzas": {
                    "Traccion": 0.0,
                    "Peso": -masa * self.g,
                    "Normal": Normal,
                    "Frenado": 0.0,
                    "Friccion": 0.0,
                    "Resistencia Aire": 0.0,
                    "Fuerza Neta": 0.0
                },
                "explicacion": f"¡DERRAPE! El vehículo derrapó hacia el exterior de la curva por exceso de velocidad (v = {v_actual:.2f} m/s > v_máx = {v_max:.2f} m/s).",
                "terminado": True,
                "derrapado": True
            }
            
        if v_actual < v_min:
            Normal = masa * (self.g * math.cos(theta) + (v_actual ** 2) / R * math.sin(theta))
            return {
                "t": t_actual,
                "x": x_actual,
                "v": v_actual,
                "a": 0.0,
                "fuerzas": {
                    "Traccion": 0.0,
                    "Peso": -masa * self.g,
                    "Normal": Normal,
                    "Frenado": 0.0,
                    "Friccion": 0.0,
                    "Resistencia Aire": 0.0,
                    "Fuerza Neta": 0.0
                },
                "explicacion": f"¡DESLIZAMIENTO! La velocidad es insuficiente para sostener el vehículo en el peralte (v = {v_actual:.2f} m/s < v_mín = {v_min:.2f} m/s) y resbaló hacia adentro.",
                "terminado": True,
                "deslizado": True
            }
            
        Normal = masa * (self.g * math.cos(theta) + (v_actual ** 2) / R * math.sin(theta))
        fk = friccion * Normal
        F_drag = 0.5 * self.densidad_aire * cd_a * (v_actual ** 2)
        
        if modo == 'Frenado':
            F_neta = -(fuerza + fk + F_drag)
        else:
            F_neta = fuerza - (fk + F_drag)
            
        a = F_neta / masa
        v_siguiente = v_actual + a * dt
        
        terminado = False
        if modo == 'Frenado' and v_siguiente <= 0.0:
            v_siguiente = 0.0
            a = 0.0
            terminado = True
        elif modo == 'Aceleracion' and v_siguiente < 0.0:
            v_siguiente = 0.0
            a = 0.0
            
        x_siguiente = x_actual + v_actual * dt + 0.5 * a * (dt ** 2)
        if x_siguiente < 0:
            x_siguiente = 0.0
            v_siguiente = 0.0
            a = 0.0
            
        t_siguiente = t_actual + dt
        fs_req = masa * ((v_actual ** 2) / R * math.cos(theta) - self.g * math.sin(theta))
        
        explicacion = (
            f"Curva de R = {R:.1f} m y Peralte = {peralte:.1f}°.\n"
            f"Fuerza = {fuerza:.1f} N. Fricción lateral requerida = {abs(fs_req):.1f} N.\n"
            f"Límites seguros: v_min = {v_min:.1f} m/s, v_max = {v_max:.1f} m/s.\n"
            f"Fuerza Neta = {F_neta:.1f} N. Aceleración = {a:.2f} m/s²."
        )
        
        return {
            "t": t_siguiente,
            "x": x_siguiente,
            "v": v_siguiente,
            "a": a,
            "fuerzas": {
                "Traccion": fuerza if modo == 'Aceleracion' else 0.0,
                "Peso": -masa * self.g,
                "Normal": Normal,
                "Frenado": -fuerza if modo == 'Frenado' else 0.0,
                "Friccion": -fk,
                "Resistencia Aire": -F_drag,
                "Fuerza Neta": F_neta,
                "FriccionLateral": fs_req
            },
            "explicacion": explicacion,
            "terminado": terminado or (x_siguiente >= 800.0)
        }

    def _simular_elevador(self, masa, tension, b, t_actual, y_actual, v_actual, dt, altura_max):
        Peso = masa * self.g
        # Resistencia viscosa del aire b * v
        F_aire = -b * v_actual
        F_neta = tension - Peso + F_aire
        a = F_neta / masa
        
        v_siguiente = v_actual + a * dt
        y_siguiente = y_actual + v_actual * dt + 0.5 * a * (dt ** 2)
        t_siguiente = t_actual + dt
        
        terminado = False
        explicacion = ""
        
        if y_siguiente <= 0.0:
            y_siguiente = 0.0
            v_siguiente = 0.0
            a = 0.0
            terminado = True
            explicacion = "El elevador ha llegado al suelo (y = 0m)."
        elif y_siguiente >= altura_max:
            y_siguiente = altura_max
            v_siguiente = 0.0
            a = 0.0
            terminado = True
            explicacion = f"El elevador ha alcanzado el límite superior de la torre ({altura_max}m)."
        else:
            direccion = "subiendo" if v_siguiente > 1e-3 else ("bajando" if v_siguiente < -1e-3 else "estacionario")
            explicacion = (
                f"Elevador {direccion}.\n"
                f"Tensión del Cable T = {tension:.1f} N. Peso P = {Peso:.1f} N. "
                f"Resistencia del Aire = {F_aire:.1f} N.\n"
                f"Fuerza Neta ΣFy = {F_neta:.1f} N. Aceleración a = {a:.2f} m/s²."
            )
            
        return {
            "t": t_siguiente,
            "x": y_siguiente,
            "v": v_siguiente,
            "a": a,
            "fuerzas": {
                "Tension": tension,
                "Peso": -Peso,
                "Resistencia Aire": F_aire,
                "Fuerza Neta": F_neta
            },
            "explicacion": explicacion,
            "terminado": terminado
        }

    def _simular_avion(self, masa, empuje, mu, t_actual, x_actual, v_actual, dt, **kwargs):
        cl = float(kwargs.get('sustentacion_coef', 0.5))
        b = float(kwargs.get('resistencia_aire', 0.15))
        inclinacion = float(kwargs.get('inclinacion', 0.0))
        theta = (inclinacion * 3.141592653589793) / 180.0
        
        y_actual = float(kwargs.get('y_actual', 0.0))
        v_y_actual = float(kwargs.get('v_y_actual', 0.0))
        
        Peso = masa * self.g
        Sustentacion = cl * (v_actual ** 2)
        
        P_y = Peso * math.cos(theta)
        despego = Sustentacion >= P_y
        
        if not despego:
            Normal = P_y - Sustentacion
            f_rodadura = mu * Normal
            estado = "Rodando en pista"
            a_y = 0.0
            v_y_siguiente = 0.0
            y_siguiente = 0.0
        else:
            Normal = 0.0
            f_rodadura = 0.0
            estado = "¡VUELO! El avión ha despegado"
            
            # Dinámica de ascenso vertical
            F_y_neta = Sustentacion - P_y - 0.2 * b * v_y_actual
            a_y = F_y_neta / masa
            v_y_siguiente = v_y_actual + a_y * dt
            if v_y_siguiente < -10.0: v_y_siguiente = -10.0
            y_siguiente = y_actual + v_y_actual * dt + 0.5 * a_y * (dt ** 2)
            if y_siguiente < 0.0:
                y_siguiente = 0.0
                v_y_siguiente = 0.0

        # Componente de gravedad a lo largo de la rampa
        P_x = Peso * math.sin(theta)
        D = b * (v_actual ** 2)
        
        F_neta = empuje - f_rodadura - D - P_x
        a = F_neta / masa
        
        v_siguiente = v_actual + a * dt
        if v_siguiente < 0:
            v_siguiente = 0.0
            a = 0.0
            
        x_siguiente = x_actual + v_actual * dt + 0.5 * a * (dt ** 2)
        t_siguiente = t_actual + dt
        
        slope_text = f" en rampa de {inclinacion:.1f}°" if abs(inclinacion) > 0.01 else ""
        explicacion = (
            f"Fase: {estado}{slope_text}.\n"
            f"Empuje = {empuje:.1f} N. Sustentación = {Sustentacion:.1f} N (Gravedad: {P_y:.1f} N).\n"
            f"Fricción = -{f_rodadura:.1f} N. Arrastre = -{D:.1f} N. Pendiente = -{P_x:.1f} N.\n"
            f"Fuerza Neta ΣFx = {F_neta:.1f} N. Aceleración = {a:.2f} m/s²."
        )
        
        terminado = False
        if despego and (x_siguiente >= 1000.0 or v_siguiente > 120.0 or y_siguiente >= 200.0):
            terminado = True
            explicacion = "Despegue completado con éxito. Altitud y velocidad seguras de ascenso."

        return {
            "t": t_siguiente,
            "x": x_siguiente,
            "y": y_siguiente,
            "v": v_siguiente,
            "a": a,
            "v_y": v_y_siguiente,
            "a_y": a_y,
            "despego": despego,
            "sustentacion": Sustentacion,
            "fuerzas": {
                "Empuje": empuje,
                "Peso": -Peso,
                "Sustentacion": Sustentacion,
                "Normal": Normal,
                "Friccion": -f_rodadura,
                "Resistencia Aire": -D,
                "Fuerza Neta": F_neta
            },
            "explicacion": explicacion,
            "terminado": terminado
        }
