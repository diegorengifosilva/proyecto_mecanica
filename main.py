# -*- coding: utf-8 -*-
"""
Módulo: main.py
Descripción: Punto de entrada principal del Simulador de la Segunda Ley de Newton.
             Orquesta la carga de la interfaz gráfica y el motor físico.
"""

import tkinter as tk
from interfaz_grafica import InterfazGrafica

def main():
    # Inicializar la ventana raíz de Tkinter
    root = tk.Tk()
    
    # Instanciar la aplicación con la interfaz gráfica
    app = InterfazGrafica(root)
    
    # Ejecutar el bucle de eventos principal de la interfaz
    root.mainloop()

if __name__ == "__main__":
    main()
