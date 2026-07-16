# -*- coding: utf-8 -*-
"""
Módulo: gestor_reportes.py
Descripción: Gestiona el almacenamiento de simulaciones en una base de datos SQLite,
             un registro histórico consolidado en CSV, y la exportación de reportes 
             detallados paso a paso (TXT y CSV) para uso académico.
"""

import sqlite3
import csv
import os
from datetime import datetime

class GestorReportes:
    def __init__(self, db_path="simulaciones.db", csv_path="historial_simulaciones.csv"):
        self.db_path = db_path
        self.csv_path = csv_path
        self.inicializar_base_datos()

    def inicializar_base_datos(self):
        """Crea la tabla en SQLite si no existe."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS historial (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fecha TEXT NOT NULL,
                escenario TEXT NOT NULL,
                masa REAL NOT NULL,
                fuerza REAL NOT NULL,
                friccion REAL NOT NULL,
                aceleracion_promedio REAL NOT NULL,
                tiempo_total REAL NOT NULL,
                distancia_recorrida REAL NOT NULL
            )
        """)
        conn.commit()
        conn.close()

    def registrar_simulacion(self, escenario, masa, fuerza, friccion, aceleracion_promedio, tiempo_total, distancia_recorrida):
        """
        Registra los resultados consolidados de una corrida tanto en SQLite como en el CSV general.
        
        Retorna:
            int: El ID autogenerado del registro en la base de datos.
        """
        fecha_actual = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # 1. Guardar en SQLite
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO historial (fecha, escenario, masa, fuerza, friccion, aceleracion_promedio, tiempo_total, distancia_recorrida)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (fecha_actual, escenario, masa, fuerza, friccion, aceleracion_promedio, tiempo_total, distancia_recorrida))
        registro_id = cursor.lastrowid
        conn.commit()
        conn.close()

        # 2. Guardar en CSV Histórico consolidado
        archivo_nuevo = not os.path.exists(self.csv_path)
        
        try:
            with open(self.csv_path, mode='a', newline='', encoding='utf-8') as file:
                writer = csv.writer(file, delimiter=';')
                if archivo_nuevo:
                    # Encabezados
                    writer.writerow([
                        "ID Prueba", "Fecha/Hora", "Escenario", "Masa (kg)", 
                        "Fuerza Aplicada/Frenado (N)", "Fricción (mu o b)", 
                        "Aceleración Promedio (m/s2)", "Tiempo Total (s)", "Distancia Recorrida (m)"
                    ])
                writer.writerow([
                    registro_id, fecha_actual, escenario, f"{masa:.2f}", 
                    f"{fuerza:.2f}", f"{friccion:.4f}", 
                    f"{aceleracion_promedio:.4f}", f"{tiempo_total:.2f}", f"{distancia_recorrida:.2f}"
                ])
        except IOError as e:
            print(f"Error al escribir en el archivo CSV de historial: {e}")

        return registro_id

    def obtener_historial(self):
        """Recupera todos los registros del historial de SQLite ordenados por ID descendente."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT id, fecha, escenario, masa, fuerza, friccion, aceleracion_promedio, tiempo_total, distancia_recorrida FROM historial ORDER BY id DESC")
        registros = cursor.fetchall()
        conn.close()
        return registros

    def eliminar_registro(self, registro_id):
        """Elimina un registro específico del historial de SQLite."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM historial WHERE id = ?", (registro_id,))
        conn.commit()
        conn.close()

    def exportar_reporte_segundo_a_segundo(self, ruta_archivo, datos_pasos):
        """
        Exporta una tabla detallada segundo a segundo de la última simulación a un archivo CSV.
        
        Parámetros:
            ruta_archivo (str): Ruta donde se guardará el reporte.
            datos_pasos (list of dict): Lista de estados de la simulación.
                                        Cada diccionario debe contener {"t", "x", "v", "a", "fuerza_neta"}.
        """
        try:
            with open(ruta_archivo, mode='w', newline='', encoding='utf-8') as file:
                writer = csv.writer(file, delimiter=';')
                # Escribimos los encabezados
                writer.writerow(["Tiempo (s)", "Posicion (m)", "Velocidad (m/s)", "Aceleracion (m/s2)", "Fuerza Neta (N)"])
                
                # Escribimos los datos paso a paso
                for paso in datos_pasos:
                    writer.writerow([
                        f"{paso['t']:.3f}",
                        f"{paso['x']:.4f}",
                        f"{paso['v']:.4f}",
                        f"{paso['a']:.4f}",
                        f"{paso['fuerza_neta']:.2f}"
                    ])
            return True
        except Exception as e:
            print(f"Error al exportar reporte CSV paso a paso: {e}")
            return False

    def exportar_reporte_academico_txt(self, ruta_archivo, info_general, datos_pasos):
        """
        Exporta un reporte en texto plano (.txt) con formato formal de artículo académico
        para pegar directamente en documentos de Word.
        
        Parámetros:
            ruta_archivo (str): Ruta para el archivo .txt
            info_general (dict): Parámetros de la simulación (Escenario, Masa, etc.)
            datos_pasos (list of dict): Datos paso a paso.
        """
        try:
            with open(ruta_archivo, mode='w', encoding='utf-8') as file:
                # Cabecera del reporte
                file.write("=========================================================================\n")
                file.write("       REPORTE ACADÉMICO DE SIMULACIÓN - SEGUNDA LEY DE NEWTON          \n")
                file.write("                 UNIVERSIDAD TECNOLÓGICA DEL PERÚ                        \n")
                file.write("=========================================================================\n\n")
                
                file.write(f"Fecha de Reporte: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                file.write(f"ID del Ensayo: {info_general.get('id', 'N/A')}\n")
                file.write(f"Escenario Simulado: {info_general.get('escenario', 'N/A')}\n\n")
                
                file.write("-------------------------------------------------------------------------\n")
                file.write("1. PARÁMETROS DE ENTRADA (CONDICIONES INICIALES)\n")
                file.write("-------------------------------------------------------------------------\n")
                file.write(f"  - Masa (m): {info_general.get('masa', 0.0):.2f} kg\n")
                
                if "frenado" in info_general.get('escenario', '').lower() or "automotriz" in info_general.get('escenario', '').lower():
                    file.write(f"  - Velocidad Inicial (v0): {info_general.get('v_inicial', 0.0):.2f} m/s\n")
                    file.write(f"  - Fuerza de Frenado (Ff): {info_general.get('fuerza', 0.0):.2f} N\n")
                    file.write(f"  - Coeficiente de Fricción (mu): {info_general.get('friccion', 0.0):.4f}\n")
                    file.write(f"  - Tipo de Terreno/Asfalto: {info_general.get('terreno', 'No especificado')}\n")
                else:
                    file.write(f"  - Tensión del Cable (T): {info_general.get('fuerza', 0.0):.2f} N\n")
                    file.write(f"  - Coeficiente Resistencia Aire (b): {info_general.get('friccion', 0.0):.4f} N*s/m\n")
                    file.write(f"  - Entorno de Resistencia: {info_general.get('entorno', 'No especificado')}\n")
                    file.write(f"  - Gravedad (g): 9.81 m/s²\n")
                file.write("\n")
                
                file.write("-------------------------------------------------------------------------\n")
                file.write("2. RESULTADOS OBTENIDOS (MAGNITUDES FÍSICAS RESULTANTES)\n")
                file.write("-------------------------------------------------------------------------\n")
                file.write(f"  - Tiempo Total de Simulación: {info_general.get('tiempo_total', 0.0):.3f} s\n")
                file.write(f"  - Distancia/Desplazamiento Recorrido: {info_general.get('distancia_recorrida', 0.0):.3f} m\n")
                file.write(f"  - Aceleración Promedio Calculada: {info_general.get('aceleracion_promedio', 0.0):.4f} m/s²\n")
                file.write("\n")
                
                file.write("-------------------------------------------------------------------------\n")
                file.write("3. MARCO TEÓRICO Y FÓRMULAS DE APLICACIÓN\n")
                file.write("-------------------------------------------------------------------------\n")
                if "frenado" in info_general.get('escenario', '').lower() or "automotriz" in info_general.get('escenario', '').lower():
                    file.write("  Ecuaciones del Movimiento Rectilíneo Uniformemente Variado (MRUV) con fricción:\n")
                    file.write("    * Fuerza Normal: N = m * g\n")
                    file.write("    * Fuerza de Fricción Dinámica: fk = mu * N\n")
                    file.write("    * Fuerza Neta Horizontal: ΣF = - (F_frenado + fk)\n")
                    file.write("    * Segunda Ley de Newton (Aceleración): a = ΣF / m\n")
                    file.write("    * Ecuaciones Diferenciales por Método de Euler:\n")
                    file.write("        v(t + dt) = v(t) + a * dt\n")
                    file.write("        x(t + dt) = x(t) + v(t + dt) * dt\n")
                else:
                    file.write("  Ecuaciones para Movimiento Vertical con Resistencia Viscosa del Fluido:\n")
                    file.write("    * Fuerza de Gravedad (Peso): P = m * g\n")
                    file.write("    * Fuerza de Arrastre (Fluido): Fa = - b * v\n")
                    file.write("    * Fuerza Neta Vertical: ΣF = Tensión - Peso + Fa\n")
                    file.write("    * Segunda Ley de Newton (Aceleración): a = ΣF / m\n")
                    file.write("    * Ecuaciones Diferenciales por Método de Euler:\n")
                    file.write("        v(t + dt) = v(t) + a * dt\n")
                    file.write("        y(t + dt) = y(t) + v(t + dt) * dt\n")
                file.write("\n")
                
                # Tabla paso a paso
                file.write("-------------------------------------------------------------------------\n")
                file.write("4. TABLA DE MUESTREO TEMPORAL (SEGUNDO A SEGUNDO)\n")
                file.write("-------------------------------------------------------------------------\n")
                file.write(f"{'Tiempo (s)':<12}{'Posición (m)':<15}{'Velocidad (m/s)':<18}{'Aceleración (m/s²)':<20}{'Fuerza Neta (N)':<15}\n")
                file.write("-" * 80 + "\n")
                
                # Imprimimos puntos de muestreo en intervalos regulares para evitar saturar el reporte
                # por ejemplo, cada 10 pasos de simulación (si dt=0.05, 10 pasos = 0.5s), más el primer y último estado.
                pasos_imprimir = []
                total_pasos = len(datos_pasos)
                
                # Muestreo inteligente para que no sea un reporte de 20 páginas
                if total_pasos > 0:
                    pasos_imprimir.append(datos_pasos[0])
                    # Intervalo para que haya alrededor de 20-30 filas en la tabla del TXT
                    intervalo = max(1, total_pasos // 25)
                    for i in range(1, total_pasos - 1):
                        if i % intervalo == 0:
                            pasos_imprimir.append(datos_pasos[i])
                    pasos_imprimir.append(datos_pasos[-1])
                
                # Evitar duplicados por rango
                vistas = set()
                for paso in pasos_imprimir:
                    t_str = f"{paso['t']:.2f}"
                    if t_str not in vistas:
                        vistas.add(t_str)
                        file.write(
                            f"{paso['t']:<12.2f}"
                            f"{paso['x']:<15.4f}"
                            f"{paso['v']:<18.4f}"
                            f"{paso['a']:<20.4f}"
                            f"{paso['fuerza_neta']:<15.1f}\n"
                        )
                
                file.write("\n=========================================================================\n")
                file.write("       FIN DEL REPORTE ACADÉMICO - CÁTEDRA DE FÍSICA UTP                 \n")
                file.write("=========================================================================\n")
            return True
        except Exception as e:
            print(f"Error al escribir reporte de texto: {e}")
            return False
