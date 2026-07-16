from rest_framework import serializers
from .models import SimulationRecord

class SimulationRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationRecord
        fields = (
            'id', 'fecha', 'escenario', 'masa', 'fuerza', 'friccion',
            'altura', 'clima', 'velocidad_inicial', 'resistencia_aire', 'inclinacion',
            'aceleracion_promedio', 'tiempo_total', 'distancia_recorrida',
            'masa_2', 'friccion_estatica', 'perfil_fuerza'
        )
        read_only_fields = ('id', 'fecha')

class SimulationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationRecord
        fields = (
            'escenario', 'masa', 'fuerza', 'friccion',
            'altura', 'clima', 'velocidad_inicial', 'resistencia_aire', 'inclinacion',
            'masa_2', 'friccion_estatica', 'perfil_fuerza'
        )
        extra_kwargs = {
            'altura': {'required': False, 'allow_null': True},
            'clima': {'required': False, 'allow_blank': True},
            'velocidad_inicial': {'required': False},
            'resistencia_aire': {'required': False},
            'inclinacion': {'required': False},
            'masa_2': {'required': False, 'allow_null': True},
            'friccion_estatica': {'required': False, 'allow_null': True},
            'perfil_fuerza': {'required': False},
        }
