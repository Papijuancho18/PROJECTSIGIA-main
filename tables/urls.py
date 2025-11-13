from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TableViewSet, 
    TableDataViewSet,
    create_table,
    update_table,
    get_table_by_id,
    delete_table,
    add_table_row,
    delete_table_row
)

router = DefaultRouter()
router.register(r'', TableViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('create/', create_table, name='create-table'),
    path('<int:table_id>/update/', update_table, name='update-table'),
    path('<int:table_id>/', get_table_by_id, name='get-table'),
    path('<int:table_id>/delete/', delete_table, name='delete-table'),
    path('<int:table_id>/rows/', add_table_row, name='add-table-row'),
    path('<int:table_id>/rows/<int:row_id>/', delete_table_row, name='delete-table-row'),
    path('<int:table_pk>/data/', TableDataViewSet.as_view({'get': 'list', 'post': 'create'}), name='table-data-list'),
    path('<int:table_pk>/data/<int:pk>/', TableDataViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='table-data-detail'),
]
