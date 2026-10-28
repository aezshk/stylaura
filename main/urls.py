from django.urls import path
from . import views


urlpatterns = [

    # HOME (SPLASH FIRST)
    path('', views.splash_view, name='splash'),

    # AUTH FLOW
    path("login/", views.login_view, name="login"),
    path("login2/", views.login2_view, name="login2"),
    path("signup/", views.signup, name="signup"),
    path("logout/", views.logout_view, name="logout"),

    path("otp/", views.otp_view, name="otp"),
    path("resend-otp/", views.resend_otp, name="resend_otp"),
    path("profile/", views.profile_view, name="profile"),

    # USER DASHBOARD
    path("dashboard/", views.dashboard_view, name="dashboard"),

    # ANALYSIS
    path("skin/", views.skin_view, name="skin"),
    path("skin-ai/", views.skin_ai_view, name="skin_ai"),
    path("skin-result/", views.skin_result_view, name="skin_result"),

    path("hair/", views.hair_view, name="hair"),
    path("hair-ai/", views.hair_ai_view, name="hair_ai"),
    path("hair-report/", views.hair_report_view, name="hair_report"),

    path("colour/", views.colour_view, name="colour"),
    path("colour-result/", views.colour_result_view, name="colour_result"),

    # ADMIN
    path("admin-dashboard/", views.admin_dashboard, name="admin_dashboard"),

    path('manage-users/', views.manage_users, name='manage_users'),
    path('manage-skin/', views.manage_skin, name='manage_skin'),
    path('manage-hair/', views.manage_hair, name='manage_hair'),
    path('manage-colour/', views.manage_colour, name='manage_colour'),

    path('delete-user/<int:user_id>/', views.delete_user, name='delete_user'),
    path('toggle-admin/<int:user_id>/', views.toggle_admin, name='toggle_admin'),

    # OPTIONAL
    path("splash/", views.splash_view, name="splash_page"),
    path('products/', views.recommended_products, name='products'),
    path('register/', views.register_view, name='register'),
    path('cart/', views.cart, name='cart'),
    path('add-to-cart/<int:product_id>/', views.add_to_cart, name='add_to_cart'),
    path('remove/<int:product_id>/', views.remove_from_cart, name='remove_from_cart'),
    path('checkout/', views.checkout, name='checkout'),
    path('success/', views.order_success, name='success'),    
    path('orders/', views.order_history, name='order_history'),
    path('dashboard/orders/', views.manage_orders, name='manage_orders'),
    path('cod-order/', views.cod_order, name='cod_order'),
    path('order-success/', views.order_success, name='order_success'),
    path('update-order-status/<int:id>/', views.update_order_status, name='update_order_status'),
    path('delete-order/<int:id>/', views.delete_order, name='delete_order'),
    path('bulk-delete-orders/', views.bulk_delete_orders, name='bulk_delete_orders'),
    path('bulk-update-status/', views.bulk_update_status, name='bulk_update_status'),
    path('hair-products/', views.hair_products, name='hair_products'),
    path('increase/<int:id>/', views.increase_quantity, name='increase_quantity'),
    path('decrease/<int:id>/', views.decrease_quantity, name='decrease_quantity'),
    path('colour-products/', views.colour_products, name='colour_products'),
    path('set-undertone/<str:value>/', views.set_undertone, name='set_undertone'),
    path('edit-user/<int:user_id>/', views.edit_user, name='edit_user'),
]

