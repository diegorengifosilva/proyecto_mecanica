# -*- coding: utf-8 -*-
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
from .physics import PhysicsEngine, PhysicsError
from .models import SimulationRecord
from .reports import generar_reporte_txt, generar_reporte_csv, generar_reporte_excel, generar_excel_historial
from .problem_solver import ProblemSolver

problem_solver = ProblemSolver()




physics_engine = PhysicsEngine()

@api_view(['GET'])
def get_scenarios(request):
    """
    Retorna la lista de escenarios soportados con su configuración por defecto,
    límites físicos e iconos.
    """
    scenarios = {
        "Automovil": {
            "nombre": "Automóvil de Pasajeros",
            "icono": "fa-car",
            "descripcion": "Simulación de la dinámica de frenado o aceleración de un coche en carretera.",
            "masa_def": 1500, "masa_min": 500, "masa_max": 4000, "masa_unidad": "kg",
            "fuerza_def": 8000, "fuerza_min": 0, "fuerza_max": 25000, "fuerza_unidad": "N",
            "fuerza_label": "Fuerza de Tracción / Frenado",
            "velocidad_inicial_def": 25, "velocidad_inicial_min": 0, "velocidad_inicial_max": 50,
            "resistencia_aire_def": 0.30, "resistencia_aire_min": 0.1, "resistencia_aire_max": 0.8,
            "climas": {
                "Seco": 0.80,
                "Mojado": 0.50,
                "Hielo": 0.15
            }
        },
        "Camion": {
            "nombre": "Camión de Carga Pesada",
            "icono": "fa-truck",
            "descripcion": "Análisis de inercia y frenado de un vehículo pesado de transporte de mercancías.",
            "masa_def": 8000, "masa_min": 3000, "masa_max": 25000, "masa_unidad": "kg",
            "fuerza_def": 20000, "fuerza_min": 0, "fuerza_max": 60000, "fuerza_unidad": "N",
            "fuerza_label": "Fuerza del Motor / Frenado",
            "velocidad_inicial_def": 20, "velocidad_inicial_min": 0, "velocidad_inicial_max": 40,
            "resistencia_aire_def": 0.60, "resistencia_aire_min": 0.4, "resistencia_aire_max": 1.5,
            "climas": {
                "Seco": 0.70,
                "Mojado": 0.40,
                "Hielo": 0.12
            }
        },
        "Motocicleta": {
            "nombre": "Motocicleta Deportiva",
            "icono": "fa-motorcycle",
            "descripcion": "Simulador de aceleración rápida en un vehículo liviano con alta relación potencia/peso.",
            "masa_def": 250, "masa_min": 100, "masa_max": 600, "masa_unidad": "kg",
            "fuerza_def": 4000, "fuerza_min": 0, "fuerza_max": 12000, "fuerza_unidad": "N",
            "fuerza_label": "Fuerza del Motor / Frenado",
            "velocidad_inicial_def": 0, "velocidad_inicial_min": 0, "velocidad_inicial_max": 40,
            "resistencia_aire_def": 0.45, "resistencia_aire_min": 0.2, "resistencia_aire_max": 1.0,
            "climas": {
                "Seco": 0.85,
                "Mojado": 0.55,
                "Hielo": 0.18
            }
        },
        "Elevador": {
            "nombre": "Elevador / Ascensor Minero",
            "icono": "fa-elevator",
            "descripcion": "Estudio del movimiento vertical en el que compiten la gravedad, la tensión del cable y el fluido.",
            "masa_def": 1200, "masa_min": 200, "masa_max": 6000, "masa_unidad": "kg",
            "fuerza_def": 14000, "fuerza_min": 0, "fuerza_max": 60000, "fuerza_unidad": "N",
            "fuerza_label": "Tensión del Cable (T)",
            "velocidad_inicial_def": 0, "velocidad_inicial_min": -10, "velocidad_inicial_max": 10,
            "altura_max_def": 100, "altura_max_min": 20, "altura_max_max": 300,
            "resistencia_aire_def": 0.80, "resistencia_aire_min": 0.0, "resistencia_aire_max": 5.0,
            "climas": {
                "Vacío": 0.00,
                "Aire": 0.50,
                "Agua (Medio Viscoso)": 5.00
            }
        },
        "Avion": {
            "nombre": "Avión Comercial (Despegue)",
            "icono": "fa-plane",
            "descripcion": "Física de despegue donde la sustentación aerodinámica compensa el peso del avión.",
            "masa_def": 45000, "masa_min": 10000, "masa_max": 150000, "masa_unidad": "kg",
            "fuerza_def": 90000, "fuerza_min": 20000, "fuerza_max": 350000, "fuerza_unidad": "N",
            "fuerza_label": "Empuje de los Turborreactores",
            "velocidad_inicial_def": 0, "velocidad_inicial_min": 0, "velocidad_inicial_max": 20,
            "resistencia_aire_def": 0.15, "resistencia_aire_min": 0.05, "resistencia_aire_max": 0.5,
            "sustentacion_coef_def": 0.5, "sustentacion_coef_min": 0.1, "sustentacion_coef_max": 1.5,
            "climas": {
                "Pista Seca": 0.02,
                "Pista Mojada": 0.05,
                "Pista Nevada": 0.10
            }
        },
        "Curva": {
            "nombre": "Vehículo en Curva Peraltada",
            "icono": "fa-road",
            "descripcion": "Análisis dinámico de fuerza centrípeta, peralte y límites de derrape lateral en curvas de carretera.",
            "masa_def": 1200, "masa_min": 500, "masa_max": 4000, "masa_unidad": "kg",
            "fuerza_def": 4000, "fuerza_min": 0, "fuerza_max": 20000, "fuerza_unidad": "N",
            "fuerza_label": "Fuerza Motor / Frenado",
            "velocidad_inicial_def": 25, "velocidad_inicial_min": 0, "velocidad_inicial_max": 50,
            "resistencia_aire_def": 0.30, "resistencia_aire_min": 0.05, "resistencia_aire_max": 1.0,
            "climas": {
                "Seco": 0.70,
                "Mojado": 0.40,
                "Hielo": 0.15
            }
        }
    }
    return Response(scenarios, status=status.HTTP_200_OK)

