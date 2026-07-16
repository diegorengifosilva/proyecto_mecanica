# -*- coding: utf-8 -*-
from django.db import models

class SimulationRecord(models.Model):
    """
    Representa el registro consolidado de un ensayo físico de la Segunda Ley de Newton.
    Guarda las variables físicas de entrada y los resultados finales.
    """
    fecha = models.DateTimeField(auto_now_add=True)
    escenario = models.CharField(max_length=50)  # 'Automotriz' o 'Elevador'
    masa = models.FloatField()  # kg
    fuerza = models.FloatField()  # N (Frenado o Tensión)
    friccion = models.FloatField()  # mu o b
    aceleracion_promedio = models.FloatField()  # m/s^2
    altura = models.FloatField(null=True, blank=True)  # metros, usado en Elevador y Avión
    clima = models.CharField(max_length=30, default='Seco')  # tipo de clima o superficie
    velocidad_inicial = models.FloatField(default=0)  # v0, útil para autos y motos
    resistencia_aire = models.FloatField(default=0)  # coeficiente de arrastre para vehículos aéreos
    inclinacion = models.FloatField(default=0.0)  # grados, inclinación de la rampa/pista (-15 a 30)
    tiempo_total = models.FloatField(default=0.0)  # s, duración total de la simulación
    distancia_recorrida = models.FloatField()  # m
    
    # Campos de Física Avanzada (Fase 2)
    masa_2 = models.FloatField(null=True, blank=True)  # kg, para Máquina de Atwood
    friccion_estatica = models.FloatField(null=True, blank=True)  # mu_s, para umbral de movimiento
    perfil_fuerza = models.CharField(max_length=30, default='Constante')  # perfil de fuerza ('Constante', 'Impulso', 'Rampa', 'Senoidal')
    modo = models.CharField(max_length=20, default='Aceleracion')
    sustentacion_coef = models.FloatField(null=True, blank=True)


    class Meta:
        ordering = ['-fecha']

    def __str__(self):
        return f"Ensayo #{self.id} - {self.escenario} ({self.fecha.strftime('%Y-%m-%d %H:%M')})"
