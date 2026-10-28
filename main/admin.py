from django.contrib import admin

# Register your models here.
from .models import Product, Cart

admin.site.register(Cart)
admin.site.register(Product)