@api_view(['POST'])
def simulate_step(request):
    """
    Calcula un paso de simulación física dada una configuración y estado actual.
    """
    data = request.data
    escenario = data.get('escenario', 'Automovil')
    
    try:
        masa = float(data.get('masa', 1.0))
        fuerza = float(data.get('fuerza', 0.0))
        friccion = float(data.get('friccion', 0.0))
        t_actual = float(data.get('t_actual', 0.0))
        x_actual = float(data.get('x_actual', 0.0))
        v_actual = float(data.get('v_actual', 0.0))
        dt = float(data.get('dt', 0.05))
        
        # Parámetros extra
        v_inicial = float(data.get('v_inicial', 0.0))
        resistencia_aire = float(data.get('resistencia_aire', 0.0))
        sustentacion_coef = float(data.get('sustentacion_coef', 0.5))
        altura_max = float(data.get('altura_max', 100.0))
        modo = data.get('modo', 'Aceleracion')
        inclinacion = float(data.get('inclinacion', 0.0))
        radio_curva = float(data.get('radio_curva', 80.0))
        friccion_estatica = float(data.get('friccion_estatica', 0.8))
    except (ValueError, TypeError):
        return Response(
            {"error": "Los parámetros numéricos de entrada son inválidos o faltan."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        resultado = physics_engine.simular_paso(
            escenario=escenario,
            masa=masa,
            fuerza=fuerza,
            friccion=friccion,
            v_inicial=v_inicial,
            t_actual=t_actual,
            x_actual=x_actual,
            v_actual=v_actual,
            dt=dt,
            resistencia_aire=resistencia_aire,
            sustentacion_coef=sustentacion_coef,
            altura_max=altura_max,
            modo=modo,
            inclinacion=inclinacion,
            radio_curva=radio_curva,
            friccion_estatica=friccion_estatica
        )
        return Response(resultado, status=status.HTTP_200_OK)
    except PhysicsError as pe:
        return Response({"error": str(pe)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": f"Error inesperado en simulación: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST'])
def manage_records(request):
    """
    GET: Listar todos los ensayos guardados en el historial (incluyendo los nuevos campos).
    POST: Guardar un nuevo ensayo consolidado en la base de datos.
    """
    if request.method == 'GET':
        records = SimulationRecord.objects.all().order_by('-fecha')
        data_list = []
        for r in records:
            data_list.append({
                "id": r.id,
                "fecha": r.fecha.strftime("%Y-%m-%d %H:%M:%S"),
                "escenario": r.escenario,
                "masa": r.masa,
                "fuerza": r.fuerza,
                "friccion": r.friccion,
                "aceleracion_promedio": r.aceleracion_promedio,
                "tiempo_total": r.tiempo_total,
                "distancia_recorrida": r.distancia_recorrida,
                "altura": r.altura,
                "clima": r.clima,
                "velocidad_inicial": r.velocidad_inicial,
                "resistencia_aire": r.resistencia_aire,
                "inclinacion": r.inclinacion,
                "modo": r.modo,
                "sustentacion_coef": r.sustentacion_coef,
                "masa_2": r.masa_2,
                "friccion_estatica": r.friccion_estatica,
                "perfil_fuerza": r.perfil_fuerza
            })
        return Response(data_list, status=status.HTTP_200_OK)
        
    elif request.method == 'POST':
        data = request.data
        try:
            record = SimulationRecord.objects.create(
                escenario=data.get('escenario'),
                masa=float(data.get('masa')),
                fuerza=float(data.get('fuerza')),
                friccion=float(data.get('friccion')),
                aceleracion_promedio=float(data.get('aceleracion_promedio')),
                tiempo_total=float(data.get('tiempo_total')),
                distancia_recorrida=float(data.get('distancia_recorrida')),
                altura=float(data.get('altura')) if data.get('altura') is not None else None,
                clima=data.get('clima', 'Seco'),
                velocidad_inicial=float(data.get('velocidad_inicial', 0.0)),
                resistencia_aire=float(data.get('resistencia_aire', 0.0)),
                inclinacion=float(data.get('inclinacion', 0.0)),
                modo=data.get('modo', 'Aceleracion'),
                sustentacion_coef=float(data.get('sustentacion_coef')) if data.get('sustentacion_coef') is not None else None,
                masa_2=float(data.get('masa_2')) if data.get('masa_2') is not None else None,
                friccion_estatica=float(data.get('friccion_estatica')) if data.get('friccion_estatica') is not None else None,
                perfil_fuerza=data.get('perfil_fuerza', 'Constante')
            )
            return Response({
                "id": record.id,
                "mensaje": "Simulación guardada exitosamente en la base de datos."
            }, status=status.HTTP_201_CREATED)
        except (ValueError, TypeError, KeyError) as e:
            return Response(
                {"error": f"Datos faltantes o inválidos para registrar la simulación: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

@api_view(['DELETE'])
def delete_record(request, pk):
    """
    Eliminar un registro específico del historial por su clave primaria.
    """
    try:
        record = SimulationRecord.objects.get(pk=pk)
        record.delete()
        return Response({"mensaje": f"Ensayo #{pk} eliminado correctamente."}, status=status.HTTP_200_OK)
    except SimulationRecord.DoesNotExist:
        return Response({"error": "El registro especificado no existe."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def export_txt(request):
    """
    Recibe la información de un ensayo y su paso a paso, y genera un archivo de texto 
    descargable en el navegador.
    """
    import traceback
    try:
        data = request.data
        info = data.get('info', {})
        pasos = data.get('pasos', [])
        
        contenido_txt = generar_reporte_txt(info, pasos)
        
        response = HttpResponse(contenido_txt, content_type='text/plain; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="reporte_academico_newton.txt"'
        return response
    except Exception as e:
        tb = traceback.format_exc()
        print("ERROR EN EXPORT TXT:")
        print(tb)
        return Response({"error": str(e), "traceback": tb}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def export_csv(request):
    """
    Recibe el paso a paso detallado y genera un archivo CSV descargable en el navegador.
    """
    import traceback
    try:
        data = request.data
        pasos = data.get('pasos', [])
        
        contenido_csv = generar_reporte_csv(pasos)
        
        response = HttpResponse(contenido_csv, content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="datos_paso_a_paso.csv"'
        return response
    except Exception as e:
        tb = traceback.format_exc()
        print("ERROR EN EXPORT CSV:")
        print(tb)
        return Response({"error": str(e), "traceback": tb}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def export_excel(request):
    """
    Recibe la información del ensayo y paso a paso, y genera un archivo Excel estructurado 
    de dos pestañas listo para descargar.
    """
    import traceback
    try:
        data = request.data
        info = data.get('info', {})
        pasos = data.get('pasos', [])
        
        contenido_xlsx = generar_reporte_excel(info, pasos)
        
        response = HttpResponse(
            contenido_xlsx, 
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="reporte_cientifico_newton.xlsx"'
        return response
    except Exception as e:
        tb = traceback.format_exc()
        print("ERROR EN EXPORT EXCEL:")
        print(tb)
        return Response({"error": str(e), "traceback": tb}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def export_history_excel(request):
    """
    Recupera todo el historial de la base de datos y genera el archivo Excel consolidado.
    """
    import traceback
    try:
        records = SimulationRecord.objects.all().order_by('-fecha')
        contenido_xlsx = generar_excel_historial(records)
        
        response = HttpResponse(
            contenido_xlsx,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="historial_completo_simulaciones.xlsx"'
        return response
    except Exception as e:
        tb = traceback.format_exc()
        print("CRITICAL ERROR IN EXPORT HISTORY EXCEL:")
        print(tb)
        return Response({"error": str(e), "traceback": tb}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def solve_problem(request):
    """
    Resuelve el problema de física planteado en base a los parámetros provistos.
    """
    data = request.data
    caso = data.get('caso', 'A')
    params = data.get('params', {})
    
    resultado = problem_solver.resolver(caso, params)
    if "error" in resultado:
        return Response({"error": resultado["error"]}, status=status.HTTP_400_BAD_REQUEST)
        
    return Response(resultado, status=status.HTTP_200_OK)



