# -*- coding: utf-8 -*-
from django.urls import path
from . import views

urlpatterns = [
    path('simulate-step/', views.simulate_step, name='simulate-step'),
    path('records/', views.manage_records, name='manage-records'),
    path('records/<int:pk>/', views.delete_record, name='delete-record'),
    path('scenarios/', views.get_scenarios, name='get-scenarios'),
    path('records/export-txt/', views.export_txt, name='export-txt'),
    path('records/export-csv/', views.export_csv, name='export-csv'),
    path('records/export-excel/', views.export_excel, name='export-excel'),
    path('records/export-history/', views.export_history_excel, name='export-history-excel'),
    path('solve-problem/', views.solve_problem, name='solve-problem'),
]



