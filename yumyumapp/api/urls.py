from django.urls import path
from . import views

urlpatterns = [path('login/', views.login_view, name='login'), path('register/', views.register_view, name='register'),
               path('logout/', views.logout_view, name='logout'), path('profile/', views.user_profile, name='profile'),
               path('fridge/', views.view_fridge, name='fridge'),
               path('fridge/add/', views.add_fridge_item, name='add_fridge_item'),
               path('fridge/item/<int:item_id>/remove/', views.remove_fridge_item, name='remove_fridge_item'),
               path('fridge/clear/', views.clear_fridge, name='clear_fridge'),
               path('recipes/find-by-ingredients/', views.find_recipes_by_ingredients,
                    name='find_recipes_by_ingredients')]
