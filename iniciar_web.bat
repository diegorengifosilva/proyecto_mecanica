@echo off
setlocal EnableDelayedExpansion
title Simulador de Newton - UTP Fisica Clasica

:: Definir codigos de escape ANSI para colores si se soporta
for /F "tokens=1,2 delims=#" %%a in ('"prompt $H#$E# & echo on & for %%b in (1) do rem"') do set ESC=%%b

set "CYAN=%ESC%[96m"
set "GREEN=%ESC%[92m"
set "YELLOW=%ESC%[93m"
set "RED=%ESC%[91m"
set "RESET=%ESC%[0m"
set "BOLD=%ESC%[1m"

cls
echo %CYAN%===================================================================%RESET%
echo %CYAN%%BOLD%  SIMULADOR NEWTONIANO - DEPARTAMENTO DE FÍSICA (UTP)%RESET%
echo %CYAN%===================================================================%RESET%
echo.

echo %CYAN%[Info]%RESET% Verificando instalacion de Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%[Error] Python no esta instalado o no se encuentra en el PATH.%RESET%
    echo Por favor, instala Python 3.10 o superior y asegurese de marcar "Add Python to PATH" durante la instalacion.
    pause
    exit /b 1
)

echo %CYAN%[Info]%RESET% Verificando entorno virtual...
if not exist ".venv" (
    echo %YELLOW%[Info] No se detecto un entorno virtual. Creando uno nuevo...%RESET%
    python -m venv .venv
    if !errorlevel! neq 0 (
        echo %RED%[Error] No se pudo crear el entorno virtual. Usando interprete global.%RESET%
    ) else (
        echo %GREEN%[Exito] Entorno virtual creado exitosamente.%RESET%
    )
)

if exist ".venv" (
    echo %CYAN%[Info]%RESET% Activando entorno virtual...
    call .venv\Scripts\activate
)

echo %CYAN%[Info]%RESET% Verificando dependencias en requirements.txt...
python -c "import django, rest_framework, corsheaders, matplotlib, numpy, openpyxl" >nul 2>&1
if %errorlevel% neq 0 (
    echo %YELLOW%[Info] Faltan dependencias. Instalando requisitos...%RESET%
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    if !errorlevel! neq 0 (
        echo %RED%[Error] Error al instalar las dependencias. Verifique su conexion.%RESET%
        pause
        exit /b 1
    )
    echo %GREEN%[Exito] Dependencias instaladas correctamente.%RESET%
) else (
    echo %GREEN%[Exito] Todas las dependencias estan instaladas.%RESET%
)

echo %CYAN%[Info]%RESET% Verificando la base de datos...
python manage.py migrate
if %errorlevel% neq 0 (
    echo %RED%[Error] Hubo un problema al aplicar las migraciones de base de datos.%RESET%
    pause
    exit /b 1
)

echo %CYAN%[Info]%RESET% Verificando disponibilidad del puerto 8000...
netstat -ano | findstr LISTENING | findstr :8000 >nul 2>&1
if %errorlevel% == 0 (
    echo %RED%[Advertencia] El puerto 8000 ya esta en uso por otro proceso.%RESET%
    echo Intente cerrarlo o el servidor Django podria fallar al iniciar.
    echo.
)

:menu
echo.
echo %CYAN%-------------------------------------------------------------------%RESET%
echo %BOLD%  MENU DE OPCIONES - SIMULADOR UTP%RESET%
echo %CYAN%-------------------------------------------------------------------%RESET%
echo [1] Iniciar Simulador Web (Django + React en Navegador)
echo [2] Iniciar Simulador Escritorio (Tkinter GUI local)
echo [3] Reinstalar dependencias (requirements.txt)
echo [4] Limpiar archivos temporales y cache
echo [5] Salir
echo %CYAN%-------------------------------------------------------------------%RESET%
set /p opcion="Seleccione una opcion [1-5]: "

if "%opcion%"=="1" goto web
if "%opcion%"=="2" goto escritorio
if "%opcion%"=="3" goto reinstalar
if "%opcion%"=="4" goto limpiar
if "%opcion%"=="5" goto salir
echo.
echo %RED%Opcion no valida. Intente de nuevo.%RESET%
goto menu

:web
echo.
echo %GREEN%[1/2] Iniciando Servidor Django...%RESET%
echo Servidor corriendo en: %CYAN%http://127.0.0.1:8000%RESET%
echo.
echo %GREEN%[2/2] Abriendo navegador en 3 segundos...%RESET%
timeout /t 3 /nobreak > nul
start http://127.0.0.1:8000
python manage.py runserver 127.0.0.1:8000
pause
goto menu

:escritorio
echo.
echo %GREEN%Iniciando Simulador Escritorio (GUI Tkinter)...%RESET%
python main.py
goto menu

:reinstalar
echo.
echo %YELLOW%Actualizando pip e instalando dependencias...%RESET%
python -m pip install --upgrade pip
pip install -r requirements.txt
echo %GREEN%[Exito] Dependencias actualizadas.%RESET%
goto menu

:limpiar
echo.
echo %YELLOW%Limpiando archivos de cache (__pycache__)...%RESET%
for /d /r . %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d"
echo %GREEN%[Exito] Archivos de cache limpiados.%RESET%
goto menu

:salir
echo.
echo Gracias por usar el Simulador Newtoniano UTP. ¡Exitos en su proyecto!
timeout /t 2 /nobreak > nul
exit /b 0
