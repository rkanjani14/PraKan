from django.http import JsonResponse
from django.shortcuts import render,redirect
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from .models import *
from django.contrib.auth import get_user_model
User = get_user_model()
import json
from allauth.socialaccount.models import SocialAccount
from itertools import chain

# Create your views here.
def home(request):
    return render(request,'index.html')

@login_required(login_url="/accounts/google/login/")
def chat_view(request):
    threads = Thread.objects.by_user(user=request.user).prefetch_related('chatmessage_thread')
    all_id = threads.values_list('first_person','second_person')
    users_id = [request.user.id]
    for item in all_id:
        if item[0] != request.user.id:
            users_id.append(item[0])
        else:
            users_id.append(item[1])
    other_users = User.objects.exclude(id__in=users_id)
    context = {
        'Threads':threads,
        "other_users":other_users
    }
    return render(request,'chat.html',context)

def user_connection(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_id = data['USER_ID']
        other_user_id = data['other_user_id']
        first_person = User.objects.filter(id=user_id)
        second_person = User.objects.filter(id=other_user_id)
        if not (first_person.exists() and second_person.exists()):
            return JsonResponse({"status":False},safe=True)
        lookup1 = Q(first_person=first_person.first()) & Q(second_person=second_person.first())
        lookup2 = Q(first_person=second_person.first()) & Q(second_person=first_person.first())
        thread = Thread.objects.filter(Q(lookup1) | Q(lookup2))
        if thread.exists():
            return JsonResponse({'status':False})
        thread_obj = Thread.objects.create(first_person=first_person.first(),second_person=second_person.first())
        thread_id = thread_obj.id
        extra_data = SocialAccount.objects.get(user=second_person.first()).extra_data
        second_person_avatar = extra_data['picture']
        data = {"thread_id":thread_id,"second_person_first_name":second_person.first().first_name,"second_person_avatar":second_person_avatar, "status":True}
        return JsonResponse(data,safe=True)

def logout_view(request):
    logout(request)
    return redirect('/')