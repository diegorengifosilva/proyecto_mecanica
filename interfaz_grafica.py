# -*- coding: utf-8 -*-
"""
Módulo: interfaz_grafica.py
Descripción: Interfaz gráfica interactiva utilizando Tkinter y Matplotlib. 
             Muestra la animación en tiempo real con vectores de fuerza 
             dinámicos y gráficos cinemáticos de aceleración y velocidad.
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import matplotlib
matplotlib.use("TkAgg")
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import matplotlib.pyplot as plt

from simulador_core import SimuladorCore, PhysicsError
from gestor_reportes import GestorReportes

class InterfazGrafica:
    def __init__(self, root):
        self.root = root
        self.root.title("Simulador de la Segunda Ley de Newton - UTP")
        self.root.geometry("1200x750")
        self.root.minsize(1100, 700)
        
        # Inicializar Core y Gestor de Reportes
        self.core = SimuladorCore()
        self.gestor = GestorReportes()
        
        # Estados de la simulación
        self.running = False
        self.loop_id = None
        self.datos_pasos = []  # Almacena el historial temporal del ensayo actual
        self.v_inicial_automotriz = 25.0  # Velocidad inicial guardada al arrancar
        
        # Parámetros por escenario para restaurar rápidamente al alternar
        self.valores_defecto = {
            "Automotriz": {"masa": 5000.0, "fuerza": 15000.0, "v_inicial": 25.0},
            "Elevador": {"masa": 1000.0, "fuerza": 15000.0, "v_inicial": 0.0}
        }
        
        # Configurar estilos de la interfaz
        self.configurar_estilos()
        
        # Crear la estructura principal en pestañas
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill=tk.BOTH, expand=True)
        
        self.tab_simulador = ttk.Frame(self.notebook, style='TFrame')
        self.tab_historial = ttk.Frame(self.notebook, style='TFrame')
        
        self.notebook.add(self.tab_simulador, text="  Simulador Activo  ")
        self.notebook.add(self.tab_historial, text="  Historial de Ensayos  ")
        
        # Construir contenido de pestañas
        self.construir_tab_simulador()
        self.construir_tab_historial()
        
        # Cargar configuración inicial
        self.seleccionar_escenario()
        
        # Vincular actualización de historial
        self.notebook.bind("<<NotebookTabChanged>>", self.al_cambiar_pestaña)

    def configurar_estilos(self):
        """Define una paleta de colores oscura, moderna y tecnológica."""
        self.color_bg = "#1e1e24"          # Fondo principal oscuro
        self.color_card = "#2a2a35"        # Fondo de paneles o tarjetas
        self.color_accent = "#00a8ff"      # Azul tecnológico
        self.color_green = "#10ac84"       # Verde (Fuerza impulsora/Tensión)
        self.color_red = "#ff7675"         # Rojo (Fricción/Resistencia/Peso)
        self.color_text = "#ffffff"        # Texto claro
        self.color_text_sec = "#a4b0be"    # Texto secundario/Unidades
        
        self.root.configure(bg=self.color_bg)
        
        style = ttk.Style()
        style.theme_use('clam')
        
        # Configurar estilos globales de ttk
        style.configure('.', background=self.color_bg, foreground=self.color_text, font=('Segoe UI', 10))
        style.configure('TFrame', background=self.color_bg)
        style.configure('Card.TFrame', background=self.color_card, relief='flat')
        style.configure('TLabel', background=self.color_card, foreground=self.color_text)
        style.configure('Title.TLabel', font=('Segoe UI', 12, 'bold'), foreground=self.color_accent)
        style.configure('Header.TLabel', font=('Segoe UI', 15, 'bold'), background=self.color_bg, foreground=self.color_accent)
        
        # Estilo para botones
        style.configure('TButton', font=('Segoe UI', 10, 'bold'), background=self.color_accent, foreground=self.color_text, borderwidth=0)
        style.map('TButton', background=[('active', '#0097e6'), ('disabled', '#3a3a45')], foreground=[('disabled', '#7f8c8d')])
        
        style.configure('Action.TButton', font=('Segoe UI', 10, 'bold'), background=self.color_green, foreground=self.color_text, borderwidth=0)
        style.map('Action.TButton', background=[('active', '#0e906f'), ('disabled', '#3a3a45')])
        
        style.configure('Danger.TButton', font=('Segoe UI', 10, 'bold'), background=self.color_red, foreground=self.color_text, borderwidth=0)
        style.map('Danger.TButton', background=[('active', '#e15f5f'), ('disabled', '#3a3a45')])
        
        # Estilo Combobox
        style.configure('TCombobox', fieldbackground=self.color_bg, background=self.color_card, foreground=self.color_text, borderwidth=1)
        style.map('TCombobox', fieldbackground=[('readonly', self.color_bg)], foreground=[('readonly', self.color_text)])
        
        # Estilo Notebook
        style.configure('TNotebook', background=self.color_bg, borderwidth=0)
        style.configure('TNotebook.Tab', background=self.color_card, foreground=self.color_text_sec, font=('Segoe UI', 10, 'bold'), padding=[15, 6])
        style.map('TNotebook.Tab', background=[('selected', self.color_accent)], foreground=[('selected', self.color_text)])

    # ==========================================
    # PESTAÑA 1: SIMULADOR INTERACTIVO
    # ==========================================
    def construir_tab_simulador(self):
        # Layout principal de la pestaña de simulación: Dos columnas
        # Columna Izquierda: Panel de Control (ancho fijo ~380)
        # Columna Derecha: Panel Visual e Instrumental (se expande)
        
        self.tab_simulador.columnconfigure(1, weight=1)
        self.tab_simulador.rowconfigure(0, weight=1)
        
        # --- COLUMNA 0: PANEL IZQUIERDO ---
        frame_izq = ttk.Frame(self.tab_simulador, style='TFrame', padding=10)
        frame_izq.grid(row=0, column=0, sticky="nsew")
        
        # Card 1: Selección de Escenario
        card_escenario = ttk.Frame(frame_izq, style='Card.TFrame', padding=12)
        card_escenario.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Label(card_escenario, text="1. ESCENARIO DE ESTUDIO", style='Title.TLabel').pack(anchor=tk.W, pady=(0, 6))
        self.combo_escenario = ttk.Combobox(
            card_escenario, 
            values=["Automotriz: Frenado de Camión", "Elevador: Carga Minera/Obra"], 
            state="readonly", 
            font=('Segoe UI', 10, 'bold')
        )
        self.combo_escenario.set("Automotriz: Frenado de Camión")
        self.combo_escenario.pack(fill=tk.X, pady=4)
        self.combo_escenario.bind("<<ComboboxSelected>>", self.seleccionar_escenario)
        
        # Card 2: Variables y Controles
        self.card_controles = ttk.Frame(frame_izq, style='Card.TFrame', padding=12)
        self.card_controles.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Label(self.card_controles, text="2. VARIABLES DE ENTRADA", style='Title.TLabel').pack(anchor=tk.W, pady=(0, 10))
        
        # Sliders y Etiquetas dinámicas
        # Masa (kg)
        self.lbl_masa_nombre = ttk.Label(self.card_controles, font=('Segoe UI', 10, 'bold'))
        self.lbl_masa_nombre.pack(anchor=tk.W)
        self.slider_masa = tk.Scale(
            self.card_controles, from_=100, to=10000, resolution=50, orient=tk.HORIZONTAL,
            bg=self.color_card, fg=self.color_text, troughcolor=self.color_bg,
            activebackground=self.color_accent, highlightthickness=0,
            command=self.al_modificar_slider
        )
        self.slider_masa.pack(fill=tk.X, pady=(0, 8))
        
        # Fuerza (N) - Cambia de nombre según el escenario
        self.lbl_fuerza_nombre = ttk.Label(self.card_controles, font=('Segoe UI', 10, 'bold'))
        self.lbl_fuerza_nombre.pack(anchor=tk.W)
        self.slider_fuerza = tk.Scale(
            self.card_controles, from_=0, to=50000, resolution=100, orient=tk.HORIZONTAL,
            bg=self.color_card, fg=self.color_text, troughcolor=self.color_bg,
            activebackground=self.color_accent, highlightthickness=0,
            command=self.al_modificar_slider
        )
        self.slider_fuerza.pack(fill=tk.X, pady=(0, 8))
        
        # Velocidad Inicial (Solo para camión)
        self.lbl_v_inicial_nombre = ttk.Label(self.card_controles, text="Velocidad Inicial (v0):", font=('Segoe UI', 10, 'bold'))
        self.slider_v_inicial = tk.Scale(
            self.card_controles, from_=5, to=50, resolution=1, orient=tk.HORIZONTAL,
            bg=self.color_card, fg=self.color_text, troughcolor=self.color_bg,
            activebackground=self.color_accent, highlightthickness=0,
            command=self.al_modificar_slider
        )
        
        # Entorno / Superficie
        self.lbl_entorno_nombre = ttk.Label(self.card_controles, font=('Segoe UI', 10, 'bold'))
        self.lbl_entorno_nombre.pack(anchor=tk.W, pady=(4, 0))
        self.combo_entorno = ttk.Combobox(self.card_controles, state="readonly")
        self.combo_entorno.pack(fill=tk.X, pady=(4, 8))
        self.combo_entorno.bind("<<ComboboxSelected>>", self.al_modificar_slider)
        
        # Casos Guía Académicos (Para cumplir el requisito de comparar casos rápidamente)
        frame_guias = ttk.Frame(self.card_controles, style='Card.TFrame')
        frame_guias.pack(fill=tk.X, pady=(8, 0))
        ttk.Label(frame_guias, text="Casos de Ensayo Rápidos:", font=('Segoe UI', 9, 'italic'), foreground=self.color_text_sec).pack(anchor=tk.W, pady=2)
        
        self.btn_caso_1 = ttk.Button(frame_guias, text="Caso A", width=8, command=lambda: self.cargar_caso_guia(1))
        self.btn_caso_1.pack(side=tk.LEFT, padx=2)
        self.btn_caso_2 = ttk.Button(frame_guias, text="Caso B", width=8, command=lambda: self.cargar_caso_guia(2))
        self.btn_caso_2.pack(side=tk.LEFT, padx=2)
        self.btn_caso_3 = ttk.Button(frame_guias, text="Caso C", width=8, command=lambda: self.cargar_caso_guia(3))
        self.btn_caso_3.pack(side=tk.LEFT, padx=2)

        # Card 3: Ecuación y Explicación Educativa
        card_ecuacion = ttk.Frame(frame_izq, style='Card.TFrame', padding=12)
        card_ecuacion.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        
        ttk.Label(card_ecuacion, text="3. ANÁLISIS MATEMÁTICO REAL-TIME", style='Title.TLabel').pack(anchor=tk.W, pady=(0, 6))
        
        self.lbl_ecuacion_teorica = ttk.Label(card_ecuacion, text="", font=('Consolas', 10, 'bold'), foreground=self.color_accent, justify=tk.LEFT)
        self.lbl_ecuacion_teorica.pack(anchor=tk.W, pady=4)
        
        self.lbl_ecuacion_valores = ttk.Label(card_ecuacion, text="", font=('Consolas', 9), foreground=self.color_text_sec, justify=tk.LEFT)
        self.lbl_ecuacion_valores.pack(anchor=tk.W, pady=4)
        
        # Card 4: Botones de Acción
        card_acciones = ttk.Frame(frame_izq, style='Card.TFrame', padding=12)
        card_acciones.pack(fill=tk.X)
        
        ttk.Label(card_acciones, text="4. PANEL DE CONTROL", style='Title.TLabel').pack(anchor=tk.W, pady=(0, 8))
        
        frame_btn_fila1 = ttk.Frame(card_acciones, style='Card.TFrame')
        frame_btn_fila1.pack(fill=tk.X, pady=2)
        
        self.btn_iniciar = ttk.Button(frame_btn_fila1, text="▶ Iniciar", style='Action.TButton', command=self.iniciar_simulacion)
        self.btn_iniciar.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=2)
        
        self.btn_pausar = ttk.Button(frame_btn_fila1, text="⏸ Pausar", command=self.pausar_simulacion, state=tk.DISABLED)
        self.btn_pausar.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=2)
        
        self.btn_reiniciar = ttk.Button(frame_btn_fila1, text="🔄 Reiniciar", command=self.reiniciar_simulacion)
        self.btn_reiniciar.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=2)
        
        frame_btn_fila2 = ttk.Frame(card_acciones, style='Card.TFrame')
        frame_btn_fila2.pack(fill=tk.X, pady=(6, 2))
        
        self.btn_exportar_txt = ttk.Button(frame_btn_fila2, text="📄 Reporte (.txt)", command=self.exportar_txt, state=tk.DISABLED)
        self.btn_exportar_txt.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=2)
        
        self.btn_exportar_csv = ttk.Button(frame_btn_fila2, text="📊 Tabla (.csv)", command=self.exportar_csv, state=tk.DISABLED)
        self.btn_exportar_csv.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=2)
        
        # --- COLUMNA 1: PANEL DERECHO ---
        frame_der = ttk.Frame(self.tab_simulador, style='TFrame', padding=10)
        frame_der.grid(row=0, column=1, sticky="nsew")
        frame_der.rowconfigure(1, weight=1)
        frame_der.columnconfigure(0, weight=1)
        
        # Sección Superior: Telemetría e Instrumentación
        frame_telemetria = ttk.Frame(frame_der, style='Card.TFrame', padding=8)
        frame_telemetria.grid(row=0, column=0, sticky="ew", pady=(0, 10))
        
        # Columnas de Instrumentación
        frame_telemetria.columnconfigure((0, 1, 2, 3), weight=1)
        
        self.inst_tiempo = self.crear_instrumento(frame_telemetria, "TIEMPO (t)", "0.00 s", 0)
        self.inst_posicion = self.crear_instrumento(frame_telemetria, "POSICIÓN (x)", "0.00 m", 1)
        self.inst_velocidad = self.crear_instrumento(frame_telemetria, "VELOCIDAD (v)", "0.00 m/s", 2)
        self.inst_aceleracion = self.crear_instrumento(frame_telemetria, "ACELERACIÓN (a)", "0.00 m/s²", 3)
        
        # Sección Media: Lienzo de Animación (Canvas)
        self.canvas_animacion = tk.Canvas(frame_der, bg=self.color_bg, height=180, highlightthickness=1, highlightbackground="#3a3a45")
        self.canvas_animacion.grid(row=1, column=0, sticky="ew", pady=(0, 10))
        
        # Sección Inferior: Gráficas de Matplotlib
        self.frame_plots = ttk.Frame(frame_der, style='Card.TFrame', padding=5)
        self.frame_plots.grid(row=2, column=0, sticky="nsew")
        frame_der.rowconfigure(2, weight=2)
        
        self.construir_graficos_matplotlib()

    def crear_instrumento(self, parent, titulo, valor_inicial, col):
        """Crea un indicador digital de telemetría de aspecto profesional."""
        frame = ttk.Frame(parent, style='Card.TFrame')
        frame.grid(row=0, column=col, sticky="ew")
        
        lbl_title = ttk.Label(frame, text=titulo, font=('Segoe UI', 8, 'bold'), foreground=self.color_text_sec)
        lbl_title.pack(anchor=tk.CENTER)
        
        lbl_val = ttk.Label(frame, text=valor_inicial, font=('Segoe UI Semibold', 16, 'bold'), foreground=self.color_accent)
        lbl_val.pack(anchor=tk.CENTER)
        
        return lbl_val

    def construir_graficos_matplotlib(self):
        """Inicializa la figura de Matplotlib con estética tecnológica y oscura."""
        self.fig, (self.ax_a, self.ax_v) = plt.subplots(2, 1, figsize=(6, 4.2), sharex=True)
        self.fig.patch.set_facecolor(self.color_card)
        
        # Tiempos y valores a graficar
        self.tiempos = [0.0]
        self.velocidades = [0.0]
        self.aceleraciones = [0.0]
        
        # Líneas de los gráficos
        self.line_a, = self.ax_a.plot(self.tiempos, self.aceleraciones, color=self.color_red, linewidth=2, label="Aceleración (a)")
        self.line_v, = self.ax_v.plot(self.tiempos, self.velocidades, color=self.color_accent, linewidth=2, label="Velocidad (v)")
        
        # Configurar Eje de Aceleración
        self.ax_a.set_facecolor(self.color_bg)
        self.ax_a.set_ylabel("Aceleración (m/s²)", color=self.color_text, fontweight='bold')
        self.ax_a.grid(True, color='#3a3a45', linestyle='--')
        self.ax_a.tick_params(colors=self.color_text_sec, labelsize=9)
        self.ax_a.spines['bottom'].set_color('#3a3a45')
        self.ax_a.spines['top'].set_color('#3a3a45')
        self.ax_a.spines['left'].set_color('#3a3a45')
        self.ax_a.spines['right'].set_color('#3a3a45')
        
        # Configurar Eje de Velocidad
        self.ax_v.set_facecolor(self.color_bg)
        self.ax_v.set_xlabel("Tiempo (s)", color=self.color_text, fontweight='bold')
        self.ax_v.set_ylabel("Velocidad (m/s)", color=self.color_text, fontweight='bold')
        self.ax_v.grid(True, color='#3a3a45', linestyle='--')
        self.ax_v.tick_params(colors=self.color_text_sec, labelsize=9)
        self.ax_v.spines['bottom'].set_color('#3a3a45')
        self.ax_v.spines['top'].set_color('#3a3a45')
        self.ax_v.spines['left'].set_color('#3a3a45')
        self.ax_v.spines['right'].set_color('#3a3a45')
        
        # Ajustar los márgenes de la figura
        self.fig.tight_layout()
        
        # Incrustar en Tkinter
        self.canvas_plot = FigureCanvasTkAgg(self.fig, master=self.frame_plots)
        self.canvas_plot.get_tk_widget().pack(fill=tk.BOTH, expand=True)

    # ==========================================
    # PESTAÑA 2: HISTORIAL DE SIMULACIONES (DB)
    # ==========================================
    def construir_tab_historial(self):
        self.tab_historial.rowconfigure(1, weight=1)
        self.tab_historial.columnconfigure(0, weight=1)
        
        # Título
        lbl_head = ttk.Label(self.tab_historial, text="Historial de Simulaciones Registradas", style='Header.TLabel', padding=10)
        lbl_head.grid(row=0, column=0, sticky="w")
        
        # Tabla (Treeview)
        columnas = ("id", "fecha", "escenario", "masa", "fuerza", "friccion", "acel_prom", "tiempo", "distancia")
        self.tabla = ttk.Treeview(self.tab_historial, columns=columnas, show="headings", selectmode="browse")
        self.tabla.grid(row=1, column=0, sticky="nsew", padx=10, pady=(0, 10))
        
        # Scrollbars
        scrollbar_y = ttk.Scrollbar(self.tab_historial, orient=tk.VERTICAL, command=self.tabla.yview)
        scrollbar_y.grid(row=1, column=1, sticky="ns", pady=(0, 10))
        self.tabla.configure(yscrollcommand=scrollbar_y.set)
        
        # Configurar cabeceras de columnas
        cabeceras = {
            "id": "ID Prueba",
            "fecha": "Fecha y Hora",
            "escenario": "Escenario",
            "masa": "Masa (kg)",
            "fuerza": "Fuerza / Tensión (N)",
            "friccion": "Fricción (μ o b)",
            "acel_prom": "Acel. Promedio (m/s²)",
            "tiempo": "Tiempo (s)",
            "distancia": "Distancia (m)"
        }
        
        for col, text in cabeceras.items():
            self.tabla.heading(col, text=text, anchor=tk.CENTER)
            self.tabla.column(col, anchor=tk.CENTER, width=110 if col != "escenario" and col != "fecha" else 180)
            
        # Controles inferiores del historial
        frame_historial_controles = ttk.Frame(self.tab_historial, style='TFrame', padding=10)
        frame_historial_controles.grid(row=2, column=0, columnspan=2, sticky="ew")
        
        self.btn_cargar_parametros = ttk.Button(frame_historial_controles, text="Cargar Parámetros en Simulador", command=self.cargar_registro_seleccionado)
        self.btn_cargar_parametros.pack(side=tk.LEFT, padx=5)
        
        self.btn_eliminar_registro = ttk.Button(frame_historial_controles, text="Eliminar Registro", style='Danger.TButton', command=self.eliminar_registro_seleccionado)
        self.btn_eliminar_registro.pack(side=tk.LEFT, padx=5)
        
        ttk.Label(frame_historial_controles, text="* Selecciona un ensayo para volver a cargar sus variables o eliminarlo.", 
                  font=('Segoe UI', 9, 'italic'), background=self.color_bg, foreground=self.color_text_sec).pack(side=tk.RIGHT, padx=10)

    # ==========================================
    # MANEJO DE EVENTOS Y LOGICA DE INTERFAZ
    # ==========================================
    def seleccionar_escenario(self, event=None):
        """Modifica dinámicamente los límites y nombres de los sliders según el escenario."""
        escenario = self.combo_escenario.get()
        
        # Detener simulación activa si hay una
        self.pausar_simulacion()
        
        if "Automotriz" in escenario:
            # 1. Ajustar etiquetas
            self.lbl_masa_nombre.config(text="Masa del Camión (m): [kg]")
            self.lbl_fuerza_nombre.config(text="Fuerza de Frenado (Ff): [N]")
            self.lbl_entorno_nombre.config(text="Estado del Asfalto / Terreno:")
            
            # 2. Configurar Sliders
            self.slider_masa.config(from_=1000, to=15000, resolution=100)
            self.slider_masa.set(self.valores_defecto["Automotriz"]["masa"])
            
            self.slider_fuerza.config(from_=1000, to=40000, resolution=500)
            self.slider_fuerza.set(self.valores_defecto["Automotriz"]["fuerza"])
            
            # Mostrar Slider de velocidad inicial (sólo camión)
            self.lbl_v_inicial_nombre.pack(anchor=tk.W, before=self.lbl_entorno_nombre)
            self.slider_v_inicial.pack(fill=tk.X, pady=(0, 8), before=self.lbl_entorno_nombre)
            self.slider_v_inicial.set(self.valores_defecto["Automotriz"]["v_inicial"])
            
            # Configurar entornos (coeficientes mu)
            self.combo_entorno.config(values=[
                "Asfalto Seco (μ = 0.70)", 
                "Asfalto Mojado (μ = 0.40)", 
                "Asfalto con Hielo (μ = 0.15)"
            ])
            self.combo_entorno.set("Asfalto Seco (μ = 0.70)")
            
            # Habilitar botoncitos de casos
            self.btn_caso_1.config(text="Seco, Ff=15k")
            self.btn_caso_2.config(text="Lluvia, Ff=15k")
            self.btn_caso_3.config(text="Hielo, Ff=5k")
            
        else: # Elevador de Carga
            # 1. Ajustar etiquetas
            self.lbl_masa_nombre.config(text="Masa de la Carga (m): [kg]")
            self.lbl_fuerza_nombre.config(text="Tensión del Cable (T): [N]")
            self.lbl_entorno_nombre.config(text="Densidad del Fluido / Entorno:")
            
            # 2. Configurar Sliders
            self.slider_masa.config(from_=100, to=4000, resolution=50)
            self.slider_masa.set(self.valores_defecto["Elevador"]["masa"])
            
            # Peso estimado: m * 9.81 = 1000 * 9.81 = 9810 N. Poner un rango amplio
            self.slider_fuerza.config(from_=0, to=60000, resolution=500)
            self.slider_fuerza.set(self.valores_defecto["Elevador"]["fuerza"])
            
            # Ocultar velocidad inicial (siempre parte de cero en vertical)
            self.lbl_v_inicial_nombre.pack_forget()
            self.slider_v_inicial.pack_forget()
            
            # Configurar entornos (coeficientes resistencia aire b)
            self.combo_entorno.config(values=[
                "Cámara de Vacío (b = 0.00)", 
                "Atmósfera Normal (Aire) (b = 0.50)", 
                "Entorno Viscoso / Agua (b = 5.00)"
            ])
            self.combo_entorno.set("Atmósfera Normal (Aire) (b = 0.50)")
            
            # Habilitar botoncitos de casos
            self.btn_caso_1.config(text="Subir Rápido")
            self.btn_caso_2.config(text="Caída Libre")
            self.btn_caso_3.config(text="Viscoso, T=12k")

        # Limpiar simulación
        self.reiniciar_simulacion()

    def al_modificar_slider(self, val=None):
        """Se ejecuta cada vez que el usuario mueve los controles para ver el análisis matemático instantáneo."""
        # Si la simulación no ha corrido (tiempo = 0) o está pausada, mostramos las ecuaciones
        if not self.running:
            self.actualizar_analisis_inicial()

    def obtener_friccion_mu(self):
        """Retorna el coeficiente mu según la selección en el combo."""
        texto = self.combo_entorno.get()
        if "0.70" in texto: return 0.70
        if "0.40" in texto: return 0.40
        if "0.15" in texto: return 0.15
        return 0.70

    def obtener_friccion_b(self):
        """Retorna el coeficiente b de resistencia fluida según la selección."""
        texto = self.combo_entorno.get()
        if "0.00" in texto: return 0.00
        if "0.50" in texto: return 0.50
        if "5.00" in texto: return 5.00
        return 0.50

    def cargar_caso_guia(self, num_caso):
        """Carga configuraciones preestablecidas del mundo real para comparar resultados rápidamente."""
        escenario = self.combo_escenario.get()
        
        if "Automotriz" in escenario:
            if num_caso == 1: # Seco, Ff=15k, m=5000kg
                self.slider_masa.set(5000)
                self.slider_fuerza.set(15000)
                self.slider_v_inicial.set(25)
                self.combo_entorno.set("Asfalto Seco (μ = 0.70)")
            elif num_caso == 2: # Mojado
                self.slider_masa.set(5000)
                self.slider_fuerza.set(15000)
                self.slider_v_inicial.set(25)
                self.combo_entorno.set("Asfalto Mojado (μ = 0.40)")
            elif num_caso == 3: # Hielo
                self.slider_masa.set(8000)
                self.slider_fuerza.set(5000)
                self.slider_v_inicial.set(20)
                self.combo_entorno.set("Asfalto con Hielo (μ = 0.15)")
        else:
            if num_caso == 1: # Subir rápido: m=1000kg, T=18000N (Supera m*g = 9810)
                self.slider_masa.set(1000)
                self.slider_fuerza.set(18000)
                self.combo_entorno.set("Atmósfera Normal (Aire) (b = 0.50)")
            elif num_caso == 2: # Caída libre: T=0, m=1500kg
                self.slider_masa.set(1500)
                self.slider_fuerza.set(0)
                self.combo_entorno.set("Atmósfera Normal (Aire) (b = 0.50)")
            elif num_caso == 3: # Entorno viscoso
                self.slider_masa.set(1200)
                self.slider_fuerza.set(12000)
                self.combo_entorno.set("Entorno Viscoso / Agua (b = 5.00)")
                
        self.reiniciar_simulacion()

    def actualizar_analisis_inicial(self):
        """Muestra las ecuaciones resueltas teóricamente antes de dar Play."""
        escenario = self.combo_escenario.get()
        masa = self.slider_masa.get()
        fuerza = self.slider_fuerza.get()
        g = 9.81
        
        if "Automotriz" in escenario:
            mu = self.obtener_friccion_mu()
            v0 = self.slider_v_inicial.get()
            
            Normal = masa * g
            fk = mu * Normal
            F_neta = -(fuerza + fk)
            a = F_neta / masa
            
            # Fórmulas
            eq_teorica = (
                "Ecuaciones del Camión:\n"
                "  N = m * g\n"
                "  fk = μ * N\n"
                "  ΣFx = - (F_frenado + fk)\n"
                "  a = ΣFx / m"
            )
            eq_valores = (
                f"Cálculos Iniciales:\n"
                f"  N = {masa} * {g:.2f} = {Normal:.1f} N\n"
                f"  fk = {mu:.2f} * {Normal:.1f} = {fk:.1f} N\n"
                f"  ΣFx = - ({fuerza} + {fk:.1f}) = {F_neta:.1f} N\n"
                f"  a = {F_neta:.1f} / {masa} = {a:.2f} m/s²\n"
                f"Estado: Listo para frenar desde {v0:.1f} m/s."
            )
        else:
            b = self.obtener_friccion_b()
            Peso = masa * g
            # v es inicialmente 0
            F_neta = fuerza - Peso
            a = F_neta / masa
            
            eq_teorica = (
                "Ecuaciones del Elevador:\n"
                "  Peso = m * g\n"
                "  F_aire = - b * v\n"
                "  ΣFy = Tensión - Peso + F_aire\n"
                "  a = ΣFy / m"
            )
            eq_valores = (
                f"Cálculos Iniciales (v = 0):\n"
                f"  Peso = {masa} * {g:.2f} = {Peso:.1f} N\n"
                f"  F_aire = - {b:.2f} * 0.00 = 0.0 N\n"
                f"  ΣFy = {fuerza} - {Peso:.1f} = {F_neta:.1f} N\n"
                f"  a = {F_neta:.1f} / {masa} = {a:.2f} m/s²\n"
                f"Estado: Listo para mover verticalmente."
            )
            
        self.lbl_ecuacion_teorica.config(text=eq_teorica)
        self.lbl_ecuacion_valores.config(text=eq_valores)

    # ==========================================
    # BUCLE DE SIMULACIÓN Y CONTROL DEL TIEMPO
    # ==========================================
    def iniciar_simulacion(self):
        """Inicia el motor de simulación física paso a paso."""
        if self.running:
            return
            
        # Desactivar controles críticos que cambiarían condiciones iniciales básicas
        self.combo_escenario.config(state="disabled")
        self.slider_v_inicial.config(state="disabled")
        self.btn_iniciar.config(state=tk.DISABLED)
        self.btn_pausar.config(state=tk.NORMAL)
        self.btn_reiniciar.config(state=tk.NORMAL)
        self.btn_exportar_txt.config(state=tk.DISABLED)
        self.btn_exportar_csv.config(state=tk.DISABLED)
        
        self.running = True
        
        # Si es un arranque desde cero
        if len(self.datos_pasos) <= 1:
            self.tiempos = [0.0]
            self.velocidades = [self.slider_v_inicial.get() if "Automotriz" in self.combo_escenario.get() else 0.0]
            # Calcular aceleración inicial
            m = self.slider_masa.get()
            f = self.slider_fuerza.get()
            if "Automotriz" in self.combo_escenario.get():
                self.v_inicial_automotriz = self.slider_v_inicial.get()
                mu = self.obtener_friccion_mu()
                fk = mu * m * 9.81
                f_neta = -(f + fk)
                self.aceleraciones = [f_neta / m]
            else:
                f_neta = f - (m * 9.81)
                self.aceleraciones = [f_neta / m]
                
            self.datos_pasos = [{
                "t": 0.0,
                "x": 0.0,
                "v": self.velocidades[0],
                "a": self.aceleraciones[0],
                "fuerza_neta": f_neta,
                "fuerzas": {}
            }]
            
            # Limpiar gráficos de matplotlib
            self.ax_a.clear()
            self.ax_v.clear()
            self.line_a, = self.ax_a.plot(self.tiempos, self.aceleraciones, color=self.color_red, linewidth=2, label="Aceleración (a)")
            self.line_v, = self.ax_v.plot(self.tiempos, self.velocidades, color=self.color_accent, linewidth=2, label="Velocidad (v)")
            
            # Volver a poner las grillas y etiquetas
            self.ax_a.set_ylabel("Aceleración (m/s²)", color=self.color_text, fontweight='bold')
            self.ax_a.grid(True, color='#3a3a45', linestyle='--')
            self.ax_a.tick_params(colors=self.color_text_sec)
            self.ax_v.set_xlabel("Tiempo (s)", color=self.color_text, fontweight='bold')
            self.ax_v.set_ylabel("Velocidad (m/s)", color=self.color_text, fontweight='bold')
            self.ax_v.grid(True, color='#3a3a45', linestyle='--')
            self.ax_v.tick_params(colors=self.color_text_sec)
            
            # Ajustar escala inicial de vectores en la animación
            self.estimar_escala_camion()
            
        self.simular_loop()

    def pausar_simulacion(self):
        """Pausa la ejecución en tiempo real."""
        self.running = False
        if self.loop_id:
            self.root.after_cancel(self.loop_id)
            self.loop_id = None
        self.btn_iniciar.config(state=tk.NORMAL)
        self.btn_pausar.config(state=tk.DISABLED)

    def reiniciar_simulacion(self):
        """Detiene y resetea las variables al estado inicial configurado en los sliders."""
        self.pausar_simulacion()
        
        self.combo_escenario.config(state="readonly")
        self.slider_v_inicial.config(state="normal")
        self.btn_iniciar.config(state=tk.NORMAL)
        self.btn_pausar.config(state=tk.DISABLED)
        self.btn_exportar_txt.config(state=tk.DISABLED)
        self.btn_exportar_csv.config(state=tk.DISABLED)
        
        # Resetear telemetría
        self.inst_tiempo.config(text="0.00 s")
        self.inst_posicion.config(text="0.00 m")
        self.inst_velocidad.config(
            text=f"{self.slider_v_inicial.get():.2f} m/s" if "Automotriz" in self.combo_escenario.get() else "0.00 m/s"
        )
        self.inst_aceleracion.config(text="0.00 m/s²")
        
        self.tiempos = [0.0]
        self.velocidades = [self.slider_v_inicial.get() if "Automotriz" in self.combo_escenario.get() else 0.0]
        self.aceleraciones = [0.0]
        self.datos_pasos = []
        
        # Resetear gráficas
        self.ax_a.clear()
        self.ax_v.clear()
        self.line_a, = self.ax_a.plot(self.tiempos, self.aceleraciones, color=self.color_red, linewidth=2)
        self.line_v, = self.ax_v.plot(self.tiempos, self.velocidades, color=self.color_accent, linewidth=2)
        
        self.ax_a.set_ylabel("Aceleración (m/s²)", color=self.color_text, fontweight='bold')
        self.ax_a.grid(True, color='#3a3a45', linestyle='--')
        self.ax_a.tick_params(colors=self.color_text_sec)
        self.ax_v.set_xlabel("Tiempo (s)", color=self.color_text, fontweight='bold')
        self.ax_v.set_ylabel("Velocidad (m/s)", color=self.color_text, fontweight='bold')
        self.ax_v.grid(True, color='#3a3a45', linestyle='--')
        self.ax_v.tick_params(colors=self.color_text_sec)
        
        self.canvas_plot.draw()
        
        # Resetear Canvas de Animación
        self.actualizar_animacion(0.0, self.velocidades[0], {})
        
        # Resetear Marco Teórico
        self.actualizar_analisis_inicial()

    def simular_loop(self):
        """Bucle recurrente que consume la física del Core paso a paso (dt = 0.05 s)."""
        if not self.running:
            return
            
        ultimo = self.datos_pasos[-1]
        escenario = self.combo_escenario.get()
        
        try:
            if "Automotriz" in escenario:
                res = self.core.simular_paso_automotriz(
                    masa=float(self.slider_masa.get()),
                    v_inicial=self.v_inicial_automotriz,
                    F_frenado=float(self.slider_fuerza.get()),
                    mu=self.obtener_friccion_mu(),
                    t_actual=ultimo["t"],
                    x_actual=ultimo["x"],
                    v_actual=ultimo["v"],
                    dt=0.05
                )
            else: # Elevador
                res = self.core.simular_paso_ascensor(
                    masa=float(self.slider_masa.get()),
                    tension=float(self.slider_fuerza.get()),
                    b=self.obtener_friccion_b(),
                    t_actual=ultimo["t"],
                    y_actual=ultimo["x"],
                    v_actual=ultimo["v"],
                    dt=0.05,
                    altura_max=50.0
                )
                
            # Guardar el punto en la lista histórica del ensayo
            self.datos_pasos.append({
                "t": res["t"],
                "x": res["x"],
                "v": res["v"],
                "a": res["a"],
                "fuerza_neta": res["fuerzas"]["Fuerza Neta (ΣF)"],
                "fuerzas": res["fuerzas"]
            })
            
            # Actualizar telemetría visual
            self.inst_tiempo.config(text=f"{res['t']:.2f} s")
            self.inst_posicion.config(text=f"{res['x']:.2f} m")
            self.inst_velocidad.config(text=f"{res['v']:.2f} m/s")
            self.inst_aceleracion.config(text=f"{res['a']:.2f} m/s²")
            
            # Agregar datos para graficar en Matplotlib
            self.tiempos.append(res["t"])
            self.velocidades.append(res["v"])
            self.aceleraciones.append(res["a"])
            
            # Actualizar gráficos cada 2 pasos para mejorar rendimiento
            if len(self.tiempos) % 2 == 0 or res["terminado"]:
                self.actualizar_graficos()
                
            # Actualizar dibujo de la animación
            self.actualizar_animacion(res["x"], res["v"], res["fuerzas"])
            
            # Actualizar fórmulas en tiempo real
            self.actualizar_ecuaciones_valores(res)
            
            if res["terminado"]:
                self.finalizar_simulacion()
            else:
                # dt = 0.05 segundos = 50 milisegundos para simulación en tiempo real (1x)
                self.loop_id = self.root.after(50, self.simular_loop)
                
        except PhysicsError as pe:
            self.pausar_simulacion()
            messagebox.showerror("Error de Consistencia Física", str(pe))
        except Exception as e:
            self.pausar_simulacion()
            messagebox.showerror("Error Inesperado", f"Ocurrió un error en el motor: {e}")

    def actualizar_graficos(self):
        """Actualiza las líneas e intervalos de Matplotlib."""
        self.line_a.set_data(self.tiempos, self.aceleraciones)
        self.line_v.set_data(self.tiempos, self.velocidades)
        
        # Escalar ejes x automáticamente a medida que avanza
        t_max = max(1.0, self.tiempos[-1])
        self.ax_a.set_xlim(0, t_max)
        self.ax_v.set_xlim(0, t_max)
        
        # Escalar ejes y dinámicamente
        self.ax_a.relim()
        self.ax_a.autoscale_view(scalex=False, scaley=True)
        self.ax_v.relim()
        self.ax_v.autoscale_view(scalex=False, scaley=True)
        
        self.canvas_plot.draw_idle()

    def actualizar_ecuaciones_valores(self, res):
        """Actualiza el panel de sustitución numérica real-time de las fórmulas."""
        escenario = self.combo_escenario.get()
        masa = self.slider_masa.get()
        fuerza = self.slider_fuerza.get()
        fuerzas = res["fuerzas"]
        
        if "Automotriz" in escenario:
            mu = self.obtener_friccion_mu()
            eq_teorica = (
                "Ecuaciones del Camión:\n"
                "  N = m * g\n"
                "  fk = μ * N\n"
                "  ΣFx = - (F_frenado + fk)\n"
                "  a = ΣFx / m"
            )
            
            # Buscar fuerzas
            Normal = fuerzas.get("Normal (N)", masa * 9.81)
            fk = abs(fuerzas.get("Fuerza de Fricción (fk)", mu * Normal))
            F_neta = fuerzas.get("Fuerza Neta (ΣF)", -(fuerza + fk))
            
            eq_valores = (
                f"Sustitución en tiempo real (t = {res['t']:.2f}s):\n"
                f"  N = {masa} * 9.81 = {Normal:.1f} N\n"
                f"  fk = {mu:.2f} * {Normal:.1f} = {fk:.1f} N\n"
                f"  ΣFx = - ({fuerza} + {fk:.1f}) = {F_neta:.1f} N\n"
                f"  a = {F_neta:.1f} / {masa} = {res['a']:.2f} m/s²\n"
                f"Estado: Frenando dinámicamente."
            )
        else:
            b = self.obtener_friccion_b()
            Peso = abs(fuerzas.get("Peso (m*g)", masa * 9.81))
            F_aire = fuerzas.get("Resistencia Aire", -b * res["v"])
            F_neta = fuerzas.get("Fuerza Neta (ΣF)", fuerza - Peso + F_aire)
            
            eq_teorica = (
                "Ecuaciones del Elevador:\n"
                "  Peso = m * g\n"
                "  F_aire = - b * v\n"
                "  ΣFy = Tensión - Peso + F_aire\n"
                "  a = ΣFy / m"
            )
            eq_valores = (
                f"Sustitución en tiempo real (t = {res['t']:.2f}s):\n"
                f"  Peso = {masa} * 9.81 = {Peso:.1f} N\n"
                f"  F_aire = - {b:.2f} * ({res['v']:.2f}) = {F_aire:.1f} N\n"
                f"  ΣFy = {fuerza} - {Peso:.1f} + ({F_aire:.1f}) = {F_neta:.1f} N\n"
                f"  a = {F_neta:.1f} / {masa} = {res['a']:.2f} m/s²\n"
                f"Estado: Moviéndose en vertical."
            )
            
        self.lbl_ecuacion_teorica.config(text=eq_teorica)
        self.lbl_ecuacion_valores.config(text=eq_valores)

    def finalizar_simulacion(self):
        """Detiene el bucle físico y persiste los resultados finales en la BD y CSV."""
        self.pausar_simulacion()
        
        # Restaurar controles
        self.combo_escenario.config(state="readonly")
        self.slider_v_inicial.config(state="normal")
        self.btn_iniciar.config(state=tk.NORMAL)
        self.btn_pausar.config(state=tk.DISABLED)
        self.btn_exportar_txt.config(state=tk.NORMAL)
        self.btn_exportar_csv.config(state=tk.NORMAL)
        
        # Calcular magnitudes promedio y finales para persistencia
        t_final = self.tiempos[-1]
        d_final = self.datos_pasos[-1]["x"]
        
        # Aceleración promedio simple
        acel_prom = sum(self.aceleraciones) / len(self.aceleraciones)
        
        escenario_corto = "Automotriz" if "Automotriz" in self.combo_escenario.get() else "Elevador"
        fuerza_aplicada = self.slider_fuerza.get()
        friccion_param = self.obtener_friccion_mu() if escenario_corto == "Automotriz" else self.obtener_friccion_b()
        
        # Registrar en la base de datos sqlite y CSV general
        registro_id = self.gestor.registrar_simulacion(
            escenario=escenario_corto,
            masa=self.slider_masa.get(),
            fuerza=fuerza_aplicada,
            friccion=friccion_param,
            aceleracion_promedio=acel_prom,
            tiempo_total=t_final,
            distancia_recorrida=d_final
        )
        
        # Mensaje educativo de fin
        if escenario_corto == "Automotriz":
            mensaje = (
                f"🚨 FRENADO FINALIZADO CON ÉXITO\n\n"
                f"El camión se ha detenido completamente en:\n"
                f" - Distancia de parada: {d_final:.2f} metros\n"
                f" - Tiempo de parada: {t_final:.2f} segundos\n"
                f" - Desaceleración promedio: {acel_prom:.2f} m/s²\n\n"
                f"Ensayo registrado en historial con el ID #{registro_id}."
            )
        else:
            mensaje = (
                f"🛎️ MOVIMIENTO VERTICAL FINALIZADO\n\n"
                f"El elevador ha terminado su trayectoria:\n"
                f" - Altura final: {d_final:.2f} metros\n"
                f" - Tiempo transcurrido: {t_final:.2f} segundos\n"
                f" - Aceleración promedio: {acel_prom:.2f} m/s²\n\n"
                f"Ensayo registrado en historial con el ID #{registro_id}."
            )
        messagebox.showinfo("Simulación Concluida", mensaje)

    # ==========================================
    # ANIMACIÓN GRÁFICA (VECTORES DINÁMICOS)
    # ==========================================
    def estimar_escala_camion(self):
        """Calcula el rango de la carretera para que el camión no se salga de la pantalla."""
        m = self.slider_masa.get()
        f = self.slider_fuerza.get()
        v0 = self.slider_v_inicial.get()
        mu = self.obtener_friccion_mu()
        
        # a = -(F_frenado + mu*m*g)/m
        a_inicial = -(f + mu * m * 9.81) / m
        
        # Distancia aproximada de frenado d = v0^2 / (-2 * a)
        distancia_estimada = (v0 ** 2) / (-2.0 * a_inicial)
        
        # Escala máxima horizontal en metros (con 15% de margen)
        self.d_max_automotriz = max(15.0, distancia_estimada * 1.15)

    def actualizar_animacion(self, posicion, velocidad, fuerzas):
        """Renderiza en 2D el escenario y dibuja los vectores dinámicos (flechas de fuerza)."""
        self.canvas_animacion.delete("all")
        
        w = self.canvas_animacion.winfo_width()
        h = self.canvas_animacion.winfo_height()
        if w < 100: w = 750  # Ancho por defecto al inicio
        if h < 50: h = 180
        
        escenario = self.combo_escenario.get()
        
        if "Automotriz" in escenario:
            # --- RENDERIZAR CAMIÓN ---
            # Carretera
            y_piso = 130
            self.canvas_animacion.create_rectangle(0, y_piso, w, y_piso + 40, fill="#2f3640", outline="")
            self.canvas_animacion.create_line(0, y_piso + 20, w, y_piso + 20, fill="#fbc531", dash=(15, 10), width=2)
            
            # Escala de dibujo horizontal (metros a píxeles)
            # x = 0m corresponde a px = 60. x = d_max corresponde a px = w - 80
            rango_px = w - 140
            d_max = getattr(self, 'd_max_automotriz', 100.0)
            
            x_camion = 60 + (posicion / d_max) * rango_px
            y_camion = y_piso - 45
            
            # Dibujo del camión (Cuerpo principal)
            self.canvas_animacion.create_rectangle(x_camion, y_camion, x_camion + 70, y_camion + 30, fill="#00a8ff", outline="#ffffff", width=1)
            # Cabina
            self.canvas_animacion.create_rectangle(x_camion + 70, y_camion + 10, x_camion + 85, y_camion + 30, fill="#008bdf", outline="#ffffff")
            self.canvas_animacion.create_rectangle(x_camion + 75, y_camion + 13, x_camion + 83, y_camion + 20, fill="#dcdde1", outline="")
            # Ruedas
            self.canvas_animacion.create_oval(x_camion + 10, y_piso - 15, x_camion + 26, y_piso + 1, fill="#1e1e24", outline="#ffffff", width=2)
            self.canvas_animacion.create_oval(x_camion + 50, y_piso - 15, x_camion + 66, y_piso + 1, fill="#1e1e24", outline="#ffffff", width=2)
            
            # Texto identificador
            self.canvas_animacion.create_text(x_camion + 35, y_camion + 15, text="CAMIÓN", fill="#ffffff", font=('Segoe UI', 8, 'bold'))
            
            # --- VECTORES DE FUERZA (FBD horizontal) ---
            # Centro del camión para aplicar flechas
            cx = x_camion + 35
            cy = y_camion + 15
            
            # Si hay simulación activa, graficamos los vectores reales
            if fuerzas:
                Ff = abs(fuerzas.get("Fuerza de Frenado (Ff)", 0.0))
                fk = abs(fuerzas.get("Fuerza de Fricción (fk)", 0.0))
                
                # Escalar longitud en píxeles. Poner una escala donde 20000 N corresponda a 100px.
                # Asegurar un mínimo de 15px y máximo de 140px.
                f_escala = 80.0 / max(1.0, float(self.slider_fuerza.get()))
                
                px_Ff = min(130.0, max(15.0, Ff * f_escala)) if Ff > 0 else 0.0
                px_fk = min(130.0, max(15.0, fk * f_escala)) if fk > 0 else 0.0
                
                # Ambas fuerzas actúan hacia atrás (izquierda) porque están frenando
                if px_Ff > 0:
                    # Flecha Verde para la fuerza aplicada de frenado
                    self.dibujar_flecha(cx, cy, cx - px_Ff, cy, self.color_green, f"F_frenado: {Ff:.0f} N", abajo=False)
                if px_fk > 0:
                    # Flecha Roja para la fricción del asfalto
                    self.dibujar_flecha(cx, cy + 12, cx - px_fk, cy + 12, self.color_red, f"fk (asfalto): {fk:.0f} N", abajo=True)
            else:
                # Si está quieto y no ha iniciado
                self.canvas_animacion.create_text(w/2, 30, text="Listo para iniciar simulación horizontal de frenado.", fill=self.color_accent, font=('Segoe UI', 10, 'bold'))
                
        else: # Elevador vertical
            # --- RENDERIZAR EDIFICIO / EJE VERTICAL ---
            cx_eje = w / 2
            self.canvas_animacion.create_line(cx_eje - 50, 15, cx_eje - 50, h - 15, fill="#3a3a45", width=2)
            self.canvas_animacion.create_line(cx_eje + 50, 15, cx_eje + 50, h - 15, fill="#3a3a45", width=2)
            
            # Regla vertical de escala (0m a 50m)
            # Altura 0m corresponde a y = h - 35. Altura 50m corresponde a y = 25
            rango_y = h - 60
            y_base = h - 30
            y_cable_tope = 15
            
            y_cabin_real = y_base - (posicion / 50.0) * rango_y
            
            # Dibujar cable
            self.canvas_animacion.create_line(cx_eje, y_cable_tope, cx_eje, y_cabin_real, fill="#a4b0be", width=2)
            
            # Dibujar polea en el tope
            self.canvas_animacion.create_oval(cx_eje - 10, y_cable_tope - 10, cx_eje + 10, y_cable_tope + 10, fill="#57606f", outline="#ffffff")
            
            # Dibujar Cabina del Elevador
            ancho_cab = 60
            alto_cab = 40
            self.canvas_animacion.create_rectangle(cx_eje - ancho_cab/2, y_cabin_real, cx_eje + ancho_cab/2, y_cabin_real + alto_cab, fill="#2ed573", outline="#ffffff", width=1.5)
            # Puerta divisoria
            self.canvas_animacion.create_line(cx_eje, y_cabin_real, cx_eje, y_cabin_real + alto_cab, fill="#ffffff")
            
            self.canvas_animacion.create_text(cx_eje, y_cabin_real + alto_cab/2, text="CARGA", fill="#ffffff", font=('Segoe UI', 8, 'bold'))
            
            # Dibujar ticks de altura en metros a la izquierda
            for metros in range(0, 51, 10):
                y_tick = y_base - (metros / 50.0) * rango_y
                self.canvas_animacion.create_line(cx_eje - 65, y_tick, cx_eje - 52, y_tick, fill="#7f8c8d")
                self.canvas_animacion.create_text(cx_eje - 80, y_tick, text=f"{metros}m", fill=self.color_text_sec, font=('Segoe UI', 8))
                
            # --- VECTORES DE FUERZA (FBD vertical) ---
            cy_center = y_cabin_real + alto_cab/2
            
            if fuerzas:
                Tension = abs(fuerzas.get("Tensión (T)", 0.0))
                Peso = abs(fuerzas.get("Peso (m*g)", 0.0))
                F_aire = fuerzas.get("Resistencia Aire", 0.0)
                
                # Normalizar escalas en píxeles. 40000 N max corresponde a 80px.
                f_escala = 50.0 / max(1.0, float(self.slider_fuerza.get()))
                
                px_T = min(90.0, max(15.0, Tension * f_escala)) if Tension > 0 else 0.0
                px_P = min(90.0, max(15.0, Peso * f_escala)) if Peso > 0 else 0.0
                px_aire = min(90.0, max(10.0, abs(F_aire) * f_escala)) if abs(F_aire) > 0 else 0.0
                
                # 1. Tensión T (Hacia arriba, Flecha Verde)
                if px_T > 0:
                    self.dibujar_flecha(cx_eje, y_cabin_real, cx_eje, y_cabin_real - px_T, self.color_green, f"Tensión: {Tension:.0f} N", horizontal=False)
                
                # 2. Peso m*g (Hacia abajo, Flecha Roja)
                if px_P > 0:
                    self.dibujar_flecha(cx_eje, y_cabin_real + alto_cab, cx_eje, y_cabin_real + alto_cab + px_P, self.color_red, f"Peso: {Peso:.0f} N", horizontal=False, lado_izq=True)
                
                # 3. Resistencia del aire (Se opone al sentido del movimiento)
                if px_aire > 0:
                    if F_aire < 0: # Velocidad hacia arriba (+), resistencia hacia abajo (-)
                        self.dibujar_flecha(cx_eje + 20, y_cabin_real + alto_cab, cx_eje + 20, y_cabin_real + alto_cab + px_aire, "#ffbe76", f"Aire: {abs(F_aire):.1f} N", horizontal=False)
                    else: # Velocidad hacia abajo (-), resistencia hacia arriba (+)
                        self.dibujar_flecha(cx_eje + 20, y_cabin_real, cx_eje + 20, y_cabin_real - px_aire, "#ffbe76", f"Aire: {abs(F_aire):.1f} N", horizontal=False)
            else:
                self.canvas_animacion.create_text(w/2, 35, text="Listo para iniciar simulación de elevación.", fill=self.color_accent, font=('Segoe UI', 10, 'bold'))

    def dibujar_flecha(self, x1, y1, x2, y2, color, texto, abajo=False, horizontal=True, lado_izq=False):
        """Método auxiliar para pintar vectores con su respectiva etiqueta numérica."""
        # Pintar línea con cabeza de flecha
        self.canvas_animacion.create_line(x1, y1, x2, y2, fill=color, width=3, arrow=tk.LAST, arrowshape=(8, 10, 4))
        
        # Pintar el texto explicativo
        if horizontal:
            offset_y = 12 if abajo else -12
            self.canvas_animacion.create_text((x1 + x2)/2, y1 + offset_y, text=texto, fill=color, font=('Segoe UI', 8, 'bold'))
        else:
            offset_x = -65 if lado_izq else 65
            self.canvas_animacion.create_text(x1 + offset_x, (y1 + y2)/2, text=texto, fill=color, font=('Segoe UI', 8, 'bold'))

    # ==========================================
    # EXPORTACIÓN DE REPORTES ACADÉMICOS
    # ==========================================
    def exportar_txt(self):
        """Abre cuadro de diálogo para exportar reporte de texto plano (.txt)."""
        if not self.datos_pasos:
            return
            
        ruta = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Archivo de Texto", "*.txt")],
            title="Exportar Reporte Académico de Simulación"
        )
        if not ruta:
            return
            
        # Preparar información general para el reporte
        escenario = self.combo_escenario.get()
        masa = self.slider_masa.get()
        fuerza = self.slider_fuerza.get()
        friccion_txt = self.combo_entorno.get()
        t_final = self.tiempos[-1]
        d_final = self.datos_pasos[-1]["x"]
        acel_prom = sum(self.aceleraciones) / len(self.aceleraciones)
        
        info = {
            "escenario": escenario,
            "masa": masa,
            "fuerza": fuerza,
            "tiempo_total": t_final,
            "distancia_recorrida": d_final,
            "aceleracion_promedio": acel_prom
        }
        
        if "Automotriz" in escenario:
            info["friccion"] = self.obtener_friccion_mu()
            info["terreno"] = friccion_txt
            info["v_inicial"] = self.v_inicial_automotriz
        else:
            info["friccion"] = self.obtener_friccion_b()
            info["entorno"] = friccion_txt
            
        # Obtener el último ID registrado consultando base de datos
        registros = self.gestor.obtener_historial()
        info["id"] = registros[0][0] if registros else 1
        
        exito = self.gestor.exportar_reporte_academico_txt(ruta, info, self.datos_pasos)
        if exito:
            messagebox.showinfo("Exportación Completada", f"Reporte de texto académico generado con éxito en:\n{ruta}")
        else:
            messagebox.showerror("Error de Archivo", "No se pudo escribir el archivo en la ruta especificada.")

    def exportar_csv(self):
        """Abre cuadro de diálogo para exportar tabla segundo a segundo (.csv)."""
        if not self.datos_pasos:
            return
            
        ruta = filedialog.asksaveasfilename(
            defaultextension=".csv",
            filetypes=[("Tabla de Datos CSV", "*.csv")],
            title="Exportar Muestreo Segundo a Segundo"
        )
        if not ruta:
            return
            
        exito = self.gestor.exportar_reporte_segundo_a_segundo(ruta, self.datos_pasos)
        if exito:
            messagebox.showinfo("Exportación Completada", f"Tabla CSV paso a paso generada con éxito en:\n{ruta}\n\nPuedes importarla directamente a Excel.")
        else:
            messagebox.showerror("Error de Archivo", "No se pudo escribir el archivo CSV.")

    # ==========================================
    # MANTENIMIENTO DE REGISTROS (HISTORIAL TAB)
    # ==========================================
    def al_cambiar_pestaña(self, event=None):
        """Actualiza el Treeview al seleccionar la pestaña Historial."""
        seleccionada = self.notebook.select()
        # Verificar si es la pestaña del historial
        if self.notebook.index(seleccionada) == 1:
            self.cargar_datos_treeview()

    def cargar_datos_treeview(self):
        """Carga la base de datos de SQLite en el Treeview."""
        # Limpiar filas existentes
        for item in self.tabla.get_children():
            self.tabla.delete(item)
            
        registros = self.gestor.obtener_historial()
        for reg in registros:
            # Reestructurar nombres para visualización estética
            esc = "Automotriz (Camión)" if reg[2] == "Automotriz" else "Elevador (Carga)"
            
            # Formatear valores
            f_fecha = reg[1]
            f_masa = f"{reg[3]:.1f}"
            f_fuerza = f"{reg[4]:.1f}"
            
            # El parámetro fricción es mu o b
            f_fric = f"μ={reg[5]:.2f}" if reg[2] == "Automotriz" else f"b={reg[5]:.2f}"
            f_acel = f"{reg[6]:.3f}"
            f_tiempo = f"{reg[7]:.2f}"
            f_dist = f"{reg[8]:.2f}"
            
            self.tabla.insert("", tk.END, values=(reg[0], f_fecha, esc, f_masa, f_fuerza, f_fric, f_acel, f_tiempo, f_dist))

    def cargar_registro_seleccionado(self):
        """Restaura los parámetros de una corrida anterior directo a los sliders."""
        seleccion = self.tabla.selection()
        if not seleccion:
            messagebox.showwarning("Advertencia", "Por favor, selecciona un ensayo del historial primero.")
            return
            
        item_valores = self.tabla.item(seleccion[0], "values")
        registro_id = item_valores[0]
        
        # Recuperar desde la base de datos para exactitud
        conn = sqlite3.connect(self.gestor.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT escenario, masa, fuerza, friccion FROM historial WHERE id = ?", (registro_id,))
        reg = cursor.fetchone()
        conn.close()
        
        if not reg:
            return
            
        escenario_db, masa, fuerza, friccion = reg
        
        # Alternar la vista del escenario
        if escenario_db == "Automotriz":
            self.combo_escenario.set("Automotriz: Frenado de Camión")
            self.seleccionar_escenario()
            self.slider_masa.set(masa)
            self.slider_fuerza.set(fuerza)
            
            # Estimar cuál entorno coincide con fricción (μ)
            if abs(friccion - 0.70) < 0.05:
                self.combo_entorno.set("Asfalto Seco (μ = 0.70)")
            elif abs(friccion - 0.40) < 0.05:
                self.combo_entorno.set("Asfalto Mojado (μ = 0.40)")
            elif abs(friccion - 0.15) < 0.05:
                self.combo_entorno.set("Asfalto con Hielo (μ = 0.15)")
        else:
            self.combo_escenario.set("Elevador: Carga Minera/Obra")
            self.seleccionar_escenario()
            self.slider_masa.set(masa)
            self.slider_fuerza.set(fuerza)
            
            # Estimar cuál entorno coincide con resistencia aire (b)
            if abs(friccion - 0.00) < 0.05:
                self.combo_entorno.set("Cámara de Vacío (b = 0.00)")
            elif abs(friccion - 0.50) < 0.05:
                self.combo_entorno.set("Atmósfera Normal (Aire) (b = 0.50)")
            elif abs(friccion - 5.00) < 0.05:
                self.combo_entorno.set("Entorno Viscoso / Agua (b = 5.00)")
                
        self.reiniciar_simulacion()
        
        # Regresar a la primera pestaña automáticamente
        self.notebook.select(0)
        messagebox.showinfo("Carga Completa", f"Se han cargado las variables físicas de la prueba #{registro_id} en el panel de control.")

    def eliminar_registro_seleccionado(self):
        """Elimina la fila de SQLite y refresca el listado."""
        seleccion = self.tabla.selection()
        if not seleccion:
            messagebox.showwarning("Advertencia", "Por favor, selecciona un ensayo del historial para eliminar.")
            return
            
        confirmacion = messagebox.askyesno("Confirmar Eliminación", "¿Estás seguro de que deseas borrar este ensayo del registro histórico?")
        if not confirmacion:
            return
            
        item_valores = self.tabla.item(seleccion[0], "values")
        registro_id = item_valores[0]
        
        self.gestor.eliminar_registro(registro_id)
        self.cargar_datos_treeview()
        messagebox.showinfo("Registro Eliminado", f"El ensayo #{registro_id} ha sido eliminado con éxito de la base de datos.")
