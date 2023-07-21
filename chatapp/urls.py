from django.contrib import admin
from django.urls import path
from .import views

urlpatterns = [
    path('',views.home,name='home'),
    path('chat/',views.chat_view,name='chat'),
    path('user_connection/',views.user_connection,name='user_connection'),
    path('logout/',views.logout_view, name="logout")
]
