from django.contrib import admin
from django.urls import path, include
from main import views
from django.conf.urls.static import static
from django.conf import settings
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('main.urls')),  # all app routes
    path('dashboard/products/', views.manage_products, name='manage_products'),
    path('dashboard/add-product/', views.add_product, name='add_product'),
    path('dashboard/delete-product/<int:id>/', views.delete_product, name='delete_product'),
    path('dashboard/edit-product/<int:id>/', views.edit_product, name='edit_product'),
    path('dashboard/update-order/<int:id>/', views.update_order_status, name='update_order'),
    path('dashboard/orders/', views.manage_orders, name='manage_orders'),
]
# MEDIA files (IMPORTANT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

